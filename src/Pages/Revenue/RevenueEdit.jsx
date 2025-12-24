import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import usePost from "@/hooks/usePost";
import useGet from "@/hooks/useGet";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function RevenueEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const { putData, loading: updating } = usePut(
    isEdit ? `/api/admin/revenue/${id}` : null
  );
  const { postData, loading: creating } = usePost("/api/admin/revenue");

  const { data: selectionData, loading: loadingSelections } =
    useGet("/api/admin/revenue/selection");

  const [initialData, setInitialData] = useState(null);
  const [fetching, setFetching] = useState(isEdit);

  /* =========================
     Select Options
  ========================= */
  const categoryOptions =
    selectionData?.categories?.map((cat) => ({
      label: `${cat.name} - ${cat.ar_name}`,
      value: cat._id,
    })) || [];

  const accountOptions =
    selectionData?.accounts?.map((acc) => ({
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
        label: "Revenue Name",
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
     Fetch Revenue (Edit)
  ========================= */
  useEffect(() => {
    const fetchRevenue = async () => {
      if (!isEdit) return;

      try {
        const res = await api.get(`/api/admin/revenue/${id}`);
        const revenue = res.data?.data?.revenue;

        if (!revenue) {
          toast.error("Revenue not found");
          navigate("/revenue");
          return;
        }

        setInitialData({
          name: revenue.name || "",
          amount: revenue.amount || "",
          Category_id: revenue.Category_id?._id || "",
          financial_accountId: revenue.financial_accountId?._id || "",
          note: revenue.note || "",
        });
      } catch (err) {
        toast.error("Failed to load revenue data",err);
        navigate("/revenue");
      } finally {
        setFetching(false);
      }
    };

    fetchRevenue();
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
        toast.success("Revenue updated successfully!");
      } else {
        await postData(payload);
        toast.success("Revenue added successfully!");
      }

      navigate("/revenue");
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong";
      toast.error(message);
    }
  };

  const handleCancel = () => navigate("/revenue");

  if (fetching || loadingSelections) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title={isEdit ? "Edit Revenue" : "Add Revenue"}
        description="Fill revenue details below"
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
        submitButtonText={isEdit ? "Update Revenue" : "Add Revenue"}
      />
    </div>
  );
}
