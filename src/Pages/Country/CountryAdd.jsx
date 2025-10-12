
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";

const CountryAdd = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);

  // جلب الدول من API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await api.get("/api/admin/country");
        const countryList = response.data?.data?.countries || [];
        setCountries(countryList);
      } catch (err) {
        toast.error("Failed to load countries");
        console.error("Error fetching countries:", err);
      }
    };

    fetchCountries();
  }, []);

  // إعداد الـ fields
  const fields = [
    { key: "name", label: "Name", required: true },

  ];

  // الإرسال
  const handleSubmit = async (data) => {
    try {
      await api.post("/api/admin/country", data); // ← تأكد إن الباكند بياخد countryId
      toast.success("country added successfully!");
      navigate("/country");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add country";

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
        title="Add country"
        description="Select country and enter country name"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/country")}
        initialData={{}}
      />
    </div>
  );
};

export default CountryAdd;
