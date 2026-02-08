'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { createTag } from '../../articles/lib/api';
import { CreateTagDto } from '../../articles/types/Tag';

export default function AddTag() {
  const router = useRouter();
  const [tagName, setTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagName.trim()) {
      setError('اسم الوسم مطلوب');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tagData: CreateTagDto = {
        tagName: tagName.trim()
      };

      await createTag(tagData);
      toast.success('تم إنشاء الوسم بنجاح');
      router.push('/dashboard/tags');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في إنشاء الوسم';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="رجوع"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">إضافة وسم جديد</h1>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-right">
                {error}
              </div>
            )}

            <div>
              <label 
                htmlFor="tagName" 
                className="block text-sm font-medium text-gray-700 text-right mb-2"
              >
                اسم الوسم <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="tagName"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="مثال: تكنولوجيا، رياضة، سياسة..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
                maxLength={100}
                required
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500 text-right">
                الحد الأقصى 100 حرف
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading || !tagName.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ الوسم'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
