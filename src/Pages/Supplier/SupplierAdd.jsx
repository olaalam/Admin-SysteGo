// src/pages/SupplierAdd.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";

const SupplierAdd = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [fetching, setFetching] = useState(true);

  // ✅ تحديد الحقول باستخدام useMemo وربط المدن والدول كـ select
  const fields = useMemo(() => [
    { key: "username", label: "Username", required: true },
    { key: "company_name", label: "Company Name", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone_number", label: "Phone Number", required: true },
    { key: "address", label: "Address", required: true },
    {
      key: "cityId",
      label: "City",
      type: "select",
      required: true,
      options: cities.map((city) => ({
        value: city._id,
        label: city.name,
      })),
    },
    {
      key: "countryId",
      label: "Country",
      type: "select",
      required: true,
      options: countries.map((country) => ({
        value: country._id,
        label: country.name,
      })),
    },
    { key: "image", label: "Image", type: "image", required: true },
  ], [cities, countries]);

  // ✅ جلب المدن والدول عند التحميل
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const res = await api.get("/api/admin/supplier"); // أو endpoint مستقل لو متاح
        const citiesList = res.data?.data?.city || [];
        const countriesList = res.data?.data?.country || [];

        setCities(citiesList);
        setCountries(countriesList);
      } catch (err) {
        toast.error("Failed to load city and country lists");
        console.error("❌ Error loading cities/countries:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchLists();
  }, []);

  // ✅ إرسال البيانات
  const handleSubmit = async (data) => {
    try {
      await api.post("/api/admin/supplier/", data);
      toast.success("Supplier added successfully!");
      navigate("/supplier");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add supplier";

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  if (fetching) return <Loader />;

  return (
    <div className="p-6">
      <AddPage
        title="Add Supplier"
        description="Fill in the supplier information and upload image"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/supplier")}
        initialData={{}}
      />
    </div>
  );
};

export default SupplierAdd;
