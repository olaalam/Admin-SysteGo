// src/pages/VariationAdd.jsx (النسخة النهائية والمحسّنة)
import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import usePost from "@/hooks/usePost"; // ✅ يتم استخدام usePost بشكل صحيح
import { toast } from "react-toastify";

// ⭐️ تم تغيير اسم المكون ليعكس اسم الملف (VariationAdd)
const VariationAdd = () => {
  const navigate = useNavigate();

  // الحقول المطلوبة
  const fields = [
    { key: "name", label: "Variation Name", required: true },
    {
      key: "options",
      label: "Options",
      type: "array", // Array input
      subFields: [
        { key: "name", label: "Option Name", required: true },
        // ✅ تغيير type: "checkbox" إلى "switch" ليكون أكثر حداثة
        { key: "status", label: "Status", type: "switch", initialValue: true }, 
      ],
    },
  ];

  // ✅ استخدام Hook: جلب الدالة postData وحالة التحميل loading
  const { postData, loading } = usePost("/api/admin/variation");

  const handleSubmit = async (data) => {
    try {
      // تجهيز الـ payload ليناسب متطلبات الـ backend
      const payload = {
        name: data.name,
        // ✅ التأكد من تعيين قيمة status كـ boolean (true/false)
        options: (data.options || []).map((opt) => ({
          name: opt.name,
          status: opt.status ?? false, 
        })),
      };

      console.log("🚀 Sending payload:", payload);

      // ⭐️ يتم إرسال البيانات وإدارة التحميل والأخطاء بواسطة Hook usePost
      await postData(payload); 

      toast.success("Variation added successfully! 🎉");
      // ✅ تعديل مسار التنقل ليكون مطابقًا لـ Variations (افتراضًا)
      navigate("/variations"); 
    } catch (err) {
      // ✅ التعامل مع الأخطاء كما هو معتاد (يُفترض أن usePost يعيد الخطأ بعد معالجته)
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
        // ✅ تعديل مسار الإلغاء ليكون مطابقًا لـ Variations (افتراضًا)
        onCancel={() => navigate("/variations")}
        // ✅ استخدام حالة التحميل من الـ Hook
        loading={loading}
      />
    </div>
  );
};

// ⭐️ تم تغيير اسم التصدير ليتطابق مع اسم المكون الجديد
export default VariationAdd;