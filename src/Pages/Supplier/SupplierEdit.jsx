import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function SupplierEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(`/api/admin/supplier/${id}`);

  const [supplierData, setSupplierData] = useState(null);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [fetching, setFetching] = useState(true);

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

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await api.get(`/api/admin/supplier/${id}`);
        const supplier = res.data?.data?.supplier;
        const citiesList = res.data?.data?.city || [];
        const countriesList = res.data?.data?.country || [];

        if (!supplier) {
          toast.error("Supplier not found.");
          return;
        }

        setSupplierData({
          username: supplier.username || "",
          company_name: supplier.company_name || "",
          email: supplier.email || "",
          phone_number: supplier.phone_number || "",
          address: supplier.address || "",
          cityId: supplier.cityId?._id || "",        // 🔥 important
          countryId: supplier.countryId?._id || "",  // 🔥 important
          image: supplier.image || "",
        });

        setCities(citiesList);
        setCountries(countriesList);
      } catch (err) {
        toast.error("Failed to fetch supplier data");
        console.error("❌ Error fetching supplier:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchSupplier();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      await putData(formData);
      toast.success("Supplier updated successfully!");
      navigate("/supplier");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to update supplier";

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/supplier");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {supplierData && (
        <AddPage
          title={`Edit Supplier: ${supplierData.username || "..."}`}
          description="Update supplier details"
          fields={fields}
          initialData={supplierData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}
