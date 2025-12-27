import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";

const Customer = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/customer");
  const { deleteData, loading: deleting } = useDelete(
    "/api/admin/customer/delete"
  );

  const [deleteTarget, setDeleteTarget] = useState(null);

  // 👇 الريسبونس: data.customers
  const customers = data?.customers || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/customer/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      filterable: true,
    },
    {
      key: "email",
      header: "Email",
      filterable: true,
    },
    {
      key: "phone_number",
      header: "Phone",
      filterable: true,
    },
    {
      key: "address",
      header: "Address",
      filterable: true,
    },
    {
      key: "is_Due",
      header: "Has Due",
      filterable: true,
      render: (value) =>
        value ? (
          <span className="text-red-600 font-semibold">Yes</span>
        ) : (
          <span className="text-green-600 font-semibold">No</span>
        ),
    },
    {
      key: "amount_Due",
      header: "Amount Due",
      filterable: false,
      render: (value) => value || 0,
    },
    {
      key: "total_points_earned",
      header: "Points",
      filterable: false,
      render: (value) => value || 0,
    },

  ];

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 text-red-600 m-auto text-center">
        {error}
      </div>
    );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable

        data={customers}
        columns={columns}
        title="Customer Management"
        addButtonText="Add Customer"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        onDelete={(item) => setDeleteTarget(item)}
        onAdd={() => alert("Add new supplier clicked!")}
        onEdit={(item) => alert(`Edit supplier: ${item.username}`)}
        itemsPerPage={10}
        searchable
        filterable
      />

      {deleteTarget && (
        <DeleteDialog
          title="Delete Customer"
          message={`Are you sure you want to delete customer "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Customer;
