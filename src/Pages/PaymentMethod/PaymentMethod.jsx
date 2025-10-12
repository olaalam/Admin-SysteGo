// src/pages/payment_methods.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";

const PaymentMethod = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/payment_method");
  const { deleteData, loading: deleting } = useDelete("/api/admin/payment_method/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const paymentMethods = data?.paymentMethods || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/payment_method/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const renderIcon = (url) => {
    if (!url) return <span className="text-gray-400">No Icon</span>;
    return (
      <img
        src={url}
        alt="Payment Icon"
        className="h-10 w-10 object-contain rounded border"
      />
    );
  };

  const renderStatus = (value) => (
    <span
      className={`px-2 py-1 rounded text-white text-xs ${
        value ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {value ? "Active" : "Inactive"}
    </span>
  );

  const columns = [
    { key: "name", header: "Name", filterable: true },
    { key: "discription", header: "Description", filterable: true },
    {
      key: "isActive",
      header: "Status",
      filterable: true,
      render: renderStatus,
    },
    {
      key: "icon",
      header: "Icon",
      filterable: false,
      render: renderIcon,
    },
  ];

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={paymentMethods}
        columns={columns}
        title="Payment Method Management"
        onAdd={() => alert("Add new payment method clicked!")}
        onEdit={(item) => alert(`Edit payment method: ${item.name}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText="Add Payment Method"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {deleteTarget && (
        <DeleteDialog
          title="Delete Payment Method"
          message={`Are you sure you want to delete payment method "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default PaymentMethod;
