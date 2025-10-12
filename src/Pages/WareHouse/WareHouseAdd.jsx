// src/pages/warehouseAdd.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";

const WareHouseAdd = () => {
  const navigate = useNavigate();

  const fields = [
    { key: "name", label: "Name", required: true },
    { key: "address", label: "Address", required: true },
    { key: "phone", label: "Phone", required: true },
    { key: "email", label: "Email", type: "email", required: true },
  ];

  const handleSubmit = async (data) => {
    try {
      await api.post("/api/admin/warehouse/", data);
      toast.success("Warehouse added successfully!");
      navigate("/warehouse");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add warehouse";

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
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title="Add Warehouse"
        description="Fill in the warehouse details"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/warehouse")}
        initialData={{
          name: "",
          address: "",
          phone: "",
          email: "",
          stock_Quantity: 0,
        }}
      />
    </div>
  );
};

export default WareHouseAdd;
