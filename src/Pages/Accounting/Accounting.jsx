import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import api from "@/api/api"; // ✅ استيراد api مباشرة

// A placeholder for a simple Switch component
const DefaultSwitch = ({ isDefault, onChange, loading }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🟢 Switch clicked! isDefault:", isDefault, "loading:", loading);
    if (!loading) {
      onChange();
    }
  };

  return (
    <button
      type="button"
      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
        isDefault
          ? "bg-primary text-white hover:bg-teal-600"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "..." : isDefault ? "On" : "Off"}
    </button>
  );
};
const Accounting = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/bank_account");
  const { deleteData, deleting } = useDelete("/api/admin/bank_account/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // حالات التحديث المنفصلة
  const [updatingDefault, setUpdatingDefault] = useState(false);
  const [updatingPOS, setUpdatingPOS] = useState(false);

  const PaymentMethod = data?.bankAccounts || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/bank_account/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

// ✅ تغيير حالة الحساب (مفعل / غير مفعل) - toggle عادي
const handleToggleStatus = async (account) => {
  setUpdatingDefault(true); // هنستخدم نفس الـ state عشان الـ loading
  try {
    await api.put(`/api/admin/bank_account/${account._id}`, {
      status: !account.status, // نبدل القيمة: true → false أو false → true
    });
    await refetch();
  } catch (err) {
    console.error(err);
    alert("فشل تحديث حالة الحساب: " + (err.response?.data?.message || err.message));
  } finally {
    setUpdatingDefault(false);
  }
};

  // ✅ تغيير ظهور الحساب في POS
  const handleTogglePOS = async (account) => {
    setUpdatingPOS(true);
    try {
      await api.put(`/api/admin/bank_account/${account._id}`, {
        in_POS: !account.in_POS, // نبدل القيمة الحالية
      });
      await refetch();
    } catch (err) {
      alert("فشل تحديث إعدادات POS: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingPOS(false);
    }
  };

  const columns = [
    { key: "name", header: "Name", filterable: true },
    { key: "balance", header: "Initial Balance", filterable: false },
{
  key: "status",
  header: "Status", // أو "Active" أو "Enabled" حسب المعنى اللي عايزاه
  render: (status, item) => (
    <DefaultSwitch
      isDefault={!!status}
      onChange={() => handleToggleStatus(item)}
      loading={updatingDefault}
    />
  ),
},
    {
      key: "in_POS",
      header: "Show in POS",
      render: (in_POS, item) => (
        <DefaultSwitch
          isDefault={!!in_POS}
          onChange={() => handleTogglePOS(item)}
          loading={updatingPOS}
        />
      ),
    },
    // باقي الأعمدة إذا فيه actions مثلاً
  ];

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={PaymentMethod}
        columns={columns}
        title="Bank Account Management"
        onAdd={() => alert("Add new bank account clicked!")}
        onEdit={(item) => alert(`Edit bank account: ${item.account_no}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText="Add Bank Account"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {deleteTarget && (
        <DeleteDialog
          title="Delete Bank Account"
          message={`Are you sure you want to delete bank account "${
            deleteTarget.account_no || deleteTarget.name
          }"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Accounting;