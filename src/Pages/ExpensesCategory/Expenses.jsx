// src/pages/payment_methods.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Expenses = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/expenseCategory");
  const { deleteData, loading: deleting } = useDelete("/api/admin/expenseCategory");
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  
  const navigate = useNavigate();
  const expenseCategories = data?.expenseCategories || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/expenseCategory/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStatusToggle = async (item) => {
    setUpdatingId(item._id);
    try {
      await api.put(`/api/admin/expenseCategory/${item._id}`, { status: !item.status });
      toast.success("Status updated successfully!");
      refetch();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const renderStatusSwitch = (value, item) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={!!value}
        onChange={() => handleStatusToggle(item)}
        disabled={updatingId === item._id}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      {updatingId === item._id && (
        <span className="ml-2 text-xs text-gray-500">Updating...</span>
      )}
    </label>
  );

  // Render expense category info
  const renderCategoryInfo = (item) => {
    return (
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 text-sm">
          {item.name}
        </h3>
        {item.ar_name && (
          <p className="text-xs text-gray-600">{item.ar_name}</p>
        )}
      </div>
    );
  };

  // Render created date
  const renderCreatedDate = (item) => {
    const date = new Date(item.createdAt);
    return (
      <div className="text-sm text-gray-700">
        {date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </div>
    );
  };

  // Render updated date
  const renderUpdatedDate = (item) => {
    const date = new Date(item.updatedAt);
    return (
      <div className="text-sm text-gray-700">
        {date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </div>
    );
  };

  const columns = [
    {
      key: "name",
      header: "Category Details",
      filterable: true,
      
    },
        {
      key: "ar_name",
      header: "Arabic Name",
      filterable: true,
     
    },

    {
      key: "status",
      header: "Status",
      filterable: false,
      render: (value, item) => renderStatusSwitch(value, item),
    },
  ];

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">Error loading expense categories</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={expenseCategories}
        columns={columns}
        title="Expense Category Management"
        onAdd={() => navigate("add")}
        onEdit={(item) => {}} // DataTable handles navigation via editPath
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText="Add Expense Category"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          title="Delete Expense Category"
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Expenses;