"use client";

import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

interface Caricature {
  caricatureId: string;
  caricatureTitle: string;
  caricatureContent: string;
  imagePath?: string;
  isPublished: boolean;
  createdDate: string;
  updatedDate: string;
}

interface FormState {
  caricatureTitle: string;
  caricatureContent: string;
  imagePath: string;
  isPublished: boolean;
}

const initialFormState: FormState = {
  caricatureTitle: "",
  caricatureContent: "",
  imagePath: "",
  isPublished: true,
};

export default function CaricaturesPage() {
  const [caricatures, setCaricatures] = useState<Caricature[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch caricatures
  const fetchCaricatures = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/backend/Caricatures", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCaricatures(
          data.sort(
            (a: Caricature, b: Caricature) =>
              new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()
          )
        );
      } else {
        throw new Error("Failed to fetch caricatures");
      }
    } catch (error) {
      toast.error("فشل في تحميل الكاريكاتير");
      console.error("Error fetching caricatures:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaricatures();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormState({
      ...formState,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.caricatureTitle) {
      toast.error("يرجى ملء العنوان");
      return;
    }

    try {
      const url = editingId
        ? `/api/backend/Caricatures/${editingId}`
        : "/api/backend/Caricatures";

      const method = editingId ? "PUT" : "POST";
      const submitFormData = new FormData();
      submitFormData.append("caricatureTitle", formState.caricatureTitle);
      submitFormData.append("caricatureContent", formState.caricatureContent || "");
      submitFormData.append("isPublished", String(formState.isPublished));
      submitFormData.append("imagePath", formState.imagePath || "");
      if (imageFile) {
        submitFormData.append("Image", imageFile, imageFile.name);
      }

      const res = await fetch(url, {
        method,
        body: submitFormData,
      });

      if (res.ok) {
        toast.success(
          editingId ? "تم تحديث الكاريكاتير بنجاح" : "تمت إضافة كاريكاتير جديد"
        );
        setFormState(initialFormState);
        setImageFile(null);
        setEditingId(null);
        setShowForm(false);
        await fetchCaricatures();
      } else {
        const errorBody = await res.text().catch(() => "");
        throw new Error(errorBody || "Failed to save caricature");
      }
    } catch (error) {
      toast.error("فشل في حفظ الكاريكاتير");
      console.error("Error saving caricature:", error);
    }
  };

  const handleEdit = (caricature: Caricature) => {
    setFormState({
      caricatureTitle: caricature.caricatureTitle,
      caricatureContent: caricature.caricatureContent || "",
      imagePath: caricature.imagePath || "",
      isPublished: caricature.isPublished,
    });
    setEditingId(caricature.caricatureId);
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل تريد حذف هذا الكاريكاتير؟")) {
      try {
        const res = await fetch(`/api/backend/Caricatures/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success("تم حذف الكاريكاتير بنجاح");
          await fetchCaricatures();
        } else {
          throw new Error("Failed to delete");
        }
      } catch (error) {
        toast.error("فشل في حذف الكاريكاتير");
        console.error("Error deleting caricature:", error);
      }
    }
  };

  const closeForm = () => {
    setFormState(initialFormState);
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto" dir="rtl">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">كاريكاتير</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            إضافة جديد
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "تعديل الكاريكاتير" : "إضافة كاريكاتير جديد"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                العنوان *
              </label>
              <input
                type="text"
                name="caricatureTitle"
                value={formState.caricatureTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="أدخل العنوان"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الوصف
              </label>
              <textarea
                name="caricatureContent"
                value={formState.caricatureContent}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="أدخل الوصف"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الصورة
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                title="اختر صورة"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              {formState.imagePath && !imageFile && (
                <p className="text-sm text-gray-600 mt-2">الصورة الحالية: {formState.imagePath}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formState.isPublished}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-600"
                title="منشور"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                منشور
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                {editingId ? "حفظ التغييرات" : "إضافة"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {caricatures.map((caricature) => (
          <div key={caricature.caricatureId} className="bg-white rounded-lg shadow-md overflow-hidden">
            {caricature.imagePath && (
              <img
                src={caricature.imagePath}
                alt={caricature.caricatureTitle}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {caricature.caricatureTitle}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {caricature.caricatureContent}
              </p>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    caricature.isPublished
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {caricature.isPublished ? "منشور" : "مسودة"}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-4">
                {new Date(caricature.updatedDate).toLocaleDateString("ar-EG")}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(caricature)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                >
                  <PencilIcon className="w-4 h-4" />
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(caricature.caricatureId)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                >
                  <TrashIcon className="w-4 h-4" />
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {caricatures.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">لا توجد كاريكاتسيرات حتى الآن</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            إضافة أول كاريكاتير
          </button>
        </div>
      )}
    </div>
  );
}
