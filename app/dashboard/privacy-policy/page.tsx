'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface PrivacyPolicyItem {
  id: number;
  title: string | null;
  content: string | null;
  createdDate: string;
  modifiedDate: string;
}

interface FormState {
  title: string;
  content: string;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const EMPTY_FORM: FormState = { title: '', content: '' };

export default function PrivacyPolicyPage() {
  const [items, setItems] = useState<PrivacyPolicyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/backend/PrivacyPolicy', { cache: 'no-store' });
      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        console.error('PrivacyPolicy API error:', response.status, errorBody.slice(0, 500));
        throw new Error('Failed to fetch privacy policy records');
      }
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching privacy policy:', error);
      toast.error('فشل في تحميل بيانات سياسة الخصوصية');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) =>
      new Date(b.modifiedDate || b.createdDate).getTime() -
      new Date(a.modifiedDate || a.createdDate).getTime()
    ),
    [items]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item: PrivacyPolicyItem) => {
    setEditingId(item.id);
    setForm({ title: item.title ?? '', content: item.content ?? '' });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() && !form.content.trim()) {
      toast.error('يرجى إدخال العنوان أو المحتوى');
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = editingId !== null;
      const url = isEdit
        ? `/api/backend/PrivacyPolicy/${editingId}`
        : '/api/backend/PrivacyPolicy';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, content: form.content }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        console.error('Save error:', response.status, errorBody.slice(0, 500));
        throw new Error('Failed to save');
      }

      toast.success(isEdit ? 'تم تحديث سياسة الخصوصية بنجاح' : 'تم إنشاء سياسة الخصوصية بنجاح');
      closeForm();
      await fetchItems();
    } catch (error) {
      console.error('Error saving privacy policy:', error);
      toast.error('فشل في حفظ سياسة الخصوصية');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/backend/PrivacyPolicy/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete');
      }
      toast.success('تم الحذف بنجاح');
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('فشل في الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div className="sm:flex-auto text-right">
          <h1 className="text-2xl font-semibold text-gray-900">سياسة الخصوصية</h1>
          <p className="mt-1 text-sm text-gray-500">إنشاء وتعديل وحذف محتوى سياسة الخصوصية المعروض في الموقع</p>
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
          <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600">
            العناصر: {sortedItems.length}
          </span>
        </div>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 text-right mb-4">
            {editingId !== null ? 'تعديل سياسة الخصوصية' : 'إضافة سياسة خصوصية جديدة'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                العنوان
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="عنوان سياسة الخصوصية"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                المحتوى
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                rows={12}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-7"
                placeholder="اكتب محتوى سياسة الخصوصية هنا..."
                dir="rtl"
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
                {submitting ? 'جاري الحفظ...' : editingId !== null ? 'تحديث' : 'حفظ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-56 bg-white rounded-lg shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="mr-2 text-gray-600">جاري التحميل...</span>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-500">
          لا توجد سياسات خصوصية حالياً. اضغط &quot;إضافة جديد&quot; لإنشاء أول سجل.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((item) => (
            <article key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2 min-w-[160px]">
                  <div className="text-xs text-gray-500 text-left">
                    <div>رقم: #{item.id}</div>
                    <div className="mt-1">الإنشاء: {formatDate(item.createdDate)}</div>
                    <div className="mt-1">آخر تعديل: {formatDate(item.modifiedDate)}</div>
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
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      {deletingId === item.id ? 'جاري...' : 'حذف'}
                    </button>
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title || 'بدون عنوان'}
                  </h2>
                  <p className="text-gray-700 leading-7 whitespace-pre-line break-words line-clamp-6">
                    {item.content || 'لا يوجد محتوى'}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
