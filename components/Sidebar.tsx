'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  FolderIcon, 
  TagIcon,
  UsersIcon, 
  CogIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  ShareIcon,
  MegaphoneIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  FilmIcon,
  MusicalNoteIcon,
  ChartBarIcon,
  BookOpenIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navigation = [
    // { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: "الرئيسية", href: "/dashboard", icon: HomeIcon },
    // { name: 'Articles', href: '/dashboard/articles', icon: DocumentTextIcon },
    { name: "الأخبار", href: "/dashboard/articles", icon: DocumentTextIcon },
    // { name: 'Categories', href: '/dashboard/categories', icon: FolderIcon },
    { name: "الأقسام", href: "/dashboard/categories", icon: FolderIcon },
    { name: "وسوم", href: "/dashboard/tags", icon: TagIcon },
    {
      name: "المقالات في الأعلى",
      href: "/dashboard/upper-articles",
      icon: ChevronUpIcon,
    },
    {
      name: "الأخبار العاجلة",
      href: "/dashboard/breaking-news",
      icon: ExclamationTriangleIcon,
    },
    { name: "وسائل التواصل", href: "/dashboard/social-media", icon: ShareIcon },
    { name: "إنفوجرافيك", href: "/dashboard/infographics", icon: ChartBarIcon },
    { name: "البودكاست", href: "/dashboard/podcasts", icon: MusicalNoteIcon },
    { name: "الفيديوهات", href: "/dashboard/videos", icon: FilmIcon },
    {
      name: "الذاكرة السياسية",
      href: "/dashboard/political-memory",
      icon: BookOpenIcon,
    },
    {
      name: "المقالات",
      href: "/dashboard/authors-articles",
      icon: DocumentTextIcon,
    },
    { name: "كاريكاتير", href: "/dashboard/caricatures", icon: PencilSquareIcon },
    { name: "الكتاب", href: "/dashboard/authors", icon: DocumentTextIcon },
    {
      name: "أعلن معنا",
      href: "/dashboard/advertise-with-us",
      icon: MegaphoneIcon,
    },
    {
      name: "مدد الإعلان",
      href: "/dashboard/advertise-with-us/durations",
      icon: ClockIcon,
    },
    {
      name: "تواصل معنا",
      href: "/dashboard/contact-us",
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: "عن جريدة تجديد",
      href: "/dashboard/about-us",
      icon: InformationCircleIcon,
    },
    {
      name: "سياسة الخصوصية",
      href: "/dashboard/privacy-policy",
      icon: ShieldCheckIcon,
    },

    { name: "المستخدمون", href: "/dashboard/users", icon: UsersIcon },
    { name: "الإعدادات", href: "/dashboard/settings", icon: CogIcon },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <span className="text-white text-xl font-semibold">لوحة التحكم</span>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md text-right`}
              >
                {/* <div className="flex items-center justify-between w-full"> */}
                <div className="flex items-center justify-between w-full">
                  <item.icon
                    className={`${
                      isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                    } flex-shrink-0 h-6 w-6`}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}