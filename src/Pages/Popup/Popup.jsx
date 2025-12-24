import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Popup = () => {
  const navigate = useNavigate();

  // ✅ endpoint الصح
  const { data, loading, error, refetch } = useGet("/api/admin/popup");
  const { deleteData, loading: deleting } = useDelete("/api/admin/popup");

  const [deleteTarget, setDeleteTarget] = useState(null);

  // ✅ البيانات جاية في popup array
  const popups = data?.popup || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/popup/${item._id}`);
      toast.success("Popup deleted successfully");
      refetch();
    } catch (err) {
      toast.error("Failed to delete popup",err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const renderImage = (url) => {
    if (!url) return <span className="text-gray-400">No Image</span>;
    return (
      <img
        src={url}
        alt="Popup"
        className="h-12 w-20 object-cover rounded border"
      />
    );
  };

  const renderLink = (url) => {
    if (!url) return "-";
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline text-sm"
      >
        Open Link
      </a>
    );
  };

  const columns = [
    {
      key: "title_En",
      header: "Title (EN)",
      filterable: true,
    },
    {
      key: "title_ar",
      header: "Title (AR)",
      filterable: true,
    },
    {
      key: "description_En",
      header: "Description (EN)",
      filterable: true,
    },
    {
      key: "description_ar",
      header: "Description (AR)",
      filterable: true,
    },
    {
      key: "image",
      header: "Image ",
      filterable: false,
      render: renderImage,
    },
    {
      key: "link",
      header: "Link",
      filterable: false,
      render: renderLink,
    },
  ];

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">Error loading popups</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={popups}
        columns={columns}
        title="Popup Management"
        onAdd={() => navigate("add")}
        onEdit={() => {}}
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText="Add Popup"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {deleteTarget && (
        <DeleteDialog
          title="Delete Popup"
          message={`Are you sure you want to delete popup "${deleteTarget.title_En}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Popup;
