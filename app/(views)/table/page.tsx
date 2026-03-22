import { Suspense } from 'react';
import TableContent from '@/app/components/table-content';

export default function TablePage() {
  return (
    <Suspense>
      <TableContent />
    </Suspense>
  );
}
