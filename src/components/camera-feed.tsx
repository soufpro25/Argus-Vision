
"use client";

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Expand, Minimize, ScanSearch } from 'lucide-react';
import type { Camera } from '@/lib/types';
import { VideoStream, type VideoStreamRef } from './video-stream';
import { useAuth } from '@/hooks/use-auth';

interface CameraFeedProps {
  camera: Camera;
  onFullscreen: (camera: Camera) => void;
  onDetectObjects: (camera: Camera) => void;
}

export interface CameraFeedHandle {
  captureFrame: () => string | null;
}

export const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(
  ({ camera, onFullscreen, onDetectObjects }, ref) => {
    const videoStreamRef = useRef<VideoStreamRef>(null);
    const { user } = useAuth();

    useImperativeHandle(ref, () => ({
      captureFrame: () => {
        return videoStreamRef.current?.captureFrame() ?? null;
      }
    }));

    return (
      <Card className="flex flex-col h-full w-full bg-card border-0 shadow-none rounded-2xl overflow-hidden relative">
        <CardContent className="p-0 flex-grow relative group/feed">
          <VideoStream ref={videoStreamRef} camera={camera} />
          <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="bg-black/50 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full">{camera.name}</div>
          </div>
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover/feed:opacity-100 transition-opacity duration-300">
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full" onClick={() => onFullscreen(camera)}>
                  <Expand className="h-4 w-4" />
                  <span className="sr-only">Fullscreen</span>
              </Button>
               {user?.role === 'admin' && (
                 <Button variant="ghost" size="icon" className="h-9 w-9 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full" onClick={() => onDetectObjects(camera)}>
                    <ScanSearch className="h-4 w-4" />
                    <span className="sr-only">Detect Objects</span>
                </Button>
               )}
          </div>
        </CardContent>
      </Card>
    );
  }
);
CameraFeed.displayName = 'CameraFeed';


export function FullscreenView({ camera, onClose }: { camera: Camera, onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in fade-in">
            <div className="flex items-center justify-between p-4 bg-transparent">
                <h2 className="text-xl font-bold">{camera.name} - Fullscreen</h2>
                <Button variant="outline" size="icon" onClick={onClose} className="rounded-full">
                    <Minimize className="h-6 w-6" />
                    <span className="sr-only">Close Fullscreen</span>
                </Button>
            </div>
            <div className="flex-grow relative p-4 pt-0">
                <VideoStream camera={camera} />
            </div>
        </div>
    );
}
