"use client";

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Expand, Minimize, ScanSearch } from 'lucide-react';
import type { Camera } from '@/lib/types';
import { VideoStream } from './video-stream';

interface CameraFeedProps {
  camera: Camera;
  onFullscreen: (camera: Camera) => void;
  onDetect: (camera: Camera, frame: string | null) => void;
}

export function CameraFeed({ camera, onFullscreen, onDetect }: CameraFeedProps) {
  const videoStreamRef = useRef<{ captureFrame: () => string | null }>(null);

  const handleDetect = () => {
    if (videoStreamRef.current) {
        const frame = videoStreamRef.current.captureFrame();
        onDetect(camera, frame);
    }
  };

  return (
    <Card className="flex flex-col h-full bg-card/50 hover:shadow-accent/10 hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <CardTitle className="text-base font-medium">{camera.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow relative">
        <VideoStream ref={videoStreamRef} streamUrl={camera.streamUrl} thumbnailUrl={camera.thumbnailUrl} />
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/40 hover:bg-black/60 text-white" onClick={() => onFullscreen(camera)}>
                <Expand className="h-4 w-4" />
                <span className="sr-only">Fullscreen</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/40 hover:bg-black/60 text-white" onClick={handleDetect}>
                <ScanSearch className="h-4 w-4" />
                <span className="sr-only">Detect Objects</span>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function FullscreenView({ camera, onClose }: { camera: Camera, onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in fade-in">
            <div className="flex items-center justify-between p-4 bg-card-foreground/5">
                <h2 className="text-xl font-bold">{camera.name} - Fullscreen</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <Minimize className="h-6 w-6" />
                    <span className="sr-only">Close Fullscreen</span>
                </Button>
            </div>
            <div className="flex-grow relative p-4">
                <VideoStream streamUrl={camera.streamUrl} thumbnailUrl={camera.thumbnailUrl} />
            </div>
        </div>
    );
}
