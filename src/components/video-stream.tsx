"use client";

import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface VideoStreamProps {
  streamUrl: string;
  thumbnailUrl: string;
}

export const VideoStream = forwardRef<{ 
  captureFrame: () => string | null;
  startRecording: () => void;
  stopRecording: () => Promise<string | null>;
}, VideoStreamProps>(
  ({ streamUrl, thumbnailUrl }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
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
      startRecording: () => {
        if (videoRef.current && videoRef.current.srcObject && !isError) {
            recordedChunksRef.current = [];
            const stream = videoRef.current.srcObject as MediaStream;
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };
            mediaRecorderRef.current.start();
        }
      },
      stopRecording: () => {
        return new Promise((resolve) => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.readAsDataURL(blob);
                };
                mediaRecorderRef.current.stop();
            } else {
                resolve(null);
            }
        });
      }
    }));
    
    useEffect(() => {
        console.info(`Attempting to play stream: ${streamUrl}. A media server is required to convert RTSP for web playback.`);
        
        async function setupVideoStream() {
            if (videoRef.current) {
                try {
                    // Using a public video stream for demo purposes
                    const demoVideoUrl = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
                    
                    // To enable recording, we need a MediaStream.
                    // We'll play the video in a hidden element and capture its stream.
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
