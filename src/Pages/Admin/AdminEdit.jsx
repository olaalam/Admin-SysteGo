// src/pages/AdminEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import useGet from "@/hooks/useGet";

export default function AdminEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(`/api/admin/admin/${id}`);

  const [adminData, setAdminData] = useState(null);
  const [fetching, setFetching] = useState(true);

  /* =======================
     Warehouses
  ======================= */
const { data: selectionData } = useGet("/api/admin/admin/selection");

const warehouseOptions = selectionData?.warehouses?.map(w => ({ label: w.name, value: w.id })) || [];
const roleOptions = selectionData?.roles?.map(r => ({ label: r.name, value: r.id })) || [];

  /* =======================
     Fetch Admin
  ======================= */
useEffect(() => {
  const fetchAdmin = async () => {
    try {
      const res = await api.get(`/api/admin/admin/${id}`);
      const admin = res.data?.data?.user;

      if (!admin) {
        toast.error("Admin not found");
        navigate("/admin");
        return;
      }

      setAdminData({
        username: admin.username || "",
        email: admin.email || "",
        company_name: admin.company_name || "",
        phone: admin.phone || "",
        password: "",
        role_id: admin.role_id?.id || "",
        warehouse_id: admin.warehouse?.id || "",
      });
    } catch (err) {
      toast.error("Failed to fetch admin data");
      console.error("❌ Error fetching admin:", err);
    } finally {
      setFetching(false);
    }
  };

  fetchAdmin();
}, [id, navigate]);


  /* =======================
     Fields
  ======================= */
  const fields = useMemo(
    () => [
      {
        key: "username",
        label: "Username",
        type: "text",
        required: true,
      },
      {
        key: "email",
        label: "Email",
        type: "email",
        required: true,
      },
      {
        key: "company_name",
        label: "Company Name",
        type: "text",
        required: true,
      },

      {
        key: "phone",
        label: "Phone",
        type: "text",
        required: true,
      },
      {
        key: "role_id",
        label: "Role",
        type: "select",
        required: true,
 options: roleOptions,

      },
      {
        key: "warehouse_id",
        label: "Warehouse",
        type: "select",
        required: true,
        options: warehouseOptions,
      },
    ],
    [selectionData]
  );

  /* =======================
     Submit
  ======================= */
  const handleSubmit = async (formData) => {
    try {
const payload = {
  username: formData.username,
  email: formData.email,
  company_name: formData.company_name,
  phone: formData.phone,
  role_id: formData.role_id,
  warehouse_id: formData.warehouse_id,
};
if (formData.password) payload.password = formData.password;


      // ابعت الباسورد فقط لو مكتوب
      if (formData.password) {
        payload.password = formData.password;
      }

      await putData(payload);

      toast.success("Admin updated successfully!");
      navigate("/admin");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to update admin";

      toast.error(errorMessage);
      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/admin");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {adminData && (
        <AddPage
          key="edit-admin"
          title={`Edit Admin: ${adminData.username}`}
          description="Update administrator details"
          fields={fields}
          initialData={adminData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
          submitButtonText="Update Admin"
        />
      )}
    </div>
  );
}
