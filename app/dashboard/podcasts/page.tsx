"use client";

import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { getCategories } from "../articles/lib/api";

interface Podcast {
  podcastId: number;
  podcastTitle: string;
  podcastSummary: string;
  podcastLink: string;
  imagePath?: string;
  isPublished: boolean;
  createdDate: string;
  updatedDate: string;
  categoryId: number;
}

interface FormState {
  podcastTitle: string;
  podcastSummary: string;
  podcastLink: string;
  imagePath: string;
  isPublished: boolean;
  categoryId: number;
}

const initialFormState: FormState = {
  podcastTitle: "",
  podcastSummary: "",
  podcastLink: "",
  imagePath: "",
  isPublished: true,
  categoryId: 0,
};

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        const mapped = data.map((category) => ({ id: category.id, name: category.name }));
        setCategories(mapped);
        if (mapped.length > 0) {
          setFormState((prev) => {
            const exists = mapped.some((c) => c.id === prev.categoryId);
            return exists ? prev : { ...prev, categoryId: mapped[0].id };
          });
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch podcasts
  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/backend/Podcasts", { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPodcasts(data.sort((a: Podcast, b: Podcast) => 
          new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()
        ));
      } else {
        throw new Error("Failed to fetch podcasts");
      }
    } catch (error) {
      toast.error("فشل في تحميل البودكاست");
      console.error("Error fetching podcasts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormState({
      ...formState,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : name === "categoryId"
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.podcastTitle || !formState.podcastSummary) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (!formState.categoryId || formState.categoryId <= 0) {
      toast.error("يرجى اختيار تصنيف صحيح");
      return;
    }

    try {
      const url = editingId 
        ? `/api/backend/Podcasts/${editingId}`
        : "/api/backend/Podcasts";
      
      const method = editingId ? "PUT" : "POST";
      const submitFormData = new FormData();
      submitFormData.append("podcastTitle", formState.podcastTitle);
      submitFormData.append("podcastSummary", formState.podcastSummary);
      submitFormData.append("podcastLink", formState.podcastLink || "");
      submitFormData.append("categoryId", String(formState.categoryId));
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
        toast.success(editingId ? "تم تحديث البودكاست بنجاح" : "تمت إضافة بودكاست جديد");
        setFormState((prev) => ({ ...initialFormState, categoryId: prev.categoryId }));
        setImageFile(null);
        setEditingId(null);
        setShowForm(false);
        await fetchPodcasts();
      } else {
        const errorBody = await res.text().catch(() => "");
        throw new Error(errorBody || "Failed to save podcast");
      }
    } catch (error) {
      toast.error("فشل في حفظ البودكاست");
      console.error("Error saving podcast:", error);
    }
  };

  const handleEdit = (podcast: Podcast) => {
    setFormState({
      podcastTitle: podcast.podcastTitle,
      podcastSummary: podcast.podcastSummary,
      podcastLink: podcast.podcastLink,
      imagePath: podcast.imagePath || "",
      isPublished: podcast.isPublished,
      categoryId: podcast.categoryId,
    });
    setEditingId(podcast.podcastId);
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل تريد حذف هذا البودكاست؟")) {
      try {
        const res = await fetch(`/api/backend/Podcasts/${id}`, { method: "DELETE" });
        if (res.ok) {
          toast.success("تم حذف البودكاست بنجاح");
          await fetchPodcasts();
        } else {
          throw new Error("Failed to delete");
        }
      } catch (error) {
        toast.error("فشل في حذف البودكاست");
        console.error("Error deleting podcast:", error);
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
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">إدارة البودكاست</h1>
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
            {editingId ? "تعديل البودكاست" : "إضافة بودكاست جديد"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                العنوان
              </label>
              <input
                type="text"
                name="podcastTitle"
                value={formState.podcastTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="أدخل العنوان"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الملخص
              </label>
              <textarea
                name="podcastSummary"
                value={formState.podcastSummary}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                rows={3}
                placeholder="أدخل الملخص"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رابط البودكاست (YouTube)
              </label>
              <input
                type="text"
                name="podcastLink"
                value={formState.podcastLink}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="أدخل رابط البودكاست"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الصورة
              </label>
              <input
                type="file"
                accept="image/*"
                title="اختر الصورة"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              {formState.imagePath && (
                <p className="text-xs text-gray-500 mt-1">الصورة الحالية محفوظة</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                التصنيف
              </label>
              <select
                name="categoryId"
                title="اختر التصنيف"
                value={formState.categoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">الحالة</legend>
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="status"
                    checked={formState.isPublished}
                    onChange={() => setFormState({ ...formState, isPublished: true })}
                    className="border-gray-300"
                  />
                  منشورة
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="status"
                    checked={!formState.isPublished}
                    onChange={() => setFormState({ ...formState, isPublished: false })}
                    className="border-gray-300"
                  />
                  مسودة
                </label>
              </div>
            </fieldset>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                {editingId ? "تحديث" : "إضافة"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 gap-4 p-6">
          {podcasts.length === 0 ? (
            <p className="text-gray-600 text-center py-8">لا يوجد بودكاست</p>
          ) : (
            podcasts.map((podcast) => (
              <div
                key={podcast.podcastId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {podcast.podcastTitle}
                    </h3>
                    <p className="text-sm text-gray-600">{podcast.podcastSummary}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(podcast)}
                      className="p-2 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition"
                      title="تعديل"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(podcast.podcastId)}
                      className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      title="حذف"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {podcast.podcastLink && (
                  <p className="text-xs text-gray-500 mb-2">رابط: {podcast.podcastLink}</p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(podcast.updatedDate).toLocaleDateString("ar-SA")}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
