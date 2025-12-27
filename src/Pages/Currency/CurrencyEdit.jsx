import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function CurrencyEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(`/api/admin/currency/${id}`);

  const [currencyData, setcurrencyData] = useState(null);
  const [fetching, setFetching] = useState(true);

  // جلب بيانات البلد
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/admin/currency/${id}`);
        const currency = res.data?.data?.currency || {};

        setcurrencyData({
          name: currency.name || "",
          ar_name: currency.ar_name || "",
          amount: currency.amount || "",
        });
      } catch (err) {
        toast.error("Failed to fetch currency data");
        console.error("❌ Error fetching currency:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  // إعداد الفورم
  const fields = useMemo(
    () => [
      { key: "name", label: "currency Name", required: true },
      { key: "ar_name", label: "Arabic Name", required: true },
      { key: "amount", label: "Amount", required: true, type: "number" },
    ],
    []
  );

  const handleSubmit = async (formData) => {
    try {
      await putData(formData);
      toast.success("currency updated successfully!");
      navigate("/currency");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to update currency";

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/currency");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {currencyData && (
        <AddPage
          title={`Edit currency: ${currencyData.name || "..."}`}
          description="Update currency details"
          fields={fields}
          initialData={currencyData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}
