'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FractalVisualization from '@/components/FractalVisualization';
import { DataLoader } from '@/lib/data-provider';

type ViewMode = 'mandala' | 'fractal' | 'constellation' | 'flow';

function EmbedContent() {
  const searchParams = useSearchParams();

  // Configurable via URL params
  const viewParam = searchParams.get('view');
  const view: ViewMode = (['mandala', 'fractal', 'constellation', 'flow'] as const).includes(
    viewParam as ViewMode
  )
    ? (viewParam as ViewMode)
    : 'mandala';
  const controls = searchParams.get('controls') !== 'false';

  return (
    <div className="w-full h-screen bg-[#0a0a12]">
      <FractalVisualization
        initialView={view}
        showControls={controls}
        className="h-full"
      />
    </div>
  );
}

export default function EmbedPage() {
  return (
    <DataLoader>
      <Suspense fallback={
        <div className="w-full h-screen bg-[#0a0a12] flex items-center justify-center">
          <div className="text-amber-400/50 text-sm">Loading...</div>
        </div>
      }>
        <EmbedContent />
      </Suspense>
    </DataLoader>
  );
}
