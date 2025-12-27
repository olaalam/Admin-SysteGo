import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function CustomerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(
    `/api/admin/customer/${id}`
  );

  const [customerData, setCustomerData] = useState(null);
  const [allCountries, setAllCountries] = useState([]);
  const [allCitiesByCountry, setAllCitiesByCountry] = useState({});
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [fetching, setFetching] = useState(true);

  // ✅ المدن المتاحة حسب الدولة
  const availableCities = useMemo(() => {
    if (!selectedCountryId) return [];
    return allCitiesByCountry[selectedCountryId] || [];
  }, [selectedCountryId, allCitiesByCountry]);

  // ✅ الحقول (متوافقة مع الريسبونس)
  const fields = useMemo(
    () => [
      { key: "name", label: "Customer Name", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "phone_number", label: "Phone Number", required: true },
      { key: "address", label: "Address", required: true },
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
          setCustomerData((prev) => ({
            ...prev,
            city: "",
          }));
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
        disabled: !selectedCountryId || availableCities.length === 0,
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
    [allCountries, availableCities, selectedCountryId]
  );

  // ✅ جلب بيانات العميل + الدول والمدن
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setFetching(true);

        const res = await api.get(`/api/admin/customer/${id}`);
        const customer = res.data?.data?.customer;
        const countriesList = res.data?.data?.countries || [];

        if (!customer) {
          toast.error("Customer not found");
          navigate("/customers");
          return;
        }

        // فهرسة المدن حسب الدولة
        const citiesByCountry = {};
        countriesList.forEach((country) => {
          citiesByCountry[country._id] = country.cities || [];
        });

        setAllCountries(countriesList);
        setAllCitiesByCountry(citiesByCountry);

        const initialData = {
          name: customer.name || "",
          email: customer.email || "",
          phone_number: customer.phone_number || "",
          address: customer.address || "",
          country: customer.country || "",
          city: customer.city || "",
is_Due: Boolean(customer.is_Due),
          amount_Due: customer.amount_Due || 0,
        };

        setCustomerData(initialData);
        setSelectedCountryId(initialData.country);
      } catch (err) {
        toast.error("Failed to fetch customer data");
        console.error("❌ Error:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchCustomer();
  }, [id, navigate]);

  // ✅ إرسال البيانات بعد التعديل
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
is_Due: Boolean(formData.is_Due),
        amount_Due: Number(formData.amount_Due || 0),
      };

      await putData(payload);

      toast.success("Customer updated successfully 🎉");
      navigate("/customer");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to update customer";
      toast.error(msg);
      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/customer");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {customerData && (
        <AddPage
          title={`Edit Customer: ${customerData.name}`}
          description="Update customer details"
          fields={fields}
          initialData={customerData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}
