import { useState } from "react";
import DataTable from "@/components/DataTable";
import DeleteDialog from "@/components/DeleteForm";

const Product = () => {
  const [data, setData] = useState([
    {
      id: 1,
      name: "azda",
      db: "sale_azda",
      domain: "azda.saleprosaas.com",
      package: "Premium",
      subscriptionType: "yearly",
      companyName: "microsoft",
      phoneNumber: "7575765",
      email: "info@microsoft.com",
      createdAt: "28-04-2025",
      expiryDate: "28-04-2026",
      status: "Active",
    },
    {
      id: 2,
      name: "tesco",
      db: "sale_tesco",
      domain: "tesco.saleprosaas.com",
      package: "Standard",
      subscriptionType: "yearly",
      companyName: "microsoft",
      phoneNumber: "7575765",
      email: "info@microsoft.com",
      createdAt: "08-02-2023",
      expiryDate: "31-12-2025",
      status: "Active",
    },
  ]);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = [
    { key: "name", header: "Name", filterable: false },
    { key: "db", header: "DB", filterable: false },
    { key: "domain", header: "Domain", filterable: false },
    { key: "package", header: "Package", filterable: true },
    { key: "subscriptionType", header: "Subscription Type", filterable: true },
    { key: "companyName", header: "Company Name", filterable: true },
    { key: "phoneNumber", header: "Phone Number", filterable: false },
    { key: "email", header: "Email", filterable: false },
    { key: "createdAt", header: "Created At", filterable: false },
    {
      key: "expiryDate",
      header: "Expiry Date",
      filterable: false,
      render: (value, item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            item.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  const handleAdd = () => {
    alert("Add new product clicked!");
  };

  const handleEdit = (item) => {
    alert(`Edit product: ${item.name}`);
  };

  const handleDelete = (item) => {
    setData((prevData) => prevData.filter((d) => d.id !== item.id));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={data}
        columns={columns}
        title="product Management"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={(item) => setDeleteTarget(item)} // 👈 افتح الـ dialog
        addButtonText="Add product"
        addPath={"add"}
        editPath={"edit/:id"}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          title="Delete Item"
          message={`Are you sure you want to delete "${
            deleteTarget.name || deleteTarget.id
          }" ?`}
          onConfirm={() => {
            handleDelete(deleteTarget); // 👈 الحذف الفعلي
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Product;
