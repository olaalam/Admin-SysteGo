// src/pages/ProductAdd.jsx (النسخة النهائية والمحسّنة)
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import ProductForm from "./ProductForm";

const ProductAdd = () => {
  const navigate = useNavigate();
  // ✅ استخدام usePost لإدارة الإرسال والتحميل
  const { postData, loading } = usePost("/api/admin/product");

  const handleAdd = async (data) => {
    try {
      // ✅ استدعاء postData لإرسال البيانات
      await postData(data);
      toast.success("✅ Product added successfully! 🎉");
      navigate("/product");
    } catch (err) {
      // ⭐️ التعديل: التعامل مع الأخطاء التفصيلية من الـ API (مطابقة لـ AdminAdd.jsx)
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "❌ Failed to add product"; // رسالة خطأ عامة كاحتياط

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        // عرض كل خطأ تفصيلي بشكل منفصل
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        // عرض رسالة الخطأ الرئيسية
        toast.error(errorMessage);
      }
      
      console.error("❌ Error adding product:", err.response?.data || err);
    }
  };

  return (
    // ✅ تمرير حالة التحميل loading من الـ Hook
    <ProductForm mode="add" onSubmit={handleAdd} loading={loading} />
  );
};

export default ProductAdd;