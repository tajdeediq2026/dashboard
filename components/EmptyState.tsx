import React from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  actionHref,
  icon
}) => {
  const defaultIcon = (
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
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-12 text-center">
      <div className="max-w-md mx-auto">
        {icon || defaultIcon}
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6">{description}</p>
        <Link
          href={actionHref}
          className="inline-flex items-center px-6 py-3 bg-custom-green text-white rounded-md hover:bg-custom-green-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-green transition-colors"
        >
          <PlusIcon className="h-5 w-5 ml-2" />
          {actionLabel}
        </Link>
      </div>
    </div>
  );
};

export default EmptyState;
