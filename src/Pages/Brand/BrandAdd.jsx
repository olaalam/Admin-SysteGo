// src/pages/brandAdd.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";

const BrandAdd = () => {
  const navigate = useNavigate();

  const fields = [
    { key: "name", label: "Name", required: true },
    { key: "logo", label: "Logo", type: "image", required: true }, // ✅ غيرنا النوع لـ image
  ];

  const handleSubmit = async (data) => {
    try {
      await api.post("/api/admin/brand/", data);
      toast.success("Brand added successfully!");
      navigate("/brand");
    } catch (err) {
      // ✅ عرض الأخطاء من الـ API
      const errorMessage = 
        err.response?.data?.error?.message || 
        err.response?.data?.message || 
        "Failed to add Brand";
      
      const errorDetails = err.response?.data?.error?.details;
      
      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach(detail => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }
      
      console.error("❌ Error:", err.response?.data);
    }
  };

  return (
    <div className="p-6">
      <AddPage
        title="Add Brand"
        description="Upload logo and fill in the details"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/brand")}
        initialData={{ status: true }}
      />
    </div>
  );
};

export default BrandAdd;