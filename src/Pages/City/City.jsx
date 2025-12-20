import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";

const City = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/city");
  const { deleteData, loading: deleting } = useDelete("/api/admin/city/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const cities = data?.cities || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/city/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: "name", header: "City Name", filterable: true },
    {
      key: "ar_name",
      header: "City Name (Arabic)",
      filterable: true,
    },
    { key: "shipingCost", header: "Shipping Cost", filterable: true },
    {
      key: "country.name",
      header: "Country",
      filterable: true,
      render: (value, row) => row.country?.name || "N/A",
    },
  ];

  if (loading) return <Loader />;
  if (error)
    return <div className="p-6 text-red-600 m-auto text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={cities}
        columns={columns}
        title="City Management"
        onAdd={() => alert("Add new city clicked!")}
        onEdit={(item) => alert(`Edit city: ${item.name}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText="Add City"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {deleteTarget && (
        <DeleteDialog
          title="Delete City"
          message={`Are you sure you want to delete city "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default City;
