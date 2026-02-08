'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface BreakingNews {
  id: number;
  title: string;
  breakingNewsDuration: string;
  createdAt: string;
  isPublished: boolean;
}

interface UpdateBreakingNewsForm {
  title: string;
  breakingNewsDuration: string;
  isPublished: boolean;
}

export default function EditBreakingNewsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState<UpdateBreakingNewsForm>({
    title: '',
    breakingNewsDuration: '00:05:00',
    isPublished: true
  });

  const fetchBreakingNews = useCallback(async () => {
    try {
      setFetchLoading(true);
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
      setFormData({
        title: data.title,
        breakingNewsDuration: data.breakingNewsDuration,
        isPublished: data.isPublished
      });
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      toast.error('فشل في تحميل بيانات الخبر العاجل');
      router.push('/dashboard/breaking-news');
    } finally {
      setFetchLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      fetchBreakingNews();
    }
  }, [id, fetchBreakingNews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان الخبر العاجل');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`https://tajdeediq-001-site1.stempurl.com/api/BreakingNews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update breaking news');
      }

      toast.success('تم تحديث الخبر العاجل بنجاح');
      router.push('/dashboard/breaking-news');
    } catch (error) {
      console.error('Error updating breaking news:', error);
      toast.error('فشل في تحديث الخبر العاجل');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowRightIcon className="ml-1 h-4 w-4" />
          العودة
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">
            تحرير الخبر العاجل
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                عنوان الخبر العاجل *
              </label>
              <textarea
                id="title"
                name="title"
                rows={3}
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="أدخل عنوان الخبر العاجل..."
              />
            </div>

            <div>
              <label htmlFor="breakingNewsDuration" className="block text-sm font-medium text-gray-700">
                مدة العرض
              </label>
              <select
                id="breakingNewsDuration"
                name="breakingNewsDuration"
                value={formData.breakingNewsDuration}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="00:05:00">5 دقائق</option>
                <option value="00:10:00">10 دقائق</option>
                <option value="00:15:00">15 دقيقة</option>
                <option value="00:30:00">30 دقيقة</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                مدة عرض الخبر العاجل
              </p>
            </div>

            <div className="flex items-center">
              <input
                id="isPublished"
                name="isPublished"
                type="checkbox"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isPublished" className="mr-2 block text-sm text-gray-900">
                نشر الخبر العاجل
              </label>
            </div>

            <div className="flex justify-end space-x-3 space-x-reverse">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'جاري التحديث...' : 'تحديث'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}