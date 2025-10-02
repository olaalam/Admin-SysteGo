// src/pages/productAdd.jsx

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "@/api/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
// Components for Tabs Content
import ProductGeneralTab from "./ProductGeneralTab";
import ProductMediaTab from "./ProductMediaTab";
import ProductPriceTab from "./ProductPriceTab";
import useGet from "@/hooks/useGet";

// ----------------------------------------------------------------------
// الدالة المساعدة لتوليد جميع التوليفات الممكنة (Combinations / Variants)
// ----------------------------------------------------------------------
const generateCombinations = (optionsMap, allVariations) => {
    // 1. تصفية التنوعات التي تحتوي على خيارات مختارة فقط
    const activeOptions = Object.entries(optionsMap)
        .filter(([id, options]) => options && options.length > 0)
        .map(([id, options]) => {
            const variation = allVariations.find(v => v.id == id);
            return {
                variationId: id,
                variationName: variation ? variation.name : `ID ${id}`,
                options: options.map(optionName => ({ 
                    name: optionName,
                    id: `${id}-${optionName}` // معرف فريد للخيار
                }))
            };
        });

    if (activeOptions.length === 0) return [];

    // 2. عملية الضرب الديكارتي (Cartesian Product) لتوليد التوليفات
    const initialCombinations = [
        // نبدأ بأول مجموعة خيارات
        ...activeOptions[0].options.map(option => ({
            name: option.name,
            option_details: [
                { id: option.id, variation_name: activeOptions[0].variationName, option_value: option.name }
            ]
        }))
    ];

    // تجميع الخيارات المتبقية
    const finalCombinations = activeOptions.slice(1).reduce((combinations, currentVariation) => {
        const newCombinations = [];
        currentVariation.options.forEach(option => {
            combinations.forEach(combo => {
                newCombinations.push({
                    name: `${combo.name} / ${option.name}`,
                    option_details: [
                        ...combo.option_details,
                        { id: option.id, variation_name: currentVariation.variationName, option_value: option.name }
                    ]
                });
            });
        });
        return newCombinations;
    }, initialCombinations);


    // 3. إضافة الحقول الافتراضية لكل متغير (Variant)
    return finalCombinations.map(combo => ({
        ...combo,
        price: 0,
        stock: 0,
        sku: '',
        image: ''
    }));
};
// ----------------------------------------------------------------------

const ProductAdd = () => {
 const navigate = useNavigate();
 const [categories, setCategories] = useState([]);
 const [brands, setBrands] = useState([]);
 const [activeTab, setActiveTab] = useState("general");
 const [allVariations, setAllVariations] = useState([]);

    // 💡 حالات التنوعات والخيارات المختارة
 const [selectedVariationIds, setSelectedVariationIds] = useState([]); 
 const [selectedOptionsMap, setSelectedOptionsMap] = useState({}); 

 const [form, setForm] = useState({
 name: "",
 categoryId: [],
 brandId: "",
 unit: "piece",
 description: "",
 mini_purchase: 1,
 image: "",
 gallery: [],
 price: 0,
 different_price: false, // لتمكين التنوعات (Variants)
 prices: [], // مصفوفة التنوعات الناتجة (Variants)
 discount: 0,
 });

 // fetch categories & brands
 const { data, loading } = useGet("/api/admin/product");

 useEffect(() => {
 if (data) {
 setCategories(data.categories || []);
 setBrands(data.brands || []);
 setAllVariations(data.variations || []); // جلب التنوعات من الـ API
 }
 }, [data]);

 // General change handler for form fields
 const handleChange = (key, value) => {
 setForm((prev) => ({ ...prev, [key]: value }));
 };

 // Handler for image uploads (single and multiple)
 const handleImageUpload = (e, multiple = false) => {
 const files = e.target.files;
 if (!files.length) return;
 [...files].forEach((file) => {
 const reader = new FileReader();
 reader.onload = () => {
 if (multiple) {
 setForm((prev) => ({
  ...prev,
  gallery: [...prev.gallery, reader.result],
 }));
 } else {
 setForm((prev) => ({ ...prev, image: reader.result }));
 }
 };
 reader.readAsDataURL(file);
 });
 };

 // Handler to remove a gallery image
 const removeGalleryImage = (index) => {
 setForm((prev) => ({
 ...prev,
 gallery: prev.gallery.filter((_, i) => i !== index),
 }));
 };

    // 💡 دالة لتحديث قائمة التنوعات المختارة
    const handleVariationChange = (ids) => {
        setSelectedVariationIds(ids);

        // قم بإزالة الخيارات الخاصة بالتنوعات التي تم إلغاء اختيارها
        setSelectedOptionsMap(prev => {
            const newMap = {};
            ids.forEach(id => {
                // احتفظ بالخيارات الموجودة مسبقاً لهذا التنوع، أو ابدأ بمصفوفة فارغة
                newMap[id] = prev[id] || []; 
            });
            return newMap;
        });
    };

    // 💡 دالة لتحديث الخيارات المختارة لتنوع معين
    const handleOptionsChange = useCallback((variationId, options) => {
        setSelectedOptionsMap(prev => ({
            ...prev,
            [variationId]: options
        }));
    }, []);

    // 💡 دالة لتحديث حقل معين (مثل price أو stock) لتنوع ناتج محدد
    const handleVariantFieldChange = useCallback((index, key, value) => {
        setForm(prevForm => {
            const newPrices = [...prevForm.prices];
            newPrices[index] = { ...newPrices[index], [key]: value };
            return { ...prevForm, prices: newPrices };
        });
    }, []);

    // 💡 تأثير لتوليد التنوعات (Variants) تلقائياً عند تغيير الخيارات أو تفعيل 'different_price'
    useEffect(() => {
        if (form.different_price) {
            const newVariants = generateCombinations(selectedOptionsMap, allVariations);

            // ننسخ القيم الموجودة مسبقاً (الأسعار، المخزون، إلخ) إلى التوليفات الجديدة للحفاظ على المدخلات
            setForm(prevForm => {
                const updatedPrices = newVariants.map(newVariant => {
                    // محاولة إيجاد متغير مطابق في القائمة القديمة (بالاسم أو معرف فريد إذا كان متاحًا)
                    const oldVariant = prevForm.prices.find(
                        p => p.name === newVariant.name 
                    );

                    // إرجاع المتغير القديم مع دمج تفاصيل التنوع الجديدة، أو المتغير الجديد
                    return oldVariant ? { ...newVariant, ...oldVariant } : newVariant;
                });

                return { ...prevForm, prices: updatedPrices };
            });
        }
        // إذا تم إلغاء تفعيل different_price، نمسح مصفوفة prices
        if (!form.different_price && form.prices.length > 0) {
            setForm(prevForm => ({ ...prevForm, prices: [] }));
        }

    }, [selectedOptionsMap, form.different_price, allVariations]);


 // Submit handler
 const handleSubmit = async () => {
    // 💡 يمكنك هنا إضافة منطق للتحقق من أن التنوعات تم ملؤها إذا كانت مفعلة
 try {
 await api.post("/api/admin/product", form);
 toast.success("Product added successfully! 🎉");
 navigate("/products");
 } catch (err) {
 console.error("❌ Error:", err.response?.data);
 const errorMessage =
 err.response?.data?.message || "Failed to add product";
 toast.error(errorMessage);
 }
 };

 // Object to pass to child components (Tabs)
 const formProps = {
 form,
 handleChange,
 categories,
 brands,
 handleImageUpload,
 removeGalleryImage,
 loading,
    // props الخاصة بالتنوعات (Variants) 💡
 allVariations, 
 selectedVariationIds, 
 handleVariationChange, 
 selectedOptionsMap, 
 handleOptionsChange, 
 handleVariantFieldChange,
 };

 return (
 <div className="min-h-screen bg-gray-50 p-6">
 <div className=" mx-auto">
 {/* Header */}
 <div className="mb-6">
 <div className="flex items-center gap-3 mb-2">
  <button
  onClick={() => navigate("/products")}
  className="text-gray-600 hover:text-gray-900 transition-colors"
  >
  <svg
  className="h-6 w-6"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  >
  <path
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth={2}
  d="M10 19l-7-7m0 0l7-7m-7 7h18"
  />
  </svg>
  </button>
  <h1 className="text-2xl font-bold text-gray-900">
  Add New Product
  </h1>
 </div>
 <p className="text-gray-600 ml-9">
  Fill in the product details below
 </p>
 </div>

 {/* Main Card and Tabs */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
 <Tabs value={activeTab} onValueChange={setActiveTab}>
  {/* Tabs List (Triggers) */}
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

  {/* General Tab Content */}
  <TabsContent value="general" className="p-6 mt-0">
  <ProductGeneralTab {...formProps} />
  </TabsContent>

  {/* Media Tab Content */}
  <TabsContent value="media" className="p-6 mt-0">
  <ProductMediaTab {...formProps} />
  </TabsContent>

  {/* Price Tab Content */}
  <TabsContent value="price" className="p-6 mt-0">
  <ProductPriceTab {...formProps} />
  </TabsContent>
 </Tabs>
 </div>

 {/* Action Buttons */}
 <div className="mt-6 flex items-center justify-end gap-3">
 <Button
  variant="outline"
  onClick={() => navigate("/products")}
  className="px-6"
 >
  Cancel
 </Button>
 <Button
  onClick={handleSubmit}
  className="px-8 bg-secondary hover:bg-secondary/90"
 >
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
 </Button>
 </div>
 </div>
 </div>
 );
};

export default ProductAdd;