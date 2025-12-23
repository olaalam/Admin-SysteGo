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

  const { putData, loading: updating } = usePut(`/api/admin/units/${id}`);

  const [unitData, setUnitData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [baseUnits, setBaseUnits] = useState([]);

  // ✅ استخدام useMemo لتعريف الحقول بناءً على baseUnits المتغيرة
  const fields = useMemo(
    () => [
      { key: "name", label: "Name (English)", type: "text", required: true },
      { key: "ar_name", label: "Name (Arabic)", type: "text", required: true },
      { key: "code", label: "Code", type: "text", required: true },
      {
        key: "base_unit",
        label: "Base Unit",
        type: "select",
        required: false,
        options: baseUnits, // ستحدث تلقائياً عند جلب البيانات
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
      { key: "operator_value", label: "Operator Value", type: "number", required: true },
      { key: "is_base_unit", label: "Is Base Unit?", type: "switch" },
      { key: "status", label: "Active Status", type: "switch" },
    ],
    [baseUnits]
  );

  // ✅ fetch واحد فقط لكل البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/admin/units/${id}`);
        const data = res.data?.data;
        const unit = data?.unit || data;
        const baseUnitsArray = data?.baseUnits || [];

        if (!unit) {
          toast.error("Unit not found");
          navigate("/units");
          return;
        }

        // 1. تعبئة خيارات الـ Select
        setBaseUnits(
          baseUnitsArray.map(u => ({
            value: u._id,
            label: `${u.name} (${u.code})`,
          }))
        );

        // 2. تعبئة بيانات الفورم
        setUnitData({
          name: unit.name || "",
          ar_name: unit.ar_name || "",
          code: unit.code || "",
          base_unit: unit.base_unit?._id || unit.base_unit || null, // التعامل مع object أو id
          operator: unit.operator || "*",
          operator_value: unit.operator_value || 1,
          is_base_unit: unit.is_base_unit || false,
          status: unit.status || false,
        });

      } catch (err) {
        console.error("❌ Error fetching unit data:", err);
        toast.error("Failed to load unit data");
        navigate("/units");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      await putData(formData);
      toast.success("Unit updated successfully!");
      navigate("/units");
    } catch (err) {
      toast.error("Failed to update unit",err);
    }
  };

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {unitData && (
        <AddPage
          title={`Edit Unit: ${unitData.name}`}
          description="Update unit details"
          fields={fields}
          initialData={unitData}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/units")}
          loading={updating}
        />
      )}
    </div>
  );
}