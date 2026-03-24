'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ContactUsItem {
  contactUsId: number;
  contactUsName: string;
  contactUsPhoneNumber: string;
  contactUsPhoneSubject: string;
  contactUsPhoneMessage: string;
}

export default function ContactUsPage() {
  const [items, setItems] = useState<ContactUsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContactUsItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const apiUrl = '/api/backend/ContactUs';

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl, { cache: 'no-store' });
      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        console.warn('ContactUs API returned non-success status:', response.status, errorBody.slice(0, 500));
        setItems([]);
        toast.error('تعذر تحميل رسائل التواصل حالياً');
        return;
      }
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn('Network error while fetching contact messages:', error);
      setItems([]);
      toast.error('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    try {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        console.warn('ContactUs delete failed:', response.status, errorBody.slice(0, 500));
        toast.error('تعذر حذف الرسالة حالياً');
        return;
      }
      toast.success('تم حذف الرسالة بنجاح');
      fetchItems();
    } catch (error) {
      console.warn('Network error while deleting contact message:', error);
      toast.error('فشل الاتصال بالخادم');
    }
  };

  // Decode HTML entities for display
  const decodeHtml = (html: string) => {
    if (!html) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
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
          <h1 className="text-2xl font-semibold text-gray-900">إدارة رسائل التواصل</h1>
          <p className="mt-1 text-sm text-gray-500">
            عرض وإدارة الرسائل الواردة من صفحة &ldquo;تواصل معنا&rdquo;
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            إجمالي الرسائل: {items.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد رسائل تواصل</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الموبايل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الموضوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الرسالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.contactUsId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {decodeHtml(item.contactUsName)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dir="ltr">
                      {item.contactUsPhoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {decodeHtml(item.contactUsPhoneSubject)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {decodeHtml(item.contactUsPhoneMessage)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-1 space-x-reverse">
                        {/* View details */}
                        <button
                          onClick={() => { setSelectedItem(item); setShowModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="عرض التفاصيل"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(item.contactUsId)}
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

      {/* Detail Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
              <h2 className="text-xl font-semibold text-gray-900">تفاصيل الرسالة</h2>
            </div>

            <div className="space-y-4 text-right">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">الاسم</label>
                <p className="text-gray-900">{decodeHtml(selectedItem.contactUsName)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">رقم الموبايل</label>
                <p className="text-gray-900" dir="ltr">{selectedItem.contactUsPhoneNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">الموضوع</label>
                <p className="text-gray-900">{decodeHtml(selectedItem.contactUsPhoneSubject)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">الرسالة</label>
                <p className="text-gray-900 whitespace-pre-wrap">{decodeHtml(selectedItem.contactUsPhoneMessage)}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-6 justify-center">
              <button
                onClick={() => { handleDelete(selectedItem.contactUsId); setShowModal(false); }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                حذف الرسالة
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
