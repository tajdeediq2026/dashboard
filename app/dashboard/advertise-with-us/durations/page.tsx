'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface Duration {
  advertiseWithUsDurationId: number;
  advertiseWithUsDurationName: string;
}

export default function AdvertiseWithUsDurationsPage() {
  const [durations, setDurations] = useState<Duration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDurations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/backend/AdvertiseWithUsDurations');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setDurations(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في تحميل مدد الإعلان');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDurations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormName('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (duration: Duration) => {
    setFormName(duration.advertiseWithUsDurationName);
    setEditingId(duration.advertiseWithUsDurationId);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('يرجى إدخال اسم المدة');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update
        const response = await fetch(
          `/api/backend/AdvertiseWithUsDurations/${editingId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              advertiseWithUsDurationName: formName.trim(),
            }),
          }
        );
        if (!response.ok) throw new Error('Failed to update');
        toast.success('تم تحديث المدة بنجاح');
      } else {
        // Create
        const response = await fetch(
          '/api/backend/AdvertiseWithUsDurations',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              advertiseWithUsDurationName: formName.trim(),
            }),
          }
        );
        if (!response.ok) throw new Error('Failed to create');
        toast.success('تم إضافة المدة بنجاح');
      }
      resetForm();
      fetchDurations();
    } catch (error) {
      console.error('Error:', error);
      toast.error(editingId ? 'فشل في تحديث المدة' : 'فشل في إضافة المدة');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه المدة؟ سيتم إزالتها من جميع طلبات الإعلان المرتبطة بها.'))
      return;

    try {
      const response = await fetch(
        `/api/backend/AdvertiseWithUsDurations/${id}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete');
      toast.success('تم حذف المدة بنجاح');
      fetchDurations();
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في حذف المدة. قد تكون مرتبطة بطلبات إعلان.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="mr-2">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div className="sm:flex-auto">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/dashboard/advertise-with-us"
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
              title="العودة لطلبات الإعلان"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">
              إدارة مدد الإعلان
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            إضافة وتعديل وحذف مدد الإعلان المتاحة للعملاء
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            إضافة مدة جديدة
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 text-right">
            {editingId ? 'تعديل المدة' : 'إضافة مدة جديدة'}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="اسم المدة (مثال: شهر واحد، 3 أشهر، سنة)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                maxLength={100}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 ml-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    جاري الحفظ...
                  </>
                ) : editingId ? (
                  'تحديث'
                ) : (
                  'إضافة'
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {durations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">لا توجد مدد إعلان</p>
            <p className="text-gray-400 text-sm">
              أضف مدد إعلان ليتمكن العملاء من اختيارها عند تقديم طلب إعلان
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اسم المدة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {durations.map((duration, index) => (
                  <tr
                    key={duration.advertiseWithUsDurationId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {duration.advertiseWithUsDurationName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleEdit(duration)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="تعديل"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(duration.advertiseWithUsDurationId)
                          }
                          className="text-red-600 hover:text-red-900 p-1"
                          title="حذف"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg text-right">
        <p className="text-sm text-blue-700">
          <strong>ملاحظة:</strong> مدد الإعلان تظهر للعملاء في صفحة &ldquo;أعلن
          معنا&rdquo; كخيارات في قائمة مدة الإعلان.
        </p>
      </div>
    </div>
  );
}
