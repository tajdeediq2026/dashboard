"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { getUpperArticle } from "../lib/api";
import { UpperArticle } from "../types/UpperArticle";

export default function ViewUpperArticle({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [upperArticle, setUpperArticle] = useState<UpperArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpperArticle = async () => {
      try {
        const response = await getUpperArticle(Number(id));
        setUpperArticle(response);
      } catch (error) {
        console.error("Error fetching upper article:", error);
        toast.error("فشل في تحميل المقال العلوي", {
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

    fetchUpperArticle();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-t-4 border-b-4 border-custom-green rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!upperArticle) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">لم يتم العثور على المقال العلوي</p>
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
          onClick={() => router.push(`/dashboard/upper-articles/edit/${id}`)}
          className="px-4 py-2 bg-custom-green text-white rounded-md hover:bg-custom-green-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-green"
        >
          تعديل المقال العلوي
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-right">
          تفاصيل المقال العلوي
        </h1>
        
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900 text-right mb-2">
              المعرف
            </h3>
            <p className="text-gray-700 text-right">
              {upperArticle.upperArticleId}
            </p>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900 text-right mb-2">
              اسم المقال العلوي
            </h3>
            <p className="text-gray-700 text-right">
              {upperArticle.upperArticleName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
