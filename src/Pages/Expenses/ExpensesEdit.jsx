import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import usePost from "@/hooks/usePost";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function ExpensesEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const { putData, loading: updating } = usePut(
    isEdit ? `/api/admin/expenseAdmin/${id}` : null
  );
  const { postData, loading: creating } = usePost("/api/admin/expenseAdmin");

  const { data: selectionData, loading: loadingSelections } =
    useGet("/api/admin/expenseAdmin/selection");

  const [initialData, setInitialData] = useState(null);
  const [fetching, setFetching] = useState(isEdit);

  /* =========================
     Select Options
  ========================= */
  const categoryOptions =
    selectionData?.expensecategory?.map((cat) => ({
      label: `${cat.name} - ${cat.ar_name}`,
      value: cat._id,
    })) || [];

  const accountOptions =
    selectionData?.financial_account?.map((acc) => ({
      label: acc.name,
      value: acc._id,
    })) || [];

  /* =========================
     Form Fields
  ========================= */
  const fields = useMemo(
    () => [
      {
        key: "name",
        label: "Expense Name",
        type: "text",
        required: true,
        placeholder: "e.g. Robabicia",
      },
      {
        key: "amount",
        label: "Amount",
        type: "number",
        required: true,
        placeholder: "e.g. 500",
      },
      {
        key: "Category_id",
        label: "Category",
        type: "select",
        required: true,
        options: categoryOptions,
        placeholder: "Select category",
      },
      {
        key: "financial_accountId",
        label: "Financial Account",
        type: "select",
        required: true,
        options: accountOptions,
        placeholder: "Select account",
      },
      {
        key: "note",
        label: "Note",
        type: "textarea",
        required: false,
        placeholder: "Monthly payment",
      },
    ],
    [categoryOptions, accountOptions]
  );

  /* =========================
     Fetch Expense (Edit)
  ========================= */
  useEffect(() => {
    const fetchExpense = async () => {
      if (!isEdit) return;

      try {
        const res = await api.get(`/api/admin/expenseAdmin/${id}`);
        const expense = res.data?.data?.expense;

        if (!expense) {
          toast.error("expense not found");
          navigate("/expense");
          return;
        }

        setInitialData({
          name: expense.name || "",
          amount: expense.amount || "",
          Category_id: expense.Category_id?._id || "",
          financial_accountId: expense.financial_accountId?._id || "",
          note: expense.note || "",
        });
      } catch (err) {
        toast.error("Failed to load expense data",err);
        navigate("/expense");
      } finally {
        setFetching(false);
      }
    };

   fetchExpense();
  }, [id, isEdit, navigate]);

  /* =========================
     Submit
  ========================= */
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        amount: Number(formData.amount),
        Category_id: formData.Category_id,
        financial_accountId: formData.financial_accountId,
        note: formData.note,
      };

      if (isEdit) {
        await putData(payload);
        toast.success("expense updated successfully!");
      } else {
        await postData(payload);
        toast.success("expense added successfully!");
      }

      navigate("/expense");
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong";
      toast.error(message);
    }
  };

  const handleCancel = () => navigate("/expense");

  if (fetching || loadingSelections) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={isEdit ? "Edit expense" : "Add expense"}
        description="Fill expense details below"
        fields={fields}
        initialData={
          initialData || {
            name: "",
            amount: "",
            Category_id: "",
            financial_accountId: "",
            note: "",
          }
        }
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updating || creating}
        submitButtonText={isEdit ? "Update expense" : "Add expense"}
      />
    </div>
  );
}
