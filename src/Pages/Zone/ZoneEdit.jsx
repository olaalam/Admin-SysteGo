import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function ZoneEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(`/api/admin/zone/${id}`);

  const [zoneData, setZoneData] = useState(null);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [fetching, setFetching] = useState(true);

  // جلب بيانات الـ zone والدول والمدن
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/admin/zone/${id}`);
        const zone = res.data?.data?.zone || {};
        const allCountries = res.data?.data?.countries || [];
        const allCities = res.data?.data?.cities || [];

        setCountries(allCountries);
        setCities(allCities);

        setZoneData({
          name: zone.name || "",
          cityId: zone.cityId?._id || "",
          countryId: zone.countryId?._id || "",
          cost: zone.cost || 0,
        });
      } catch (err) {
        toast.error("Failed to fetch zone data");
        console.error("❌ Error fetching zone:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  // إعداد الفورم
  const fields = useMemo(() => [
    { key: "name", label: "Zone Name", required: true },
    {
      key: "cityId",
      label: "City",
      type: "select",
      required: true,
      options: cities.map((c) => ({ label: c.name, value: c._id })),
    },
    { key: "cost", label: "Cost", type: "number", required: true },
    {
      key: "countryId",
      label: "Country",
      type: "select",
      required: true,
      options: countries.map((c) => ({ label: c.name, value: c._id })),
    },
  ], [cities, countries]);

  const handleSubmit = async (formData) => {
    try {
      await putData(formData);
      toast.success("Zone updated successfully!");
      navigate("/zone");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to update zone";

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/zone");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {zoneData && (
        <AddPage
          title={`Edit Zone: ${zoneData.name || "..."}`}
          description="Update zone details"
          fields={fields}
          initialData={zoneData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}
