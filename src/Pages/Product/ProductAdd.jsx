import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import ProductForm from "./ProductForm";

const ProductAdd = () => {
  const navigate = useNavigate();
  const { postData, loading } = usePost("/api/admin/product");

  const handleAdd = async (data) => {
    try {
      // ✅ هنا نكتفي باستدعاء postData(data)
      await postData(data);
      toast.success("✅ Product added successfully!");
      navigate("/product");
    } catch {
      toast.error("❌ Failed to add product");
    }
  };

  return (
    <ProductForm mode="add" onSubmit={handleAdd} loading={loading} />
  );
};

export default ProductAdd;
