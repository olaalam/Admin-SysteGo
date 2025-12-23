// src/pages/TaxesEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function TaxesEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(`/api/admin/taxes/${id}`);

  const [taxData, setTaxData] = useState(null);
  const [fetching, setFetching] = useState(true);

  /* =======================
     Fields
  ======================= */
  const fields = useMemo(
    () => [
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
    ],
    []
  );

  /* =======================
     Fetch Tax
  ======================= */
  useEffect(() => {
    const fetchTax = async () => {
      if (!id) return;

      try {
        const res = await api.get(`/api/admin/taxes/${id}`);
        console.log("🔍 Tax Response:", res.data);

        const tax = res.data?.data?.tax || res.data?.data;

        if (!tax) {
          toast.error("Tax not found");
          navigate("/taxes");
          return;
        }

        setTaxData({
          name: tax.name || "",
          ar_name: tax.ar_name || "",
          type: tax.type || "percentage",
          status: tax.status ?? true,
          amount:
            tax.type === "percentage"
              ? Number(tax.amount) * 100
              : Number(tax.amount),
        });
      } catch (err) {
        console.error("❌ Error fetching tax:", err);
        toast.error("Failed to load tax data");
        navigate("/taxes");
      } finally {
        setFetching(false);
      }
    };

    fetchTax();
  }, [id, navigate]);

  /* =======================
     Submit
  ======================= */
  const handleSubmit = async (formData) => {
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

      await putData(payload);

      toast.success("Tax updated successfully!");
      navigate("/taxes");
    } catch (err) {
      console.error("❌ Update error:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Failed to update tax";

      toast.error(errorMessage);
    }
  };

  const handleCancel = () => navigate("/taxes");

  if (fetching) return <Loader />;

  if (!taxData) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-center">
        <p className="text-red-600 text-lg">Tax not found</p>
        <button
          onClick={() => navigate("/taxes")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
        >
          Back to Taxes
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={`Edit Tax: ${taxData.name}`}
        description="Update tax details"
        fields={fields}
        initialData={taxData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updating}
        submitButtonText="Update Tax"
      />
    </div>
  );
}
