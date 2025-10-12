// src/pages/BankAccountAdd.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";

const BankAccountAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ✅ الـ fields بتطابق الداتا اللي في الجدول
  const fields = [
    { 
      key: "account_no", 
      label: "Account Number", 
      type: "text",
      required: true,
      placeholder: "Enter account number"
    },
    { 
      key: "name", 
      label: "Bank Name", 
      type: "text",
      required: true,
      placeholder: "Enter bank name"
    },
    { 
      key: "initial_balance", 
      label: "Initial Balance", 
      type: "number",
      required: true,
      placeholder: "0"
    },
    { 
      key: "is_default", 
      label: "Set as Default Account", 
      type: "checkbox",
      required: false 
    },
    { 
      key: "note", 
      label: "Note", 
      type: "textarea",
      required: false,
      placeholder: "Add any notes (optional)"
    },
  ];

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      console.log("📤 Submitting data:", data);
      
      await api.post("/api/admin/bank_account/", data);
      
      toast.success("Bank account added successfully!");
      navigate("/accounting");
    } catch (err) {
      console.error("❌ Error adding bank account:", err);
      
      // ✅ عرض الأخطاء من الـ API
      const errorMessage = 
        err.response?.data?.error?.message || 
        err.response?.data?.message || 
        "Failed to add bank account";
      
      const errorDetails = err.response?.data?.error?.details;
      
      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach(detail => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate("/accounting");

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title="Add Bank Account"
        description="Fill in the bank account details"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialData={{ 
          account_no: "",
          name: "",
          initial_balance: 0,
          is_default: false,
          note: ""
        }}
        loading={loading}
      />
    </div>
  );
};

export default BankAccountAdd;