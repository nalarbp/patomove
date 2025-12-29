'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Bars3Icon, 
  ChartBarIcon,
  MagnifyingGlassIcon,
  DocumentPlusIcon,
  CpuChipIcon,
  ChartPieIcon,
  CogIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import ComponentFeedback from './ComponentFeedback';

interface SidebarNavItem {
  name: string;
  href: string;
  description: string;
  iconName: string;
}

interface MainNavItem {
  name: string;
  href: string;
  segment: string;
}

interface SidebarNavigationProps {
  title: string;
  items: SidebarNavItem[];
  mainNavItems: MainNavItem[];
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function SidebarNavigation({ title, items, mainNavItems, onCollapseChange }: SidebarNavigationProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  //load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      const collapsed = JSON.parse(savedState);
      setIsCollapsed(collapsed);
      onCollapseChange?.(collapsed);
    }
  }, [onCollapseChange]);

  //persist sidebar state to localStorage
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
    onCollapseChange?.(newState);
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  const isMainNavActive = (segment: string) => {
    return pathname.includes(`/${segment}`);
  };

  return (
    <>
      <ComponentFeedback componentName="SidebarNavigation" />
      
      {/*sidebar*/}
      <div className={`fixed left-0 top-0 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 sm:w-16 md:w-16 ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      } ${isCollapsed ? 'w-16' : 'w-64'} h-screen z-40`}>
        
        {/*header with logo and toggle*/}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <h1 className="text-lg font-bold text-gray-900">Patomove</h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block"
          >
            <Bars3Icon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/*sub navigation items - fills remaining space but allows bottom to stick*/}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const active = isActive(item.href);
            const IconComponent = getIconComponent(item.iconName);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <IconComponent className={`flex-shrink-0 h-5 w-5 ${
                  active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                
                {!isCollapsed && (
                  <div className="ml-3 flex-1 min-w-0">
                    <span className="block truncate">{item.name}</span>
                    {item.description && (
                      <span className={`block text-xs truncate mt-0.5 ${
                        active ? 'text-blue-500' : 'text-gray-400'
                      }`}>
                        {item.description}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/*bottom section - sticks to bottom*/}
        <div className="border-t border-gray-200 p-2">
          <div className="space-y-1">
            {/*main navigation (Path Lab/IPC)*/}
            {mainNavItems.map((item) => {
              const active = isMainNavActive(item.segment);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? `View as ${item.name}` : undefined}
                >
                  <div className={`flex-shrink-0 h-2 w-2 rounded-full ${
                    active ? 'bg-blue-500' : 'bg-gray-400 group-hover:bg-gray-500'
                  }`} />
                  
                  {!isCollapsed && (
                    <span className="ml-3 truncate">{item.name}</span>
                  )}
                </Link>
              );
            })}

            {/*divider*/}
            <div className="border-t border-gray-200 my-2"></div>

            {/*user avatar*/}
            <div className={`flex items-center px-3 py-2 text-sm text-gray-600 ${
              isCollapsed ? 'justify-center' : ''
            }`}>
              <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-gray-600" />
              </div>
              {!isCollapsed && (
                <span className="ml-3 truncate">User</span>
              )}
            </div>

            {/*settings*/}
            <button
              className={`w-full group flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title={isCollapsed ? 'Settings' : undefined}
            >
              <CogIcon className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              {!isCollapsed && (
                <span className="ml-3 truncate">Settings</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

//icon mapping helper for client-side use
function getIconComponent(iconName: string) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'chart-bar': ChartBarIcon,
    'magnifying-glass': MagnifyingGlassIcon,
    'document-plus': DocumentPlusIcon,
    'cpu-chip': CpuChipIcon,
    'chart-pie': ChartPieIcon,
  };
  return iconMap[iconName] || ChartBarIcon;
}

