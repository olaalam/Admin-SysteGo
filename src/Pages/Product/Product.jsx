// src/pages/products.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
// Import the new component
import VariablePricesDialog from "@/components/VariablePricesDialog";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";

const Product = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/product");
  const { deleteData, loading: deleting } = useDelete("/api/admin/product/delete");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [priceDialogProduct, setPriceDialogProduct] = useState(null);

  // Helper function to fix image URLs (kept for renderProductInfo)
  const getImageUrl = (imageStr) => {
    if (!imageStr) return "";

    // If it's already a full URL, return as is
    if (imageStr.startsWith("http://") || imageStr.startsWith("https://")) {
      return imageStr;
    }

    // If it's a data URI, return as is
    if (imageStr.startsWith("data:")) {
      return imageStr;
    }

    // If it's a base64 string without prefix, add it
    if (imageStr.match(/^[A-Za-z0-9+/=]+$/)) {
      return `data:image/jpeg;base64,${imageStr}`;
    }

    // Otherwise return as is
    return imageStr;
  };

  const products = data?.products || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/product/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Check if expiring soon (within 30 days)
  const isExpiringSoon = (dateString) => {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  // Product info with image
  const renderProductInfo = (item) => {
    return (
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <img
            // Use getImageUrl for the main product image
            src={getImageUrl(item.image)}
            alt={item.name}
            className="h-16 w-16 object-cover rounded-lg border-2 border-gray-200"
          />
          {item.quantity < 10 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              Low
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm mb-1.5 truncate">
            {item.name}
          </h3>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500">Category:</span>
              <span className="font-medium text-gray-700">
                {item.categoryId?.[0]?.name || "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500">Brand:</span>
              <span className="font-medium text-gray-700">
                {item.brandId?.name || "—"}
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-base font-bold text-teal-600">
              {item.price} EGP
            </span>
            <span className="text-xs text-gray-500">/ {item.unit}</span>
          </div>
        </div>
      </div>
    );
  };

  // Inventory info
  const renderInventory = (item) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-16">Stock:</span>
          <span
            className={`text-sm font-semibold ${item.quantity < 10
                ? "text-red-600"
                : item.quantity < 50
                  ? "text-orange-600"
                  : "text-green-600"
              }`}
          >
            {item.quantity}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-16">Min Sale:</span>
          <span className="text-sm font-medium text-gray-700">
            {item.minimum_quantity_sale || 1}
          </span>
        </div>
        {item.whole_price > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16">Wholesale:</span>
            <span className="text-sm font-medium text-gray-700">
              {item.whole_price} EGP
            </span>
          </div>
        )}
      </div>
    );
  };

  // Badge component
  const renderBadge = (value) => (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${value
          ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
          : "bg-gray-50 text-gray-600 ring-1 ring-gray-300/50"
        }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full mr-1.5 ${value ? "bg-green-500" : "bg-gray-400"
          }`}
      />
      {value ? "Yes" : "No"}
    </span>
  );

  // Expiration info
  const renderExpiration = (item) => {
    if (!item.exp_ability) {
      return renderBadge(false);
    }

    return (
      <div className="space-y-1.5">
        {renderBadge(true)}
        {item.date_of_expiery && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500">Expires:</span>
            <span
              className={`font-medium ${isExpiringSoon(item.date_of_expiery)
                  ? "text-red-600"
                  : "text-gray-700"
                }`}
            >
              {formatDate(item.date_of_expiery)}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Features column
  const renderFeatures = (item) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-20">IMEI:</span>
          {renderBadge(item.product_has_imei)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-20">Var. Price:</span>
          {item.different_price ? (
            <button
              onClick={() => setPriceDialogProduct(item)}
              className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 ring-1 ring-green-600/20 hover:bg-green-100 transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-green-500" />
              Yes
              <svg
                className="ml-1 h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          ) : (
            renderBadge(false)
          )}
        </div>
      </div>
    );
  };

  // Columns definition
  const columns = [
    {
      key: "info",
      header: "Product Details",
      filterable: true,
      render: (_, item) => renderProductInfo(item),
    },
    {
      key: "inventory",
      header: "Inventory",
      filterable: false,
      render: (_, item) => renderInventory(item),
    },
    {
      key: "exp_ability",
      header: "Expiration",
      filterable: true,
      render: (_, item) => renderExpiration(item),
    },
    {
      key: "features",
      header: "Features",
      filterable: false,
      render: (_, item) => renderFeatures(item),
    },

  ];

  if (loading) return <Loader />;
  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-600 font-medium">Error loading products</p>
      <p className="text-red-500 text-sm mt-1">{error}</p>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable
        data={products}
        columns={columns}
        title="Product Management"
        onAdd={() => alert("Add new product clicked!")}

        onEdit={(item) => { }} // DataTable handles navigation via editPath
        onDelete={(item) => setDeleteTarget(item)}
        addButtonText="Add Product"
        addPath="add"
        editPath={(item) => `edit/${item._id}`}
        itemsPerPage={10}
        searchable={true}
        filterable={true}
      />

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Variable Prices Dialog (REPLACED) */}
      {priceDialogProduct && (
        <VariablePricesDialog
          product={priceDialogProduct}
          onCancel={() => setPriceDialogProduct(null)}
        />
      )}
    </div>
  );
};

export default Product;