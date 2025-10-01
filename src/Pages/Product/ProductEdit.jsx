// src/pages/productEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { putData, loading: updating } = usePut(`/api/admin/product/${id}`);

  const [productData, setProductData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [prodRes, catsRes, brandsRes] = await Promise.all([
          api.get(`/api/admin/product/${id}`),
          api.get("/api/admin/category"),
          api.get("/api/admin/brand"),
        ]);

        const product = prodRes.data.data;
        setCategories(catsRes.data?.categories || []);
        setBrands(brandsRes.data?.brands || []);

        setProductData({
          name: product.name || "",
          image: product.image || "",
          categoryId: product.categoryId?.map((c) => c._id) || [],
          brandId: product.brandId?._id || "",
          unit: product.unit || "piece",
          price: product.price || 0,
          quantity: product.quantity || 0,
          description: product.description || "",
          different_price: product.different_price || false,
          prices: product.prices?.map((p) => ({
            _id: p._id, // عشان نعرف لو تعديل
            price: p.price,
            code: p.code,
            gallery: p.gallery || [],
            options: p.options?.filter(Boolean) || [],
          })),
        });
      } catch (err) {
        toast.error("Failed to fetch product data");
        console.error("❌ Error fetching product:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [id]);

  const fields = [
    { key: "name", label: "Name", required: true },
    { key: "image", label: "Main Image", type: "image", required: true },
    {
      key: "categoryId",
      label: "Category",
      type: "select",
      options: categories.map((c) => ({ value: c._id, label: c.name })),
    },
    {
      key: "brandId",
      label: "Brand",
      type: "select",
      options: brands.map((b) => ({ value: b._id, label: b.name })),
    },
    { key: "unit", label: "Unit", required: true },
    { key: "price", label: "Base Price", type: "number" },
    { key: "quantity", label: "Quantity", type: "number" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "different_price", label: "Different Prices", type: "checkbox" },
    // 👇 ممكن هنا نعمل مكون خاص للـ prices[]
  ];

  const handleSubmit = async (formData) => {
    try {
      // نجهز الـ payload
      const payload = {
        ...formData,
        categoryId: Array.isArray(formData.categoryId)
          ? formData.categoryId
          : [formData.categoryId],
        brandId: formData.brandId,
        prices: formData.prices?.map((p) => {
          const obj = {
            price: p.price,
            code: p.code,
            options: p.options || [],
            gallery: p.gallery || [],
          };
          if (p._id) obj._id = p._id; // update موجود
          return obj;
        }),
      };

      await putData(payload);
      toast.success("Product updated successfully!");
      navigate("/products");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to update product";

      if (err.response?.data?.error?.details) {
        err.response.data.error.details.forEach((d) => toast.error(d));
      } else {
        toast.error(errorMessage);
      }
      console.error("❌ Error updating product:", err.response?.data);
    }
  };

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {productData && (
        <AddPage
          title={`Edit Product: ${productData?.name || "..."}`}
          description="Update product details, media, and prices"
          fields={fields}
          initialData={productData}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/products")}
          loading={updating}
        />
      )}
    </div>
  );
}
