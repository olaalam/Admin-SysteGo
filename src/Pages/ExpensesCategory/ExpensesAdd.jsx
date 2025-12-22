// src/pages/ExpenseCategoryAdd.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";

const ExpenseCategoryAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fields = [
    {
      key: "name",
      label: "Name (English)",
      type: "text",
      required: true,
      placeholder: "e.g. Electricity Bill",
    },
    {
      key: "ar_name",
      label: "Name (Arabic)",
      type: "text",
      required: true,
      placeholder: "مثال: فاتورة الكهرباء",
    },
    {
      key: "status",
      label: "Active Status",
      type: "switch",
      required: false,
    },
  ];

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      // ✅ إرسال البيانات للـ API
      const payload = {
        name: formData.name,
        ar_name: formData.ar_name,
        status: formData.status,
      };

      await api.post("/api/admin/expenseCategory", payload);

      toast.success("Expense category added successfully!");
      navigate("/expense");
    } catch (err) {
      console.error("❌ Error adding expense category:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Failed to add expense category";

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title="Add New Expense Category"
        description="Create a new expense category for tracking expenses"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/expense")}
        initialData={{
          status: true, // افتراضيًا active
        }}
        loading={loading}
        submitButtonText="Create Expense Category"
      />
    </div>
  );
};

export default ExpenseCategoryAdd;