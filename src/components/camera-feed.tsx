"use client";

import { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Expand, Minimize, ScanSearch, CircleDot } from 'lucide-react';
import type { Camera } from '@/lib/types';
import { VideoStream } from './video-stream';

interface CameraFeedProps {
  camera: Camera;
  onFullscreen: (camera: Camera) => void;
  onDetect: (camera: Camera, frame: string | null) => void;
  onRecord: (camera: Camera, videoUri: string) => void;
}

export function CameraFeed({ camera, onFullscreen, onDetect, onRecord }: CameraFeedProps) {
  const videoStreamRef = useRef<{ 
    captureFrame: () => string | null;
    startRecording: () => void;
    stopRecording: () => Promise<string | null>;
  }>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleDetect = () => {
    if (videoStreamRef.current) {
        const frame = videoStreamRef.current.captureFrame();
        onDetect(camera, frame);
    }
  };

  const handleToggleRecord = async () => {
    if (!videoStreamRef.current) return;

    if (isRecording) {
      const videoUri = await videoStreamRef.current.stopRecording();
      setIsRecording(false);
      if (videoUri) {
        onRecord(camera, videoUri);
      }
    } else {
      videoStreamRef.current.startRecording();
      setIsRecording(true);
    }
  };

  return (
    <Card className="flex flex-col h-full w-full bg-card border-0 shadow-none rounded-2xl overflow-hidden relative">
      <CardContent className="p-0 flex-grow relative group/feed">
        <VideoStream ref={videoStreamRef} streamUrl={camera.streamUrl} thumbnailUrl={camera.thumbnailUrl} />
        <div className="absolute top-3 left-3 flex items-center gap-2">
            <div className="bg-black/50 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full">{camera.name}</div>
            {isRecording && (
                <div className="flex items-center gap-2 text-destructive animate-pulse bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                    <CircleDot className="h-3 w-3 fill-current" />
                    <span className="text-sm font-medium">REC</span>
                </div>
            )}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover/feed:opacity-100 transition-opacity duration-300">
            <Button variant="ghost" size="icon" className="h-9 w-9 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full" onClick={() => onFullscreen(camera)}>
                <Expand className="h-4 w-4" />
                <span className="sr-only">Fullscreen</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full" onClick={handleDetect}>
                <ScanSearch className="h-4 w-4" />
                <span className="sr-only">Detect Objects</span>
            </Button>
             <Button 
                variant="ghost" 
                size="icon" 
                className={`h-9 w-9 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full text-white ${isRecording ? 'text-destructive hover:text-destructive' : ''}`} 
                onClick={handleToggleRecord}
              >
                <CircleDot className="h-4 w-4" />
                <span className="sr-only">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

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
                <VideoStream streamUrl={camera.streamUrl} thumbnailUrl={camera.thumbnailUrl} />
            </div>
        </div>
    );
}
