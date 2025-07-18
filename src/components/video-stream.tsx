
"use client";

import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface VideoStreamProps {
  streamUrl: string;
  thumbnailUrl: string;
}

export const VideoStream = forwardRef<{ 
  captureFrame: () => string | null;
}, VideoStreamProps>(
  ({ streamUrl, thumbnailUrl }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isError, setIsError] = useState(false);

    useImperativeHandle(ref, () => ({
      captureFrame: () => {
        if (videoRef.current && !isError) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg');
          }
        }
        return null;
      },
    }));
    
    useEffect(() => {
        console.info(`Attempting to play stream: ${streamUrl}. A media server is required to convert RTSP for web playback.`);
        
        async function setupVideoStream() {
            if (videoRef.current) {
                try {
                    const demoVideoUrl = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
                    
                    const sourceVideo = document.createElement('video');
                    sourceVideo.src = demoVideoUrl;
                    sourceVideo.crossOrigin = 'anonymous';
                    sourceVideo.loop = true;
                    sourceVideo.muted = true;
                    
                    sourceVideo.onerror = () => {
                        console.error("Error playing the source video.");
                        setIsError(true);
                    };

                    await sourceVideo.play();
                    
                    const stream = (sourceVideo as any).captureStream();
                    
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.addEventListener('error', () => setIsError(true));
                    }

                } catch (e) {
                    console.error("Failed to setup video stream:", e);
                    setIsError(true);
                }
            }
        }
        
        setupVideoStream();

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

    