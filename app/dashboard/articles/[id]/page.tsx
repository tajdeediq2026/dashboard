"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArticleCreate } from "../types/Article";
//import Image from "next/image";

export default function ViewArticle({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [article, setArticle] = useState<ArticleCreate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/backend/Articles/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        console.error("Error fetching article:", error);
        toast.error("فشل في تحميل المقال", {
          position: "bottom-center",
          duration: 3000,
          style: {
            background: "#EF4444",
            color: "#fff",
            direction: "rtl",
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-t-4 border-b-4 border-custom-green rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">لم يتم العثور على المقال</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-custom-green text-white rounded-md hover:bg-custom-green-hover"
        >
          العودة
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          رجوع
        </button>
        <button
          onClick={() => router.push(`/dashboard/articles/edit/${id}`)}
          className="px-4 py-2 bg-custom-green text-white rounded-md hover:bg-custom-green-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-green"
        >
          تعديل المقال
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-right">
          {article.articleTitle}
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 text-right">
            <span className="font-semibold">تاريخ النشر:</span>{" "}
            {article.createdDate ? new Date(article.createdDate).toLocaleDateString("ar-SA") : "غير محدد"}
          </p>
          <p className="text-gray-600 text-right">
            <span className="font-semibold">الحالة:</span>{" "}
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                article.isPublished
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {article.isPublished ? "منشورة" : "مسودة"}
            </span>
          </p>
        </div>

        <div className="prose max-w-none text-right">
          <h2 className="text-xl font-semibold mb-2">ملخص المقال</h2>
          <p className="text-gray-700 mb-6">{article.articleSummary}</p>

          <h2 className="text-xl font-semibold mb-2">محتوى المقال</h2>
          <div className="text-gray-700 whitespace-pre-wrap">{article.articleContent}</div>
        </div>
      </div>
    </div>
  );
}
