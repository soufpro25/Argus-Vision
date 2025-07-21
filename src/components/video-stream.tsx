
"use client";

import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface VideoStreamProps {
  streamUrl: string;
  thumbnailUrl: string;
}

export interface VideoStreamRef {
  captureFrame: () => string | null;
}

export const VideoStream = forwardRef<VideoStreamRef, VideoStreamProps>(
  ({ streamUrl, thumbnailUrl }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isError, setIsError] = useState(false);

    useImperativeHandle(ref, () => ({
      captureFrame: () => {
        if (videoRef.current && !isError && videoRef.current.readyState >= 2) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg');
          }
        }
        // Fallback to thumbnail if video isn't ready or has failed
        return thumbnailUrl;
      },
    }));
    
    useEffect(() => {
      if (videoRef.current) {
        console.info(`Attempting to play stream: ${streamUrl}. A media server is required to convert RTSP for web playback.`);
        
        // For demo purposes, we use a public MP4 file.
        // In a real scenario, this would be an HLS or DASH stream URL from a media server.
        const demoVideoUrl = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        
        const videoElement = videoRef.current;
        videoElement.src = demoVideoUrl;
        videoElement.loop = true;
        videoElement.muted = true;
        videoElement.crossOrigin = 'anonymous';

        videoElement.addEventListener('error', () => {
            console.error(`Error playing video stream from: ${demoVideoUrl}`);
            setIsError(true);
        });

        videoElement.play().catch(error => {
            console.error('Autoplay was prevented.', error);
            // We don't set isError here, as the user might still be able to play it manually if we had controls.
            // For a background video, this might just mean it won't autoplay.
        });
      }
    }, [streamUrl]);

    if (isError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground">
          <Image
            src={thumbnailUrl}
            alt="Video feed fallback"
            data-ai-hint="security camera"
            width={800}
            height={600}
            className="object-cover w-full h-full"
            priority
          />
          <div className="absolute bottom-2 left-2 bg-destructive/80 text-destructive-foreground text-xs px-2 py-1 rounded">
            Live feed failed. Showing thumbnail.
          </div>
        </div>
      );
    }

    return (
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        poster={thumbnailUrl}
      />
    );
  }
);

VideoStream.displayName = 'VideoStream';
