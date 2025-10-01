// src/pages/VariationAdd.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import usePost from "@/hooks/usePost"; // ✅ بنستخدم usePost
import { toast } from "react-toastify";

const AttributeAdd = () => {
  const navigate = useNavigate();

  // الحقول المطلوبة
  const fields = [
    { key: "name", label: "Variation Name", required: true },
    {
      key: "options",
      label: "Options",
      type: "array", // ✅ Array input
      subFields: [
        { key: "name", label: "Option Name", required: true },
        { key: "status", label: "Status", type: "checkbox" },
      ],
    },
  ];

  const { postData, loading } = usePost("/api/admin/variation");

  const handleSubmit = async (data) => {
    try {
      // ✅ نظبط الـ payload زي ما الـ backend عاوز
      const payload = {
        name: data.name,
        options: (data.options || []).map((opt) => ({
          name: opt.name,
          status: opt.status ?? false,
        })),
      };

      console.log("🚀 Sending payload:", payload);

      await postData(payload);

      toast.success("Variation added successfully!");
      navigate("/attribute");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add variation";

      const errorDetails = err.response?.data?.error?.details;
      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  return (
    <div className="p-6">
      <AddPage
        title="Add Variation"
        description="Fill variation name and options"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/attribute")}
        loading={loading}
      />
    </div>
  );
};

export default AttributeAdd;
