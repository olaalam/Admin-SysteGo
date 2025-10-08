import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/api/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ProductGeneralTab from "./ProductGeneralTab";
import ProductMediaTab from "./ProductMediaTab";
import ProductPriceTab from "./ProductPriceTab";
import useGet from "@/hooks/useGet";

// دالة مساعدة لاستخراج اسم الخيار من الـ ID (لعرض أسماء التنوعات)
const getOptionNameFromId = (optionId, variations) => {
  for (const variation of variations) {
    const option = variation.options.find((opt) => opt._id === optionId);
    if (option) return option.name;
  }
  return null;
};

// دالة generateCombinations (نفس الدالة الموجودة في الكود الأصلي)
const generateCombinations = (optionsMap, allVariations) => {
  const activeOptions = Object.entries(optionsMap)
    .filter(([id, options]) => options && options.length > 0)
    .map(([id, options]) => {
      const variation = allVariations.find((v) => v._id == id);
      return {
        variationId: id,
        variationName: variation ? variation.name : `ID ${id}`,
        options: options.map((optionName) => {
          const originalVariation = allVariations.find((v) => v._id == id);
          const originalOption = originalVariation?.options.find(
            (opt) => opt.name === optionName
          );
          return {
            name: optionName,
            id: originalOption?._id || `${id}-${optionName}`,
          };
        }),
      };
    });

  if (activeOptions.length === 0) return [];

  const initialCombinations = [
    ...activeOptions[0].options.map((option) => ({
      name: option.name,
      options_ids: [option.id],
    })),
  ];

  const finalCombinations = activeOptions
    .slice(1)
    .reduce((combinations, currentVariation) => {
      const newCombinations = [];
      currentVariation.options.forEach((option) => {
        combinations.forEach((combo) => {
          newCombinations.push({
            name: `${combo.name} / ${option.name}`,
            options_ids: [...combo.options_ids, option.id],
          });
        });
      });
      return newCombinations;
    }, initialCombinations);

  return finalCombinations.map((combo) => ({
    name: combo.name,
    options: combo.options_ids,
    price: 0,
    stock: 0,
    code: "",
    image: "",
  }));
};

const ProductAdd = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [activeTab, setActiveTab] = useState("general");
  const [allVariations, setAllVariations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVariationIds, setSelectedVariationIds] = useState([]);
  const [selectedOptionsMap, setSelectedOptionsMap] = useState({});
  // إضافة حالة لتخزين بيانات المنتج المُضاف
  const [addedProduct, setAddedProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    categoryId: [],
    brandId: "",
    unit: "piece",
    description: "",
    minimum_quantity_sale: 1,
    image: "",
    gallery_product: [],
    price: 0,
    different_price: false,
    prices: [],
    discount: 0,
    quantity: 0,
    stock: 0,
    exp_ability: false, // ✅ جديد
    date_of_expiery: "", // ✅ جديد
    whole_price: 0, // ✅ جديد
    start_quantaty: 0, // ✅ جديد
    product_has_imei: false, // ✅ جديد
    show_quantity: false, // ✅ جديد
    maximum_to_show: 0, // ✅ جديد
  });

  const { data, loading } = useGet("/api/admin/product");

  useEffect(() => {
    if (data) {
      setCategories(data.categories || []);
      setBrands(data.brands || []);
      setAllVariations(data.variations || []);
    }
  }, [data]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e, multiple = false) => {
    const files = e.target.files;
    if (!files.length) return;
    [...files].forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (multiple) {
          setForm((prev) => ({
            ...prev,
            gallery_product: [...prev.gallery_product, reader.result],
          }));
        } else {
          setForm((prev) => ({ ...prev, image: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index) => {
    setForm((prev) => ({
      ...prev,
      gallery_product: prev.gallery_product.filter((_, i) => i !== index),
    }));
  };

  const handleVariationChange = (ids) => {
    setSelectedVariationIds(ids);
    setSelectedOptionsMap((prev) => {
      const newMap = {};
      ids.forEach((id) => {
        newMap[id] = prev[id] || [];
      });
      return newMap;
    });
  };

  const handleOptionsChange = useCallback((variationId, options) => {
    setSelectedOptionsMap((prev) => ({
      ...prev,
      [variationId]: options,
    }));
  }, []);

  const handleVariantFieldChange = useCallback((index, key, value) => {
    setForm((prevForm) => {
      const newPrices = [...prevForm.prices];
      newPrices[index] = { ...newPrices[index], [key]: value };
      return { ...prevForm, prices: newPrices };
    });
  }, []);

  useEffect(() => {
    if (form.different_price) {
      const newVariants = generateCombinations(
        selectedOptionsMap,
        allVariations
      );
      setForm((prevForm) => {
        const updatedPrices = newVariants.map((newVariant) => {
          const oldVariant = prevForm.prices.find(
            (p) => p.name === newVariant.name
          );
          return oldVariant
            ? {
                ...newVariant,
                price: oldVariant.price,
                stock: oldVariant.stock,
                code: oldVariant.code,
                image: oldVariant.image,
              }
            : newVariant;
        });
        return { ...prevForm, prices: updatedPrices };
      });
    }
    if (!form.different_price && form.prices.length > 0) {
      setForm((prevForm) => ({ ...prevForm, prices: [] }));
    }
  }, [selectedOptionsMap, form.different_price, allVariations]);

  const cleanBase64 = (dataUri) => {
    if (typeof dataUri === "string" && dataUri.startsWith("data:")) {
      return dataUri.split(",")[1];
    }
    return dataUri;
  };

  const isFormValid = () => {
    if (!form.name || form.name.trim() === "") return false;
    if (form.categoryId.length === 0) return false;
    if (form.price <= 0) return false;
    if (!form.image) return false;

    if (form.different_price) {
      if (form.prices.length === 0) return false;
      const allVariantsValid = form.prices.every(
        (variant) => variant.price > 0 && variant.stock >= 0
      );
      if (!allVariantsValid) return false;
      const allOptionsSelected = selectedVariationIds.every(
        (id) => selectedOptionsMap[id] && selectedOptionsMap[id].length > 0
      );
      if (!allOptionsSelected) return false;
    } else {
      if (form.quantity <= 0 || form.stock <= 0) return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields and correct the errors.");
      return;
    }

    setIsSubmitting(true);

    let finalForm = {
      name: form.name,
      categoryId: form.categoryId, // إرسال المصفوفة بالكامل
      brandId: form.brandId || "",
      unit: form.unit,
      price: form.price,
      description: form.description,
      image: cleanBase64(form.image),
      gallery_product: form.gallery_product.map((img) => cleanBase64(img)),
      different_price: form.different_price,
    };
    finalForm.exp_ability = form.exp_ability;
    if (form.exp_ability) finalForm.date_of_expiery = form.date_of_expiery;

    finalForm.whole_price = form.whole_price || 0;
    finalForm.start_quantaty = form.start_quantaty || 0;
    finalForm.product_has_imei = form.product_has_imei;

    finalForm.show_quantity = form.show_quantity;
    if (form.show_quantity)
      finalForm.maximum_to_show = form.maximum_to_show || 0;

    if (finalForm.different_price) {
      finalForm.prices = form.prices.map((variant) => ({
        price: variant.price,
        options: variant.options,
        code: variant.code,
      }));
      const disallowedFields = [
        "quantity",
        "stock",
        "minimum_quantity_sale",
        "discount",
      ];
      disallowedFields.forEach((field) => delete finalForm[field]);
    } else {
      finalForm = {
        ...finalForm,
        quantity: form.quantity || 0,
        stock: form.stock || 0,
        minimum_quantity_sale: form.minimum_quantity_sale,
        discount: form.discount,
      };
      delete finalForm.different_price;
      delete finalForm.prices;
    }

    if (finalForm.categoryId.length === 0) delete finalForm.categoryId;
    if (!finalForm.brandId) delete finalForm.brandId;

    try {
      const response = await api.post("/api/admin/product", finalForm);
      setAddedProduct(response.data.data); // تخزين بيانات المنتج المُضاف
      toast.success("Product added successfully! 🎉");
      // عدم إعادة التوجيه لعرض البيانات المُرجعة
       navigate("/product");
    } catch (err) {
      console.error("❌ Error:", err.response?.data);
      const errorMessage =
        err.response?.data?.message || "Failed to add product";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // دالة لإعادة تعيين النموذج لإضافة منتج جديد
  const resetForm = () => {
    setForm({
      name: "",
      categoryId: [],
      brandId: "",
      unit: "piece",
      description: "",
      minimum_quantity_sale: 1,
      image: "",
      gallery_product: [],
      price: 0,
      different_price: false,
      prices: [],
      discount: 0,
      quantity: 0,
      stock: 0,
    });
    setSelectedVariationIds([]);
    setSelectedOptionsMap({});
    setAddedProduct(null);
  };

  const formProps = {
    form,
    handleChange,
    categories,
    brands,
    handleImageUpload,
    removeGalleryImage,
    loading,
    allVariations,
    selectedVariationIds,
    handleVariationChange,
    selectedOptionsMap,
    handleOptionsChange,
    handleVariantFieldChange,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        <div className="mb-6">
          <div className="flex flex-col  gap-3 mb-2 ml-9">

            <h1 className="text-2xl font-bold text-gray-900">
              Add New Product
            </h1>
          
          <p className="text-gray-600 ">
            Fill in the product details below
          </p>
        </div>
        </div>



        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-24">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200 bg-gray-50">
              <TabsList className="w-full bg-transparent border-0 p-0 h-auto">
                <div className="flex w-full">
                  <TabsTrigger
                    value="general"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary rounded-none py-4 font-medium"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    General Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="media"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary rounded-none py-4 font-medium"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Media
                  </TabsTrigger>
                  <TabsTrigger
                    value="price"
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:text-secondary rounded-none py-4 font-medium"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Pricing
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>

            <TabsContent value="general" className="p-6 mt-0">
              <ProductGeneralTab {...formProps} />
            </TabsContent>

            <TabsContent value="media" className="p-6 mt-0">
              <ProductMediaTab {...formProps} />
            </TabsContent>

            <TabsContent value="price" className="p-6 mt-0">
              <ProductPriceTab {...formProps} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/product")}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid()}
            className="px-8 bg-secondary hover:bg-secondary/90"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Product
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductAdd;
