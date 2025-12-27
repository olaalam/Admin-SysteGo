import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";

const CustomerGroup = () => {
    const navigate = useNavigate();

    const { data, loading, error, refetch } = useGet(
        "/api/admin/customer/groups"
    );

    const { deleteData, loading: deleting } = useDelete(
        "/api/admin/customer/groups/delete"
    );

    const [deleteTarget, setDeleteTarget] = useState(null);

    // ✅ حسب الريسبونس
    const groups = data?.groups || [];

    const handleDelete = async (item) => {
        try {
            await deleteData(`/api/admin/customer/groups/${item._id}`);
            refetch();
        } finally {
            setDeleteTarget(null);
        }
    };

    const columns = [
        {
            key: "name",
            header: "Group Name",
            filterable: true,
        },
        {
            key: "status",
            header: "Status",
            filterable: true,
            render: (value) =>
                value ? (
                    <span className="text-green-600 font-semibold">Active</span>
                ) : (
                    <span className="text-red-600 font-semibold">Inactive</span>
                ),
        },
        {
            key: "createdAt",
            header: "Created At",
            render: (value) =>
                new Date(value).toLocaleDateString("en-GB"),
        },
    ];

    if (loading) return <Loader />;

    if (error)
        return (
            <div className="p-6 text-red-600 text-center">
                {error}
            </div>
        );

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <DataTable
                data={groups}
                columns={columns}
                title="Customer Groups"
                addButtonText="Add Group"
                onAdd={() => alert("Add new supplier clicked!")}
                onEdit={(item) => alert(`Edit supplier: ${item.username}`)}
                addPath="add"
                editPath={(item) => `edit/${item._id}`}
                onDelete={(item) => setDeleteTarget(item)}
                itemsPerPage={10}
                searchable
                filterable
            />

            {deleteTarget && (
                <DeleteDialog
                    title="Delete Customer Group"
                    message={`Are you sure you want to delete group "${deleteTarget.name}"?`}
                    onConfirm={() => handleDelete(deleteTarget)}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleting}
                />
            )}
        </div>
    );
};

export default CustomerGroup;
