
"use client";

import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ShieldAlert } from 'lucide-react';
import Hls from 'hls.js';

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
        return thumbnailUrl;
      },
    }));
    
    useEffect(() => {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      setIsError(false);
      let hls: Hls | null = null;

      const onError = () => {
        console.warn(`Could not play video stream from: ${streamUrl}. This is expected for non-web formats like RTSP. Falling back to thumbnail.`);
        setIsError(true);
      };

      if (streamUrl.endsWith('.m3u8')) {
        if (Hls.isSupported()) {
          console.info('HLS stream detected. Attempting to play with hls.js.');
          hls = new Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(videoElement);
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error('HLS.js fatal error:', data);
              onError();
            }
          });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          console.info('HLS supported natively by browser.');
          videoElement.src = streamUrl;
        } else {
           onError();
        }
      } else {
        console.info(`Attempting to play direct stream: ${streamUrl}. For this to work, it must be in a web-compatible format (not RTSP).`);
        videoElement.src = streamUrl;
      }
      
      videoElement.loop = true;
      videoElement.muted = true;
      videoElement.crossOrigin = 'anonymous';
      videoElement.addEventListener('error', onError);

      videoElement.play().catch(error => {
          console.warn('Autoplay was prevented or failed for the stream.', error);
      });

      return () => {
          if (hls) {
            hls.destroy();
          }
          videoElement.removeEventListener('error', onError);
      }
    }, [streamUrl]);

    if (isError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground relative">
          <Image
            src={thumbnailUrl}
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
                <p className="text-xs text-white/80">Browser cannot play this stream. Ensure it's a web-friendly format (not RTSP).</p>
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
