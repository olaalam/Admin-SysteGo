// src/pages/UnitEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function UnitEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ الـ endpoint الصحيح لتعديل Unit
  const { putData, loading: updating } = usePut(`/api/admin/units/${id}`);

  const [unitData, setUnitData] = useState(null);
  const [fetching, setFetching] = useState(true);

  // ✅ الحقول الصحيحة للـ Unit (مش payment method)
  const fields = useMemo(
    () => [
      {
        key: "name",
        label: "Name (English)",
        type: "text",
        required: true,
        placeholder: "e.g. Gram",
      },
      {
        key: "ar_name",
        label: "Name (Arabic)",
        type: "text",
        required: true,
        placeholder: "مثال: جرام",
      },
      {
        key: "code",
        label: "Code",
        type: "text",
        required: true,
        placeholder: "e.g. G, KG, PC",
        // يفضل uppercase
      },
      {
        key: "base_unit",
        label: "Base Unit",
        type: "select",
        required: false,
        placeholder: "Select base unit (optional)",
        // هنجيب الـ options من API منفصل لو عايزة، أو نعتمد على backend يتعامل مع _id
        // دلوقتي هنخليه text مؤقتًا لو مفيش options
      },
      {
        key: "operator",
        label: "Operator",
        type: "select",
        required: true,
        options: [
          { value: "*", label: "Multiply (*)" },
          { value: "/", label: "Divide (/)" },
        ],
      },
      {
        key: "operator_value",
        label: "Operator Value",
        type: "number",
        required: true,
        min: 0,
        step: "any",
        placeholder: "e.g. 1000 (for 1 KG = 1000 G)",
      },
      {
        key: "is_base_unit",
        label: "Is Base Unit?",
        type: "switch",
        required: false,
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

  useEffect(() => {
    const fetchUnit = async () => {
      if (!id) return;

      try {
        const res = await api.get(`/api/admin/units/${id}`);
        console.log("🔍 Full Response:", res.data);

        // ✅ استخراج الـ unit الصحيح (عادةً يكون res.data.data.unit أو res.data.data)
        const unit = res.data?.data?.unit || res.data?.data || null;

        if (!unit) {
          toast.error("Unit not found");
          navigate("/units");
          return;
        }

        console.log("🎯 Extracted Unit:", unit);

        // ✅ تحويل base_unit إلى _id فقط (لأن الـ select غالبًا بيبعت _id)
        const baseUnitId = unit.base_unit?._id || null;

        setUnitData({
          name: unit.name || "",
          ar_name: unit.ar_name || "",
          code: unit.code || "",
          base_unit: baseUnitId, // نبعت الـ _id بس
          operator: unit.operator || "*",
          operator_value: unit.operator_value || 1,
          is_base_unit: unit.is_base_unit || false,
          status: unit.status || false,
        });
      } catch (err) {
        console.error("❌ Error fetching unit:", err);
        toast.error("Failed to load unit data");
        navigate("/units");
      } finally {
        setFetching(false);
      }
    };

    fetchUnit();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      console.log("📤 Submitting updated unit:", formData);

      await putData(formData);

      toast.success("Unit updated successfully!");
      navigate("/units");
    } catch (err) {
      console.error("❌ Update error:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Failed to update unit";

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((msg) => toast.error(msg));
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleCancel = () => navigate("/units");

  if (fetching) return <Loader />;

  if (!unitData) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-center">
        <p className="text-red-600 text-lg">Unit not found</p>
        <button
          onClick={() => navigate("/units")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-teal-700"
        >
          Back to Units
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={`Edit Unit: ${unitData.name || unitData.ar_name || "Loading..."}`}
        description="Update unit details"
        fields={fields}
        initialData={unitData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updating}
        submitButtonText="Update Unit"
      />
    </div>
  );
}