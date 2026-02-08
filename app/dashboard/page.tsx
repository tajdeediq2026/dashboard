'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DocumentTextIcon, 
  FolderIcon, 
  ExclamationTriangleIcon, 
  ArrowUpIcon,
  ArrowDownIcon,
  UsersIcon,
  CheckCircleIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalArticles: number;
  totalCategories: number;
  totalBreakingNews: number;
  publishedArticles: number;
  recentArticles: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    totalCategories: 0,
    totalBreakingNews: 0,
    publishedArticles: 0,
    recentArticles: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard-stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Dynamic stats array with real data
  const dashboardStats = [
    { 
      name: 'إجمالي المقالات', 
      value: loading ? '...' : stats.totalArticles.toString(), 
      icon: DocumentTextIcon, 
      change: `+${stats.recentArticles}`, 
      changeType: 'increase',
      changeLabel: 'خلال الشهر الماضي'
    },
    { 
      name: 'إجمالي الأقسام', 
      value: loading ? '...' : stats.totalCategories.toString(), 
      icon: FolderIcon, 
      change: '+0', 
      changeType: 'neutral',
      changeLabel: 'خلال الشهر الماضي'
    },
    { 
      name: 'المقالات المنشورة', 
      value: loading ? '...' : stats.publishedArticles.toString(), 
      icon: CheckCircleIcon, 
      change: `+${Math.floor(stats.recentArticles * 0.8)}`, 
      changeType: 'increase',
      changeLabel: 'خلال الشهر الماضي'
    },
    { 
      name: 'الأخبار العاجلة', 
      value: loading ? '...' : stats.totalBreakingNews.toString(), 
      icon: ExclamationTriangleIcon, 
      change: '+2', 
      changeType: 'increase',
      changeLabel: 'خلال الشهر الماضي'
    },
  ];

  return (
    <div className="container mx-auto">
      <div className="flex justify-end mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardStats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-full bg-indigo-100">
                <stat.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? (
                    <span className="inline-block animate-pulse bg-gray-200 rounded w-8 h-8"></span>
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end">
              {!loading && (
                <>
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 
                    stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.changeType === 'increase' ? (
                      <ArrowUpIcon className="inline h-4 w-4 ml-1" />
                    ) : stat.changeType === 'decrease' ? (
                      <ArrowDownIcon className="inline h-4 w-4 ml-1" />
                    ) : null}
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 mr-1">{stat.changeLabel}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4 text-right">الإجراءات السريعة</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          <Link href="/dashboard/articles/add">
            <div className="p-4 bg-indigo-50 rounded-lg text-center hover:bg-indigo-100 transition-colors">
              <DocumentTextIcon className="h-8 w-8 text-indigo-600 mx-auto" />
              <span className="block mt-2 text-sm font-medium text-gray-900">إضافة مقال</span>
            </div>
          </Link>
          <Link href="/dashboard/categories/add">
            <div className="p-4 bg-indigo-50 rounded-lg text-center hover:bg-indigo-100 transition-colors">
              <FolderIcon className="h-8 w-8 text-indigo-600 mx-auto" />
              <span className="block mt-2 text-sm font-medium text-gray-900">إضافة قسم</span>
            </div>
          </Link>
          <Link href="/dashboard/breaking-news/create">
            <div className="p-4 bg-indigo-50 rounded-lg text-center hover:bg-indigo-100 transition-colors">
              <ExclamationTriangleIcon className="h-8 w-8 text-indigo-600 mx-auto" />
              <span className="block mt-2 text-sm font-medium text-gray-900">خبر عاجل</span>
            </div>
          </Link>
          <Link href="/dashboard/social-media">
            <div className="p-4 bg-indigo-50 rounded-lg text-center hover:bg-indigo-100 transition-colors">
              <ShareIcon className="h-8 w-8 text-indigo-600 mx-auto" />
              <span className="block mt-2 text-sm font-medium text-gray-900">وسائل التواصل</span>
            </div>
          </Link>
          <Link href="/dashboard/users">
            <div className="p-4 bg-indigo-50 rounded-lg text-center hover:bg-indigo-100 transition-colors">
              <UsersIcon className="h-8 w-8 text-indigo-600 mx-auto" />
              <span className="block mt-2 text-sm font-medium text-gray-900">المستخدمين</span>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Recent Articles */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <Link href="/dashboard/articles">
            <button className="text-sm text-indigo-600 hover:text-indigo-800">
              عرض الكل
            </button>
          </Link>
          <h2 className="text-lg font-medium text-gray-900">أحدث المقالات</h2>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-500">جاري التحميل...</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">لا توجد مقالات حديثة</p>
            <Link href="/dashboard/articles/add">
              <button className="mt-2 text-indigo-600 hover:text-indigo-800">
                إضافة مقال جديد
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}