import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import api from "@/api/api";
import { toast } from "react-toastify";
const Currency = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/currency"); // تأكد من الرابط الصحيح
  const { deleteData, loading: deleting } = useDelete("/api/admin/currency/delete");
const [updatingId, setUpdatingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // تعديل هنا: نستخدم data.currencies بدل countries
  const currencies = data?.currencies || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/currency/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };
  const handleSetDefault = async (item) => {
  if (item.isdefault) return; // already default

  setUpdatingId(item._id);
  try {
    await api.put(`/api/admin/currency/${item._id}`, {
      isdefault: true,
    });

    toast.success("Default currency updated");
    refetch();
  } catch (err) {
    toast.error("Failed to update default currency");
    console.error(err);
  } finally {
    setUpdatingId(null);
  }
};


const columns = [
  { key: "name", header: "Currency Name", filterable: true },
  { key: "ar_name", header: "Arabic Name", filterable: true },
{
  key: "isdefault",
  header: "Default",
  filterable: false,
  render: (value, item) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={!!value}
        disabled={value || updatingId === item._id}
        onChange={() => handleSetDefault(item)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
      {updatingId === item._id && (
        <span className="ml-2 text-xs text-gray-500">Updating...</span>
      )}
    </label>
  ),
}
,
  { key: "amount", header: "Amount", filterable: true },
];


  if (loading) return <Loader />;
  if (error)
    return <div className="p-6 text-red-600 m-auto text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={currencies}
        columns={columns}
        title="Currency Management"
        onAdd={() => alert("Add new currency clicked!")}
        onEdit={(item) => alert(`Edit currency: ${item.name}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText="Add Currency"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {deleteTarget && (
        <DeleteDialog
          title="Delete Currency"
          message={`Are you sure you want to delete currency "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Currency;
