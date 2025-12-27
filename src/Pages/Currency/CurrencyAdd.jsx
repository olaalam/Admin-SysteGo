// src/pages/currencyAdd.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";

const CurrencyAdd = () => {
  const navigate = useNavigate();

  const { postData, loading } = usePost("/api/admin/currency");

  // ✅ تعديل الحقول لتتوافق مع body الجديد
  const fields = [
    { key: "name", label: "currency Name", required: true },
    { key: "ar_name", label: "Arabic Name", required: true },
    { key: "amount", label: "Amount", required: true, type: "number" },
  ];

  const handleSubmit = async (data) => {
    try {
      console.log("📤 Submitting data:", data);

      await postData(data);

      toast.success("currency added successfully! 🎉");
      navigate("/currency");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add currency";

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
        title="Add currency"
        description="Enter the details of the new currency"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/currency")}
        loading={loading}
        initialData={{ name: "", ar_name: "", amount: "" }}
      />
    </div>
  );
};

export default CurrencyAdd;
