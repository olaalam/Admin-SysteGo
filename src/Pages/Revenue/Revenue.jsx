// src/pages/revenues.jsx
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import { useNavigate } from "react-router-dom";

const Revenues = () => {
  const { data, loading, error } = useGet("/api/admin/revenue");

  const navigate = useNavigate();

  // ✅ البيانات جاية داخل revenues
  const revenues = data?.revenues || [];



  const columns = [
    {
      key: "name",
      header: "Revenue Name",
      filterable: true,
    },
    {
      key: "amount",
      header: "Amount",
      filterable: true,
      render: (value) => `${value} EGP`,
    },
    {
      key: "Category_id.name",
      header: "Category",
      filterable: true,
      render: (_, item) => item?.Category_id?.name || "-",
    },
    {
      key: "Category_id.ar_name",
      header: "Arabic Category",
      filterable: true,
      render: (_, item) => item?.Category_id?.ar_name || "-",
    },
    {
      key: "financial_accountId.name",
      header: "Financial Account",
      filterable: true,
      render: (_, item) => item?.financial_accountId?.name || "-",
    },
    {
      key: "admin_id.username",
      header: "Created By",
      filterable: true,
      render: (_, item) => item?.admin_id?.username || "-",
    },
    {
      key: "note",
      header: "Note",
      filterable: true,
    },

  ];

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">Error loading revenues</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={revenues}
        columns={columns}
        title="Revenues Management"
        onAdd={() => navigate("add")}
        onEdit={() => {}}
        addButtonText="Add Revenue"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

    </div>
  );
};

export default Revenues;
