// src/pages/CountryAdd.jsx (النسخة النهائية باستخدام usePost)
import React from "react"; // ⭐️ تم إزالة useEffect و useState غير الضروريين
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
// ⭐️ استيراد الـ Hook المخصص
import usePost from "@/hooks/usePost"; 

const CountryAdd = () => {
  const navigate = useNavigate();

  // ⭐️ استخدام usePost: تحديد المسار وجلب postData وحالة التحميل loading
  const { postData, loading } = usePost("/api/admin/country");

  // إعداد الـ fields (تم تبسيطها)
  const fields = [
    { key: "name", label: "Country Name", required: true },
    // إضافة حقل اختياري لحالة التفعيل
    { key: "status", label: "Is Active", type: "switch", initialValue: true }, 
  ];

  // الإرسال
  const handleSubmit = async (data) => {
    try {
      console.log("📤 Submitting data:", data);

      // ⭐️ استخدام postData بدلاً من api.post
      await postData(data); 

      toast.success("Country added successfully! 🎉");
      navigate("/country");
    } catch (err) {
      // ✅ التعامل مع الأخطاء (نفس المنطق التفصيلي)
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add country";

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
        title="Add Country"
        description="Enter the name of the new country"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/country")}
        // ⭐️ استخدام حالة التحميل من الـ Hook
        loading={loading}
        initialData={{ name: "", status: true }}
      />
    </div>
  );
};

export default CountryAdd;