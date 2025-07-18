
"use client";

import Playback from '@/components/playback';
import { getRecordings } from '@/lib/storage';

export default function PlaybackPage() {
  const recordings = typeof window !== 'undefined' ? getRecordings() : [];
  return <Playback recordings={recordings} />;
}

    