import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";

const Currency = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/currency"); // تأكد من الرابط الصحيح
  const { deleteData, loading: deleting } = useDelete("/api/admin/currency/delete");

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

  const columns = [
    { key: "name", header: "Currency Name", filterable: true },
    { key: "ar_name", header: "Arabic Name", filterable: true },
    { key: "isdefault", header: "Default", filterable: true },
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
