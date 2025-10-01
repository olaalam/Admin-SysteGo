// src/pages/brands.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";

const Brand = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/brand");
  const { deleteData, loading: deleting } = useDelete(
    "/api/admin/brand/delete"
  );

  const [deleteTarget, setDeleteTarget] = useState(null);
  const PaymentMethod = data?.brands || [];

  const handleDelete = async (item) => {
    try {
      // ✅ استدعاء الـ API مع id
      await deleteData(`/api/admin/brand/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

// helper function لعرض الصورة
const renderLogo = (url) => {
  if (!url) return <span className="text-gray-400">No Logo</span>;
  return (
    <img
      src={url}
      alt="Logo"
      className="h-10 w-10 object-contain rounded border"
    />
  );
};

const columns = [
  { key: "name", header: "Name", filterable: true },
  {
    key: "logo",
    header: "Logo",
    filterable: false,
    render: (value) => renderLogo(value), // 👈 هنا نستعملها
  },

];


  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={PaymentMethod}
        columns={columns}
        title="Brand Management"
        onAdd={() => alert("Add new brand clicked!")}
        onEdit={(item) => alert(`Edit brand: ${item.code}`)}
        onDelete={(item) => setDeleteTarget(item)} // 👈 فتح الديالوغ
        addButtonText="Add brand"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          title="Delete brand"
          message={`Are you sure you want to delete brand "${
            deleteTarget.code || deleteTarget.name
          }"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Brand;