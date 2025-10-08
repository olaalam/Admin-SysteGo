// src/pages/productEdit.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/api/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import ProductGeneralTab from "./ProductGeneralTab";
import ProductMediaTab from "./ProductMediaTab";
import ProductPriceTab from "./ProductPriceTab";

// ===================================================================
// دالة مساعدة لتوليد كل التركيبات الممكنة (combinations)
// ===================================================================
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
            // استخدام ID الخيار الفعلي إن وُجد، وإلا إنشاء ID مؤقت
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

  const finalCombinations = activeOptions.slice(1).reduce(
    (combinations, currentVariation) => {
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
    },
    initialCombinations
  );

  return finalCombinations.map((combo) => ({
    name: combo.name,
    options: combo.options_ids, // مصفوفة من ID الخيارات
    price: 0,
    stock: 0,
    code: "",
    image: "",
    _id: null,
  }));
};

// ===================================================================

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    categoryId: [],
    brandId: "",
    unit: "piece",
    description: "",
    image: "",
    gallery_product: [],
    minimum_quantity_sale: 1,
    price: 0,
    different_price: false,
    prices: [],
    discount: 0,
    quantity: 0,
    stock: 0,
    exp_ability: false,
    date_of_expiery: "",
    whole_price: 0,
    start_quantaty: 0,
    product_has_imei: false,
    show_quantity: false,
    maximum_to_show: 0,
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allVariations, setAllVariations] = useState([]);
  const [selectedVariationIds, setSelectedVariationIds] = useState([]);
  const [selectedOptionsMap, setSelectedOptionsMap] = useState({});
  const [fetching, setFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // دالة استخراج اسم الخيار من الـ ID (معرف الخيار)
  const getOptionNameFromId = (optionId, variations) => {
    for (const variation of variations) {
      const option = variation.options.find((opt) => opt._id === optionId);
      if (option) return option.name;
    }
    return null;
  };

  // ===================================================================
  // جلب بيانات المنتج من الـ API
  // ===================================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/admin/product/${id}`);
        const data = res.data.data.product || res.data.data;

        const fetchedVariations = res.data.data.variations || [];
        setCategories(res.data.data.categories || []);
        setBrands(res.data.data.brands || []);
        setAllVariations(fetchedVariations);

        // تهيئة البيانات في الفورم
        setForm({
          name: data.name || "",
          categoryId: data.categoryId?.map((c) => c._id) || [],
          brandId: data.brandId?._id || "",
          unit: data.unit || "piece",
          description: data.description || "",
          image: data.image || "",
          gallery_product: data.gallery_product || [],
          minimum_quantity_sale: data.minimum_quantity_sale || 1,
          price: data.price || 0,
          different_price: data.different_price || false,
          // إعادة بناء قائمة الأسعار المحفوظة مع الاسم
// ✅ إعادة بناء قائمة الأسعار مع دعم شكل الـ variations اللي راجع من الـ API
prices:
  data.prices?.map((p) => {
    // استخراج كل IDs الخيارات من داخل structure الـ variations
    const optionIds = [];
    p.variations?.forEach((variation) => {
      variation.options?.forEach((opt) => {
        optionIds.push(opt._id);
      });
    });

    // استخراج الاسم الظاهر في الجدول (مثلاً: sm / large)
    const name =
      optionIds
        .map((optId) => getOptionNameFromId(optId, fetchedVariations))
        .filter(Boolean)
        .join(" / ") || "";

    return {
      _id: p._id,
      price: p.price,
      stock: p.quantity || 0,
      code: p.code || "",
      image: p.gallery?.[0] || "",
      options: optionIds, // IDs الفعلية
      name,
    };
  }) || [],

          discount: data.discount || 0,
          quantity: data.quantity || 0,
          stock: data.stock || 0,
          exp_ability: data.exp_ability || false,
          date_of_expiery: data.date_of_expiery || "",
          whole_price: data.whole_price || 0,
          start_quantaty: data.start_quantaty || 0,
          product_has_imei: data.product_has_imei || false,
          show_quantity: data.show_quantity || false,
          maximum_to_show: data.maximum_to_show || 0,
        });

        // ===============================================================
        // إعداد بيانات التنوعات للتحرير (الجزء المعدل لإظهار التنوعات السابقة)
        // ===============================================================
if (data.different_price && data.prices?.length > 0) {
  const allOptionIds = new Set();
data.prices.forEach((p) => {
  p.variations?.forEach((variation) => {
    variation.options?.forEach((opt) => {
      allOptionIds.add(opt._id);
    });
  });
});

  const newSelectedOptionsMap = {};
  const newSelectedVariationIds = new Set();

  (fetchedVariations || []).forEach((variation) => {
    const selectedOptions = variation.options
      .filter((opt) => allOptionIds.has(opt._id))
      .map((opt) => opt.name);

    if (selectedOptions.length > 0) {
      newSelectedOptionsMap[variation._id] = selectedOptions;
      newSelectedVariationIds.add(variation._id);
    }
  });

  setSelectedVariationIds(Array.from(newSelectedVariationIds));
  setSelectedOptionsMap(newSelectedOptionsMap);
}

        // ===============================================================

      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Failed to fetch product data.");
        navigate("/product");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // ===================================================================
  // Handlers
  // ===================================================================
  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

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

  // ===================================================================
  // توليد التوليفات الجديدة لو تم تعديل التنوعات (بدون تغيير)
  // ===================================================================
  useEffect(() => {
    if (form.different_price) {
      const newVariants = generateCombinations(selectedOptionsMap, allVariations);
      setForm((prevForm) => {
        const updatedPrices = newVariants.map((newVariant) => {
          // البحث عن التوليفة القديمة للمحافظة على بياناتها (السعر/الكمية/الـ ID)
          const oldVariant = prevForm.prices.find((p) => {
             // المقارنة تتم بناءً على مصفوفة ID الخيارات (options)
             if (!p.options || p.options.length !== newVariant.options.length) return false;
             // تحويل مصفوفة الـ IDs إلى سلاسل للمقارنة بشكل أسهل
             const oldOptionsStr = [...p.options].sort().join(',');
             const newOptionsStr = [...newVariant.options].sort().join(',');
             return oldOptionsStr === newOptionsStr;
          });

          // دمج البيانات القديمة مع البيانات الجديدة (الاسم والـ IDs)
          return oldVariant
            ? { ...newVariant, ...oldVariant }
            : newVariant; // توليفة جديدة
        });
        return { ...prevForm, prices: updatedPrices };
      });
    } else {
      setForm((prevForm) => ({ ...prevForm, prices: [] }));
    }
  }, [selectedOptionsMap, form.different_price, allVariations]);

  // ===================================================================
  // Submit (Update Product)
  // ===================================================================
  const cleanBase64 = (dataUri) =>
    typeof dataUri === "string" && dataUri.startsWith("data:")
      ? dataUri.split(",")[1]
      : dataUri;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let finalData = {
        ...form,
        image: cleanBase64(form.image),
        gallery_product: form.gallery_product.map((img) => cleanBase64(img)),
      };

      if (form.different_price) {
        // إرسال البيانات المطلوبة فقط للـ API
        finalData.prices = form.prices.map((variant) => ({
          price: variant.price,
          options: variant.options, // هذه هي مصفوفة IDs الخيارات المطلوبة
          code: variant.code,
          quantity: variant.stock,
          ...(variant._id && { _id: variant._id }),
        }));
      }

      await api.put(`/api/admin/product/${id}`, finalData);
      toast.success("Product updated successfully!");
      navigate("/product");
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetching) return <Loader />;

  const formProps = {
    form,
    handleChange,
    categories,
    brands,
    allVariations,
    handleImageUpload,
    removeGalleryImage,
    selectedVariationIds,
    handleVariationChange,
    selectedOptionsMap,
    handleOptionsChange,
    handleVariantFieldChange,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex border-b mb-4">
              <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
              <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
              <TabsTrigger value="price" className="flex-1">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <ProductGeneralTab {...formProps} />
            </TabsContent>

            <TabsContent value="media">
              <ProductMediaTab {...formProps} />
            </TabsContent>

            <TabsContent value="price">
              <ProductPriceTab {...formProps} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/product")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductEdit;