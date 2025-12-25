// src/pages/BankAccountEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";
import useGet from "@/hooks/useGet";

export default function BankAccountEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(
    `/api/admin/bank_account/${id}`
  );

  const [bankAccountData, setBankAccountData] = useState(null);
  const [fetching, setFetching] = useState(true);

  // =============================
  // GET: Warehouses
  // =============================
  const {
    data: warehouseData,
    loading: loadingWarehouses,
    error: warehouseError,
  } = useGet("/api/admin/bank_account/select-warehouses");

  const warehouses =
    warehouseData?.warehouses?.map((w) => ({
      label: w.name,
      value: w._id,
    })) || [];

  // =============================
  // Form fields
  // =============================
  const fields = useMemo(
    () => [
      {
        key: "name",
        label: "Bank Name",
        type: "text",
        required: true,
      },
      {
        key: "warehouseId",
        label: "Warehouse",
        type: "select",
        required: true,
        options: warehouses,
      },
      {
        key: "balance",
        label: "Initial Balance",
        type: "number",
        required: true,
        min: 0,
        step: "0.01",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
      },
      {
        key: "image",
        label: "Account Image",
        type: "image",
      },
      {
        key: "status",
        label: "Active Status",
        type: "switch",
      },
      {
        key: "in_POS",
        label: "Available in POS",
        type: "switch",
      },
    ],
    [warehouses]
  );

  // =============================
  // Fetch bank account data
  // =============================
  useEffect(() => {
    const fetchBankAccount = async () => {
      try {
        const res = await api.get(`/api/admin/bank_account/${id}`);
        const bankAccount = res.data?.data?.bankAccount;

        if (!bankAccount) {
          toast.error("Bank account not found");
          navigate("/accounting");
          return;
        }

        setBankAccountData({
          name: bankAccount.name || "",
warehouseId: Array.isArray(bankAccount.warehouseId)
  ? bankAccount.warehouseId.map((w) => w._id)
  : bankAccount.warehouseId?._id
  ? [bankAccount.warehouseId._id]
  : [],
          balance: bankAccount.balance || 0,
          description: bankAccount.description || "",
          image: bankAccount.image || null,
          status: Boolean(bankAccount.status),
          in_POS: Boolean(bankAccount.in_POS),
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load bank account data");
        navigate("/accounting");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchBankAccount();
  }, [id, navigate]);

  // =============================
  // Submit
  // =============================
const handleSubmit = async (formData) => {
  try {
    // 1️⃣ جهزي الـ payload الأول
    const payload = {
      ...formData,
      warehouseId: Array.isArray(formData.warehouseId)
        ? formData.warehouseId
        : [formData.warehouseId], // backend requirement
    };

    // 2️⃣ لو الصورة URL قديمة → ما نبعتهوش
    if (
      typeof payload.image === "string" &&
      payload.image === bankAccountData?.image
    ) {
      delete payload.image;
    }

    console.log("📤 Updating payload:", payload);

    await putData(payload);

    toast.success("Bank account updated successfully!");
    navigate("/accounting");
  } catch (err) {
    console.error(err);

    const errorMessage =
      err.response?.data?.message ||
      err.response?.data?.error?.message ||
      "Failed to update bank account";

    toast.error(errorMessage);
  }
};


  const handleCancel = () => navigate("/accounting");

  // =============================
  // Loading & Error states
  // =============================
  if (fetching || loadingWarehouses) return <Loader />;

  if (warehouseError) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load warehouses
      </div>
    );
  }

  // =============================
  // Render
  // =============================
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
