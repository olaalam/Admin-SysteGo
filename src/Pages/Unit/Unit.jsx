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

const Unit = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/units");
  const { deleteData, deleting } = useDelete("/api/admin/units");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();
  const units = data?.units || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/units/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStatusToggle = async (item) => {
    setUpdatingId(item._id);
    try {
      await api.put(`/api/admin/units/${item._id}`, { status: !item.status });
      toast.success("Status updated successfully!");
      refetch();
    } catch (err) {
      toast.error("Failed to update status", err);
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

  const columns = [
    { key: "name", header: "Name", filterable: true },
    { key: "ar_name", header: "Arabic Name", filterable: true },
    { key: "code", header: "Code", filterable: true },

    {
      key: "base_unit",
      header: "Base Unit",
      filterable: true,
      render: (baseUnit) => {
        if (!baseUnit) {
          return <span className="text-gray-400 italic">—</span>; // أو "Base Unit Itself"
        }
        // نعرض الاسم بالإنجليزي أولاً، ثم العربي لو موجود
        return (
          <div className="text-sm">
            <div className="font-medium">{baseUnit.name}</div>
            {baseUnit.ar_name && (
              <div className="text-gray-600 text-xs">{baseUnit.ar_name}</div>
            )}
            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-200 rounded">
              {baseUnit.code}
            </span>
          </div>
        );
      },
    },

    { key: "operator", header: "Operator", filterable: true },
    { key: "operator_value", header: "Value", filterable: true },
    {
      key: "is_base_unit",
      header: "Is Base Unit",
      filterable: true,
      render: (value) => (
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {value ? "Yes" : "No"}
        </span>
      ),
    },

    {
      key: "status",
      header: "Status",
      filterable: true,
      render: (value, item) => renderStatusSwitch(value, item),
    },
  ];

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={units}
        columns={columns}
        title="Unit Management"
        onAdd={() => navigate("add")}
        onEdit={(item) => navigate(`edit/${item._id}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText="Add Unit"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          title="Delete Unit"
          message={`Are you sure you want to delete unit "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Unit;
