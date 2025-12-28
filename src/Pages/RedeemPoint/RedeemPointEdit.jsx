// src/pages/RedeemPointEdit.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function RedeemPointEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(`/api/admin/redeem-points/${id}`);
  const [pointData, setPointData] = useState(null);
  const [fetching, setFetching] = useState(true);

  /* =======================
     Fields
  ======================= */
  const fields = useMemo(
    () => [
      {
        key: "amount",
        label: "Amount",
        type: "number",
        required: true,
        min: 0,
        placeholder: "e.g. 30",
      },
      {
        key: "points",
        label: "Points",
        type: "number",
        required: true,
        min: 0,
        placeholder: "e.g. 30",
      },
    ],
    []
  );

  /* =======================
     Fetch Point
  ======================= */
  useEffect(() => {
    const fetchPoint = async () => {
      if (!id) return;

      try {
        const res = await api.get(`/api/admin/redeem-points/${id}`);
        console.log("🔍 RedeemPoint Response:", res.data);

        const point =
          res.data?.data?.point ||
          res.data?.data ||
          res.data?.point;

        if (!point) {
          toast.error("RedeemPoint not found");
          navigate("/redeem-point");
          return;
        }

        setPointData({
          amount: Number(point.amount) || 0,
          points: Number(point.points) || 0,
        });
      } catch (err) {
        console.error("❌ Error fetching redeem point:", err);
        toast.error("Failed to load redeem point data");
        navigate("/redeem-point");
      } finally {
        setFetching(false);
      }
    };

    fetchPoint();
  }, [id, navigate]);

  /* =======================
     Submit
  ======================= */
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        amount: Number(formData.amount),
        points: Number(formData.points),
      };

      await putData(payload);

      toast.success("RedeemPoint updated successfully!");
      navigate("/redeem-point");
    } catch (err) {
      console.error("❌ Update error:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Failed to update redeem point";

      toast.error(errorMessage);
    }
  };

  const handleCancel = () => navigate("/redeem-point");

  if (fetching) return <Loader />;

  if (!pointData) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-center">
        <p className="text-red-600 text-lg">RedeemPoint not found</p>
        <button
          onClick={() => navigate("/redeem-point")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
        >
          Back to RedeemPoints
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title="Edit RedeemPoint"
        description="Update redeem point details"
        fields={fields}
        initialData={pointData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={updating}
        submitButtonText="Update RedeemPoint"
      />
    </div>
  );
}
