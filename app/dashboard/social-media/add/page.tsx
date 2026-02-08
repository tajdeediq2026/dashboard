'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface FormData {
  iconName: string;
  link: string;
  imagePath: string;
  imageFile: File | null;
  isActivated: boolean;
}

export default function AddSocialMedia() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    iconName: '',
    link: '',
    imagePath: '',
    imageFile: null,
    isActivated: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.iconName.trim() || !formData.link.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (!formData.imageFile) {
      setError('يرجى تحديد صورة للأيقونة');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imagePath = null;
      
      // Upload image file
      if (formData.imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.imageFile);
        uploadFormData.append('uploadType', 'social-media');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tajdeediq-001-site1.stempurl.com';
        const uploadResponse = await fetch(`${apiUrl}/api/Upload`, {
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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tajdeediq-001-site1.stempurl.com';
      const response = await fetch(`${apiUrl}/api/SocialMedia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        setError(errorData.message || 'فشل في إضافة وسيلة التواصل');
      }
    } catch (err) {
      setError('فشل في إضافة وسيلة التواصل');
      console.error('Error adding social media:', err);
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

  return (
    <div className="container mx-auto max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/social-media">
          <button className="flex items-center text-gray-600 hover:text-gray-800">
            <ArrowRightIcon className="h-5 w-5 ml-1" />
            العودة إلى القائمة
          </button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800">إضافة وسيلة تواصل اجتماعي</h1>
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
                title="تحميل أيقونة وسيلة التواصل"
                aria-label="تحميل أيقونة وسيلة التواصل"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
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
              {loading ? 'جاري الحفظ...' : 'حفظ'}
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