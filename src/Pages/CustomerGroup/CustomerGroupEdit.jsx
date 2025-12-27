import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function CustomerGroupEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(
    `/api/admin/customer/groups/${id}`
  );

  const [groupData, setGroupData] = useState(null);
  const [fetching, setFetching] = useState(true);

  // ✅ الحقول الخاصة بالـ customer group
  const fields = useMemo(
    () => [
      {
        key: "name",
        label: "Group Name",
        required: true,
      },
      {
        key: "status",
        label: "Status",
        type: "switch",
        required: true,
      },
    ],
    []
  );

  // ✅ جلب بيانات الجروب
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setFetching(true);

        const res = await api.get(
          `/api/admin/customer/groups/${id}`
        );

        const group = res.data?.data?.group;

        if (!group) {
          toast.error("Customer group not found");
          navigate("/customer-group");
          return;
        }

        setGroupData({
          name: group.name || "",
          status: Boolean(group.status),
        });
      } catch (err) {
        toast.error("Failed to fetch customer group");
        console.error("❌ Error:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchGroup();
  }, [id, navigate]);

  // ✅ إرسال نفس الـ body اللي طلبتيه
  const handleSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        status: Boolean(formData.status),
      };

      await putData(payload);

      toast.success("Customer group updated successfully 🎉");
      navigate("/customer-group");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to update customer group";
      toast.error(msg);
      console.error("❌ Error:", err.response?.data);
    }
  };

  const handleCancel = () => navigate("/customer-group");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {groupData && (
        <AddPage
          title={`Edit Group: ${groupData.name}`}
          description="Update customer group details"
          fields={fields}
          initialData={groupData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}
