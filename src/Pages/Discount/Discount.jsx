// src/pages/discounts.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Discount = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/discount");
  const { deleteData, loading: deleting } = useDelete("/api/admin/discount");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const navigate = useNavigate();

  // ✅ متوافق مع الريسبونس
  const discounts = data?.discounts || [];

  /* =======================
     Delete Single
  ======================= */
  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/discount/${item._id}`);
      toast.success("Discount deleted successfully");
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  /* =======================
     Bulk Delete
  ======================= */
  const handleBulkDelete = (selectedIds) => {
    if (!selectedIds?.length) return;
    setBulkDeleteIds(selectedIds);
  };

  const confirmBulkDelete = async () => {
    if (!bulkDeleteIds?.length) return;

    setBulkDeleting(true);
    try {
      await deleteData("/api/admin/discount", {
        ids: bulkDeleteIds,
      });
      toast.success(
        `Successfully deleted ${bulkDeleteIds.length} discount${
          bulkDeleteIds.length > 1 ? "s" : ""
        }`
      );
      refetch();
    } finally {
      setBulkDeleting(false);
      setBulkDeleteIds(null);
    }
  };

  /* =======================
     Status Toggle
  ======================= */
  const handleStatusToggle = async (item) => {
    setUpdatingId(item._id);
    try {
      await api.put(`/api/admin/discount/${item._id}`, {
        status: !item.status,
      });
      toast.success("Status updated successfully");
      refetch();
    } catch {
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
      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:h-5 after:w-5 after:bg-white after:border after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
      {updatingId === item._id && (
        <span className="ml-2 text-xs text-gray-500">Updating...</span>
      )}
    </label>
  );

  /* =======================
     Columns
  ======================= */
  const columns = [
    {
      key: "name",
      header: "Discount Name",
      filterable: true,
      render: (value) => (
        <span className="font-medium text-gray-900 text-sm">{value}</span>
      ),
    },
 
    {
      key: "type",
      header: "Type",
      filterable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            value === "percentage"
              ? "bg-blue-50 text-blue-700"
              : "bg-purple-50 text-purple-700"
          }`}
        >
          {value === "percentage" ? "Percentage" : "Fixed"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      filterable: false,
      render: (value, item) =>
        item.type === "percentage" ? `${value * 100}%` : value,
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
        <p className="text-red-600 font-medium">Error loading discounts</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={discounts}
        columns={columns}
        title="Discount Management"
        onAdd={() => navigate("add")}
        onEdit={(item)=>alert("edits")}
        onDelete={(item) => setDeleteTarget(item)}
        onBulkDelete={handleBulkDelete}
        addButtonText="Add Discount"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable
        filterable
      />

      {/* Delete Single */}
      {deleteTarget && (
        <DeleteDialog
          title="Delete Discount"
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Bulk Delete */}
      {bulkDeleteIds && (
        <DeleteDialog
          title="Delete Multiple Discounts"
          message={`Are you sure you want to delete ${bulkDeleteIds.length} discount${
            bulkDeleteIds.length > 1 ? "s" : ""
          }?`}
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteIds(null)}
          loading={bulkDeleting}
        />
      )}
    </div>
  );
};

export default Discount;
