'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MintStatusBanner() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const mint = searchParams.get('mint');
    if (mint === 'admin') setShow(true);
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="p-4 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm">
      Admin mint triggered. In a production app, this would call an admin-only contract function.
    </div>
  );
}
