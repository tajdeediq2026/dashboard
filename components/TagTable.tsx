import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Tag } from '../app/dashboard/articles/types/Tag';
import EmptyState from './EmptyState';

interface TagTableProps {
  tags: Tag[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TagTable({ tags, onEdit, onDelete }: TagTableProps) {
  if (tags.length === 0) {
    return (
      <EmptyState
        title="لا توجد وسوم"
        description="ابدأ بإنشاء وسمك الأول لتصنيف المقالات بشكل أفضل"
        actionLabel="إضافة وسم جديد"
        actionHref="/dashboard/tags/add"
        icon={
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        }
      />
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              اسم الوسم
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              الإجراءات
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tags.map((tag) => (
            <tr key={tag.tagId} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-custom-green-100 text-custom-green-dark">
                  {tag.tagName}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => onEdit(tag.tagId)}
                    className="text-custom-green hover:text-custom-green-dark p-1 rounded-full hover:bg-custom-green-50 transition-colors"
                    aria-label="تعديل الوسم"
                    title="تعديل"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(tag.tagId)}
                    className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                    aria-label="حذف الوسم"
                    title="حذف"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
