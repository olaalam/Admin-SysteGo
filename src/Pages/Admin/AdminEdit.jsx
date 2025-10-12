// src/pages/PaymentMethodEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function AdminEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { putData, loading: updating } = usePut(
        `/api/admin/admin/${id}`
    );

    const [paymentMethodData, setPaymentMethodData] = useState(null);
    const [fetching, setFetching] = useState(true);

    const fields = useMemo(() => [
        { key: "username", label: "Name", required: true },
        { key: "email", label: "Email", required: true },
        { key: "role", label: "Role", required: true },
        { key: "company_name", label: "Company Name", required: true },
        { key: "password", label: "Password", type: "password" },
        { key: "phone", label: "Phone", required: true },
    ], []);

    useEffect(() => {
        const fetchPaymentMethod = async () => {
            try {
                const res = await api.get(`/api/admin/admin/${id}`);

                console.log("🔍 Full API Response:", res.data.data.user);

                // ✅ حاول كل الاحتمالات للوصول للبيانات
                const paymentMethod = res.data.data.user || res.data.data || res.data;

                console.log("🎯 Extracted admin:", paymentMethod);

                setPaymentMethodData({
                    username: paymentMethod.username || "",
                    email: paymentMethod.email || "",
                    role: paymentMethod.role || "",
                    company_name: paymentMethod.company_name || "",
                    phone: paymentMethod.phone || "",
                    password:paymentMethod.password || "",
                    status: paymentMethod.status || false,
                });
            } catch (err) {
                toast.error("Failed to fetch admin data");
                console.error("❌ Error fetching admin:", err);
            } finally {
                setFetching(false);
            }
        };

        fetchPaymentMethod();
    }, [id]);

    const handleSubmit = async (formData) => {
        try {
            await putData(formData);
            toast.success("admin updated successfully!");
            navigate("/admin");
        } catch (err) {
            // ✅ عرض الأخطاء من الـ API
            const errorMessage =
                err.response?.data?.error?.message ||
                err.response?.data?.message ||
                "Failed to update admin";

            const errorDetails = err.response?.data?.error?.details;

            if (errorDetails && Array.isArray(errorDetails)) {
                errorDetails.forEach(detail => toast.error(detail));
            } else {
                toast.error(errorMessage);
            }

            console.error("❌ Error:", err.response?.data);
        }
    };

    const handleCancel = () => navigate("/admin");

    if (fetching) {
        return <Loader />;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {paymentMethodData && (
                <AddPage
                    title={`Edit admin: ${paymentMethodData?.name || "..."}`}
                    description="Update admin details and logo"
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