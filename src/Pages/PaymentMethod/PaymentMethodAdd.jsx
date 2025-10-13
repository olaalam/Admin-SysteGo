import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";

const PaymentMethodAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // ✅ حالة التحميل

  const fields = [
    { key: "name", label: "Name", required: true },
    { key: "discription", label: "Description", required: false },
    { key: "icon", label: "Icon / Logo", type: "image", required: true },
  ];

  const handleSubmit = async (data) => {
    setLoading(true); // ✅ تعطيل الزر
    try {
      await api.post("/api/admin/payment_method/", data);
      toast.success("Payment method added successfully!");
      navigate("/payment_method");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add payment method";

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    } finally {
      setLoading(false); // ✅ إعادة التمكين بعد الانتهاء
    }
  };

  return (
    <div className="p-6">
      <AddPage
        title="Add Payment Method"
        description="Upload logo and fill in the details"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/payment_method")}
        initialData={{ status: true }}
        loading={loading} // ✅ تمرير الحالة إلى AddPage
      />
    </div>
  );
};

export default PaymentMethodAdd;
