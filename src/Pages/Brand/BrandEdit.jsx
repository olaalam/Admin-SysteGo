// src/pages/PaymentMethodEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function BrandEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(
    `/api/admin/brand/${id}`
  );

  const [paymentMethodData, setPaymentMethodData] = useState(null);
  const [fetching, setFetching] = useState(true);

  const fields = useMemo(() => [
    { key: "name", label: "Name", required: true },
    {key: "ar_name", label: "Name (Arabic)", required: true},
    { key: "logo", label: "Logo", type: "image", required: true },
  ], []);

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        const res = await api.get(`/api/admin/brand/${id}`);
        
        console.log("🔍 Full API Response:", res.data.data.brand);
        
        // ✅ حاول كل الاحتمالات للوصول للبيانات
        const paymentMethod = res.data.data.brand || res.data.data || res.data;
        
        console.log("🎯 Extracted brand:", paymentMethod);
        
        setPaymentMethodData({
          name: paymentMethod.name || "",
          description: paymentMethod.description || "",
          logo: paymentMethod.logo || "",
          status: paymentMethod.status || false,
        });
      } catch (err) {
        toast.error("Failed to fetch brand data");
        console.error("❌ Error fetching brand:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchPaymentMethod();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      await putData(formData);
      toast.success("brand updated successfully!");
      navigate("/brand");
    } catch (err) {
      // ✅ عرض الأخطاء من الـ API
      const errorMessage = 
        err.response?.data?.error?.message || 
        err.response?.data?.message || 
        "Failed to update brand";
      
      const errorDetails = err.response?.data?.error?.details;
      
      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach(detail => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }
      
      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/brand");

  if (fetching) {
    return <Loader />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {paymentMethodData && (
        <AddPage
          title={`Edit brand: ${paymentMethodData?.name || "..."}`}
          description="Update brand details and logo"
          fields={fields}
          initialData={paymentMethodData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}