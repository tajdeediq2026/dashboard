'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { TrashIcon, CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline';

interface AdvertiseWithUs {
  advertiseWithUsId: number;
  advertiseWithUsName: string;
  advertiseWithUsPhoneNumber: string;
  advertiseWithUsNotes: string;
  advertiseWithUsDurationId: number | null;
  advertiseWithUsDurationName: string | null;
  status: string;
  createdDate: string;
}

export default function AdvertiseWithUsPage() {
  const [items, setItems] = useState<AdvertiseWithUs[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<AdvertiseWithUs | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const url = filterStatus === 'all'
        ? '/api/backend/AdvertiseWithUs'
        : `/api/backend/AdvertiseWithUs?status=${filterStatus}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData?.message || 'Failed to fetch');
      }
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في تحميل طلبات الإعلان');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/backend/AdvertiseWithUs/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast.success(
        newStatus === 'Approved' ? 'تم قبول الطلب بنجاح' :
        newStatus === 'Rejected' ? 'تم رفض الطلب' :
        'تم تحديث الحالة'
      );
      fetchItems();
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في تحديث الحالة');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;

    try {
      const response = await fetch(`/api/backend/AdvertiseWithUs/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      toast.success('تم حذف الطلب بنجاح');
      fetchItems();
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في حذف الطلب');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">مقبول</span>;
      case 'Rejected':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">مرفوض</span>;
      case 'Pending':
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">قيد الانتظار</span>;
    }
  };

  const statusCounts = {
    all: items.length,
    Pending: items.filter(i => i.status === 'Pending').length,
    Approved: items.filter(i => i.status === 'Approved').length,
    Rejected: items.filter(i => i.status === 'Rejected').length,
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
          <h1 className="text-2xl font-semibold text-gray-900">إدارة طلبات الإعلان</h1>
          <p className="mt-1 text-sm text-gray-500">
            إدارة طلبات &ldquo;أعلن معنا&rdquo; - قبول، رفض، أو حذف الطلبات
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard/advertise-with-us/durations"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            إدارة مدد الإعلان
          </Link>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          الكل ({statusCounts.all})
        </button>
        <button
          onClick={() => setFilterStatus('Pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
            filterStatus === 'Pending'
              ? 'bg-yellow-500 text-white'
              : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
          }`}
        >
          <ClockIcon className="h-4 w-4" />
          قيد الانتظار ({statusCounts.Pending})
        </button>
        <button
          onClick={() => setFilterStatus('Approved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
            filterStatus === 'Approved'
              ? 'bg-green-600 text-white'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          <CheckCircleIcon className="h-4 w-4" />
          مقبول ({statusCounts.Approved})
        </button>
        <button
          onClick={() => setFilterStatus('Rejected')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
            filterStatus === 'Rejected'
              ? 'bg-red-600 text-white'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          <XCircleIcon className="h-4 w-4" />
          مرفوض ({statusCounts.Rejected})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد طلبات إعلان</p>
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
                    مدة الإعلان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.advertiseWithUsId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {decodeHtml(item.advertiseWithUsName)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dir="ltr">
                      {item.advertiseWithUsPhoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.advertiseWithUsDurationName || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.createdDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
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

                        {/* Approve */}
                        {item.status !== 'Approved' && (
                          <button
                            onClick={() => updateStatus(item.advertiseWithUsId, 'Approved')}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="قبول"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        )}

                        {/* Reject */}
                        {item.status !== 'Rejected' && (
                          <button
                            onClick={() => updateStatus(item.advertiseWithUsId, 'Rejected')}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="رفض"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        )}

                        {/* Set back to pending */}
                        {item.status !== 'Pending' && (
                          <button
                            onClick={() => updateStatus(item.advertiseWithUsId, 'Pending')}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="إرجاع للانتظار"
                          >
                            <ClockIcon className="h-5 w-5" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(item.advertiseWithUsId)}
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
              <h2 className="text-xl font-semibold text-gray-900">تفاصيل الطلب</h2>
            </div>

            <div className="space-y-4 text-right">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">الاسم</label>
                <p className="text-gray-900">{decodeHtml(selectedItem.advertiseWithUsName)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">رقم الموبايل</label>
                <p className="text-gray-900" dir="ltr">{selectedItem.advertiseWithUsPhoneNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">مدة الإعلان</label>
                <p className="text-gray-900">{selectedItem.advertiseWithUsDurationName || 'غير محدد'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ملاحظات</label>
                <p className="text-gray-900 whitespace-pre-wrap">{decodeHtml(selectedItem.advertiseWithUsNotes) || 'لا توجد ملاحظات'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">التاريخ</label>
                <p className="text-gray-900">{formatDate(selectedItem.createdDate)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">الحالة</label>
                <div>{getStatusBadge(selectedItem.status)}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-6 justify-center">
              {selectedItem.status !== 'Approved' && (
                <button
                  onClick={() => { updateStatus(selectedItem.advertiseWithUsId, 'Approved'); setShowModal(false); }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  قبول الطلب
                </button>
              )}
              {selectedItem.status !== 'Rejected' && (
                <button
                  onClick={() => { updateStatus(selectedItem.advertiseWithUsId, 'Rejected'); setShowModal(false); }}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                >
                  رفض الطلب
                </button>
              )}
              <button
                onClick={() => { handleDelete(selectedItem.advertiseWithUsId); setShowModal(false); }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
