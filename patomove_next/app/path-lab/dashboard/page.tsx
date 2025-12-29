import SampleQueue from '@/components/SampleQueue';
import ProcessingStats from '@/components/ProcessingStats';

export default function PathLabDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <ProcessingStats />
          <SampleQueue />
        </div>
      </div>
    </div>
  );
}