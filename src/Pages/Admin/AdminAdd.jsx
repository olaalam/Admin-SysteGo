import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import usePost from "@/hooks/usePost";

const AdminAdd = () => {
  const navigate = useNavigate();

  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null); // This will hold the entire position object
  const [fetchingPositions, setFetchingPositions] = useState(true);

  const { postData, loading: submitting } = usePost("/api/admin/admin/");

  // 🟢 جلب بيانات الـ Positions
  useEffect(() => {
    const fetchPositions = async () => {
      setFetchingPositions(true);
      try {
        const res = await api.get("/api/admin/admin");
        const fetchedPositions = res.data?.data?.positions || [];
        setPositions(fetchedPositions);

        if (fetchedPositions.length > 0) {
          // 🟡 تحديد أول موقع كافتراضي
          setSelectedPosition(fetchedPositions[0]);
        }
      } catch (err) {
        toast.error("Failed to fetch positions");
        console.error("Error fetching positions:", err);
      } finally {
        setFetchingPositions(false);
      }
    };

    fetchPositions();
  }, []);

  // 🟡 الحقول التي ستظهر في الفورم
  const fields = useMemo(() => {
    if (fetchingPositions) {
      return [
        { key: "username", label: "Name", required: true, disabled: true },
        {
          key: "loading",
          label: "Loading Positions...",
          type: "text",
          disabled: true,
        },
      ];
    }

    // ⭐ التعديل رقم 1: استخدام الـ _id كـ value
    const positionOptions = positions.map((position) => ({
      label: position.name,
      value: position._id, // ⭐ تم التغيير من position.name إلى position._id
    }));

    const roleOptions = [
      { label: "Admin", value: "admin" },
      { label: "Super Admin", value: "superadmin" },
    ];

    return [
      { key: "username", label: "Name", required: true },
      { key: "email", label: "Email", required: true },
      { key: "company_name", label: "Company Name", required: true },
      { key: "password", label: "Password", type: "password", required: true },
      { key: "phone", label: "Phone", required: true },
      {
        key: "positionId",
        label: "Position",
        type: "select",
        required: true,
        options: positionOptions,
        // ⭐ عرض القيمة الافتراضية باستخدام الـ _id
        value: selectedPosition?._id || "",
        // ⭐ التعديل رقم 2: البحث عن الـ position باستخدام الـ id
        onChange: (value) => {
          // 'value' هنا هي الـ _id للموقع المختار
          const found = positions.find((p) => p._id === value);
          setSelectedPosition(found || null);
        },
      },
      {
        key: "role",
        label: "Role",
        type: "select",
        required: true,
        options: roleOptions,
      },
    ].filter((field) => field.key !== "loading");
  }, [positions, fetchingPositions]);

  // 🟣 عند الضغط على Submit
  const handleSubmit = async (data) => {
    try {
      // ⭐ التعديل رقم 3: التأكد من إرسال الـ _id للـ position
      const payload = {
        ...data,
        // نستخدم data.positionId مباشرة لأنه يحتوي على الـ _id الآن
        positionId: data.positionId || selectedPosition?._id,
        role: data.role,
      };

      await postData(payload);

      toast.success("Admin added successfully! 🎉");
      navigate("/admin");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add admin";

      toast.error(errorMessage);
      console.error("❌ Error:", err.response?.data);
    }
  };

  return (
    <div className="p-6">
      <AddPage
        key="admin-add"
        title="Add admin"
        description="Fill in the details for the new administrator."
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin")}
        loading={submitting || fetchingPositions}
        initialData={{
          // ⭐ القيمة الأولية يجب أن تكون الـ _id
          positionId: selectedPosition?._id || "",
          status: true,
        }}
      />
    </div>
  );
};

export default AdminAdd;
