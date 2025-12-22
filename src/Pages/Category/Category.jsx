// src/pages/categorys.jsx
import { useState } from "react";
import * as XLSX from "xlsx";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";
import { toast } from "react-toastify";

const Category = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/category");
  const { deleteData, loading: deleting } = useDelete("/api/admin/category/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const categories = data?.categories || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/category/${item._id}`);
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
      await deleteData("/api/admin/category", { ids: bulkDeleteIds });

      refetch();
      toast.success(`Successfully deleted ${bulkDeleteIds.length} categor${bulkDeleteIds.length > 1 ? 'ies' : 'y'}`);
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

    const worksheetData = dataToExport.map((category) => ({
      Name: category.name,
      "Name (Arabic)": category.ar_name || "",
      "Parent Category": category.parentId?.name || "",
      "Parent Category (Arabic)": category.parentId?.ar_name || "",
      "Product Quantity": category.product_quantity || 0,
      "Image URL": category.image || "",
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Categories");

    XLSX.writeFile(wb, `categories_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleImport = async (file) => {
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      console.log("Imported categories data:", jsonData);

      toast.info(`Read ${jsonData.length} row${jsonData.length > 1 ? 's' : ''} from file. (API integration pending)`);

      // Here you should make an API call for bulk import
      // await fetch("/api/admin/category/import", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ categories: jsonData }),
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
        "Parent Category": "",
        "Parent Category (Arabic)": "",
        "Product Quantity": "",
        "Image URL": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    XLSX.writeFile(wb, "categories_import_template.xlsx");
  };

  // helper function to display image
  const renderImage = (url) => {
    if (!url) return <span className="text-gray-400 text-xs">No image</span>;
    return (
      <img
        src={url}
        alt="category"
        className="h-12 w-12 object-cover rounded-lg border-2 border-gray-200"
      />
    );
  };

  // Render category info with image
  const renderCategoryInfo = (item) => {
    return (
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          {renderImage(item.image)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
            {item.name}
          </h3>
          {item.ar_name && (
            <p className="text-xs text-gray-500 truncate">{item.ar_name}</p>
          )}
        </div>
      </div>
    );
  };

  // Render parent category
  const renderParentCategory = (item) => {
    return (
      <div className="text-sm">
        <span className="font-medium text-gray-700">
          {item.parentId?.name || "—"}
        </span>
        {item.parentId?.ar_name && (
          <p className="text-xs text-gray-500 mt-0.5">{item.parentId.ar_name}</p>
        )}
      </div>
    );
  };

  // Render product quantity with badge
  const renderProductQuantity = (item) => {
    const quantity = item.product_quantity || 0;
    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-full ${
            quantity === 0
              ? "bg-gray-100 text-gray-600"
              : quantity < 5
              ? "bg-orange-100 text-orange-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {quantity}
        </span>
        <span className="text-xs text-gray-500">
          {quantity === 1 ? "product" : "products"}
        </span>
      </div>
    );
  };

  const columns = [
    {
      key: "name",
      header: "Category Details",
      filterable: true,
      render: (_, item) => renderCategoryInfo(item),
    },
    {
      key: "parentId",
      header: "Parent Category",
      filterable: true,
      render: (_, item) => renderParentCategory(item),
    },
    {
      key: "product_quantity",
      header: "Products",
      filterable: false,
      render: (_, item) => renderProductQuantity(item),
    },
  ];

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 font-medium">Error loading categories</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={categories}
        columns={columns}
        title="Category Management"
        onAdd={() => alert("Add new category clicked!")}
        onEdit={(item) => {}} // DataTable handles navigation via editPath
        onDelete={(item) => setDeleteTarget(item)}
        onBulkDelete={handleBulkDelete}
        onExport={handleExport}
        onImport={handleImport}
        downloadTemplate={downloadTemplate}
        addButtonText="Add Category"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          title="Delete Category"
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Bulk Delete Dialog */}
      {bulkDeleteIds && (
        <DeleteDialog
          title="Delete Multiple Categories"
          message={`Are you sure you want to delete ${bulkDeleteIds.length} categor${bulkDeleteIds.length > 1 ? 'ies' : 'y'}? This action cannot be undone.`}
          onConfirm={confirmBulkDelete}
          onCancel={() => setBulkDeleteIds(null)}
          loading={bulkDeleting}
        />
      )}
    </div>
  );
};

export default Category;