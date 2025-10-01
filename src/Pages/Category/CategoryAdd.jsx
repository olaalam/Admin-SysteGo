// src/pages/categoryAdd.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";

const CategoryAdd = () => {
  const navigate = useNavigate();
  const [parentOptions, setParentOptions] = useState([]);

  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const res = await api.get("/api/admin/category");
        const parents = res.data?.data?.ParentCategories || [];
        setParentOptions(
          parents.map((cat) => ({
            value: cat._id, // يتبعت للباك
            label: cat.name, // يظهر لليوزر
          }))
        );
      } catch (err) {
        toast.error("Failed to load parent categories",err);
      }
    };
    fetchParentCategories();
  }, []);

  const fields = [
    { key: "name", label: "Name", required: true },
    { key: "image", label: "Image", type: "image", required: true },
    {
      key: "parentId",
      label: "Parent Category",
      type: "select",
      options: parentOptions,
    },
  ];

  const handleSubmit = async (data) => {
    try {
      await api.post("/api/admin/category/", data);
      toast.success("Category added successfully!");
      navigate("/category");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add category";

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
        title="Add Category"
        description="Upload image and fill in the details"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/category")}
        initialData={{ status: true }}
      />
    </div>
  );
};

export default CategoryAdd;
