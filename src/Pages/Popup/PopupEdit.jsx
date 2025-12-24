import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import usePut from "@/hooks/usePut";
import api from "@/api/api";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import AddPage from "@/components/AddPage";

export default function PopupEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { putData, loading: updating } = usePut(
    `/api/admin/popup/${id}`
  );

  const [popupData, setPopupData] = useState(null);
  const [fetching, setFetching] = useState(true);

  // ✅ fields متوافقة مع الـ body
  const fields = useMemo(
    () => [
      {
        key: "title_En",
        label: "Title (English)",
        required: true,
      },
      {
        key: "title_ar",
        label: "Title (Arabic)",
        required: true,
      },
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
        type: "text",
        required: false,
        placeholder: "https://example.com",
      },
    ],
    []
  );

  useEffect(() => {
    const fetchPopup = async () => {
      try {
        const res = await api.get(`/api/admin/popup/${id}`);

        // حسب response المعتاد
        const popup = res.data?.data?.popup;

        setPopupData({
          title_En: popup?.title_En || "",
          title_ar: popup?.title_ar || "",
          description_En: popup?.description_En || "",
          description_ar: popup?.description_ar || "",
          image: popup?.image || "",

          link: popup?.link || "",
        });
      } catch (err) {
        toast.error("Failed to fetch popup data");
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchPopup();
  }, [id]);

const handleSubmit = async (formData) => {
  try {
    const payload = { ...formData };

    // ✅ لو image URL قديم → ما نبعتهوش
    if (
      typeof payload.image === "string" &&
      payload.image === popupData.image
    ) {
      delete payload.image;
    }


    await putData(payload);

    toast.success("Popup updated successfully!");
    navigate("/popup");
  } catch (err) {
    const errorMessage =
      err.response?.data?.message ||
      err.response?.data?.error?.message ||
      "Failed to update popup";

    toast.error(errorMessage);
    console.error(err);
  }
};


  const handleCancel = () => navigate("/popup");

  if (fetching) return <Loader />;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {popupData && (
        <AddPage
          title={`Edit Popup: ${popupData.title_En}`}
          description="Update popup content and images"
          fields={fields}
          initialData={popupData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updating}
        />
      )}
    </div>
  );
}
