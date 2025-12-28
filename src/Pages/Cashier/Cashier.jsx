import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";

const Cashier = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/cashier");
  const { deleteData, loading: deleting } = useDelete(
    "/api/admin/cashier/delete"
  );

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showBankAccountsModal, setShowBankAccountsModal] = useState(false);
  const [selectedBankAccounts, setSelectedBankAccounts] = useState([]);
  const cashiers = data?.cashiers || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/cashier/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  const renderStatus = (status) => {
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          status
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {status ? "Active" : "Inactive"}
      </span>
    );
  };



  const renderBankAccounts = (accounts) => {
    if (!accounts || accounts.length === 0) {
      return <span className="text-gray-400">No Accounts</span>;
    }
    return (
      <div className="flex flex-col gap-1">
        {accounts.slice(0, 2).map((account, idx) => (
          <span key={idx} className="text-sm">
            {account.name}
          </span>
        ))}
        {accounts.length > 2 && (
          <button
            onClick={() => {
              setSelectedBankAccounts(accounts);
              setShowBankAccountsModal(true);
            }}
            className="text-xs text-teal-600 hover:text-teal-800 hover:underline text-left"
          >
            +{accounts.length - 2} more
          </button>
        )}
      </div>
    );
  };

  const columns = [
    { key: "name", header: "Name", filterable: true },
    { key: "ar_name", header: "Arabic Name", filterable: true },
    {
      key: "warehouse_id",
      header: "Warehouse",
      filterable: true,
      render: (_, row) => row.warehouse_id?.name || <span className="text-gray-400">No Warehouse</span>,
    },
    {
      key: "status",
      header: "Status",
      filterable: true,
      render: renderStatus,
    },
    {
      key: "cashier_active",
      header: "Cashier Active",
      filterable: true,
      render: renderStatus,
    },
    {
      key: "bankAccounts",
      header: "Bank Accounts",
      filterable: false,
      render: renderBankAccounts,
    },
  ];

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 text-red-600 m-auto text-center">{error}</div>
    );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={cashiers}
        columns={columns}
        title="Cashier Management"
        onAdd={() => alert("Add new cashier clicked!")}
        onEdit={(item) => alert(`Edit cashier: ${item.name}`)}
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText="Add Cashier"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {deleteTarget && (
        <DeleteDialog
          title="Delete Cashier"
          message={`Are you sure you want to delete cashier "${
            deleteTarget.name || deleteTarget.ar_name
          }"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Bank Accounts Modal */}
      {showBankAccountsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    Bank Accounts
                  </h3>
                  <p className="text-teal-100 text-sm mt-1">
                    Total: {selectedBankAccounts.length} {selectedBankAccounts.length === 1 ? 'Account' : 'Accounts'}
                  </p>
                </div>
                <button
                  onClick={() => setShowBankAccountsModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <div className="space-y-3">
                {selectedBankAccounts.map((account, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {account.name}
                        </p>

                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Balance:</span>{" "}
                            <span className="font-bold text-teal-600">
                              ${account.balance.toFixed(2)}
                            </span>
                          </p>

                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Status:</span>{" "}
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                account.status
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {account.status ? "Active" : "Inactive"}
                            </span>
                          </p>

                          <p className="text-xs text-gray-600">
                            <span className="font-medium">In POS:</span>{" "}
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                account.in_POS
                                  ? "bg-teal-100 text-teal-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {account.in_POS ? "Yes" : "No"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-teal-600">
                          ${account.balance.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowBankAccountsModal(false)}
                className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Cashier;