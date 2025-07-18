
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Video, ScanSearch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Event } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function Events() {
    const [events, setEvents] = useState<Event[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedEvents = localStorage.getItem('events');
            if (storedEvents) {
                setEvents(JSON.parse(storedEvents));
            }
        } catch (error) {
            console.error("Failed to load events from localStorage", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not load past events.',
            });
        }
    }, [toast]);

    const getEventIcon = (type: Event['type']) => {
        switch (type) {
            case 'Recording':
                return <Video className="h-5 w-5 text-blue-400" />;
            case 'Object Detection':
                return <ScanSearch className="h-5 w-5 text-teal-400" />;
            default:
                return <History className="h-5 w-5" />;
        }
    }

    return (
        <div className="h-full w-full p-4 md:p-6 flex flex-col">
            <header className="flex items-center gap-4 mb-6 shrink-0">
                <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <History className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Event Log</h1>
                    <p className="text-muted-foreground">A log of all significant system events.</p>
                </div>
            </header>
            
            <div className="flex-grow overflow-hidden">
                {events.length > 0 ? (
                    <ScrollArea className="h-full pr-4">
                        <div className="space-y-6">
                            {events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(event => (
                                <div key={event.id} className="relative flex items-start gap-4">
                                    <div className="absolute left-[10px] top-[10px] h-full w-px bg-border -z-10" />
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-card z-10 mt-px">
                                        {getEventIcon(event.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="font-medium">{event.description}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{event.cameraName}</span>
                                            <Badge variant={event.type === 'Recording' ? 'default' : 'secondary'} className="bg-opacity-20 border-opacity-40">{event.type}</Badge>
                                            <span>&middot;</span>
                                            <p title={new Date(event.timestamp).toLocaleString()}>
                                                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg bg-card/50">
                        <History className="h-16 w-16 text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold">No Events Found</h2>
                        <p className="text-muted-foreground mt-2">
                            Events will appear here as they happen, such as when recordings are saved.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
