import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/admin");
  const navigate = useNavigate();
  const { deleteData, loading: deleting } = useDelete(
    "/api/admin/admin/delete"
  );

  const [deleteTarget, setDeleteTarget] = useState(null);

  const admins = data?.users || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/admin/${item.id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    { key: "username", header: "Name", filterable: true },
    { key: "email", header: "Email", filterable: true },
    { key: "role", header: "Role", filterable: true },
    { key: "company_name", header: "Company Name", filterable: true },
    {
      key: "warehouse",
      header: "Warehouse",
      filterable: true,
    },
  ];

  if (loading) return <Loader />;
  if (error)
    return <div className="p-6 text-red-600 m-auto text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={admins}
        columns={columns}
        title="Admin Management"
        onAdd={() => navigate("add")}
        addButtonText="Add admin"
        addPath="add"
        editPath={(item) => `edit/${item.id}`}
        onDelete={(item) => setDeleteTarget(item)}
        onEdit={() => {}}
        itemsPerPage={10}
        searchable
        filterable
      />

      {deleteTarget && (
        <DeleteDialog
          title="Delete admin"
          message={`Are you sure you want to delete admin "${deleteTarget.username}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Admin;
