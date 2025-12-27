// src/pages/CustomerGroupAdd.jsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";

const CustomerGroupAdd = () => {
  const navigate = useNavigate();

  // ✅ endpoint الإضافة
  const { postData, loading: submitting } = usePost(
    "/api/admin/customer-group"
  );

  // ✅ الحقول الخاصة بالـ customer group
  const fields = useMemo(
    () => [
      {
        key: "name",
        label: "Group Name",
        required: true,
      },
      {
        key: "status",
        label: "Status",
        type: "switch",
        required: true,
      },
    ],
    []
  );

  // ✅ إرسال البيانات بنفس الـ body المطلوب
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        status: Boolean(formData.status),
      };

      await postData(payload);

      toast.success("Customer group added successfully 🎉");
      navigate("/customer-group");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to add customer group";
      toast.error(msg);
      console.error("❌ Error:", err.response?.data);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title="Add Customer Group"
        description="Create a new customer group"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/customer-group")}
        loading={submitting}
        initialData={{
          status: true, // default active
        }}
      />
    </div>
  );
};

export default CustomerGroupAdd;
