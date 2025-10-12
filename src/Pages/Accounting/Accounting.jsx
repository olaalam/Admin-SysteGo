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
  const { deleteData, loading: deleting } = useDelete(
    "/api/admin/bank_account/delete"
  );
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updatingDefault, setUpdatingDefault] = useState(false); // ✅ state للـ loading
  const PaymentMethod = data?.accounts || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/bank_account/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  // ✅ Handler للـ default account
  const handleSetDefault = async (account) => {
    console.log("🔵 handleSetDefault called with account:", account);
    
    // ✅ لو الـ account ده already default، متعملش حاجة
    if (account.is_default) {
      console.log("⚠️ Account is already default - no action needed");
      return;
    }

    setUpdatingDefault(true);
    try {
      console.log("🚀 Sending PUT request to:", `/api/admin/bank_account/${account._id}`);
      console.log("📦 Request body:", { is_default: true });
      
      // ✅ بعت request للـ API عشان نخلي الـ account ده default
      const result = await api.put(`/api/admin/bank_account/${account._id}`, {
        is_default: true,
      });
      
      console.log("✅ PUT request successful:", result.data);

      // ✅ نعمل refetch عشان نجيب الداتا المحدثة
      // الـ backend المفروض يخلي هذا الـ account is_default: true
      // وكل الباقي is_default: false
      await refetch();
      console.log("🔄 Data refetched successfully");
    } catch (err) {
      console.error("❌ Failed to set default account:", err);
      alert("فشل تحديد الحساب كافتراضي: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingDefault(false);
    }
  };

  const columns = [
    { key: "account_no", header: "Account No", filterable: true },
    { key: "name", header: "Name", filterable: true },
    { key: "initial_balance", header: "Initial Balance", filterable: false },
    {
      key: "is_default",
      header: "Default",
      filterable: false,
      // ✅ رندر الـ switch مع الـ handler
      render: (isDefault, item) => (
        <DefaultSwitch
          isDefault={isDefault}
          onChange={() => handleSetDefault(item)}
          loading={updatingDefault} // ✅ Disable أثناء التحديث
        />
      ),
    },
    { key: "note", header: "Note", filterable: false },
  ];

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 text-red-600 m-auto text-center">{error}</div>
    );

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

      {/* Delete Dialog */}
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