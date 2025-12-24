// src/pages/PandelEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import AddPage from "@/components/AddPage";
import ProductSelector from "@/components/ProductSelector";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";

const PandelEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { putData, loading: updating } = usePut(`/api/admin/pandel/${id}`);

  const { data: productsData, loading: productsLoading } = useGet("/api/admin/product");
  const { data: pandelData, loading: pandelLoading } = useGet(`/api/admin/pandel/${id}`);
  const [loading, setLoading] = useState(false);

  if (productsLoading || pandelLoading) return <Loader />;

  const products = productsData?.products || [];
  const pandel = pandelData?.pandel || {};

  // تحويل ISO Date لـ YYYY-MM-DD
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fields = [
    {
      key: "name",
      label: "Pandel Name",
      type: "text",
      required: true,
      placeholder: "Enter pandel name"
    },
    {
      key: "startdate",
      label: "Start Date",
      type: "date",
      required: true
    },
    {
      key: "enddate",
      label: "End Date",
      type: "date",
      required: true
    },
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
const toBase64 = (url) => {
  return fetch(url)
    .then(res => res.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]); // ناخد بس Base64 بدون data:image/...
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));
};
  const handleSubmit = async (formData) => {
    // Validation
    if (!formData.name?.trim()) return toast.error("Please enter pandel name");
    if (!formData.startdate) return toast.error("Please select start date");
    if (!formData.enddate) return toast.error("Please select end date");
    if (new Date(formData.enddate) < new Date(formData.startdate)) return toast.error("End Date cannot be earlier than Start Date");
    if (!formData.price || formData.price <= 0) return toast.error("Please enter valid price");
    if (!formData.productsId?.length) return toast.error("Please select at least one product");

    setLoading(true);
    try {
           const imagesBase64 = await Promise.all(formData.images.map(img => {
      if (img.startsWith("http")) return toBase64(img);
      return img; // Base64 موجود
    }));
      const payload = {
        name: formData.name,
        productsId: formData.productsId,
        images: imagesBase64,
        startdate: formData.startdate,
        enddate: formData.enddate,
        price: Number(formData.price)
      };

      await putData(payload);
      toast.success("Pandel updated successfully!");
      navigate("/pandel");
    } catch (err) {
      console.error("❌ Error updating pandel:", err);
      const errorMessage = err.response?.data?.message || "Failed to update pandel";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <AddPage
        title={`Edit Pandel: ${pandel.name || ""}`}
        description="Update pandel details"
        fields={fields}
        initialData={{
          name: pandel.name || "",
          startdate: formatDate(pandel.startdate),
          enddate: formatDate(pandel.enddate),
          price: pandel.price || "",
          productsId: pandel.productsId || [],
          images: pandel.images || []
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/pandel")}
        loading={loading || updating}
        submitButtonText="Update Pandel"
      />
    </div>
  );
};

// Image Upload Component (Reuse from Add)
const ImageUploadSection = ({ images, onImagesChange }) => {
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        onImagesChange([...images, base64String]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => onImagesChange(images.filter((_, i) => i !== index));

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
              <img src={`data:image/jpeg;base64,${img}`} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg border-2 border-gray-200" />
              <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

export default PandelEdit;
