//"use client";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import EmptyState from "../../../components/EmptyState";

type Article = {
  id: string;
  articleTitle: string;
  articleSummary: string;
  articleContent: string;
  imagePath: string;
  createdDate: string;
  updatedDate: string;
  isPublished: boolean;
  facebook: boolean;
  twitter: boolean;
  categoryId: number;
};

const ArticlesPage = async () => {
  const response = await fetch('/api/proxy/api/Articles', { cache: 'no-store' });
  const articles: Article[] = await response.json();
  console.log(articles)
  
  return (
    <section className="container m-auto px-5">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/dashboard/articles/add"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
        >
          <PlusIcon className="h-5 w-5 ml-2" />
          إضافة مقال جديد
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800">جميع المقالات</h1>
      </div>

      {articles.length === 0 ? (
        <EmptyState
          title="لا توجد مقالات"
          description="ابدأ بإنشاء مقالك الأول"
          actionLabel="إضافة مقال جديد"
          actionHref="/dashboard/articles/add"
        />
      ) : (
        <div className="flex items-center justify-center flex-wrap gap-7">
          {articles.map((item) => (
            <div
              className="p-5 rounded-lg my-1 shadow-lg border-2 border-gray-400 hover:bg-slate-200 w-full md:w-2/5 lg:w-2/5"
              key={item.id}
            >
              <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                {item.articleTitle}
              </h3>
              <p className="my-2 text-xl text-gray-700 p-1 line-clamp-1">
                {item.articleContent}
              </p>
              <Link
                className="text-xl bg-green-700 hover:bg-green-900 w-full block text-center p-1 text-white rounded-lg"
                href={`/politicsandsecurity/${item.id}`}
              >
                إقرأ المزيد
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ArticlesPage;
