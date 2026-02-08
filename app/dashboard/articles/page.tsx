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
import { getArticles } from "./lib/api";
import { ArticleAll } from "./types/Article";
import EmptyState from "../../../components/EmptyState";

export default function Articles() {
  const [articles, setArticles] = useState<ArticleAll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'articleTitle' | 'isPublished' | 'createdDate'>('createdDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const router = useRouter();

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching articles from API...');
      const data = await getArticles();
      console.log('Articles data received:', data);
      setArticles(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSort = (field: 'articleTitle' | 'isPublished' | 'createdDate') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedArticles = () => {
    return [...articles].sort((a, b) => {
      if (sortField === 'articleTitle') {
        return sortDirection === 'asc' 
          ? a.articleTitle.localeCompare(b.articleTitle)
          : b.articleTitle.localeCompare(a.articleTitle);
      } else if (sortField === 'isPublished') {
        return sortDirection === 'asc'
          ? Number(a.isPublished) - Number(b.isPublished)
          : Number(b.isPublished) - Number(a.isPublished);
      } else {
        return sortDirection === 'asc'
          ? (a.createdDate ? new Date(a.createdDate).getTime() : 0) - (b.createdDate ? new Date(b.createdDate).getTime() : 0)
          : (b.createdDate ? new Date(b.createdDate).getTime() : 0) - (a.createdDate ? new Date(a.createdDate).getTime() : 0);
      }
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  const handleViewArticle = (id: string) => {
    router.push(`/dashboard/articles/${id}`);
  };

  const handleEditArticle = (id: string) => {
    router.push(`/dashboard/articles/edit/${id}`);
  };

  const handleDeleteArticle = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المقال؟")) {
      try {
        const response = await fetch(`https://tajdeediq-001-site1.stempurl.com/api/Articles/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete article");
        }

        // Remove the article from the local state
        setArticles(articles.filter((article) => article.id !== id));

        toast.success("تم حذف المقال بنجاح", {
          position: "bottom-center",
          duration: 3000,
          style: {
            background: "#22C55E",
            color: "#fff",
            direction: "rtl",
          },
        });    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء حذف المقال";
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

  const sortedArticles = getSortedArticles();

  return (
    <div className="container mx-auto">
      <Toaster />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <Link
          href="/dashboard/articles/add"
          className="w-full sm:w-auto px-4 py-2 bg-green-700 text-white rounded-md hover:bg-custom-green-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-green flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 ml-2" />
          إضافة مقال جديد
        </Link>

        <h1 className="text-2xl font-semibold text-gray-800">المقالات</h1>
      </div>

      {articles.length === 0 ? (
        <EmptyState
          title="لا توجد مقالات حالياً"
          description="ابدأ بإنشاء مقالك الأول"
          actionLabel="إضافة مقال جديد"
          actionHref="/dashboard/articles/add"
        />
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('articleTitle')}
                  >
                    العنوان {sortField === 'articleTitle' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    التصنيف
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('isPublished')}
                  >
                    الحالة {sortField === 'isPublished' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdDate')}
                  >
                    تاريخ الإنشاء {sortField === 'createdDate' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                {sortedArticles.map((article) => {
                  // Debug logging for each article
                  console.log(`Article: ${article.articleTitle}, isPublished: ${article.isPublished}, type: ${typeof article.isPublished}`);
                  
                  return (
                  <tr key={article.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 text-right">
                        {article.articleTitle}
                      </div>
                      <div className="text-sm text-gray-500 text-right truncate max-w-xs">
                        {article.articleSummary}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 text-right">
                        {article.categoryName || article.category?.name || 'غير محدد'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          article.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {article.isPublished ? "منشورة" : "مسودة"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {article.createdDate ? new Date(article.createdDate).toLocaleDateString("en-GB", {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        calendar: 'gregory'
                      }) : "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <button
                        onClick={() => handleViewArticle(article.id)}
                        title="عرض المقال"
                        className="text-custom-green hover:text-custom-green-dark ml-3"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditArticle(article.id)}
                        title="تعديل المقال"
                        className="text-custom-green hover:text-custom-green-dark ml-3"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        title="حذف المقال"
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
