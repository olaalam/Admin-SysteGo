// src/pages/adminAdd.jsx (النسخة المعدلة)
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";

const AdminAdd = () => {
  const navigate = useNavigate();

  const [positions, setPositions] = useState([]);
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]); // لعرض الـ actions

  // جلب البيانات من الـ API وتعيين أول Position (لتحسين UX)
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await api.get("/api/admin/admin");
        const fetchedPositions = res.data?.data?.positions || [];
        setPositions(fetchedPositions);

        // ✅ تعيين أول Position كقيمة افتراضية
        if (fetchedPositions.length > 0) {
          setSelectedPositionId(fetchedPositions[0]._id);
        }
      } catch (err) {
        toast.error("Failed to fetch positions");
        console.error("Error fetching positions:", err);
      }
    };

    fetchPositions();
  }, []);

  // الحقول اللي هتظهر في الفورم
  const fields = useMemo(() => {
    const positionOptions = positions.map((position) => ({
      label: position.name,
      value: position._id,
    }));

    const selectedPosition = positions.find((p) => p._id === selectedPositionId);
    const roles = selectedPosition?.roles || [];

    const roleOptions = roles.map((role) => ({
      label: role.name,
      value: role._id,
      actions: role.actions,
    }));

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
        // ✅ ربط القيمة الحالية بالـ Select (مهم جداً)
        value: selectedPositionId,
        onChange: (value) => {
          setSelectedPositionId(value);
          setSelectedRoles([]); // Reset roles when position changes
        },
      },
      {
        key: "role",
        label: "Roles",
        type: "multiselect",
        required: true,
        options: roleOptions,
        onChange: (values) => {
          // يتم استدعاء هذا الـ onChange من داخل AddPage الآن
          const roleValues = Array.isArray(values) ? values : [values];
          const selected = roleOptions.filter((r) => roleValues.includes(r.value));
          setSelectedRoles(selected);
        },
      },
    ];
  }, [positions, selectedPositionId]);

  // عند الضغط على Submit
  const handleSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        // التأكد من استخدام القيمة الصحيحة للـ positionId
        positionId: data.positionId || selectedPositionId, 
        role: Array.isArray(data.role) ? data.role : [data.role],
      };

      await api.post("/api/admin/admin/", payload);
      toast.success("Admin added successfully! 🎉");
      navigate("/admin");
    } catch (err) {
      // ... (Error handling remains the same)
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add admin";

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  return (
    <div className="p-6">
      <AddPage
        // ✅ إضافة Key ديناميكي لإجبار المكون على إعادة الرسم وتحديث حقوله
        key={selectedPositionId}
        title="Add admin"
        description="Upload logo and fill in the details"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin")}
        initialData={{ positionId: selectedPositionId, status: true }}
      />

      {/* عرض الـ Actions بعد اختيار الـ Roles */}
      {selectedRoles.length > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded-md border">
          <h3 className="text-lg font-semibold mb-2">Role Actions:</h3>
          <ul className="list-disc pl-5">
            {selectedRoles.map((role) => (
              <li key={role.value}>
                <strong>{role.label}</strong>:{" "}
                {role.actions && role.actions.length > 0
                  ? role.actions.join(", ")
                  : "No actions"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminAdd;