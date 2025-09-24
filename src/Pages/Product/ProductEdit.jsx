// ClientEdit.jsx
import AddPackage from "@/components/AddPage";
import { useParams } from "react-router-dom";

const ClientEdit = () => {
  const { id } = useParams();

  // مثال بيانات مبدئية (ممكن تجيبيها من API)
  const packageData = {
    name: "Premium",
    monthlyFee: "99.99",
    yearlyFee: "999.99",
    isFree: false,
    isFreeTrial: true,
    warehouses: 5,
    products: 500,
    invoices: 200,
    userAccounts: 10,
    employees: 50,
    selectedFeatures: {
      productCategories: true,
      purchaseSale: true,
      expense: true,
    },
  };

  const handleSubmit = (formData) => {
    console.log(`Package ${id} updated:`, formData);
    alert("Package updated successfully!");
  };

  const handleCancel = () => {
    alert("Edit cancelled");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPackage
        title={`Edit Package #${id}`}
        initialData={packageData} // ✅ بيانات موجودة مسبقاً
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ClientEdit;
