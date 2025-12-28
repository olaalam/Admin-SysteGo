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
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [fetching, setFetching] = useState(true);

// 🔹 جلب zone + countries (with cities)
useEffect(() => {
  const fetchData = async () => {
    setFetching(true);
    try {
      const [zoneRes, countriesRes] = await Promise.all([
        api.get(`/api/admin/zone/${id}`),
        api.get(`/api/admin/zone/countries`)
      ]);

      const zone = zoneRes.data?.data?.zone;
      const allCountries = countriesRes.data?.data?.countries || [];

      setCountries(allCountries);

      const countryId = zone?.countryId?._id || "";
      setSelectedCountryId(countryId);

      setZoneData({
        name: zone?.name || "",
        ar_name: zone?.ar_name || "",
        countryId,
        cityId: zone?.cityId?._id || "",
        cost: zone?.cost || 0,
      });
    } catch (err) {
      toast.error("Failed to fetch zone data");
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  fetchData();
}, [id]);


  // 🔹 country options
  const countryOptions = useMemo(() => {
    return countries.map((c) => ({
      label: c.name,
      value: c._id,
    }));
  }, [countries]);

  // 🔹 cities based on selected country
const citiesOptions = useMemo(() => {
  const selectedCountry = countries.find(
    (c) => c._id === selectedCountryId
  );

  return selectedCountry
    ? selectedCountry.cities.map((city) => ({
        label: city.name,
        value: city._id,
      }))
    : [];
}, [countries, selectedCountryId]);


  // 🔹 fields
  const fields = useMemo(
    () => [
      { key: "name", label: "Zone Name", required: true },
      { key: "ar_name", label: "Zone Name(Arabic)", required: true },

  {
    key: "countryId",
    label: "Country",
    type: "select",
    required: true,
    options: countries.map((c) => ({
      label: c.name,
      value: c._id,
    })),
    onChange: (value, setFormData) => {
      setSelectedCountryId(value);
      setFormData((prev) => ({ ...prev, cityId: "" }));
    },
  },

  {
    key: "cityId",
    label: "City",
    type: "select",
    required: true,
    options: citiesOptions,
    disabled: !selectedCountryId,
  },

      { key: "cost", label: "Cost", type: "number", required: true },
    ],
    [countryOptions, citiesOptions, fetching, selectedCountryId]
  );

  // 🔹 submit
  const handleSubmit = async (formData) => {
    try {
      await putData(formData);
      toast.success("Zone updated successfully 🎉");
      navigate("/zone");
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to update zone";

      toast.error(msg);
      console.error(err.response?.data);
    }
  };

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {zoneData && (
        <AddPage
          title={`Edit Zone: ${zoneData.name}`}
          description="Update zone details"
          fields={fields}
          initialData={zoneData}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/zone")}
          loading={updating}
        />
      )}
    </div>
  );
}
