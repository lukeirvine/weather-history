import { Suspense } from 'react';
import TableContent from '@/app/components/templates/table-content';

export default function TablePage() {
  return (
    <Suspense>
      <TableContent />
    </Suspense>
  );
}
