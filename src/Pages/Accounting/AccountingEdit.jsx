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

  const { putData, loading: updating } = usePut(`/api/admin/bank_account/${id}`);

  const [bankAccountData, setBankAccountData] = useState(null);
  const [fetching, setFetching] = useState(true);

  // ✅ الـ fields مطابقة تمامًا للداتا الجديدة
  const fields = useMemo(
    () => [
      {
        key: "name",
        label: "Bank Name",
        type: "text",
        required: true,
        placeholder: "Enter bank name",
      },
      {
        key: "warehouseId",
        label: "Warehouse",
        type: "select", // أو "combobox" لو عندك دعم لـ multi أو search
        required: true,
        placeholder: "Select warehouse",
        // مهم: لو الـ AddPage بيدعم options، هنجيبهم من API منفصل لو عايزة
        // أو هنعتمد إنه بياخد value كـ string (الـ _id)
      },
      {
        key: "balance",
        label: "Initial Balance",
        type: "number",
        required: true,
        placeholder: "0",
        min: 0,
        step: "0.01",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        required: false,
        placeholder: "Account description (optional)",
        rows: 4,
      },
      {
        key: "image",
        label: "Account Image",
        type: "image",
        required: false,
        // لو الـ AddPage بيدعم preview، هيعرض الصورة القديمة
      },
      {
        key: "status",
        label: "Active Status",
        type: "switch",
        required: false,
      },
      {
        key: "in_POS",
        label: "Available in POS",
        type: "switch",
        required: false,
      },
    ],
    []
  );

  useEffect(() => {
    const fetchBankAccount = async () => {
      try {
        const res = await api.get(`/api/admin/bank_account/${id}`);
        console.log("🔍 Full API Response:", res.data);

        // ✅ استخراج الـ bankAccount من الـ response الصحيح
        const bankAccount = res.data?.data?.bankAccount;

        if (!bankAccount) {
          toast.error("Bank account not found in response");
          navigate("/accounting");
          return;
        }

        console.log("🎯 Extracted bank account:", bankAccount);

        // ✅ تحويل الداتا للشكل اللي AddPage يفهمه
        setBankAccountData({
          name: bankAccount.name || "",
          // warehouseId جاي كـ array، هناخد أول واحد (عادةً واحد بس)
          // ونحط الـ _id بس كـ value (لأن الـ select غالبًا بياخد string)
          warehouseId:
            bankAccount.warehouseId && bankAccount.warehouseId.length > 0
              ? bankAccount.warehouseId[0]._id
              : "",
          balance: bankAccount.balance || 0,
          description: bankAccount.description || "",
          image: bankAccount.image || null, // لو مفيش صورة → null
          status: bankAccount.status || false,
          in_POS: bankAccount.in_POS || false,
        });
      } catch (err) {
        console.error("❌ Error fetching bank account:", err);
        toast.error("Failed to load bank account data");
        navigate("/accounting");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchBankAccount();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      console.log("📤 Submitting updated data:", formData);

      // ✅ إرسال الداتا كـ FormData لو في image، أو JSON عادي
      await putData(formData);

      toast.success("Bank account updated successfully!");
      navigate("/accounting");
    } catch (err) {
      console.error("❌ Error updating bank account:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Failed to update bank account";

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
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
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-600 text-lg">Bank account not found</p>
          <button
            onClick={() => navigate("/accounting")}
            className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-teal-700 transition"
          >
            Back to Bank Accounts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={`Edit Bank Account: ${bankAccountData.name}`}
        description="Update the details of this bank account"
        fields={fields}
        initialData={bankAccountData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updating}
        submitButtonText="Update Account"
      />
    </div>
  );
}