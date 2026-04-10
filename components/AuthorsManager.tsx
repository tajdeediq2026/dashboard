"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

interface AuthorItem {
  authorId: number;
  authorName: string | null;
  authorProfilePictureUrl: string | null;
}

interface AuthorFormState {
  authorName: string;
}

const AUTHORS_API_URL = "/api/backend/Authors";
const EMPTY_FORM: AuthorFormState = {
  authorName: "",
};

export default function AuthorsManager() {
  const [items, setItems] = useState<AuthorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AuthorFormState>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a.authorName || "").localeCompare(b.authorName || "", "ar")),
    [items]
  );

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(AUTHORS_API_URL, { cache: "no-store" });
      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw new Error(`Failed to fetch authors (${response.status}): ${errorBody}`);
      }

      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching authors:", error);
      toast.error("فشل في تحميل بيانات الكتاب");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (item: AuthorItem) => {
    setEditingId(item.authorId);
    setForm({
      authorName: item.authorName || "",
    });
    setImageFile(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.authorName.trim()) {
      toast.error("اسم الكاتب مطلوب");
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `${AUTHORS_API_URL}/${editingId}` : AUTHORS_API_URL;
      const method = isEdit ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("authorName", form.authorName);
      if (imageFile) {
        formData.append("Image", imageFile, imageFile.name);
      }

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw new Error(errorBody || "Failed to save author");
      }

      toast.success(isEdit ? "تم تحديث الكاتب بنجاح" : "تم إضافة الكاتب بنجاح");
      closeForm();
      await fetchItems();
    } catch (error) {
      console.error("Error saving author:", error);
      toast.error("فشل في حفظ بيانات الكاتب");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكاتب؟")) return;

    setDeletingId(id);
    try {
      const response = await fetch(`${AUTHORS_API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete author");
      }

      toast.success("تم حذف الكاتب بنجاح");
      setItems((prev) => prev.filter((item) => item.authorId !== id));
    } catch (error) {
      console.error("Error deleting author:", error);
      toast.error("فشل في حذف الكاتب");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6" dir="rtl">
      <Toaster position="top-right" />

      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div className="sm:flex-auto text-right">
          <h1 className="text-2xl font-semibold text-gray-900">الكتاب</h1>
          <p className="mt-1 text-sm text-gray-500">إدارة بيانات الكتاب والصور الشخصية</p>
        </div>
        <div className="mt-4 sm:mt-0 flex justify-end gap-2">
          <button
            onClick={fetchItems}
            className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            تحديث
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4" />
            إضافة كاتب
          </button>
          <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600">
            العناصر: {sortedItems.length}
          </span>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 text-right mb-4">
            {editingId !== null ? "تعديل الكاتب" : "إضافة كاتب جديد"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-1">اسم الكاتب</label>
              <input
                type="text"
                value={form.authorName}
                onChange={(e) => setForm((prev) => ({ ...prev, authorName: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="أدخل اسم الكاتب"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-1">رفع صورة جديدة (اختياري)</label>
              <input
                type="file"
                accept="image/*"
                title="اختر صورة الكاتب"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? "جاري الحفظ..." : editingId !== null ? "تحديث" : "حفظ"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-56 bg-white rounded-lg shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="mr-2 text-gray-600">جاري التحميل...</span>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-500">
          لا توجد بيانات كتاب حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedItems.map((item) => (
            <article key={item.authorId} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(item.authorId)}
                    disabled={deletingId === item.authorId}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    {deletingId === item.authorId ? "جاري الحذف..." : "حذف"}
                  </button>
                </div>

                <div className="text-right flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.authorName || "بدون اسم"}</h3>
                  <p className="text-xs text-gray-500 mt-1">المعرف: #{item.authorId}</p>
                </div>
              </div>

              {item.authorProfilePictureUrl && (
                <div className="mt-4">
                  <img
                    src={item.authorProfilePictureUrl}
                    alt={item.authorName || "author"}
                    className="w-16 h-16 rounded-full object-cover border border-gray-200"
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
