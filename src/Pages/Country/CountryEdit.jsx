import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function CountryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(`/api/admin/country/${id}`);

  const [countryData, setcountryData] = useState(null);
  const [countries, setCountries] = useState([]);
  const [fetching, setFetching] = useState(true);

  // جلب بيانات المدينة والدول
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/admin/country/${id}`);
        const country = res.data?.data?.country || {};
        const allCountries = res.data?.data?.countries || [];

        setCountries(allCountries);

        setcountryData({
          name: country.name || "",
          countryId: country.country?._id || "",
        });
      } catch (err) {
        toast.error("Failed to fetch country data");
        console.error("❌ Error fetching country:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  // إعداد الفورم
  const fields = useMemo(() => [
    { key: "name", label: "Name", required: true },

  ], [countries]);

  const handleSubmit = async (formData) => {
    try {
      await putData(formData);
      toast.success("country updated successfully!");
      navigate("/country");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to update country";

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/country");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {countryData && (
        <AddPage
          title={`Edit country: ${countryData.name || "..."}`}
          description="Update country details"
          fields={fields}
          initialData={countryData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}
