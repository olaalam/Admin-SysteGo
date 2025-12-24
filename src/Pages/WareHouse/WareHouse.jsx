// src/pages/warehouses.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";

const WareHouse = () => {
  const navigate = useNavigate(); // هنا نستخدم navigate
  const { data, loading, error, refetch } = useGet("/api/admin/warehouse");
  const { deleteData, loading: deleting } = useDelete("/api/admin/warehouse/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const warehouses = data?.warehouses || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/warehouse/${item._id}`);
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
render: (value, row) => (
  <span
    className="text-blue-600 cursor-pointer hover:underline"
  onClick={() => navigate(`/product-warehouse/${row._id}`)}

  >
    {value}  {/* هذا يعرض الاسم */}
  </span>
)

},
    { key: "address", header: "Address", filterable: true },
    { key: "phone", header: "Phone", filterable: true },
    { key: "email", header: "Email", filterable: true },
    { key: "number_of_products", header: "Products", filterable: false },
    { key: "stock_Quantity", header: "Stock Quantity", filterable: false },
  ];

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600 m-auto text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={warehouses}
        columns={columns}
        title="Warehouse Management"
        onAdd={() => alert("Add new warehouse clicked!")}
        onEdit={(item) => alert(`Edit warehouse: ${item.name}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText="Add warehouse"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {deleteTarget && (
        <DeleteDialog
          title="Delete Warehouse"
          message={`Are you sure you want to delete warehouse "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default WareHouse;
