'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowRightIcon, PencilIcon } from '@heroicons/react/24/outline';

interface BreakingNews {
  id: number;
  title: string;
  breakingNewsDuration: string;
  createdAt: string;
  isPublished: boolean;
}

export default function ViewBreakingNewsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [breakingNews, setBreakingNews] = useState<BreakingNews | null>(null);

  const fetchBreakingNews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://tajdeediq-001-site1.stempurl.com/api/BreakingNews/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch breaking news');
      }
      
      const data: BreakingNews = await response.json();
      setBreakingNews(data);
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      toast.error('فشل في تحميل بيانات الخبر العاجل');
      router.push('/dashboard/breaking-news');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      fetchBreakingNews();
    }
  }, [id, fetchBreakingNews]);

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

  if (!breakingNews) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">لم يتم العثور على الخبر العاجل</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowRightIcon className="ml-1 h-4 w-4" />
          العودة
        </button>
        
        <button
          onClick={() => router.push(`/dashboard/breaking-news/${id}/edit`)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PencilIcon className="ml-2 h-4 w-4" />
          تحرير
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              تفاصيل الخبر العاجل
            </h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان
              </label>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-900 whitespace-pre-wrap">{breakingNews.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مدة العرض
                </label>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-900">{formatDuration(breakingNews.breakingNewsDuration)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الإنشاء
                </label>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-900">{formatDate(breakingNews.createdAt)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حالة النشر
                </label>
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    breakingNews.isPublished
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {breakingNews.isPublished ? 'منشور' : 'غير منشور'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}