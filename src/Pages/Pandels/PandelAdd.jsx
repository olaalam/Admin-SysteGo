import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AddPage from "@/components/AddPage";
import ProductSelector from "@/components/ProductSelector";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import api from "@/api/api";

const PandelAdd = () => {
  const navigate = useNavigate();
  const { data: productsData, loading: productsLoading } = useGet("/api/admin/product");
  const [loading, setLoading] = useState(false);

  const products = productsData?.products || [];

  const fields = [
    { key: "name", label: "Pandel Name", type: "text", required: true, placeholder: "Enter pandel name" },
    { key: "startdate", label: "Start Date", type: "date", required: true },
    { key: "enddate", label: "End Date", type: "date", required: true },
    {
      key: "price",
      label: "Price (EGP)",
      type: "number",
      required: true,
      placeholder: "Enter price",
      min: 0,
      step: "0.01"
    },
    {
      key: "images",
      label: "Images",
      type: "custom",
      required: false,
      render: (formData, setFormData) => (
        <ImageUploadSection 
          images={formData.images || []} 
          onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
        />
      )
    },
    {
      key: "productsId",
      label: "Products",
      type: "custom",
      required: true,
      render: (formData, setFormData) => (
        <ProductSelector
          products={products}
          selectedProducts={formData.productsId || []}
          onProductsChange={(products) => setFormData(prev => ({ ...prev, productsId: products }))}
          label="Add Products to Pandel"
          showQuantity={false}
        />
      )
    }
  ];

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      // تنظيف الصور: نرسل للسيرفر الجزء الـ Base64 فقط بدون الديباجة
      const imagesToSubmit = (formData.images || []).map(img => {
        if (img.includes("base64,")) {
          return img.split("base64,")[1];
        }
        return img;
      });

      const payload = {
        name: formData.name,
        productsId: formData.productsId,
        images: imagesToSubmit,
        startdate: formData.startdate,
        enddate: formData.enddate,
        price: Number(formData.price)
      };

      await api.post("/api/admin/pandel", payload);
      toast.success("Pandel created successfully!");
      navigate("/pandel");
    } catch (err) {
      console.error("❌ Error creating pandel:", err);
      const errorMessage = err.response?.data?.message || "Failed to create pandel";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (productsLoading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <AddPage
        title="Create New Pandel"
        description="Add a new pandel with products and details"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/pandel")}
        initialData={{
          name: "",
          startdate: "",
          enddate: "",
          price: "",
          productsId: [],
          images: []
        }}
        loading={loading}
        submitButtonText="Create Pandel"
      />
    </div>
  );
};

const ImageUploadSection = ({ images, onImagesChange }) => {
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // استخدام Promise.all لمعالجة الملفات معاً وتحديث الـ state مرة واحدة
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // نأخذ الـ result كاملاً (Data URL)
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(newImages => {
      onImagesChange([...images, ...newImages]);
    });
  };

  const removeImage = (index) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-600">Click to upload images</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
        </div>
        <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img} // هنا الـ src سيعمل مباشرة لأننا خزنّاه كـ Data URL
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PandelAdd;