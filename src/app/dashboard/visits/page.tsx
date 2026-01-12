import { Suspense } from 'react';
import VisitsClient from './VisitsClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Loading visits…</div>}>
      <VisitsClient />
    </Suspense>
  );
}