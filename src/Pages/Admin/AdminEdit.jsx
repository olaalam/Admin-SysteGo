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
  const { data: warehousesData } = useGet("/api/admin/admin/selection");

  const warehouseOptions = useMemo(() => {
    return (
      warehousesData?.warehouse?.map((w) => ({
        label: w.name,
        value: w._id,
      })) || []
    );
  }, [warehousesData]);

  /* =======================
     Fetch Admin
  ======================= */
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get(`/api/admin/admin/${id}`);
        const admin = res.data?.data?.user || res.data?.data || res.data;

        if (!admin) {
          toast.error("Admin not found");
          navigate("/admin");
          return;
        }

        setAdminData({
          username: admin.username || "",
          email: admin.email || "",
          role: admin.role || "admin",
          company_name: admin.company_name || "",
          phone: admin.phone || "",
          password: "",
warehouse_id: admin.warehouse_id?._id || "",
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
        key: "role",
        label: "Role",
        type: "select",
        required: true,
        options: [
          { label: "Admin", value: "admin" },
          { label: "Super Admin", value: "superadmin" },
        ],
      },
      {
        key: "warehouse_id",
        label: "Warehouse",
        type: "select",
        required: true,
        options: warehouseOptions,
      },
    ],
    [warehouseOptions]
  );

  /* =======================
     Submit
  ======================= */
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        company_name: formData.company_name,
        phone: formData.phone,
        warehouse_id: formData.warehouse_id, // ✅ الاسم الصح
      };

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
