// src/pages/ZoneAdd.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import Loader from "@/components/Loader";

const ZoneAdd = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [fetching, setFetching] = useState(true);

  const { postData, loading: submitting } = usePost("/api/admin/zone");

  // جلب الدول والمدن من API
  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const res = await api.get("/api/admin/zone-data"); // تأكد من المسار الصحيح للـ API
        setCountries(res.data?.data?.countries || []);
        setCities(res.data?.data?.cities || []);
      } catch (err) {
        toast.error("Failed to load cities or countries");
        console.error("Error fetching data:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  // إعداد الحقول
  const fields = useMemo(() => {
    const countryOptions = countries.map((c) => ({ label: c.name, value: c._id }));
    const cityOptions = cities.map((c) => ({ label: c.name, value: c._id }));

    return [
      { key: "name", label: "Zone Name", required: true },
      { key: "cityId", label: "City", type: "select", required: true, options: cityOptions, disabled: fetching },
      { key: "cost", label: "Cost", type: "number", required: true },
      { key: "countryId", label: "Country", type: "select", required: true, options: countryOptions, disabled: fetching },
    ];
  }, [countries, cities, fetching]);

  const handleSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        cityId: data.cityId,
        cost: data.cost,
        countryId: data.countryId,
      };

      await postData(payload);

      toast.success("Zone added successfully! 🎉");
      navigate("/zone");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add zone";

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
    <div className="p-6">
      <AddPage
        title="Add Zone"
        description="Select city and country, then enter zone details"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/zone")}
        loading={submitting || fetching}
        initialData={{ name: "", cityId: "", cost: 0, countryId: "" }}
      />
    </div>
  );
};

export default ZoneAdd;
