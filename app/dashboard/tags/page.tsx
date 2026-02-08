'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Tag } from '../articles/types/Tag';
import { getTags, deleteTag } from '../articles/lib/api';
import TagTable from '../../../components/TagTable';

export default function Tags() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await getTags();
      setTags(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحميل الوسوم');
      toast.error('فشل في تحميل الوسوم');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الوسم؟')) {
      return;
    }

    try {
      await deleteTag(id);
      await loadTags(); // Refresh the list
      toast.success('تم حذف الوسم بنجاح');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في حذف الوسم');
      toast.error('فشل في حذف الوسم');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">وسوم المقالات</h1>
        <button
          onClick={() => router.push('/dashboard/tags/add')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          إضافة وسم جديد
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-right">
          {error}
        </div>
      )}

      <TagTable 
        tags={tags}
        onEdit={(id) => router.push(`/dashboard/tags/edit/${id}`)}
        onDelete={handleDelete}
      />

      <Toaster />
    </div>
  );
}
