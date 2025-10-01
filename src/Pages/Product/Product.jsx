// src/pages/products.jsx
import { useState } from "react";
import DataTable from "@/components/DataTable";
import Loader from "@/components/Loader";
import DeleteDialog from "@/components/DeleteForm";
import useGet from "@/hooks/useGet";
import useDelete from "@/hooks/useDelete";

const Product = () => {
  const { data, loading, error, refetch } = useGet("/api/admin/product");
  const { deleteData, loading: deleting } = useDelete(
    "/api/admin/product/delete"
  );

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [priceDialogProduct, setPriceDialogProduct] = useState(null);

  const products = data || [];

  const handleDelete = async (item) => {
    try {
      await deleteData(`/api/admin/product/${item._id}`);
      refetch();
    } finally {
      setDeleteTarget(null);
    }
  };

  // ✅ صورة + تفاصيل المنتج - تصميم محسّن
  const renderProductInfo = (item) => {
    return (
      <div className="flex items-start gap-4 py-2">
        {/* الصورة مع border وظل */}
        <div className="relative flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
          />
          {/* Stock indicator */}
          {item.quantity < 10 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              Low
            </span>
          )}
        </div>

        {/* المعلومات الأساسية */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base mb-2 truncate">
            {item.name}
          </h3>
          
          {/* Grid للمعلومات */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Category:</span>
              <span className="font-medium text-gray-700">
                {item.categoryId?.[0]?.name || "—"}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Brand:</span>
              <span className="font-medium text-gray-700">
                {item.brandId?.name || "—"}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Unit:</span>
              <span className="font-medium text-gray-700">{item.unit}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Stock:</span>
              <span className={`font-semibold ${
                item.quantity < 10 ? 'text-red-600' : 
                item.quantity < 50 ? 'text-orange-600' : 
                'text-green-600'
              }`}>
                {item.quantity}
              </span>
            </div>
          </div>

          {/* السعر */}
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary">
              {item.price} EGP
            </span>
            <span className="text-xs text-gray-500">/ {item.unit}</span>
          </div>

          {/* الوصف */}
          {item.description && (
            <p className="mt-2 text-xs text-gray-600 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  // ✅ Badge محسّن
  const renderBadge = (value, label) => (
    <div className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full ${
          value
            ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
            : "bg-gray-50 text-gray-600 ring-1 ring-gray-300/50"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
            value ? "bg-green-500" : "bg-gray-400"
          }`}
        />
        {value ? "true" : "false"}
      </span>
    </div>
  );

  // ✅ عرض تاريخ الانتهاء
  const renderExpiration = (item) => {
    if (!item.exp_ability) {
      return renderBadge(false, "N/A");
    }

    const isExpiringSoon = item.exp_date && 
      new Date(item.exp_date) - new Date() < 30 * 24 * 60 * 60 * 1000; // 30 days

    return (
      <div className="space-y-1">
        {renderBadge(true)}
        {item.exp_date && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500">Expires:</span>
            <span className={`font-medium ${
              isExpiringSoon ? 'text-red-600' : 'text-gray-700'
            }`}>
              {new Date(item.exp_date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    );
  };

  // ✅ Badge للأسعار المختلفة مع إمكانية الضغط
  const renderVariablePriceBadge = (value, item) => {
    if (!value) {
      return renderBadge(false);
    }

    return (
      <button
        onClick={() => setPriceDialogProduct(item)}
        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-green-50 text-green-700 ring-1 ring-green-600/20 hover:bg-green-100 hover:ring-green-600/40 transition-all cursor-pointer"
      >
        <span className="h-1.5 w-1.5 rounded-full mr-1.5 bg-green-500" />
        true
        <svg 
          className="ml-1.5 h-3.5 w-3.5" 
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
    );
  };

  // ✅ الأعمدة
  const columns = [
    {
      key: "info",
      header: "Product Details",
      filterable: true,
      render: (_, item) => renderProductInfo(item),
    },
    {
      key: "exp_ability",
      header: "Expiration",
      filterable: true,
      render: (_, item) => renderExpiration(item),
    },
    {
      key: "minimum_quantity_sale",
      header: "Min Qty Sale",
      filterable: true,
      render: (val) => (
        <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
          {val || "1"}
        </span>
      ),
    },
    {
      key: "product_has_imei",
      header: "IMEI",
      filterable: true,
      render: (val) => renderBadge(val),
    },
    {
      key: "different_price",
      header: "Variable Price",
      filterable: true,
      render: (val, item) => renderVariablePriceBadge(val, item),
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
        onEdit={(item) => alert(`Edit product: ${item.name}`)}
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
          message={`Are you sure you want to delete product "${deleteTarget.name}"?`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Variable Prices Dialog */}
      {priceDialogProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-teal-700 px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    Variable Prices
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">
                    {priceDialogProduct.name}
                  </p>
                </div>
                <button
                  onClick={() => setPriceDialogProduct(null)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {priceDialogProduct.different_prices && 
               priceDialogProduct.different_prices.length > 0 ? (
                <div className="space-y-3">
                  {priceDialogProduct.different_prices.map((priceItem, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {priceItem.name || `Price Tier ${idx + 1}`}
                        </p>
                        {priceItem.min_quantity && (
                          <p className="text-xs text-gray-500 mt-1">
                            Min Qty: {priceItem.min_quantity}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {priceItem.price} EGP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No variable prices available</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setPriceDialogProduct(null)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-teal-800 transition-colors font-medium"
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

export default Product;