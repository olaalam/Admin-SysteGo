// src/pages/attributes.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";

const Attribute = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/variation");
  const { deleteData, loading: deleting } = useDelete(
    "/api/admin/variation/delete"
  );

  const [deleteTarget, setDeleteTarget] = useState(null);

  // ✅ ناخد الـ variations من الداتا
  const attributes = data?.variations || [];

  console.log("attributes:", attributes);

  const handleDelete = async (item) => {
    try {
      // ✅ استدعاء API delete بالـ id
      await deleteData(`/api/admin/variation/${item._id}`);
      refetch(); // بعد الحذف نرجع نجيب الداتا
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
   { key: "ar_name", label: "Name (Arabic)", required: true },
{ key: "name", label: "Name (English)", required: false },

    {
      key: "options",
      header: "Options",
      render: (value) =>
        value && value.length > 0
          ? value.map((opt) => (
              <span
                key={opt._id}
                className={`px-2 py-1 mr-1 mb-1 inline-block rounded-full text-xs ${
                  opt.status
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {opt.name}
              </span>
            ))
          : "—",
    },
  ];

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={attributes}
        columns={columns}
        title="Attributes Management"
        onAdd={() => alert("Add new attribute clicked!")}
        onEdit={(item) => alert(`Edit attribute: ${item.name}`)} // 👈 edit
        onDelete={(item) => setDeleteTarget(item)} // 👈 delete
        addButtonText="Add Attribute"
        addPath="add"
        editPath={(item) => `edit/${item._id}`} // لو عندك صفحة edit
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          title="Delete Attribute"
          message={`Are you sure you want to delete attribute "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Attribute;
