'use client';

import { useState } from 'react';
import SidebarNavigation from '@/components/SidebarNavigation';

const mainNavItems = [
  {
    name: 'Path Lab',
    href: '/path-lab/dashboard',
    segment: 'path-lab'
  },
  {
    name: 'IPC',
    href: '/ipc/dashboard', 
    segment: 'ipc'
  }
];

const pathLabNavItems = [
  {
    name: 'Dashboard',
    href: '/path-lab/dashboard',
    description: 'Sample overview',
    iconName: 'chart-bar'
  },
  {
    name: 'Browse Isolates',
    href: '/path-lab/isolates',
    description: 'Search and filter isolates',
    iconName: 'magnifying-glass'
  },
  {
    name: 'Sample Management',
    href: '/path-lab/samples',
    description: 'Add, import & manage isolates',
    iconName: 'document-plus'
  },
  {
    name: 'Genome Management',
    href: '/path-lab/genomes',
    description: 'Upload & manage genome files',
    iconName: 'cpu-chip'
  },
  {
    name: 'Analytics',
    href: '/path-lab/analytics',
    description: 'Genomic insights & patterns',
    iconName: 'chart-pie'
  }
];

export default function PathLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen">
      <SidebarNavigation 
        title="Laboratory Operations" 
        items={pathLabNavItems} 
        mainNavItems={mainNavItems}
        onCollapseChange={setSidebarCollapsed}
      />
      <div className={`transition-all duration-300 ${
        sidebarCollapsed 
          ? 'pl-16' 
          : 'pl-16 lg:pl-64'
      }`}>
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}