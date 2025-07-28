
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
        // Construct the HLS stream URL using environment variables for configuration.
        const streamHost = process.env.NEXT_PUBLIC_STREAMING_HOST || `http://localhost`;
        const streamPort = process.env.NEXT_PUBLIC_STREAMING_PORT || '8080';
        const constructedUrl = `${streamHost}:${streamPort}/${camera.id}/stream.m3u8`;
        setHlsUrl(constructedUrl);
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
        hls = new Hls({
            startLevel: -1, 
            fragLoadingMaxRetry: 4,
            manifestLoadingMaxRetry: 4,
        });
        hls.loadSource(hlsUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('HLS.js fatal error:', data.type, data.details);
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
      videoElement.playsInline = true;
      videoElement.crossOrigin = 'anonymous';
      videoElement.addEventListener('error', onError);

      videoElement.play().catch(error => {
          console.warn('Autoplay was prevented for the HLS stream.', error);
          // Muting is often required for autoplay to work
          videoElement.muted = true;
          videoElement.play().catch(finalError => {
            console.error('Final autoplay attempt failed.', finalError);
          });
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
                <p className="text-xs text-white/80">Check camera stream and manager script.</p>
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
