// src/pages/attributes.jsx
import { useState } from "react";
import * as XLSX from "xlsx";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { toast } from "react-toastify";

const Attribute = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/variation");
  const { deleteData, loading: deleting } = useDelete("/api/admin/variation/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const attributes = data?.variations || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/variation/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  // Bulk delete with the required body format
  const handleBulkDelete = async (selectedIds) => {
    if (!selectedIds?.length) return;
    setBulkDeleteIds(selectedIds);
  };

  const confirmBulkDelete = async () => {
    if (!bulkDeleteIds?.length) return;

    setBulkDeleting(true);

    try {
      // Pass the body data with ids array to deleteData
      await deleteData("/api/admin/variation", { ids: bulkDeleteIds });

      refetch();
      toast.success(`Successfully deleted ${bulkDeleteIds.length} attribute${bulkDeleteIds.length > 1 ? 's' : ''}`);
    } catch (err) {
      console.error("Bulk delete error:", err);
      // Error toast is already handled by useDelete hook
    } finally {
      setBulkDeleting(false);
      setBulkDeleteIds(null);
    }
  };

  const handleExport = (dataToExport) => {
    if (!dataToExport?.length) {
      toast.error("No data found");
      return;
    }

    const worksheetData = dataToExport.map((attribute) => ({
      Name: attribute.name,
      "Name (Arabic)": attribute.ar_name || "",
      Options: attribute.options && attribute.options.length > 0
        ? attribute.options.map(opt => `${opt.name} (${opt.status ? 'Active' : 'Inactive'})`).join(", ")
        : "",
      "Total Options": attribute.options?.length || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attributes");

    XLSX.writeFile(wb, `attributes_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleImport = async (file) => {
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      console.log("Imported attributes data:", jsonData);

      toast.info(`Read ${jsonData.length} row${jsonData.length > 1 ? 's' : ''} from file. (API integration pending)`);

      // Here you should make an API call for bulk import
      // await fetch("/api/admin/variation/import", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ variations: jsonData }),
      // });

      refetch();
    } catch (err) {
      console.error("Import failed:", err);
      toast.error("Failed to read Excel file");
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        Name: "",
        "Name (Arabic)": "",
        Options: "Option1 (Active), Option2 (Inactive)",
        "Total Options": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    XLSX.writeFile(wb, "attributes_import_template.xlsx");
  };

  // Render attribute info
  const renderAttributeInfo = (item) => {
    return (
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 text-sm">
          {item.name}
        </h3>
        {item.ar_name && (
          <p className="text-xs text-gray-600">{item.ar_name}</p>
        )}
      </div>
    );
  };

  // Render options with better styling
  const renderOptions = (item) => {
    const options = item.options || [];
    
    if (options.length === 0) {
      return <span className="text-gray-400 text-sm italic">No options</span>;
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <span
            key={opt._id}
            className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
              opt.status
                ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                : "bg-red-50 text-red-700 ring-1 ring-red-600/20"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                opt.status ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {opt.name}
          </span>
        ))}
      </div>
    );
  };

  // Render option count
  const renderOptionCount = (item) => {
    const count = item.options?.length || 0;
    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-full ${
            count === 0
              ? "bg-gray-100 text-gray-600"
              : count < 3
              ? "bg-orange-100 text-orange-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {count}
        </span>
        <span className="text-xs text-gray-500">
          {count === 1 ? "option" : "options"}
        </span>
      </div>
    );
  };

  const columns = [
    {
      key: "name",
      header: "Attribute Details",
      filterable: true,
      render: (_, item) => renderAttributeInfo(item),
    },
    {
      key: "options",
      header: "Options",
      filterable: false,
      render: (_, item) => renderOptions(item),
    },
    {
      key: "option_count",
      header: "Total Options",
      filterable: false,
      render: (_, item) => renderOptionCount(item),
    },
  ];

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">Error loading attributes</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={attributes}
        columns={columns}
        title="Attributes Management"
        onAdd={() => alert("Add new attribute clicked!")}
        onEdit={(item) => {}} // DataTable handles navigation via editPath
        onDelete={(item) => setDeleteTarget(item)}
        onBulkDelete={handleBulkDelete}
        onExport={handleExport}
        onImport={handleImport}
        downloadTemplate={downloadTemplate}
        addButtonText="Add Attribute"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          title="Delete Attribute"
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Bulk Delete Dialog */}
      {bulkDeleteIds && (
        <DeleteDialog
          title="Delete Multiple Attributes"
          message={`Are you sure you want to delete ${bulkDeleteIds.length} attribute${bulkDeleteIds.length > 1 ? 's' : ''}? This action cannot be undone.`}
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteIds(null)}
          loading={bulkDeleting}
        />
      )}
    </div>
  );
};

export default Attribute;