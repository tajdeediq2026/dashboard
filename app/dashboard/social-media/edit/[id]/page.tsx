'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface FormData {
  socialMediaId: number;
  iconName: string;
  link: string;
  imagePath: string;
  imageFile: File | null;
  isActivated: boolean;
}

export default function EditSocialMedia() {
  const API_BASE = '/api/proxy/api';
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    socialMediaId: 0,
    iconName: '',
    link: '',
    imagePath: '',
    imageFile: null,
    isActivated: true
  });

  const fetchSocialMedia = useCallback(async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`${API_BASE}/SocialMedia/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch social media');
      }
      const data = await response.json();
      setFormData({
        socialMediaId: data.socialMediaId,
        iconName: data.iconName || '',
        link: data.link || '',
        imagePath: data.imagePath || '',
        imageFile: null,
        isActivated: data.isActivated
      });
    } catch (err) {
      setError('فشل في تحميل بيانات وسيلة التواصل');
      console.error('Error fetching social media:', err);
    } finally {
      setFetchLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchSocialMedia();
    }
  }, [id, fetchSocialMedia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.iconName.trim() || !formData.link.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imagePath = formData.imagePath || null;
      
      // Upload new image if file is selected
      if (formData.imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.imageFile);
        uploadFormData.append('uploadType', 'social-media');

        const uploadResponse = await fetch(`${API_BASE}/Upload`, {
          method: 'POST',
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imagePath = uploadResult.imagePath;
        } else {
          throw new Error('فشل في رفع الصورة');
        }
      }

      const response = await fetch(`${API_BASE}/SocialMedia/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          socialMediaId: formData.socialMediaId,
          iconName: formData.iconName.trim(),
          link: formData.link.trim(),
          imagePath: imagePath,
          isActivated: formData.isActivated
        }),
      });

      if (response.ok) {
        router.push('/dashboard/social-media');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'فشل في تحديث وسيلة التواصل');
      }
    } catch (err) {
      setError('فشل في تحديث وسيلة التواصل');
      console.error('Error updating social media:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0] || null;
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  if (fetchLoading) {
    return (
      <div className="container mx-auto max-w-2xl">
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="mr-2">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/social-media">
          <button className="flex items-center text-gray-600 hover:text-gray-800">
            <ArrowRightIcon className="h-5 w-5 ml-1" />
            العودة إلى القائمة
          </button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800">تعديل وسيلة تواصل اجتماعي</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="iconName" className="block text-sm font-medium text-gray-700 mb-2 text-right">
              اسم الأيقونة *
            </label>
            <input
              type="text"
              id="iconName"
              name="iconName"
              value={formData.iconName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
              placeholder="مثال: Facebook, Twitter, Instagram"
            />
            <p className="text-sm text-gray-500 mt-1 text-right">
              اسم وسيلة التواصل الاجتماعي (مثل: Facebook, Twitter, Instagram)
            </p>
          </div>

          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2 text-right">
              الرابط *
            </label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://www.example.com"
            />
            <p className="text-sm text-gray-500 mt-1 text-right">
              الرابط الكامل لصفحة وسيلة التواصل الاجتماعي
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              أيقونة وسيلة التواصل
            </label>
            <div className="relative">
              <input
                type="file"
                id="imageFile"
                name="imageFile"
                accept="image/*"
                onChange={handleInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title="رفع أيقونة وسيلة التواصل"
                aria-label="رفع أيقونة وسيلة التواصل"
              />
              <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                {formData.imageFile ? (
                  <div className="text-center">
                    <div className="text-green-600 mb-1">
                      ✓
                    </div>
                    <p className="text-sm text-gray-600">
                      {formData.imageFile.name}
                    </p>
                  </div>
                ) : formData.imagePath ? (
                  <div className="text-center">
                    <div className="text-blue-600 mb-1">
                      <svg className="mx-auto h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      صورة موجودة
                    </p>
                    <p className="text-xs text-gray-500">
                      اضغط لتغيير الصورة
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">
                      <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      اضغط لتحميل أيقونة
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <label htmlFor="isActivated" className="ml-2 block text-sm text-gray-700">
              تفعيل وسيلة التواصل
            </label>
            <input
              type="checkbox"
              id="isActivated"
              name="isActivated"
              checked={formData.isActivated}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex justify-start space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'جاري التحديث...' : 'حفظ التغييرات'}
            </button>
            <Link href="/dashboard/social-media">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                disabled={loading}
              >
                إلغاء
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}