'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

interface AboutUsItem {
  id: number;
  title: string | null;
  content: string | null;
  createdDate: string;
  modifiedDate: string;
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

export default function AboutUsDashboardPage() {
  const [items, setItems] = useState<AboutUsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/backend/AboutUs', { cache: 'no-store' });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        console.error('AboutUs API returned non-success status:', response.status, errorBody.slice(0, 500));
        throw new Error('Failed to fetch AboutUs records');
      }

      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching AboutUs records:', error);
      toast.error('فشل في تحميل بيانات عن جريدة تجديد');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.modifiedDate || b.createdDate).getTime() - new Date(a.modifiedDate || a.createdDate).getTime()),
    [items]
  );

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div className="sm:flex-auto text-right">
          <h1 className="text-2xl font-semibold text-gray-900">عن جريدة تجديد</h1>
          <p className="mt-1 text-sm text-gray-500">عرض البيانات الواردة من نموذج AboutUs في الباك إند</p>
        </div>
        <div className="mt-4 sm:mt-0 flex justify-end gap-2">
          <button
            onClick={fetchItems}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            تحديث
          </button>
          <span className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            العناصر: {sortedItems.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-56 bg-white rounded-lg shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="mr-2 text-gray-600">جاري التحميل...</span>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-500">
          لا توجد بيانات حالياً في AboutUs
        </div>
      ) : (
        <div className="space-y-4">
          {sortedItems.map((item) => (
            <article key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="text-left text-xs text-gray-500 min-w-[170px]">
                  <div>رقم: #{item.id}</div>
                  <div className="mt-1">الإنشاء: {formatDate(item.createdDate)}</div>
                  <div className="mt-1">آخر تعديل: {formatDate(item.modifiedDate)}</div>
                </div>
                <div className="flex-1 text-right">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title || 'بدون عنوان'}
                  </h2>
                  <p className="text-gray-700 leading-7 whitespace-pre-line break-words">
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