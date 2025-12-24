import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";

const RevenueAdd = () => {
  const navigate = useNavigate();

  /* =========================
     Get Select Data
  ========================= */
  const { data, loading } = useGet("/api/admin/revenue/selection");

  const categories = data?.categories || [];
  const accounts = data?.accounts || [];

  const categoryOptions = categories.map((cat) => ({
    label: `${cat.name} - ${cat.ar_name}`,
    value: cat._id,
  }));

  const accountOptions = accounts.map((acc) => ({
    label: acc.name,
    value: acc._id,
  }));

  /* =========================
     Form Fields
  ========================= */
  const fields = useMemo(
    () => [
      {
        key: "name",
        label: "Revenue Name",
        type: "text",
        required: true,
        placeholder: "e.g. Robabicia",
      },
      {
        key: "amount",
        label: "Amount",
        type: "number",
        required: true,
        placeholder: "e.g. 500",
      },
      {
        key: "Category_id",
        label: "Category",
        type: "select",
        required: true,
        options: categoryOptions,
        placeholder: "Select category",
      },
      {
        key: "financial_accountId",
        label: "Financial Account",
        type: "select",
        required: true,
        options: accountOptions,
        placeholder: "Select account",
      },
      {
        key: "note",
        label: "Note",
        type: "textarea",
        required: false,
        placeholder: "Monthly payment",
      },
    ],
    [categoryOptions, accountOptions]
  );

  /* =========================
     Submit
  ========================= */
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        amount: Number(formData.amount),
        Category_id: formData.Category_id,
        financial_accountId: formData.financial_accountId,
        note: formData.note,
      };

      await api.post("/api/admin/revenue", payload);

      toast.success("Revenue added successfully!");
      navigate("/revenue");
    } catch (err) {
      console.error("❌ Error adding revenue:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Failed to add revenue";

      toast.error(message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title="Add New Revenue"
        description="Create a new revenue entry"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/revenue")}
        initialData={{
          name: "",
          amount: "",
          Category_id: "",
          financial_accountId: "",
          note: "",
        }}
        submitButtonText="Create Revenue"
      />
    </div>
  );
};

export default RevenueAdd;
