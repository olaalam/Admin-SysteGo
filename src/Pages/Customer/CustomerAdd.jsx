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

  const [allCountries, setAllCountries] = useState([]);
  const [allCitiesByCountry, setAllCitiesByCountry] = useState({});
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [fetchingLists, setFetchingLists] = useState(true);

  // ✅ endpoint الإضافة
  const { postData, loading: submitting } = usePost(
    "/api/admin/customer"
  );

  const availableCities = useMemo(() => {
    if (!selectedCountryId) return [];
    return allCitiesByCountry[selectedCountryId] || [];
  }, [selectedCountryId, allCitiesByCountry]);

  // ✅ الحقول متوافقة مع الريسبونس
  const fields = useMemo(
    () => [
      {
        key: "name",
        label: "Customer Name",
        required: true,
      },
      {
        key: "email",
        label: "Email",
        type: "email",
        required: true,
      },
      {
        key: "phone_number",
        label: "Phone Number",
        required: true,
      },
      {
        key: "address",
        label: "Address",
        required: true,
      },
      {
        key: "country",
        label: "Country",
        type: "select",
        required: true,
        options: allCountries.map((country) => ({
          value: country._id,
          label: country.name,
        })),
        onChange: (value) => {
          setSelectedCountryId(value);
        },
      },
      {
        key: "city",
        label: "City",
        type: "select",
        required: true,
        options: availableCities.map((city) => ({
          value: city._id,
          label: city.name,
        })),
        disabled:
          !selectedCountryId ||
          availableCities.length === 0 ||
          fetchingLists,
        placeholder: fetchingLists
          ? "Loading cities..."
          : "Select city",
      },
      {
        key: "is_Due",
        label: "Has Due?",
        type: "switch",
        required: true,

      },
      {
        key: "amount_Due",
        label: "Amount Due",
        type: "number",
        required: false,
      },
    ],
    [allCountries, availableCities, selectedCountryId, fetchingLists]
  );

  // ✅ جلب الدول + المدن
  useEffect(() => {
    const fetchLists = async () => {
      setFetchingLists(true);
      try {
        const res = await api.get("/api/admin/countries");
        const countriesList = res.data?.data || [];

        const citiesByCountry = {};
        countriesList.forEach((country) => {
          citiesByCountry[country._id] = country.cities || [];
        });

        setAllCountries(countriesList);
        setAllCitiesByCountry(citiesByCountry);
      } catch (err) {
        toast.error("Failed to load countries and cities");
        console.error(err);
      } finally {
        setFetchingLists(false);
      }
    };

    fetchLists();
  }, []);

  // ✅ إرسال البيانات (تحويل القيم قبل الإرسال)
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
      const msg =
        err.response?.data?.message || "Failed to add customer";
      toast.error(msg);
      console.error(err.response?.data);
    }
  };

  if (fetchingLists) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title="Add Customer"
        description="Fill in customer information"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/customers")}
        loading={submitting}
        initialData={{
          is_Due: "0",
          amount_Due: 0,
        }}
      />
    </div>
  );
};

export default CustomerAdd;
