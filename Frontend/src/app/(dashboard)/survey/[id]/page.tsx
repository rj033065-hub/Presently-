'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function SurveyByIdPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/survey?id=${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="animate-pulse text-sm text-zinc-500">Loading survey draft...</div>
    </div>
  );
}
