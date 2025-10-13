// src/pages/SupplierAdd.jsx (النسخة النهائية باستخدام usePost)
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddPage from "@/components/AddPage";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
// ⭐️ استيراد الـ Hook المخصص
import usePost from "@/hooks/usePost"; 

const SupplierAdd = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [fetchingLists, setFetchingLists] = useState(true); // ⭐️ تم تغيير الاسم ليكون أوضح

  // ⭐️ استخدام usePost: تحديد المسار وجلب postData وحالة التحميل loading
  const { postData, loading: submitting } = usePost("/api/admin/supplier/");

  // ✅ تحديد الحقول باستخدام useMemo وربط المدن والدول كـ select
  const fields = useMemo(() => [
    { key: "username", label: "Username", required: true },
    { key: "company_name", label: "Company Name", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone_number", label: "Phone Number", required: true },
    { key: "address", label: "Address", required: true },
    {
      key: "cityId",
      label: "City",
      type: "select",
      required: true,
      options: cities.map((city) => ({
        value: city._id,
        label: city.name,
      })),
      // ⭐️ تعطيل الحقل إذا كنا نحمل القوائم
      disabled: fetchingLists, 
      placeholder: fetchingLists ? "Loading cities..." : "Select city",
    },
    {
      key: "countryId",
      label: "Country",
      type: "select",
      required: true,
      options: countries.map((country) => ({
        value: country._id,
        label: country.name,
      })),
      // ⭐️ تعطيل الحقل إذا كنا نحمل القوائم
      disabled: fetchingLists,
      placeholder: fetchingLists ? "Loading countries..." : "Select country",
    },
    { key: "image", label: "Image", type: "image", required: true },
  ], [cities, countries, fetchingLists]); // ⭐️ إضافة fetchingLists كـ dependency

  // ✅ جلب المدن والدول عند التحميل
  useEffect(() => {
    const fetchLists = async () => {
      setFetchingLists(true);
      try {
        const res = await api.get("/api/admin/supplier"); 
        const citiesList = res.data?.data?.city || [];
        const countriesList = res.data?.data?.country || [];

        setCities(citiesList);
        setCountries(countriesList);
      } catch (err) {
        toast.error("Failed to load city and country lists");
        console.error("❌ Error loading cities/countries:", err);
      } finally {
        setFetchingLists(false);
      }
    };

    fetchLists();
  }, []);

  // ✅ إرسال البيانات
  const handleSubmit = async (data) => {
    try {
      // ⭐️ استخدام postData بدلاً من api.post
      await postData(data); 
      
      toast.success("Supplier added successfully! 🎉");
      navigate("/supplier");
    } catch (err) {
      // ✅ التعامل مع الأخطاء التفصيلية (مطابقة لـ AdminAdd.jsx)
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to add supplier";

      const errorDetails = err.response?.data?.error?.details;

      if (errorDetails && Array.isArray(errorDetails)) {
        errorDetails.forEach((detail) => toast.error(detail));
      } else {
        toast.error(errorMessage);
      }

      console.error("❌ Error:", err.response?.data);
    }
  };

  // ⭐️ عرض Loader أثناء جلب قوائم المدن والدول
  if (fetchingLists) return <Loader />;

  return (
    <div className="p-6">
      <AddPage
        title="Add Supplier"
        description="Fill in the supplier information and upload image"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/supplier")}
        // ⭐️ دمج حالة التحميل: الإرسال (submitting)
        loading={submitting} 
        initialData={{}}
      />
    </div>
  );
};

export default SupplierAdd;