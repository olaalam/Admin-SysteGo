import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";

const Supplier = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/supplier");
  const { deleteData, loading: deleting } = useDelete(
    "/api/admin/supplier/delete"
  );

  const [deleteTarget, setDeleteTarget] = useState(null);
  const suppliers = data?.suppliers || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/supplier/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const renderImage = (url) => {
    if (!url) return <span className="text-gray-400">No Image</span>;
    return (
      <img
        src={url}
        alt="Supplier"
        className="h-10 w-10 object-contain rounded border"
      />
    );
  };

  const columns = [
    { key: "username", header: "Username", filterable: true },
    { key: "company_name", header: "Company Name", filterable: true },
    { key: "email", header: "Email", filterable: true },
    { key: "address", header: "Address", filterable: true },
    {
      key: "cityId",
      header: "City",
      filterable: true,
      render: (_, row) => row.cityId?.name || <span className="text-gray-400">No City</span>,
    },
    {
      key: "countryId",
      header: "Country",
      filterable: true,
      render: (_, row) => row.countryId?.name || <span className="text-gray-400">No Country</span>,
    },
    {
      key: "image",
      header: "Image",
      filterable: false,
      render: renderImage,
    },
  ];

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 text-red-600 m-auto text-center">{error}</div>
    );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={suppliers}
        columns={columns}
        title="Supplier Management"
        onAdd={() => alert("Add new supplier clicked!")}
        onEdit={(item) => alert(`Edit supplier: ${item.username}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText="Add Supplier"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {deleteTarget && (
        <DeleteDialog
          title="Delete Supplier"
          message={`Are you sure you want to delete supplier "${
            deleteTarget.username || deleteTarget.company_name
          }"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Supplier;
