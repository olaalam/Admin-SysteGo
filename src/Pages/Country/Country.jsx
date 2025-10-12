import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";

const Country = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/country");
  const { deleteData, loading: deleting } = useDelete("/api/admin/country/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const cities = data?.countries || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/country/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: "name", header: "country Name", filterable: true },

  ];

  if (loading) return <Loader />;
  if (error)
    return <div className="p-6 text-red-600 m-auto text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={cities}
        columns={columns}
        title="country Management"
        onAdd={() => alert("Add new country clicked!")}
        onEdit={(item) => alert(`Edit country: ${item.name}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText="Add country"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {deleteTarget && (
        <DeleteDialog
          title="Delete country"
          message={`Are you sure you want to delete country "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Country;
