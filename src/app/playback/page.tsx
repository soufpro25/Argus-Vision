
"use client";

import Playback from '@/components/playback';
import { getRecordings } from '@/lib/storage';
import { useState, useEffect } from 'react';
import type { Recording } from '@/lib/types';

export default function PlaybackPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);

  useEffect(() => {
    setRecordings(getRecordings());
  }, []);
  
  return <Playback recordings={recordings} />;
}
