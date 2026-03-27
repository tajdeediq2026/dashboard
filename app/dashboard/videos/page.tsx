"use client";

import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

interface Video {
  videoId: number;
  title: string;
  frameContent: string;
  imagePath?: string;
  isPublished: boolean;
  createdVideoDate: string;
  modifiedVideoDate: string;
  categoryId: number;
}

interface FormState {
  title: string;
  frameContent: string;
  imagePath: string;
  isPublished: boolean;
  categoryId: number;
}

const initialFormState: FormState = {
  title: "",
  frameContent: "",
  imagePath: "",
  isPublished: true,
  categoryId: 1,
};

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
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
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/backend/Videos", { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setVideos(data.sort((a: Video, b: Video) => 
          new Date(b.modifiedVideoDate).getTime() - new Date(a.modifiedVideoDate).getTime()
        ));
      } else {
        throw new Error("Failed to fetch videos");
      }
    } catch (error) {
      toast.error("فشل في تحميل الفيديوهات");
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormState({
      ...formState,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.title) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      const url = editingId 
        ? `/api/backend/Videos/${editingId}`
        : "/api/backend/Videos";
      
      const method = editingId ? "PUT" : "POST";

      let imagePath = formState.imagePath;
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);
        uploadFormData.append("uploadType", "articles");

        const uploadRes = await fetch("/api/backend/Upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadRes.json();
        imagePath = uploadData.imagePath || imagePath;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formState, imagePath }),
      });

      if (res.ok) {
        toast.success(editingId ? "تم تحديث الفيديو بنجاح" : "تمت إضافة فيديو جديد");
        setFormState(initialFormState);
        setImageFile(null);
        setEditingId(null);
        setShowForm(false);
        await fetchVideos();
      } else {
        throw new Error("Failed to save video");
      }
    } catch (error) {
      toast.error("فشل في حفظ الفيديو");
      console.error("Error saving video:", error);
    }
  };

  const handleEdit = (video: Video) => {
    setFormState({
      title: video.title,
      frameContent: video.frameContent,
      imagePath: video.imagePath || "",
      isPublished: video.isPublished,
      categoryId: video.categoryId,
    });
    setEditingId(video.videoId);
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل تريد حذف هذا الفيديو؟")) {
      try {
        const res = await fetch(`/api/backend/Videos/${id}`, { method: "DELETE" });
        if (res.ok) {
          toast.success("تم حذف الفيديو بنجاح");
          await fetchVideos();
        } else {
          throw new Error("Failed to delete");
        }
      } catch (error) {
        toast.error("فشل في حذف الفيديو");
        console.error("Error deleting video:", error);
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
        <h1 className="text-3xl font-bold text-gray-900">إدارة الفيديوهات</h1>
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
            {editingId ? "تعديل الفيديو" : "إضافة فيديو جديد"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                العنوان
              </label>
              <input
                type="text"
                name="title"
                value={formState.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="أدخل العنوان"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                محتوى الإطار (Frame Content)
              </label>
              <textarea
                name="frameContent"
                value={formState.frameContent}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                rows={4}
                placeholder="أدخل محتوى الإطار (مثل كود iframe)"
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPublished"
                id="isPublished"
                checked={!formState.isPublished}
                onChange={(e) => {
                  setFormState({
                    ...formState,
                    isPublished: !e.target.checked,
                  });
                }}
                className="rounded border-gray-300"
              />
              <label htmlFor="isPublished" className="text-sm text-gray-700">
                مسودة
              </label>
            </div>

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
          {videos.length === 0 ? (
            <p className="text-gray-600 text-center py-8">لا توجد فيديوهات</p>
          ) : (
            videos.map((video) => (
              <div
                key={video.videoId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {video.title}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(video)}
                      className="p-2 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition"
                      title="تعديل"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.videoId)}
                      className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      title="حذف"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {video.frameContent && (
                  <p className="text-xs text-gray-500 mb-2 truncate">محتوى: {video.frameContent.substring(0, 50)}...</p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(video.modifiedVideoDate).toLocaleDateString("ar-SA")}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
