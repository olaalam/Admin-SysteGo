// src/pages/admins.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";

const Admin = () => {
    const { data, loading, error, refetch } = useGet("/api/admin/admin");
    const { deleteData, loading: deleting } = useDelete(
        "/api/admin/admin/delete"
    );

    const [deleteTarget, setDeleteTarget] = useState(null);
    const PaymentMethod = data?.users || [];

    const handleDelete = async (item) => {
        try {
            // ✅ استدعاء الـ API مع id
            await deleteData(`/api/admin/admin/${item._id}`);
            refetch();
        } finally {
            setDeleteTarget(null);
        }
    };


const columns = [
  { key: "username", header: "Name", filterable: true },
  { key: "email", header: "Email", filterable: true },
  { key: "role", header: "Role", filterable: true },
  { key: "company_name", header: "Company Name", filterable: true },
  {
    key: "warehouse_id",
    header: "Warehouse",
    filterable: true,
  },
];



    if (loading) return <Loader />;
    if (error) return <div className="p-6 text-red-600 m-auto text-center">{error}</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <DataTable
                data={PaymentMethod}
                columns={columns}
                title="admin Management"
                onAdd={() => alert("Add new admin clicked!")}
                onEdit={(item) => alert(`Edit admin: ${item.code}`)}
                onDelete={(item) => setDeleteTarget(item)} // 👈 فتح الديالوغ
                addButtonText="Add admin"
                addPath="add"
                editPath={(item) => `edit/${item._id}`}
                itemsPerPage={10}
                searchable={true}
                filterable={true}
            />

            {/* Delete Dialog */}
            {deleteTarget && (
                <DeleteDialog
                    title="Delete admin"
message={`Are you sure you want to delete admin "${deleteTarget.username}"?`}

                    onConfirm={() => handleDelete(deleteTarget)}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleting}
                />
            )}
        </div>
    );
};

export default Admin;