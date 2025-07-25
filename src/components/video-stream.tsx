
"use client";

import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ShieldAlert } from 'lucide-react';
import Hls from 'hls.js';
import type { Camera } from '@/lib/types';

interface VideoStreamProps {
  camera: Camera;
}

export interface VideoStreamRef {
  captureFrame: () => string | null;
}

export const VideoStream = forwardRef<VideoStreamRef, VideoStreamProps>(
  ({ camera }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isError, setIsError] = useState(false);
    const [hlsUrl, setHlsUrl] = useState('');

    useEffect(() => {
        // Construct the HLS stream URL based on the camera ID and the current window's hostname.
        // This assumes the Python manager script is running on the same network.
        if (typeof window !== 'undefined') {
            const serverIp = window.location.hostname; // Assumes manager is on the same machine as the user is accessing from
            setHlsUrl(`http://${serverIp}:8080/${camera.id}/stream.m3u8`);
        }
    }, [camera.id]);


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
        return camera.thumbnailUrl;
      },
    }));
    
    useEffect(() => {
      if (!hlsUrl) return;

      const videoElement = videoRef.current;
      if (!videoElement) return;

      setIsError(false);
      let hls: Hls | null = null;
      
      const onError = () => {
        console.warn(`Could not play HLS stream from: ${hlsUrl}. Check if the camera manager script is running.`);
        setIsError(true);
      };

      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(hlsUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('HLS.js fatal error:', data);
            onError();
          }
        });
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = hlsUrl;
      } else {
         onError();
      }
      
      videoElement.loop = true;
      videoElement.muted = true;
      videoElement.crossOrigin = 'anonymous';
      videoElement.addEventListener('error', onError);

      videoElement.play().catch(error => {
          console.warn('Autoplay was prevented for the HLS stream.', error);
      });

      return () => {
          if (hls) {
            hls.destroy();
          }
          if (videoElement) {
            videoElement.removeEventListener('error', onError);
          }
      }
    }, [hlsUrl]);

    if (isError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground relative">
          <Image
            src={camera.thumbnailUrl}
            alt="Video feed fallback"
            data-ai-hint="security camera"
            layout="fill"
            objectFit="cover"
            className="w-full h-full"
            priority
          />
           <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4 text-center">
                <ShieldAlert className="h-10 w-10 text-destructive mb-2" />
                <p className="font-semibold text-white">Live Feed Unavailable</p>
                <p className="text-xs text-white/80">Check if the camera manager script is running on your server.</p>
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
        poster={camera.thumbnailUrl}
      />
    );
  }
);

VideoStream.displayName = 'VideoStream';
