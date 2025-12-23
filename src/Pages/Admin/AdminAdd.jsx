// src/pages/AdminAdd.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";
import useGet from "@/hooks/useGet";

const AdminAdd = () => {
  const navigate = useNavigate();

  const { postData, loading: submitting } = usePost("/api/admin/admin");
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
     Form Fields
  ======================= */
  const fields = useMemo(
    () => [
      {
        key: "username",
        label: "Username",
        type: "text",
        required: true,
        placeholder: "e.g. seddek",
      },
      {
        key: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "e.g. admin@mail.com",
      },
      {
        key: "password",
        label: "Password",
        type: "password",
        required: true,
      },
      {
        key: "company_name",
        label: "Company Name",
        type: "text",
        required: true,
        placeholder: "e.g. Wego",
      },
      {
        key: "phone",
        label: "Phone",
        type: "text",
        required: true,
        placeholder: "e.g. 01234567899",
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
    []
  );

  /* =======================
     Submit
  ======================= */
const handleSubmit = async (formData) => {
  try {
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      company_name: formData.company_name,
      phone: formData.phone,
      warehouse_id: formData.warehouse_id, // 👈 مهم
    };

    await postData(payload);

    toast.success("Admin added successfully!");
    navigate("/admin");
  } catch (err) {
    toast.error(
      err.response?.data?.message || "Failed to add admin"
    );
  }
};


  return (
    <div className="p-6">
      <AddPage
        title="Add Admin"
        description="Fill in the details for the new administrator."
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin")}
        loading={submitting}
      />
    </div>
  );
};

export default AdminAdd;
