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
  politicalMemoryIsPublished: boolean;
}

const EMPTY_FORM: FormState = {
  politicalMemoryTitle: "",
  politicalMemoryIsPublished: true,
};

function formatDate(dateString?: string): string {
  if (!dateString) return "-";

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "-";

  const dateParts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatToParts(parsed);

  const day = dateParts.find((part) => part.type === "day")?.value ?? "";
  const month = dateParts.find((part) => part.type === "month")?.value ?? "";
  const year = dateParts.find((part) => part.type === "year")?.value ?? "";

  const timePart = parsed.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${day} ${month} ${year} - ${timePart}`;
}

function getImageSrc(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `/api/proxy${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function PoliticalMemoryManager() {
  const [items, setItems] = useState<PoliticalMemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<"title" | "status" | "createdDate">("createdDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
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

  const handleSort = (field: "title" | "status" | "createdDate") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection(field === "createdDate" ? "desc" : "asc");
  };

  const sortedItems = useMemo(
    () => {
      return [...items].sort((a, b) => {
        let comparison = 0;

        if (sortField === "title") {
          const aTitle = (a.politicalMemoryTitle || "").trim();
          const bTitle = (b.politicalMemoryTitle || "").trim();
          comparison = aTitle.localeCompare(bTitle, "ar");
        } else if (sortField === "status") {
          const aStatus = Number(!!a.politicalMemoryIsPublished);
          const bStatus = Number(!!b.politicalMemoryIsPublished);
          comparison = aStatus - bStatus;
        } else {
          const aCreated = new Date(a.politicalMemoryCreatedDate).getTime();
          const bCreated = new Date(b.politicalMemoryCreatedDate).getTime();
          comparison = aCreated - bCreated;
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
    },
    [items, sortField, sortDirection]
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

    const isEdit = editingId !== null;

    if (!form.politicalMemoryTitle.trim()) {
      toast.error("يرجى إدخال العنوان");
      return;
    }

    setSubmitting(true);

    try {
      const url = isEdit ? `/api/backend/PoliticalMemory/${editingId}` : "/api/backend/PoliticalMemory";
      const method = isEdit ? "PUT" : "POST";

      const payload = new FormData();

      payload.append("PoliticalMemoryTitle", form.politicalMemoryTitle);
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
        throw new Error(errorBody || `Failed to save PoliticalMemory (${response.status})`);
      }

      toast.success(isEdit ? "تم تحديث سجل الذاكرة السياسية" : "تم إنشاء سجل جديد في الذاكرة السياسية");
      closeForm();
      await fetchItems();
    } catch (error) {
      console.error("Error saving PoliticalMemory:", error);
      const message = error instanceof Error ? error.message : "";
      toast.error(message ? `فشل في حفظ السجل: ${message}` : "فشل في حفظ السجل");
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
          لا توجد بيانات حالياً. اضغط &quot;إضافة جديد&quot; لإنشاء أول سجل.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("title")}
                  >
                    العنوان {sortField === "title" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    الحالة {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("createdDate")}
                  >
                    تاريخ الإنشاء {sortField === "createdDate" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedItems.map((item) => (
                  <tr key={item.politicalMemoryId}>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-start gap-3">
                        {item.politicalMemoryImagePath && (
                          <img
                            src={getImageSrc(item.politicalMemoryImagePath)}
                            alt={item.politicalMemoryTitle || "Political memory"}
                            className="w-14 h-14 object-cover rounded border border-gray-200"
                          />
                        )}
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900">
                            {item.politicalMemoryTitle || "بدون عنوان"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.politicalMemoryIsPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.politicalMemoryIsPublished ? "منشورة" : "مسودة"}
                      </span>
                    </td>
                    <td dir="ltr" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                      {formatDate(item.politicalMemoryCreatedDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <button
                        onClick={() => openEdit(item)}
                        title="تعديل"
                        className="text-custom-green hover:text-custom-green-dark ml-3"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.politicalMemoryId)}
                        disabled={deletingId === item.politicalMemoryId}
                        title="حذف"
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
