// src/pages/BankAccountEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function BankAccountEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(
    `/api/admin/bank_account/${id}`
  );

  const [bankAccountData, setBankAccountData] = useState(null);
  const [fetching, setFetching] = useState(true);

  // ✅ الـ fields بتطابق الداتا اللي في الجدول
  const fields = useMemo(() => [
    { 
      key: "account_no", 
      label: "Account Number", 
      type: "text",
      required: true 
    },
    { 
      key: "name", 
      label: "Bank Name", 
      type: "text",
      required: true 
    },
    { 
      key: "initial_balance", 
      label: "Initial Balance", 
      type: "number",
      required: true 
    },
    { 
      key: "is_default", 
      label: "Set as Default Account", 
      type: "checkbox",
      required: false 
    },
    { 
      key: "note", 
      label: "Note", 
      type: "textarea",
      required: false 
    },
  ], []);

  useEffect(() => {
    const fetchBankAccount = async () => {
      try {
        const res = await api.get(`/api/admin/bank_account/${id}`);
        
        console.log("🔍 Full API Response:", res.data);
        
        // ✅ استخراج الداتا من الـ response
        const bankAccount = 
          res.data.data?.account || 
          res.data.bank_account || 
          res.data.data || 
          res.data;
        
        console.log("🎯 Extracted bank account:", bankAccount);
        
        setBankAccountData({
          account_no: bankAccount.account_no || "",
          name: bankAccount.name || "",
          initial_balance: bankAccount.initial_balance || 0,
          is_default: bankAccount.is_default || false,
          note: bankAccount.note || "",
        });
      } catch (err) {
        toast.error("Failed to load bank account data");
        console.error("❌ Error fetching bank account:", err);
        navigate("/accounting");
      } finally {
        setFetching(false);
      }
    };

    fetchBankAccount();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      console.log("📤 Submitting data:", formData);
      
      await putData(formData);
      
      toast.success("Bank account updated successfully!");
      navigate("/accounting");
    } catch (err) {
      console.error("❌ Error updating bank account:", err);
      
      // ✅ عرض الأخطاء من الـ API
      const errorMessage = 
        err.response?.data?.error?.message || 
        err.response?.data?.message || 
        "Failed to update bank account";
      
      const errorDetails = err.response?.data?.error?.details;
      
      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach(detail => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleCancel = () => navigate("/accounting");

  if (fetching) {
    return <Loader />;
  }

  if (!bankAccountData) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-red-600">Bank account data not found</p>
          <button
            onClick={() => navigate("/accounting")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-teal-700"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={`Edit Bank Account: ${bankAccountData?.name || "..."}`}
        description="Update bank account details"
        fields={fields}
        initialData={bankAccountData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updating}
      />
    </div>
  );
}