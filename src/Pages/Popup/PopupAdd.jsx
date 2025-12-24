import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import api from "@/api/api";
import { toast } from "react-toastify";
import AddPage from "@/components/AddPage";

export default function PopupAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fields = useMemo(
    () => [
      { key: "title_En", label: "Title (English)", required: true },
      { key: "title_ar", label: "Title (Arabic)", required: true },
      {
        key: "description_En",
        label: "Description (English)",
        type: "textarea",
        required: true,
      },
      {
        key: "description_ar",
        label: "Description (Arabic)",
        type: "textarea",
        required: true,
      },
      {
        key: "image",
        label: "Image ",
        type: "image",
        required: false,
      },

      {
        key: "link",
        label: "Redirect Link",
        placeholder: "https://example.com",
      },
    ],
    []
  );

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = { ...formData };



      await api.post("/api/admin/popup", payload);

      toast.success("Popup added successfully!");
      navigate("/popup");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Failed to add popup";

      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AddPage
        title="Add New Popup"
        description="Create a new popup with images and content"
        fields={fields}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/popup")}
        loading={loading}
      />
    </div>
  );
}
