// src/pages/barcode.jsx
import { useParams } from "react-router-dom";
import Loader from "@/components/Loader";
import useGet from "@/hooks/useGet";
import DataTable from "@/components/DataTable";

const Barcode = () => {
  const { productId } = useParams();

  // ✅ استدعاء بيانات الباركود بناءً على الـ productId
  const { data, loading, error } = useGet(
    `/api/admin/product/generate-barcode/${productId}`
  );

  // البيانات الراجعة من الـ API
  const barcodes = data?.barcodes || [];

  // ✅ دالة مساعدة لعرض الصورة
  const renderBarcode = (url) => {
    if (!url) return <span className="text-gray-400">No Barcode</span>;
    return (
      <img
        src={url}
        alt="Barcode"
        className="h-20 w-auto object-contain border rounded"
      />
    );
  };

  // ✅ الأعمدة
  const columns = [
    { key: "productName", header: "Product Name" },
    {
      key: "barcodeImage",
      header: "Barcode",
      render: (value) => renderBarcode(value),
    },
    { key: "barcodeNumber", header: "Barcode Number" },
  ];

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 text-red-600 m-auto text-center">{error}</div>
    );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <DataTable
        data={barcodes}
        columns={columns}
        title="Product Barcodes"
        // 🔸 حذف كل الأكشنز (add/edit/delete)
        itemsPerPage={10}
        searchable={false}
        filterable={false}
        hideActions={true} // لو الـ DataTable عندك بيدعم prop دي
      />
    </div>
  );
};

export default Barcode;
