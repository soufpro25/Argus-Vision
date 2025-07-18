"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, ListVideo } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Recording } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';

export default function Playback() {
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedRecordings = localStorage.getItem('recordings');
            if (storedRecordings) {
                setRecordings(JSON.parse(storedRecordings));
            }
        } catch (error) {
            console.error("Failed to load recordings from localStorage", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not load past recordings.',
            });
        }
    }, [toast]);

    const handlePlayRecording = (recording: Recording) => {
        setSelectedRecording(recording);
        setIsPlayerOpen(true);
    };

    return (
        <div className="h-full w-full p-4 md:p-6 flex flex-col">
            <header className="flex items-center gap-4 mb-6 shrink-0">
                <ListVideo className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Playback</h1>
                    <p className="text-muted-foreground">Review and watch recorded video clips.</p>
                </div>
            </header>
            
            <div className="flex-grow overflow-hidden">
            {recordings.length > 0 ? (
                 <ScrollArea className="h-full pr-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {recordings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(rec => (
                            <Card key={rec.id} className="overflow-hidden flex flex-col group bg-card hover:border-primary/50 transition-colors">
                                 <div className="relative aspect-video overflow-hidden">
                                    <video
                                        src={rec.videoDataUri}
                                        className="w-full h-full object-cover"
                                        muted
                                        preload="metadata"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" className="h-14 w-14 rounded-full" onClick={() => handlePlayRecording(rec)}>
                                            <PlayCircle className="h-8 w-8" />
                                        </Button>
                                    </div>
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-lg truncate">{rec.title}</CardTitle>
                                    <CardDescription>{new Date(rec.timestamp).toLocaleString()}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-2">
                                    <p className="text-sm text-muted-foreground line-clamp-3">{rec.summary}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg bg-card">
                    <ListVideo className="h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold">No Recordings Found</h2>
                    <p className="text-muted-foreground mt-2">
                        Go to the Live View and press the record button on a camera feed to create a clip.
                    </p>
                </div>
            )}
            </div>
            
            <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{selectedRecording?.title}</DialogTitle>
                    </DialogHeader>
                    {selectedRecording?.videoDataUri && (
                         <video
                            src={selectedRecording.videoDataUri}
                            className="w-full aspect-video rounded-md"
                            controls
                            autoPlay
                         />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
