'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ComponentFeedback from './ComponentFeedback';

interface SubNavItem {
  name: string;
  href: string;
  description: string;
}

interface SubNavigationProps {
  title: string;
  items: SubNavItem[];
}

export default function SubNavigation({ title, items }: SubNavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="relative bg-white border-b border-gray-200">
      <ComponentFeedback componentName="SubNavigation" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
          
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group inline-flex flex-col py-4 px-1 border-b-2 font-medium ${
                      active
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm">{item.name}</span>
                    {item.description && (
                      <span className={`text-xs mt-1 ${
                        active ? 'text-blue-500' : 'text-gray-400'
                      }`}>
                        {item.description}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}