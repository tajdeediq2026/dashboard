'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { CategoryAll } from '../articles/types/Category';
import { getCategories, deleteCategory } from '../articles/lib/api';
import CategoryTable from '../../../components/CategoryTable';

export default function Categories() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryAll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحميل التصنيفات');
      toast.error('فشل في تحميل التصنيفات');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      return;
    }

    try {
      await deleteCategory(id);
      await loadCategories(); // Refresh the list
      toast.success('تم حذف التصنيف بنجاح');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في حذف التصنيف');
      toast.error('فشل في حذف التصنيف');
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
        <h1 className="text-2xl font-semibold text-gray-800">التصنيفات</h1>
        <button
          onClick={() => router.push('/dashboard/categories/add')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2"
        >
          إضافة تصنيف جديد
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-right">
          {error}
        </div>
      )}

      <CategoryTable 
        categories={categories}
        onEdit={(id) => router.push(`/dashboard/categories/edit/${id}`)}
        onDelete={handleDelete}
      />

      <Toaster />
    </div>
  );
}
