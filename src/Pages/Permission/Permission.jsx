// src/pages/admins.jsx
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";

const  Permission = () => {
    const { data, loading, error} = useGet("/api/admin/admin");


    const PaymentMethod = data?.users || [];





    const columns = [
        { key: "username", header: "Name", filterable: true },
        { key: "email", header: "Email", filterable: true },
        { key: "role", header: "Role", filterable: true },
        { key: "company_name", header: "Company Name", filterable: true },


    ];


    if (loading) return <Loader />;
    if (error) return <div className="p-6 text-red-600 m-auto text-center">{error}</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <DataTable
                data={PaymentMethod}
                columns={columns}
                title="permission Management"
                onAdd={() => alert("Add new permission clicked!")}
                onEdit={(item) => alert(`Edit permission: ${item.code}`)}
                addButtonText="Add permission"
                addPath="add"
                editPath={(item) => `edit/${item._id}`}
                itemsPerPage={10}
                searchable={true}
                filterable={true}
            />


        </div>
    );
};

export default Permission;