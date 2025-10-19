// src/pages/AdminEdit.jsx
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

  const { putData, loading: updating } = usePut(`/api/admin/admin/${id}`);

  const [adminData, setAdminData] = useState(null);
  const [positions, setPositions] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState(null);

  // 🟢 تحميل بيانات الـ admin + الـ positions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ جلب بيانات الأدمن
        const res = await api.get(`/api/admin/admin/${id}`);
        const admin = res.data?.data?.user || res.data?.data || res.data;

        // 2️⃣ جلب قائمة الـ positions
        const posRes = await api.get("/api/admin/admin");
        const fetchedPositions = posRes.data?.data?.positions || [];

        setPositions(fetchedPositions);

        // 3️⃣ إيجاد الـ position الحالي للأدمن
        const currentPosition =
          fetchedPositions.find((p) => p._id === admin.positionId?._id) || null;

        setSelectedPosition(currentPosition);

        setAdminData({
          username: admin.username || "",
          email: admin.email || "",
          role: admin.role || "",
          company_name: admin.company_name || "",
          phone: admin.phone || "",
          password: "",
          status: admin.status || false,
          positionId: currentPosition?._id || "",
        });
      } catch (err) {
        toast.error("Failed to fetch admin data");
        console.error("❌ Error fetching admin:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  // 🟡 الحقول
  const fields = useMemo(() => {
    const positionOptions = positions.map((pos) => ({
      label: pos.name,
      value: pos._id,
    }));

    const roleOptions = [
      { label: "Admin", value: "admin" },
      { label: "Super Admin", value: "superadmin" },
    ];

    return [
      { key: "username", label: "Name", required: true },
      { key: "email", label: "Email", required: true },
      { key: "company_name", label: "Company Name", required: true },
      { key: "password", label: "Password", type: "password" },
      { key: "phone", label: "Phone", required: true },
      {
        key: "positionId",
        label: "Position",
        type: "select",
        required: true,
        options: positionOptions,
        value: selectedPosition?._id || "",
        // 🟢 منع الريفريش هنا
        onChange: (value) => {
          const found = positions.find((p) => p._id === value);
          setSelectedPosition(found);
          setAdminData((prev) => ({
            ...prev,
            positionId: found?._id || "",
          }));
        },
      },
      {
        key: "role",
        label: "Role",
        type: "select",
        required: true,
        options: roleOptions,
      },
    ];
  }, [positions, selectedPosition]);

  // 🟣 عند الحفظ
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        positionId: formData.positionId || selectedPosition?._id,
      };

      await putData(payload);
      toast.success("Admin updated successfully!");
      navigate("/admin");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to update admin";

      const details = err.response?.data?.error?.details;
      if (details && Array.isArray(details)) {
        details.forEach((d) => toast.error(d));
      } else {
        toast.error(errorMessage);
      }
      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/admin");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {adminData && (
        <AddPage
          key={adminData.positionId || "edit-admin"}
          title={`Edit admin: ${adminData.username || "..."}`}
          description="Update admin details"
          fields={fields}
          initialData={adminData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}
