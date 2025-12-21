// src/pages/warehouseAdd.jsx (النسخة النهائية باستخدام usePost)
import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
// ⭐️ استيراد الـ Hook المخصص
import usePost from "@/hooks/usePost"; 

const WareHouseAdd = () => {
  const navigate = useNavigate();
  
  // ⭐️ استخدام usePost: تحديد المسار وجلب postData وحالة التحميل loading
  const { postData, loading } = usePost("/api/admin/warehouse/");

  const fields = [
    { key: "name", label: "Name", required: true },
    { key: "address", label: "Address", required: true },
    { key: "phone", label: "Phone", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    // إضافة حقل اختياري لتحديد ما إذا كان المستودع هو المستودع الافتراضي
  ];

  const handleSubmit = async (data) => {
    try {
      // ⭐️ استخدام postData بدلاً من api.post
      await postData(data);
      
      toast.success("Warehouse added successfully! 🎉");
      navigate("/warehouse");
    } catch (err) {
      // ✅ التعامل مع الأخطاء التفصيلية (مطابقة لـ AdminAdd.jsx)
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add warehouse";

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
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title="Add Warehouse"
        description="Fill in the warehouse details"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/warehouse")}
        // ⭐️ استخدام حالة التحميل من الـ Hook
        loading={loading} 
        initialData={{
          name: "",
          address: "",
          phone: "",
          email: "",
          // stock_Quantity: 0, // 💡 هذا الحقل قد يكون غير ضروري في initialData لصفحة الإضافة
        }}
      />
    </div>
  );
};

export default WareHouseAdd;