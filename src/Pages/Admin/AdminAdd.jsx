// src/pages/adminAdd.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";

const AdminAdd = () => {
  const navigate = useNavigate();

    const fields = useMemo(() => [
        { key: "username", label: "Name", required: true },
        { key: "email", label: "Email", required: true },
        { key: "role", label: "Role", required: true },
        { key: "company_name", label: "Company Name", required: true },
        { key: "password", label: "Password", type: "password" },
        { key: "phone", label: "Phone", required: true },
    ], []);

  const handleSubmit = async (data) => {
    try {
      await api.post("/api/admin/admin/", data);
      toast.success("admin added successfully!");
      navigate("/admin");
    } catch (err) {
      // ✅ عرض الأخطاء من الـ API
      const errorMessage = 
        err.response?.data?.error?.message || 
        err.response?.data?.message || 
        "Failed to add admin";
      
      const errorDetails = err.response?.data?.error?.details;
      
      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach(detail => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }
      
      console.error("❌ Error:", err.response?.data);
    }
  };

  return (
    <div className="p-6">
      <AddPage
        title="Add admin"
        description="Upload logo and fill in the details"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin")}
        initialData={{ status: true }}
      />
    </div>
  );
};

export default AdminAdd;