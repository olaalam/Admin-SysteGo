// src/pages/ProductWarehouse.jsx
import { useEffect } from "react"; // 1. استيراد useEffect
import { useParams } from "react-router-dom";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";

const ProductWarehouse = () => {
  const { id } = useParams(); // هذا هو ID المخزن

  // 2. تخزين الـ ID في localStorage بمجرد توفره
  useEffect(() => {
    if (id) {
      localStorage.setItem("currentWarehouseId", id);
    }
  }, [id]);

  const { data, loading, error } = useGet(`/api/admin/product_warehouse/${id}`);

  const warehouse = data?.warehouse || {};
  const products = data?.products || [];

  const columns = [
    {
      key: "name",
      header: "Product Name",
      filterable: true,
      render: (value) => (
        <span className="text-gray-700 font-medium">
          {value}
        </span>
      ),
    },
    { key: "sku", header: "SKU", filterable: true },
    { key: "price", header: "Price", filterable: false },
    { key: "quantity", header: "Quantity", filterable: false },
  ];

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600 m-auto text-center">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      
      {/* قسم تفاصيل المخزن */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{warehouse.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div><span className="font-semibold text-gray-900">Address:</span> {warehouse.address}</div>
          <div><span className="font-semibold text-gray-900">Phone:</span> {warehouse.phone}</div>
          <div><span className="font-semibold text-gray-900">Email:</span> {warehouse.email}</div>
          <div><span className="font-semibold text-gray-900">Stock Quantity:</span> {warehouse.stock_Quantity}</div>
        </div>
      </div>

      {/* جدول المنتجات */}
      <DataTable
        data={products}
        columns={columns}
        title={`Products inside ${warehouse.name || "Warehouse"}`}
        addButtonText="Add Product to Warehouse"
        onAdd={() => alert("Add new warehouse clicked!")}
        addPath={`/product-warehouse/add`} 
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />
    </div>
  );
};

export default ProductWarehouse;