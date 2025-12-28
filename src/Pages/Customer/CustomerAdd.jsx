// src/pages/CustomerAdd.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import usePost from "@/hooks/usePost";

const CustomerAdd = () => {
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [fetching, setFetching] = useState(true);

  const { postData, loading: submitting } = usePost("/api/admin/customer");

  // 🔹 جلب الدول + المدن مرة واحدة
  useEffect(() => {
    const fetchCountries = async () => {
      setFetching(true);
      try {
        const res = await api.get("/api/admin/customer/countries");
        setCountries(res.data?.data?.countries || []);
      } catch (err) {
        toast.error("Failed to load countries and cities");
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchCountries();
  }, []);

  // 🔹 خيارات الدول
  const countryOptions = useMemo(() => {
    return countries.map((c) => ({ label: c.name, value: c._id }));
  }, [countries]);

  // 🔹 المدن حسب الدولة المختارة
  const cityOptions = useMemo(() => {
    const country = countries.find((c) => c._id === selectedCountryId);
    return country?.cities?.map((city) => ({
      label: city.name,
      value: city._id,
    })) || [];
  }, [countries, selectedCountryId]);

  // ✅ إعداد الحقول
  const fields = useMemo(() => [
    { key: "name", label: "Customer Name", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone_number", label: "Phone Number", required: true },
    { key: "address", label: "Address", required: true },
    {
      key: "countryId",
      label: "Country",
      type: "select",
      required: true,
      options: countryOptions,
      disabled: fetching,
      onChange: (value, setFormData) => {
        setSelectedCountryId(value);
        setFormData((prev) => ({ ...prev, countryId: value, cityId: "" }));
      },
    },
    {
      key: "cityId",
      label: "City",
      type: "select",
      required: true,
      options: cityOptions,
      disabled: !selectedCountryId || fetching,
    },
    { key: "is_Due", label: "Has Due?", type: "switch", required: true },
    { key: "amount_Due", label: "Amount Due", type: "number", required: false },
  ], [countryOptions, cityOptions, selectedCountryId, fetching]);

  // ✅ إرسال البيانات
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        is_Due: Boolean(formData.is_Due),
        amount_Due: Number(formData.amount_Due || 0),
      };

      await postData(payload);
      toast.success("Customer added successfully 🎉");
      navigate("/customer");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add customer";
      toast.error(msg);
      console.error(err.response?.data);
    }
  };

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title="Add Customer"
        description="Fill in customer information"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/customer")}
        loading={submitting}
        initialData={{ is_Due: false, amount_Due: 0, countryId: "", cityId: "" }}
      />
    </div>
  );
};

export default CustomerAdd;
