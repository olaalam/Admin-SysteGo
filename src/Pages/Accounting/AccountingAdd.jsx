// src/pages/BankAccountAdd.jsx (النسخة النهائية باستخدام usePost)
import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
// ⭐️ افتراض: استخدام Hook مخصص للـ POST لتبسيط إدارة التحميل
import  usePost  from "@/hooks/usePost"; // يجب توفر هذا الـ Hook في مسارك

const BankAccountAdd = () => {
  const navigate = useNavigate();

  // ⭐️ استخدام usePost بدلاً من إدارة setLoading يدوياً
  const { postData, loading: submitting } = usePost("/api/admin/bank_account/");

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
      type: "switch", 
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
    try {
      console.log("📤 Submitting data:", data);
      
      // ⭐️ استخدام postData من الـ Hook
      await postData(data);
      
      toast.success("Bank account added successfully!");
      navigate("/accounting");
    } catch (err) {
      console.error("❌ Error adding bank account:", err);
      
      // ✅ ملاحظة: إدارة الأخطاء تتم عادةً داخل الـ Hook نفسه لتبسيط الكود هنا
      // لكن يمكننا ترك منطق عرض التوست هنا (أو إزالته إذا كان Hook usePost يعالجها)
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
        // ⭐️ استخدام حالة التحميل من الـ Hook
        loading={submitting} 
      />
    </div>
  );
};

export default BankAccountAdd;