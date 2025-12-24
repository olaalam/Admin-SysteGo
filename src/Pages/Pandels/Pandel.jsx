import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import ProductsViewDialog from "@/components/ProductsViewDialog";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import api from "@/api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

/* =======================
   Pandels Page
======================= */
const Pandels = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/pandel");
  const { deleteData, loading: deleting } = useDelete("/api/admin/pandel");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showProductsDialog, setShowProductsDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const navigate = useNavigate();

  const pandels = data?.pandels || [];

  /* =======================
     Delete Single
  ======================= */
  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/pandel/${item._id}`);
      toast.success("Pandel deleted successfully");
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  /* =======================
     Status Toggle
  ======================= */
  const handleStatusToggle = async (item) => {
    setUpdatingId(item._id);
    try {
      await api.put(`/api/admin/pandel/${item._id}`, {
        status: !item.status,
      });
      toast.success("Status updated successfully");
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
      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      {updatingId === item._id && (
        <span className="ml-2 text-xs text-gray-500">Updating...</span>
      )}
    </label>
  );

  /* =======================
     View Products Handler
  ======================= */
  const handleViewProducts = (item) => {
    setSelectedProducts(item.productsId || []);
    setShowProductsDialog(true);
  };

  /* =======================
     Columns
  ======================= */
const columns = [
  {
    key: "name",
    header: "Pandel Name",
    filterable: true,
  },
  {
    key: "startdate",
    header: "Start Date",
    filterable: true,
    render: (value) => {
      if (!value) return "-";
      const date = new Date(value);
      return new Intl.DateTimeFormat("en-GB").format(date); // dd/mm/yyyy
    },
  },
  {
    key: "enddate",
    header: "End Date",
    filterable: true,
    render: (value) => {
      if (!value) return "-";
      const date = new Date(value);
      return new Intl.DateTimeFormat("en-GB").format(date); // dd/mm/yyyy
    },
  },
  {
    key: "price",
    header: "Price",
    filterable: false,
  },
  {
    key: "products",
    header: "Products",
    render: (_, item) => (
      <button
        className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        onClick={() => handleViewProducts(item)}
      >
        {/* أيقونة */}
        View Products
      </button>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value, item) => renderStatusSwitch(value, item),
  },
];


  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">Error loading pandels</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={pandels}
        columns={columns}
        title="Pandel Management"
        onAdd={() => navigate("add")}
        onEdit={(item) => navigate(`edit/${item._id}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText="Add Pandel"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable
        filterable
      />

      {/* Delete Single */}
      {deleteTarget && (
        <DeleteDialog
          title="Delete Pandel"
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Products Dialog */}
      {showProductsDialog && (
        <ProductsViewDialog
          products={selectedProducts}
          onCancel={() => setShowProductsDialog(false)}
          title="Pandel Products"
        />
      )}
    </div>
  );
};

export default Pandels;