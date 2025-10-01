// src/pages/categoryEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function CategoryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(`/api/admin/category/${id}`);

  const [categoryData, setCategoryData] = useState(null);
  const [parentOptions, setParentOptions] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get(`/api/admin/category/${id}`);

        console.log("🔍 Full API Response:", res.data.data);

        const category = res.data.data.category;
        const parent = res.data.data.Parent;

        // إعداد الـ parent options
        const parents = parent
          ? [{ value: parent._id, label: parent.name }]
          : [];

        setParentOptions(parents);

        setCategoryData({
          name: category.name || "",
          image: category.image || "",
          parentId: category.parentId?._id || "", // نخزن id فقط
        });
      } catch (err) {
        toast.error("Failed to fetch category data");
        console.error("❌ Error fetching category:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchCategory();
  }, [id]);

  const fields = [
    { key: "name", label: "Name", required: true },
    { key: "image", label: "Image", type: "image", required: true },
    {
      key: "parentId",
      label: "Parent Category",
      type: "select",
      options: parentOptions, // هنا هنمرر القايمة
    },
  ];

  const handleSubmit = async (formData) => {
    try {
      await putData(formData);
      toast.success("Category updated successfully!");
      navigate("/category");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to update category";

      const errorDetails = err.response?.data?.error?.details;
      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }
      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/category");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {categoryData && (
        <AddPage
          title={`Edit Category: ${categoryData?.name || "..."}`}
          description="Update category details and image"
          fields={fields}
          initialData={categoryData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}
