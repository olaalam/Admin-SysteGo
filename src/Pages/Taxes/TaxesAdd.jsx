// src/pages/TaxesAdd.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";

const TaxesAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fields = [
    {
      key: "name",
      label: "Name (English)",
      type: "text",
      required: true,
      placeholder: "e.g. Tax (10%)",
    },

    {
      key: "type",
      label: "Tax Type",
      type: "select",
      required: true,
      options: [
        { value: "percentage", label: "Percentage (%)" },
        { value: "fixed", label: "Fixed Amount" },
      ],
      placeholder: "Select tax type",
    },
    {
      key: "amount",
      label: "Amount",
      type: "number",
      required: true,
      min: 0,
      step: "any",
      placeholder: "e.g. 10",
      helperText: "For percentage, enter 10 for 10%",
    },
    {
      key: "status",
      label: "Active Status",
      type: "switch",
      required: false,
    },
  ];

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        ar_name: formData.ar_name,
        type: formData.type,
        status: formData.status ?? true,
        amount:
          formData.type === "percentage"
            ? Number(formData.amount) / 100
            : Number(formData.amount),
      };

      await api.post("/api/admin/taxes", payload);

      toast.success("Tax added successfully!");
      navigate("/taxes");
    } catch (err) {
      console.error("❌ Error adding tax:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Failed to add tax";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title="Add New Tax"
        description="Create a new tax"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/taxes")}
        initialData={{
          status: true,
          type: "percentage",
          amount: 10,
        }}
        loading={loading}
        submitButtonText="Create Tax"
      />
    </div>
  );
};

export default TaxesAdd;
