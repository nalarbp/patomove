import SubNavigation from '@/components/SubNavigation';

const pathLabNavItems = [
  {
    name: 'Dashboard',
    href: '/path-lab/dashboard',
    description: 'Sample overview'
  },
  {
    name: 'Browse Isolates',
    href: '/path-lab/isolates',
    description: 'Search and filter isolates'
  },
  {
    name: 'Sample Management',
    href: '/path-lab/samples',
    description: 'Add, import & manage isolates'
  },
  {
    name: 'Analytics',
    href: '/path-lab/analytics',
    description: 'Genomic insights & patterns'
  }
];

export default function PathLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SubNavigation title="Laboratory Operations" items={pathLabNavItems} />
      <div className="py-6">
        {children}
      </div>
    </>
  );
}