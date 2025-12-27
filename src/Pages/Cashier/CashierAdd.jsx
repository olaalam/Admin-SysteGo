// src/pages/CashierAdd.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import usePost from "@/hooks/usePost";

const CashierAdd = () => {
  const navigate = useNavigate();

  const [allWarehouses, setAllWarehouses] = useState([]);
  const [fetchingLists, setFetchingLists] = useState(true);

  // استخدام usePost للإضافة
  const { postData, loading: submitting } = usePost("/api/admin/cashier/");

  // الحقول
  const fields = useMemo(
    () => [
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
        disabled: fetchingLists,
        placeholder: fetchingLists ? "Loading warehouses..." : "Select warehouse",
      },
      {
        key: "status",
        label: "Status",
        type: "switch",
        required: true,

      },
    ],
    [allWarehouses, fetchingLists]
  );

  // جلب المخازن عند التحميل
  useEffect(() => {
    const fetchWarehouses = async () => {
      setFetchingLists(true);
      try {
        // استدعاء API لجلب المخازن
        const res = await api.get("/api/admin/warehouse"); // أو الـ endpoint المناسب
        const warehousesList = res.data?.data?.warehouses || [];

        if (!Array.isArray(warehousesList)) {
          throw new Error("Invalid warehouses data");
        }

        setAllWarehouses(warehousesList);
      } catch (err) {
        toast.error("Failed to load warehouses");
        console.error("❌ Error loading warehouses:", err);
      } finally {
        setFetchingLists(false);
      }
    };

    fetchWarehouses();
  }, []);

  // إرسال البيانات
  const handleSubmit = async (formData) => {
    try {
      // تحويل status إلى boolean إذا جاء كـ string
      const dataToSend = {
        name: formData.name,
        ar_name: formData.ar_name,
        warehouse_id: formData.warehouse_id,
        status: formData.status === "true" || formData.status === true,
      };

      await postData(dataToSend);
      toast.success("Cashier added successfully! 🎉");
      navigate("/cashier");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add cashier";

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  // عرض Loader أثناء جلب المخازن
  if (fetchingLists) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title="Add Cashier"
        description="Fill in the cashier information"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/cashier")}
        loading={submitting}
        initialData={{
          name: "",
          ar_name: "",
          warehouse_id: "",
          status: true, // القيمة الافتراضية
        }}
      />
    </div>
  );
};

export default CashierAdd;