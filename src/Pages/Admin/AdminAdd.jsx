// src/pages/adminAdd.jsx (النسخة النهائية والمحسّنة)
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
// ⭐️ افتراض: استخدام Hook مخصص للـ POST لتبسيط إدارة التحميل
import { usePost } from "@/hooks/usePost"; // افتراض وجود هذا الـ Hook

const AdminAdd = () => {
  const navigate = useNavigate();

  const [positions, setPositions] = useState([]);
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]); // لعرض الـ actions
  const [fetchingPositions, setFetchingPositions] = useState(true);

  // ⭐️ استخدام usePost بدلاً من إدارة setLoading يدوياً
  const { postData, loading: submitting } = usePost("/api/admin/admin/");

  // جلب بيانات الـ Positions
  useEffect(() => {
    const fetchPositions = async () => {
      setFetchingPositions(true);
      try {
        const res = await api.get("/api/admin/admin");
        // يجب الانتباه إلى أن الـ API قد يعيد البيانات في res.data.data
        const fetchedPositions = res.data?.data?.positions || []; 
        setPositions(fetchedPositions);

        // تعيين أول Position كقيمة افتراضية
        if (fetchedPositions.length > 0) {
          setSelectedPositionId(fetchedPositions[0]._id);
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

  // الحقول التي ستظهر في الفورم
  const fields = useMemo(() => {
    // إذا لم يتم جلب الـ Positions بعد، نعرض رسالة تحميل أو حقل معطل
    if (fetchingPositions) {
      return [
        { key: "username", label: "Name", required: true, disabled: true },
        // ... (باقي الحقول)
        { key: "loading", label: "Loading Positions...", type: "text", disabled: true },
      ];
    }
    
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
        // ربط القيمة الحالية بالـ Select (مهم جداً)
        value: selectedPositionId,
        onChange: (value) => {
          setSelectedPositionId(value);
          setSelectedRoles([]); // Reset roles when position changes
        },
      },
      {
        key: "role",
        label: "Roles",
        // إذا لم يكن هناك أدوار متاحة، عرض حقل نصي أو تعريفي
        type: roleOptions.length > 0 ? "multiselect" : "text",
        required: roleOptions.length > 0,
        options: roleOptions,
        onChange: (values) => {
          const roleValues = Array.isArray(values) ? values : [values].filter(Boolean);
          const selected = roleOptions.filter((r) => roleValues.includes(r.value));
          setSelectedRoles(selected);
        },
      },
    ].filter(field => field.key !== 'loading'); // التأكد من إزالة حقل التحميل بعد الانتهاء
  }, [positions, selectedPositionId, fetchingPositions]);

  // عند الضغط على Submit
  const handleSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        // التأكد من استخدام القيمة الصحيحة للـ positionId
        positionId: data.positionId || selectedPositionId, 
        // التأكد من أن حقل role موجود ومصفوفة، وإلا يتم تعيينه كمصفوفة فارغة لتجنب الأخطاء
        role: Array.isArray(data.role) ? data.role : (data.role ? [data.role] : []),
      };

      // ⭐️ استخدام Hook: postData هو المسؤول عن تعيين حالة التحميل
      await postData(payload); 
      
      toast.success("Admin added successfully! 🎉");
      navigate("/admin");
    } catch (err) {
      // ✅ عرض الأخطاء من الـ API (تم تبسيطها قليلاً)
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
        // إضافة Key ديناميكي لإجبار المكون على إعادة الرسم وتحديث حقوله
        key={selectedPositionId} 
        title="Add admin"
        description="Fill in the details for the new administrator."
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin")}
        // ⭐️ استخدام حالة التحميل من usePost
        loading={submitting || fetchingPositions} 
        // القيمة الافتراضية للـ positionId يجب أن تكون هي الـ selectedPositionId بعد الجلب
        initialData={{ 
            positionId: selectedPositionId, 
            status: true 
        }}
      />

      {/* عرض الـ Actions بعد اختيار الـ Roles */}
      {selectedRoles.length > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded-md border">
          <h3 className="text-lg font-semibold mb-2">Role Actions:</h3>
          <ul className="list-disc pl-5">
            {selectedRoles.map((role) => (
              <li key={role.value} className="mb-1 text-sm text-gray-700">
                <span className="font-medium text-bg-primary">{role.label}</span>:{" "}
                {role.actions && role.actions.length > 0
                  ? role.actions.join(", ")
                  : "No actions defined"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminAdd;