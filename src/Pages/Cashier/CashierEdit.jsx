import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function CashierEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(`/api/admin/cashier/${id}`);

  const [cashierData, setCashierData] = useState(null);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [fetching, setFetching] = useState(true);

  // تحديث الـ fields ديناميكياً
  const fields = useMemo(() => [
    { key: "name", label: "Name", required: true },
    { key: "ar_name", label: "Arabic Name", required: true },
    {
      key: "warehouse_id",
      label: "Warehouse",
      type: "select",
      required: true,
      options: allWarehouses.map((warehouse) => ({
        value: warehouse._id,
        label: warehouse.name,
      })),
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: true, label: "Active" },
        { value: false, label: "Inactive" },
      ],
    },
  ], [allWarehouses]);

  useEffect(() => {
    const fetchCashier = async () => {
      try {
        setFetching(true);

        const res = await api.get(`/api/admin/cashier/${id}`);
        const cashier = res.data?.data?.cashier;
        const warehousesList = res.data?.data?.warehouses || [];

        if (!cashier) {
          toast.error("Cashier not found.");
          navigate("/cashier");
          return;
        }

        setAllWarehouses(warehousesList);

        const initialData = {
          name: cashier.name || "",
          ar_name: cashier.ar_name || "",
          warehouse_id: cashier.warehouse_id?._id || "",
          status: cashier.status ?? true,
        };

        setCashierData(initialData);

      } catch (err) {
        toast.error("Failed to fetch cashier data");
        console.error("❌ Error fetching cashier:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchCashier();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      // تحويل status إلى boolean إذا جاء كـ string
      const dataToSend = {
        ...formData,
        status: formData.status === "true" || formData.status === true,
      };

      await putData(dataToSend);
      toast.success("Cashier updated successfully!");
      navigate("/cashier");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to update cashier";

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/cashier");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {cashierData && (
        <AddPage
          title={`Edit Cashier: ${cashierData.name || "..."}`}
          description="Update cashier details"
          fields={fields}
          initialData={cashierData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}