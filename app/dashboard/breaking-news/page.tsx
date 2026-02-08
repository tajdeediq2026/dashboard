'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface BreakingNews {
  id: number;
  title: string;
  breakingNewsDuration: string;
  createdAt: string;
  isPublished: boolean;
}

export default function BreakingNewsPage() {
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchBreakingNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://tajdeediq-001-site1.stempurl.com/api/BreakingNews', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch breaking news');
      }
      
      const data = await response.json();
      setBreakingNews(data);
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      toast.error('فشل في تحميل الأخبار العاجلة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakingNews();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الخبر العاجل؟')) {
      return;
    }

    try {
      const response = await fetch(`https://tajdeediq-001-site1.stempurl.com/api/BreakingNews/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete breaking news');
      }

      toast.success('تم حذف الخبر العاجل بنجاح');
      fetchBreakingNews();
    } catch (error) {
      console.error('Error deleting breaking news:', error);
      toast.error('فشل في حذف الخبر العاجل');
    }
  };

  const togglePublish = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`https://tajdeediq-001-site1.stempurl.com/api/BreakingNews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublished: !currentStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update breaking news');
      }

      toast.success('تم تحديث حالة النشر بنجاح');
      fetchBreakingNews();
    } catch (error) {
      console.error('Error updating breaking news:', error);
      toast.error('فشل في تحديث حالة النشر');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG');
  };

  const formatDuration = (duration: string) => {
    if (!duration) return 'غير محدد';
    
    const durationMap: { [key: string]: string } = {
      '00:05:00': '5 دقائق',
      '00:10:00': '10 دقائق',
      '00:15:00': '15 دقيقة',
      '00:30:00': '30 دقيقة'
    };
    
    return durationMap[duration] || duration;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">الأخبار العاجلة</h1>
          <p className="mt-2 text-sm text-gray-700">
            قائمة بجميع الأخبار العاجلة في النظام
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:mr-16 sm:flex-none">
          <button
            type="button"
            onClick={() => router.push('/dashboard/breaking-news/create')}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
            إنشاء خبر عاجل جديد
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العنوان
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المدة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الإنشاء
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">الإجراءات</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {breakingNews.map((news) => (
                    <tr key={news.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {news.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(news.breakingNewsDuration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(news.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePublish(news.id, news.isPublished)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            news.isPublished
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {news.isPublished ? 'منشور' : 'غير منشور'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => router.push(`/dashboard/breaking-news/${news.id}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="عرض"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/breaking-news/${news.id}/edit`)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="تحرير"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(news.id)}
                            className="text-red-600 hover:text-red-900"
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
              
              {breakingNews.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">لا توجد أخبار عاجلة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}