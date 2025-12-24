// src/pages/AddProductToWarehouse.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { toast } from "react-toastify";
import AddPage from "@/components/AddPage";
import ProductSelector from "@/components/ProductSelector"; // هذا المكون يحتوي على البحث
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import api from "@/api/api";

const ProductWarehouseAdd = () => {
  const navigate = useNavigate();
  const { data: productsData, loading: productsLoading } = useGet("/api/admin/product");
  const [loading, setLoading] = useState(false);
const warehouseId = localStorage.getItem("currentWarehouseId");
  const products = productsData?.products || [];

  // تعريف الحقول بناءً على الـ Body المطلوب
  const fields = [
    {
      key: "productId",
      label: "Select Product",
      type: "custom",
      required: true,
      // نستخدم ProductSelector للحفاظ على خاصية البحث
      render: (formData, setFormData) => (
        <ProductSelector
          products={products}
          // ProductSelector يتعامل عادة مع مصفوفة، لذا نحول الـ id إلى مصفوفة للعرض
          selectedProducts={formData.productId ? [formData.productId] : []} 
          onProductsChange={(selectedIds) => {
            // نأخذ آخر عنصر تم اختياره لأننا نريد منتجاً واحداً فقط
            const singleId = selectedIds.length > 0 ? selectedIds[selectedIds.length - 1] : "";
            setFormData((prev) => ({ ...prev, productId: singleId }));
          }}
          label="Search & Select Product"
          showQuantity={false}
        />
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
      type: "number",
      required: true,
      placeholder: "Enter quantity (e.g., 30)",
      min: 1,
    },
    {
      key: "low_stock",
      label: "Low Stock Alert Limit",
      type: "number",
      required: true,
      placeholder: "Enter low stock limit (e.g., 5)",
      min: 0,
    },
  ];

  const handleSubmit = async (formData) => {
    // التحقق من وجود المخزن والمنتج
    if (!warehouseId) {
        toast.error("Warehouse ID is missing!");
        return;
    }
    if (!formData.productId) {
        toast.error("Please select a product!");
        return;
    }

    setLoading(true);
    try {
      // 2. تجهيز البيانات بنفس الشكل المطلوب (JSON Body)
      const payload = {
        productId: formData.productId,
        warehouseId: warehouseId, // يتم أخذه تلقائياً من الرابط
        quantity: Number(formData.quantity),
        low_stock: Number(formData.low_stock),
      };

      // يرجى التأكد من مسار الـ API الصحيح للإضافة
      await api.post("/api/admin/product_warehouse", payload);
      
      toast.success("Product added to warehouse successfully!");
      navigate(`/product-warehouse/${warehouseId}`); // العودة لصفحة تفاصيل المخزن
    } catch (err) {
      console.error("❌ Error adding product:", err);
      const errorMessage = err.response?.data?.message || "Failed to add product";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (productsLoading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <AddPage
        title="Add Product to Warehouse"
        description="Search for a product and assign stock levels"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/product-warehouse/${warehouseId}`)}
        initialData={{
          productId: "",
          quantity: "",
          low_stock: "",
        }}
        loading={loading}
        submitButtonText="Add to Stock"
      />
    </div>
  );
};

export default ProductWarehouseAdd;