// src/pages/BankAccountAdd.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import useGet from "@/hooks/useGet";
import Loader from "@/components/Loader";

const BankAccountAdd = () => {
  const navigate = useNavigate();

  // =============================
  // POST: Add bank account
  // =============================
  const { postData, loading: submitting } = usePost("/api/admin/bank_account/");

  // =============================
  // GET: Warehouses for select
  // =============================
  const {
    data: warehouseData,
    loading: loadingWarehouses,
    error,
  } = useGet("/api/admin/bank_account/select-warehouses");

  const warehouses =
    warehouseData?.warehouses?.map((w) => ({
      label: w.name,
      value: w._id,
    })) || [];

  // =============================
  // Form fields
  // =============================
  const fields = [
    {
      key: "name",
      label: "Bank Name",
      type: "text",
      required: true,
      placeholder: "Enter bank name",
    },
    {
      key: "warehouseId",
      label: "Warehouse",
      type: "select",
      required: true,
      placeholder: "Select warehouse",
      options: warehouses, // ✅ جاي من الـ API
    },
    {
      key: "balance",
      label: "Initial Balance",
      type: "number",
      required: true,
      placeholder: "0",
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      required: false,
      placeholder: "Account description",
    },
    {
      key: "image",
      label: "Image",
      type: "image",
      required: false,
    },
    {
      key: "status",
      label: "Active",
      type: "switch",
      required: false,
    },
    {
      key: "in_POS",
      label: "Available in POS",
      type: "switch",
      required: false,
    },
  ];

  // =============================
  // Submit handler
  // =============================
  const handleSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        warehouseId: Array.isArray(data.warehouseId)
          ? data.warehouseId
          : [data.warehouseId],
        image: data.image || null,
        description: data.description || "",
        balance: String(data.balance), // backend مستني string
        status: Boolean(data.status),
        in_POS: Boolean(data.in_POS),
      };

      console.log("📤 Submitting payload:", payload);

      await postData(payload);

      toast.success("Bank account added successfully!");
      navigate("/accounting");
    } catch (err) {
      console.error("❌ Error adding bank account:", err);

      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add bank account";

      const errorDetails = err.response?.data?.error?.details;

      if (Array.isArray(errorDetails)) {
        errorDetails.forEach((d) => toast.error(d));
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleCancel = () => navigate("/accounting");

  // =============================
  // Loading / Error states
  // =============================
  if (loadingWarehouses) return <Loader />;

  if (error) {
    return (
      <div className="p-6 text-red-600 text-center">
        Failed to load warehouses
      </div>
    );
  }

  // =============================
  // Render
  // =============================
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title="Add Bank Account"
        description="Fill in the bank account details"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={submitting}
        initialData={{
          name: "",
          warehouseId: "",
          image: null,
          description: "",
          balance: "",
          status: true,
          in_POS: true,
        }}
      />
    </div>
  );
};

export default BankAccountAdd;
