// src/pages/categorys.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";

const Category = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/category");
  const { deleteData, loading: deleting } = useDelete(
    "/api/admin/category/delete"
  );

  const [deleteTarget, setDeleteTarget] = useState(null);
  const PaymentMethod = data?.categories || [];

  const handleDelete = async (item) => {
    try {
      // ✅ استدعاء الـ API مع id
      await deleteData(`/api/admin/category/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  // helper function لعرض الصورة
  const renderimage = (url) => {
    if (!url) return <span className="text-gray-400">No image</span>;
    return (
      <img
        src={url}
        alt="image"
        className="h-10 w-10 object-contain rounded border"
      />
    );
  };

const columns = [
  { key: "name", header: "Name", filterable: true },
  {
    key: "image",
    header: "Image",
    filterable: false,
    render: (value) => renderimage(value), 
  },
  {
    key: "parentId",
    header: "Parent Category",
    filterable: true,
    render: (value) => value?.name || "—", // 👈 هنا الحل
  },
  {
    key: "number_of_products",
    header: "number_of_products",
    filterable: true,
  },
  { key: "stock_quantity", header: "stock_quantity", filterable: true },
  { key: "value", header: "value", filterable: true },
  { key: "product_quantity", header: "product_quantity", filterable: true },
];


  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={PaymentMethod}
        columns={columns}
        title="category Management"
        onAdd={() => alert("Add new category clicked!")}
        onEdit={(item) => alert(`Edit category: ${item.code}`)}
        onDelete={(item) => setDeleteTarget(item)} // 👈 فتح الديالوغ
        addButtonText="Add category"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          title="Delete category"
          message={`Are you sure you want to delete category "${
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

export default Category;
