"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { History, Video, ScanSearch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Event } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

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
    }, []);

    const getEventIcon = (type: Event['type']) => {
        switch (type) {
            case 'Recording':
                return <Video className="h-5 w-5 text-primary" />;
            case 'Object Detection':
                return <ScanSearch className="h-5 w-5 text-accent" />;
            default:
                return <History className="h-5 w-5" />;
        }
    }

    return (
        <div className="h-full w-full p-4 md:p-6">
            <div className="flex items-center gap-4 mb-6">
                <History className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Events</h1>
                    <p className="text-muted-foreground">A log of all significant system events.</p>
                </div>
            </div>
            
            {events.length > 0 ? (
                 <ScrollArea className="h-[calc(100vh-150px)]">
                    <div className="space-y-4">
                        {events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(event => (
                            <Card key={event.id} className="overflow-hidden">
                                <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                                     {getEventIcon(event.type)}
                                     <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">{event.description}</p>
                                            <p className="text-sm text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
                                        </div>
                                         <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <span>{event.cameraName}</span>
                                            <Badge variant="outline">{event.type}</Badge>
                                         </div>
                                     </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
                    <History className="h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold">No Events Found</h2>
                    <p className="text-muted-foreground mt-2">
                        Events will appear here as they happen, such as when recordings are saved.
                    </p>
                </div>
            )}
        </div>
    );
}
