"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { getUpperArticles } from "../articles/lib/api";
import { UpperArticle } from "../articles/types/UpperArticle";
import EmptyState from "../../../components/EmptyState";

export default function UpperArticles() {
  const [upperArticles, setUpperArticles] = useState<UpperArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'upperArticleName'>('upperArticleName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const router = useRouter();

  useEffect(() => {
    const fetchUpperArticles = async () => {
      try {
        setIsLoading(true);
        const data = await getUpperArticles();
        setUpperArticles(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpperArticles();
  }, []);

  const handleSort = (field: 'upperArticleName') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedUpperArticles = () => {
    return [...upperArticles].sort((a, b) => {
      return sortDirection === 'asc' 
        ? a.upperArticleName.localeCompare(b.upperArticleName)
        : b.upperArticleName.localeCompare(a.upperArticleName);
    });
  };

  const handleViewUpperArticle = (id: number) => {
    router.push(`/dashboard/upper-articles/${id}`);
  };

  const handleEditUpperArticle = (id: number) => {
    router.push(`/dashboard/upper-articles/edit/${id}`);
  };

  const handleDeleteUpperArticle = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المقال العلوي؟")) {
      try {
        const response = await fetch(`https://tajdeediq-001-site1.stempurl.com/api/UpperArticles/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete upper article");
        }

        // Remove the upper article from the local state
        setUpperArticles(upperArticles.filter((upperArticle) => upperArticle.upperArticleId !== id));

        toast.success("تم حذف المقال العلوي بنجاح", {
          position: "bottom-center",
          duration: 3000,
          style: {
            background: "#22C55E",
            color: "#fff",
            direction: "rtl",
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء حذف المقال العلوي";
        toast.error(errorMessage, {
          position: "bottom-center",
          duration: 3000,
          style: {
            background: "#EF4444",
            color: "#fff",
            direction: "rtl",
          },
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-t-4 border-b-4 border-custom-green rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-red-600">خطأ: {error}</p>
      </div>
    );
  }

  const sortedUpperArticles = getSortedUpperArticles();

  return (
    <div className="container mx-auto">
      <Toaster />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <Link
          href="/dashboard/upper-articles/add"
          className="w-full sm:w-auto px-4 py-2 bg-custom-green text-white rounded-md hover:bg-custom-green-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-green flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 ml-2" />
          إضافة مقال علوي جديد
        </Link>

        <h1 className="text-2xl font-semibold text-gray-800">المقالات في الأعلى</h1>
      </div>

      {upperArticles.length === 0 ? (
        <EmptyState
          title="لا توجد مقالات علوية حالياً"
          description="ابدأ بإنشاء مقالك العلوي الأول"
          actionLabel="إضافة مقال علوي جديد"
          actionHref="/dashboard/upper-articles/add"
        />
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    المعرف
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('upperArticleName')}
                  >
                    اسم المقال العلوي {sortField === 'upperArticleName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedUpperArticles.map((upperArticle) => (
                  <tr key={upperArticle.upperArticleId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 text-right">
                        {upperArticle.upperArticleId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 text-right">
                        {upperArticle.upperArticleName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <button
                        onClick={() => handleViewUpperArticle(upperArticle.upperArticleId)}
                        title="عرض المقال العلوي"
                        className="text-custom-green hover:text-custom-green-dark ml-3"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditUpperArticle(upperArticle.upperArticleId)}
                        title="تعديل المقال العلوي"
                        className="text-custom-green hover:text-custom-green-dark ml-3"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUpperArticle(upperArticle.upperArticleId)}
                        title="حذف المقال العلوي"
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
