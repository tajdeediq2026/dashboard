"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

interface PoliticalMemoryItem {
  politicalMemoryId: number;
  politicalMemoryTitle: string | null;
  politicalMemoryFrameContent: string | null;
  politicalMemoryImagePath: string | null;
  politicalMemoryIsPublished: boolean | null;
  politicalMemoryCreatedDate: string;
  politicalMemoryModifiedDate: string;
}

interface FormState {
  politicalMemoryTitle: string;
  politicalMemoryFrameContent: string;
  politicalMemoryIsPublished: boolean;
}

const EMPTY_FORM: FormState = {
  politicalMemoryTitle: "",
  politicalMemoryFrameContent: "",
  politicalMemoryIsPublished: true,
};

function formatDate(dateString?: string): string {
  if (!dateString) return "-";

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getImageSrc(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `/api/proxy${path.startsWith("/") ? "" : "/"}${path}`;
}

function normalizeEmbedUrl(url: string): string | null {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\//, "").split("/")[0];
      if (!id) return null;
      return `https://www.youtube.com/embed/${id}`;
    }

    if (host.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return `https://www.youtube.com${parsed.pathname}`;
      }

      const id = parsed.searchParams.get("v");
      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    if (host.includes("vimeo.com")) {
      if (host === "player.vimeo.com") {
        return `https://player.vimeo.com${parsed.pathname}`;
      }

      const id = parsed.pathname.replace(/^\//, "").split("/")[0];
      if (id) {
        return `https://player.vimeo.com/video/${id}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function extractEmbedUrl(content?: string | null): string | null {
  if (!content) return null;

  const text = content.trim();
  if (!text) return null;

  const srcMatch = text.match(/src\s*=\s*['\"]([^'\"]+)['\"]/i);
  if (srcMatch?.[1]) {
    const normalized = normalizeEmbedUrl(srcMatch[1]);
    if (normalized) return normalized;
  }

  const rawUrlMatch = text.match(/https?:\/\/[^\s"'<>]+/i);
  if (rawUrlMatch?.[0]) {
    const normalized = normalizeEmbedUrl(rawUrlMatch[0]);
    if (normalized) return normalized;
  }

  return null;
}

export default function PoliticalMemoryManager() {
  const [items, setItems] = useState<PoliticalMemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/backend/PoliticalMemory", { cache: "no-store" });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        console.error("PoliticalMemory API error:", response.status, errorBody.slice(0, 500));
        throw new Error("Failed to fetch PoliticalMemory records");
      }

      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching PoliticalMemory records:", error);
      toast.error("فشل في تحميل بيانات الذاكرة السياسية");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(b.politicalMemoryModifiedDate || b.politicalMemoryCreatedDate).getTime() -
          new Date(a.politicalMemoryModifiedDate || a.politicalMemoryCreatedDate).getTime()
      ),
    [items]
  );

  const openCreate = () => {
    setEditingId(null);
    setImageFile(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item: PoliticalMemoryItem) => {
    setEditingId(item.politicalMemoryId);
    setImageFile(null);
    setForm({
      politicalMemoryTitle: item.politicalMemoryTitle ?? "",
      politicalMemoryFrameContent: item.politicalMemoryFrameContent ?? "",
      politicalMemoryIsPublished: item.politicalMemoryIsPublished ?? true,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setImageFile(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.politicalMemoryTitle.trim() && !form.politicalMemoryFrameContent.trim()) {
      toast.error("يرجى إدخال العنوان أو المحتوى");
      return;
    }

    setSubmitting(true);

    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `/api/backend/PoliticalMemory/${editingId}` : "/api/backend/PoliticalMemory";
      const method = isEdit ? "PUT" : "POST";

      const payload = new FormData();
      payload.append("PoliticalMemoryTitle", form.politicalMemoryTitle);
      payload.append("PoliticalMemoryFrameContent", form.politicalMemoryFrameContent);
      payload.append("PoliticalMemoryIsPublished", String(form.politicalMemoryIsPublished));
      if (imageFile) {
        payload.append("Image", imageFile, imageFile.name);
      }

      const response = await fetch(url, {
        method,
        body: payload,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        console.error("Save PoliticalMemory error:", response.status, errorBody.slice(0, 500));
        throw new Error("Failed to save PoliticalMemory");
      }

      toast.success(isEdit ? "تم تحديث سجل الذاكرة السياسية" : "تم إنشاء سجل جديد في الذاكرة السياسية");
      closeForm();
      await fetchItems();
    } catch (error) {
      console.error("Error saving PoliticalMemory:", error);
      toast.error("فشل في حفظ السجل");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;

    setDeletingId(id);

    try {
      const response = await fetch(`/api/backend/PoliticalMemory/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete PoliticalMemory");
      }

      toast.success("تم حذف السجل بنجاح");
      setItems((prev) => prev.filter((item) => item.politicalMemoryId !== id));
    } catch (error) {
      console.error("Error deleting PoliticalMemory:", error);
      toast.error("فشل في حذف السجل");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div dir="rtl">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div className="sm:flex-auto text-right">
          <h1 className="text-2xl font-semibold text-gray-900">الذاكرة السياسية</h1>
          <p className="mt-1 text-sm text-gray-500">إدارة عناصر الذاكرة السياسية (إضافة، تعديل، حذف)</p>
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
            إضافة جديد
          </button>
          <span className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            العناصر: {sortedItems.length}
          </span>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 text-right mb-4">
            {editingId !== null ? "تعديل سجل الذاكرة السياسية" : "إضافة سجل جديد"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-1">العنوان</label>
              <input
                type="text"
                title="العنوان"
                value={form.politicalMemoryTitle}
                onChange={(e) => setForm((prev) => ({ ...prev, politicalMemoryTitle: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="عنوان الذاكرة السياسية"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-1">محتوى الإطار</label>
              <textarea
                title="محتوى الإطار"
                value={form.politicalMemoryFrameContent}
                onChange={(e) => setForm((prev) => ({ ...prev, politicalMemoryFrameContent: e.target.value }))}
                rows={8}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="اكتب محتوى الإطار هنا..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-1">رفع صورة (اختياري)</label>
              <input
                type="file"
                title="رفع ملف صورة"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2 text-right">الحالة</legend>
              <div className="flex items-center justify-end gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="status"
                    checked={form.politicalMemoryIsPublished}
                    onChange={() => setForm((prev) => ({ ...prev, politicalMemoryIsPublished: true }))}
                  />
                  منشورة
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="status"
                    checked={!form.politicalMemoryIsPublished}
                    onChange={() => setForm((prev) => ({ ...prev, politicalMemoryIsPublished: false }))}
                  />
                  مسودة
                </label>
              </div>
            </fieldset>

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
          لا توجد بيانات حالياً. اضغط "إضافة جديد" لإنشاء أول سجل.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((item) => (
            <article key={item.politicalMemoryId} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2 min-w-[170px]">
                  <div className="text-left text-xs text-gray-500">
                    <div>رقم: #{item.politicalMemoryId}</div>
                    <div className="mt-1">الإنشاء: {formatDate(item.politicalMemoryCreatedDate)}</div>
                    <div className="mt-1">آخر تعديل: {formatDate(item.politicalMemoryModifiedDate)}</div>
                    <div className="mt-1">الحالة: {item.politicalMemoryIsPublished ? "منشورة" : "مسودة"}</div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => openEdit(item)}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(item.politicalMemoryId)}
                      disabled={deletingId === item.politicalMemoryId}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      {deletingId === item.politicalMemoryId ? "جاري..." : "حذف"}
                    </button>
                  </div>
                </div>

                <div className="flex-1 text-right">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.politicalMemoryTitle || "بدون عنوان"}
                  </h2>
                  {item.politicalMemoryImagePath && (
                    <img
                      src={getImageSrc(item.politicalMemoryImagePath)}
                      alt={item.politicalMemoryTitle || "Political memory image"}
                      className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-200 mb-3 mr-auto"
                    />
                  )}
                  {(() => {
                    const embedUrl = extractEmbedUrl(item.politicalMemoryFrameContent);
                    if (embedUrl) {
                      return (
                        <div className="mb-3 w-full max-w-3xl mr-auto">
                          <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-gray-200">
                            <iframe
                              src={embedUrl}
                              title={item.politicalMemoryTitle || "Embedded video"}
                              className="absolute inset-0 h-full w-full"
                              frameBorder={0}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      );
                    }

                    return (
                      <p className="text-gray-700 leading-7 whitespace-pre-line break-words">
                        {item.politicalMemoryFrameContent || "لا يوجد محتوى"}
                      </p>
                    );
                  })()}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
