"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

interface AuthorItem {
  authorId: number;
  authorName: string | null;
}

interface TagItem {
  tagId: number;
  tagName: string | null;
}

interface AuthorArticleItem {
  authorArticleId: string;
  authorArticleTitle: string | null;
  authorArticleContent: string | null;
  imagePath: string | null;
  createdDate: string;
  updatedDate: string;
  isPublished: boolean;
  authorId: number;
  authorName: string | null;
  tagId: number | null;
  tagName: string | null;
}

interface ArticleFormState {
  authorArticleTitle: string;
  authorArticleContent: string;
  isPublished: boolean;
  authorId: number;
  tagId: string;
}

const AUTHORS_API_URL = "/api/backend/Authors";
const AUTHOR_ARTICLES_API_URL = "/api/backend/AuthorArticles";
const TAGS_API_URL = "/api/backend/Tags";
const CKEDITOR_LICENSE_KEY = process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY || "GPL";

const EMPTY_FORM: ArticleFormState = {
  authorArticleTitle: "",
  authorArticleContent: "",
  isPublished: true,
  authorId: 0,
  tagId: "",
};

function formatDate(input?: string): string {
  if (!input) return "-";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "-";

  const dateParts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatToParts(date);

  const day = dateParts.find((part) => part.type === "day")?.value ?? "";
  const month = dateParts.find((part) => part.type === "month")?.value ?? "";
  const year = dateParts.find((part) => part.type === "year")?.value ?? "";

  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${day} ${month} ${year} - ${timePart}`;
}

export default function AuthorArticlesManager() {
  const [items, setItems] = useState<AuthorArticleItem[]>([]);
  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleFormState>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"title" | "author" | "tag" | "status" | "createdDate">("createdDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedItems = useMemo(
    () => {
      return [...items].sort((a, b) => {
        let comparison = 0;

        if (sortField === "title") {
          comparison = (a.authorArticleTitle || "").localeCompare(b.authorArticleTitle || "", "ar");
        } else if (sortField === "author") {
          comparison = (a.authorName || "").localeCompare(b.authorName || "", "ar");
        } else if (sortField === "tag") {
          comparison = (a.tagName || "").localeCompare(b.tagName || "", "ar");
        } else if (sortField === "status") {
          comparison = Number(a.isPublished) - Number(b.isPublished);
        } else {
          comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
    },
    [items, sortField, sortDirection]
  );

  const handleSort = (field: "title" | "author" | "tag" | "status" | "createdDate") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection(field === "createdDate" ? "desc" : "asc");
  };

  const fetchLookups = async () => {
    const [authorsRes, tagsRes] = await Promise.all([
      fetch(AUTHORS_API_URL, { cache: "no-store" }),
      fetch(TAGS_API_URL, { cache: "no-store" }),
    ]);

    const [authorsData, tagsData] = await Promise.all([
      authorsRes.ok ? authorsRes.json() : Promise.resolve([]),
      tagsRes.ok ? tagsRes.json() : Promise.resolve([]),
    ]);

    const normalizedAuthors: AuthorItem[] = Array.isArray(authorsData) ? authorsData : [];
    const normalizedTags: TagItem[] = Array.isArray(tagsData) ? tagsData : [];

    setAuthors(normalizedAuthors);
    setTags(normalizedTags);

    setForm((prev) => {
      if (prev.authorId > 0) return prev;
      const firstAuthorId = normalizedAuthors[0]?.authorId ?? 0;
      return { ...prev, authorId: firstAuthorId };
    });
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(AUTHOR_ARTICLES_API_URL, { cache: "no-store" });
      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw new Error(`Failed to fetch author articles (${response.status}): ${errorBody}`);
      }

      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching author articles:", error);
      toast.error("فشل في تحميل المقالات");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchLookups(), fetchItems()]);
      } catch (error) {
        console.error("Initial load error:", error);
        toast.error("تعذر تحميل بيانات الصفحة");
      }
    };

    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm((prev) => ({ ...EMPTY_FORM, authorId: prev.authorId || authors[0]?.authorId || 0 }));
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (item: AuthorArticleItem) => {
    setEditingId(item.authorArticleId);
    setForm({
      authorArticleTitle: item.authorArticleTitle || "",
      authorArticleContent: item.authorArticleContent || "",
      isPublished: item.isPublished,
      authorId: item.authorId,
      tagId: item.tagId ? String(item.tagId) : "",
    });
    setImageFile(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm((prev) => ({ ...EMPTY_FORM, authorId: prev.authorId || authors[0]?.authorId || 0 }));
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.authorArticleTitle.trim()) {
      toast.error("عنوان المقال مطلوب");
      return;
    }
    if (!form.authorId || form.authorId <= 0) {
      toast.error("يرجى اختيار كاتب");
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `${AUTHOR_ARTICLES_API_URL}/${editingId}` : AUTHOR_ARTICLES_API_URL;
      const method = isEdit ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("authorArticleTitle", form.authorArticleTitle);
      formData.append("authorArticleContent", form.authorArticleContent);
      formData.append("authorId", String(form.authorId));
      formData.append("isPublished", String(form.isPublished));

      if (form.tagId.trim()) {
        formData.append("tagId", form.tagId.trim());
      } else if (isEdit) {
        formData.append("tagId", "0");
      }

      if (imageFile) {
        formData.append("Image", imageFile, imageFile.name);
      }

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw new Error(errorBody || "Failed to save author article");
      }

      toast.success(isEdit ? "تم تحديث المقال بنجاح" : "تم إضافة المقال بنجاح");
      closeForm();
      await fetchItems();
    } catch (error) {
      console.error("Error saving author article:", error);
      toast.error("فشل في حفظ المقال");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقال؟")) return;

    setDeletingId(id);
    try {
      const response = await fetch(`${AUTHOR_ARTICLES_API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete author article");
      }

      toast.success("تم حذف المقال بنجاح");
      setItems((prev) => prev.filter((item) => item.authorArticleId !== id));
    } catch (error) {
      console.error("Error deleting author article:", error);
      toast.error("فشل في حذف المقال");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6" dir="rtl">
      <Toaster position="top-right" />

      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div className="sm:flex-auto text-right">
          <h1 className="text-2xl font-semibold text-gray-900">المقالات</h1>
          <p className="mt-1 text-sm text-gray-500">إدارة مقالات الكتاب وربطها بالوسوم</p>
        </div>
        <div className="mt-4 sm:mt-0 flex justify-end gap-2">
          <button
            onClick={() => {
              fetchLookups().catch(() => undefined);
              fetchItems().catch(() => undefined);
            }}
            className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            تحديث
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4" />
            إضافة مقال
          </button>
          <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600">
            العناصر: {sortedItems.length}
          </span>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 text-right mb-4">
            {editingId ? "تعديل المقال" : "إضافة مقال جديد"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-1">العنوان</label>
              <input
                type="text"
                value={form.authorArticleTitle}
                onChange={(e) => setForm((prev) => ({ ...prev, authorArticleTitle: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="عنوان المقال"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-1">المحتوى</label>
              <div className="rounded-lg border border-gray-300 overflow-hidden">
                <CKEditor
                  editor={ClassicEditor}
                  data={form.authorArticleContent}
                  onChange={(_event, editor) => {
                    const editorInstance = editor as { getData: () => string };
                    const data = editorInstance.getData();
                    setForm((prev) => ({ ...prev, authorArticleContent: data }));
                  }}
                  config={{
                    licenseKey: CKEDITOR_LICENSE_KEY,
                    language: "ar",
                    removePlugins: ["Title"],
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "indent",
                      "outdent",
                      "|",
                      "blockQuote",
                      "insertTable",
                      "undo",
                      "redo",
                    ],
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 text-right mb-1">الكاتب</label>
                <select
                  title="اختر الكاتب"
                  value={form.authorId}
                  onChange={(e) => setForm((prev) => ({ ...prev, authorId: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={0}>اختر الكاتب</option>
                  {authors.map((author) => (
                    <option key={author.authorId} value={author.authorId}>
                      {author.authorName || `كاتب #${author.authorId}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 text-right mb-1">الوسم (اختياري)</label>
                <select
                  title="اختر الوسم"
                  value={form.tagId}
                  onChange={(e) => setForm((prev) => ({ ...prev, tagId: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">بدون وسم</option>
                  {tags.map((tag) => (
                    <option key={tag.tagId} value={tag.tagId}>
                      {tag.tagName || `وسم #${tag.tagId}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-1">رفع صورة جديدة (اختياري)</label>
              <input
                type="file"
                accept="image/*"
                title="اختر صورة المقال"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">الحالة</legend>
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="publish-state"
                    checked={form.isPublished}
                    onChange={() => setForm((prev) => ({ ...prev, isPublished: true }))}
                  />
                  منشور
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="publish-state"
                    checked={!form.isPublished}
                    onChange={() => setForm((prev) => ({ ...prev, isPublished: false }))}
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
                {submitting ? "جاري الحفظ..." : editingId ? "تحديث" : "حفظ"}
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
          لا توجد مقالات حالياً.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("title")}
                  >
                    العنوان {sortField === "title" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("author")}
                  >
                    الكاتب {sortField === "author" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("tag")}
                  >
                    الوسم {sortField === "tag" && (sortDirection === "asc" ? "↑" : "↓")}
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
                  <tr key={item.authorArticleId}>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-start">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {item.authorArticleTitle || "بدون عنوان"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                      {item.authorName || `#${item.authorId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                      {item.tagName || "بدون وسم"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.isPublished ? "منشور" : "مسودة"}
                      </span>
                    </td>
                    <td dir="ltr" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                      {formatDate(item.createdDate)}
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
                        onClick={() => handleDelete(item.authorArticleId)}
                        disabled={deletingId === item.authorArticleId}
                        title="حذف"
                        className="text-red-600 hover:text-red-900 disabled:opacity-60"
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
