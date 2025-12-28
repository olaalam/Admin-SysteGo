// src/pages/DiscountAdd.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";

const DiscountAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fields = useMemo(
    () => [
      {
        key: "name",
        label: "Discount Name",
        type: "text",
        required: true,
        placeholder: "e.g. Summer Sale",
      },

      {
        key: "type",
        label: "Discount Type",
        type: "select",
        required: true,
        options: [
          { value: "percentage", label: "Percentage (%)" },
          { value: "fixed", label: "Fixed Amount" },
        ],
      },
      {
        key: "amount",
        label: "Amount",
        type: "number",
        required: true,
        min: 0,
        step: "any",
        placeholder: "e.g. 15",
        helperText:
          "If percentage, enter 15 for 15%. If fixed, enter amount value.",
      },
    ],
    []
  );

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        amount:
          formData.type === "percentage"
            ? Number(formData.amount) / 100
            : Number(formData.amount),
      };

      await api.post("/api/admin/discount", payload);

      toast.success("Discount added successfully 🎉");
      navigate("/discount");
    } catch (err) {
      console.error("❌ Error adding discount:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Failed to add discount";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title="Add New Discount"
        description="Create a new discount"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/discount")}
        initialData={{
          type: "percentage",
          amount: 15,
        }}
        loading={loading}
        submitButtonText="Create Discount"
      />
    </div>
  );
};

export default DiscountAdd;
