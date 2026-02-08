'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ShareIcon
} from '@heroicons/react/24/outline';

interface SocialMedia {
  socialMediaId: number;
  iconName: string;
  link: string;
  imagePath?: string;
  isActivated: boolean;
}

export default function SocialMediaManagement() {
  const [socialMedias, setSocialMedias] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSocialMedias();
  }, []);

  const fetchSocialMedias = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tajdeediq-001-site1.stempurl.com';
      const response = await fetch(`${apiUrl}/api/SocialMedia`);
      if (!response.ok) {
        throw new Error('Failed to fetch social media');
      }
      const data = await response.json();
      setSocialMedias(data);
    } catch (err) {
      setError('فشل في تحميل وسائل التواصل الاجتماعي');
      console.error('Error fetching social media:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivation = async (id: number, currentStatus: boolean) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tajdeediq-001-site1.stempurl.com';
      const response = await fetch(`${apiUrl}/api/SocialMedia/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          socialMediaId: id,
          isActivated: !currentStatus
        }),
      });

      if (response.ok) {
        setSocialMedias(prevSocialMedias =>
          prevSocialMedias.map(sm =>
            sm.socialMediaId === id ? { ...sm, isActivated: !currentStatus } : sm
          )
        );
      } else {
        throw new Error('Failed to update social media');
      }
    } catch (err) {
      setError('فشل في تحديث حالة وسيلة التواصل');
      console.error('Error updating social media:', err);
    }
  };

  const deleteSocialMedia = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف وسيلة التواصل هذه؟')) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tajdeediq-001-site1.stempurl.com';
      const response = await fetch(`${apiUrl}/api/SocialMedia/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSocialMedias(prevSocialMedias =>
          prevSocialMedias.filter(sm => sm.socialMediaId !== id)
        );
      } else {
        throw new Error('Failed to delete social media');
      }
    } catch (err) {
      setError('فشل في حذف وسيلة التواصل');
      console.error('Error deleting social media:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="mr-2">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard/social-media/add">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center">
            <PlusIcon className="h-5 w-5 ml-2" />
            إضافة وسيلة تواصل
          </button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800">إدارة وسائل التواصل الاجتماعي</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {socialMedias.length === 0 ? (
          <div className="text-center py-12">
            <ShareIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد وسائل تواصل اجتماعي</p>
            <Link href="/dashboard/social-media/add">
              <button className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                إضافة وسيلة التواصل الأولى
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    إجراءات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الرابط
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الأيقونة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاسم
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {socialMedias.map((socialMedia) => (
                  <tr key={socialMedia.socialMediaId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => deleteSocialMedia(socialMedia.socialMediaId)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="حذف"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                        <Link href={`/dashboard/social-media/edit/${socialMedia.socialMediaId}`}>
                          <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" title="تعديل">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleActivation(socialMedia.socialMediaId, socialMedia.isActivated)}
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                          socialMedia.isActivated 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {socialMedia.isActivated ? 'مفعل' : 'غير مفعل'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <a 
                        href={socialMedia.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline truncate block"
                        title={socialMedia.link}
                      >
                        {socialMedia.link}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center justify-center">
                        {socialMedia.imagePath ? (
                          <img
                            src={`https://tajdeediq-001-site1.stempurl.com${socialMedia.imagePath}`}
                            alt={socialMedia.iconName}
                            className="w-10 h-10 rounded-lg object-cover shadow-sm border border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold border border-gray-200 shadow-sm ${socialMedia.imagePath ? 'hidden' : ''}`}>
                          {socialMedia.iconName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {socialMedia.iconName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}