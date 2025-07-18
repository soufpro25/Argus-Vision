"use client";

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { Aperture, History, LayoutGrid, ScanSearch, Settings, Wand2, Loader2, ListVideo } from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockCameras, mockLayouts } from '@/lib/mock-data';
import type { Camera, Layout, Recording, Event } from '@/lib/types';
import { CameraFeed, FullscreenView } from '@/components/camera-feed';
import { LayoutManager } from '@/components/layout-manager';
import { ObjectDetectionPanel } from '@/components/object-detection-panel';
import { useToast } from '@/hooks/use-toast';
import { summarizeRecordingAction } from '../actions';
import { getCameras, getLayouts } from '@/lib/storage';

export default function Dashboard() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [activeLayout, setActiveLayout] = useState<Layout | null>(null);
  const [fullscreenCamera, setFullscreenCamera] = useState<Camera | null>(null);
  const [isLayoutManagerOpen, setIsLayoutManagerOpen] = useState(false);
  const [isObjectDetectorOpen, setIsObjectDetectorOpen] = useState(false);
  const [detectionData, setDetectionData] = useState<{camera: Camera, frame: string | null} | null>(null);
  const [isRecordingPending, startRecordingTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    const loadedCameras = getCameras();
    const loadedLayouts = getLayouts();
    setCameras(loadedCameras);
    setLayouts(loadedLayouts);
    if (loadedLayouts.length > 0) {
      setActiveLayout(loadedLayouts[0]);
    } else if (loadedCameras.length > 0) {
      // Create a default layout if none exist
      const defaultLayout: Layout = {
        id: 'layout-default',
        name: 'Default View',
        grid: {
          rows: 1,
          cols: 1,
          cameras: [loadedCameras[0].id]
        }
      };
      setActiveLayout(defaultLayout);
      setLayouts([defaultLayout]);
    }
  }, []);

  const handleLayoutChange = (layoutId: string) => {
    const newLayout = layouts.find(l => l.id === layoutId);
    if (newLayout) {
      setActiveLayout(newLayout);
    }
  };

  const handleSaveLayout = (newLayout: Layout) => {
    const newLayouts = [...layouts, newLayout];
    setLayouts(newLayouts);
    localStorage.setItem('layouts', JSON.stringify(newLayouts));
    setActiveLayout(newLayout);
    setIsLayoutManagerOpen(false);
  };
  
  const handleOpenDetector = (camera: Camera, frame: string | null) => {
      setDetectionData({ camera, frame });
      setIsObjectDetectorOpen(true);
  }

  const handleOpenDetectorForFirstCamera = () => {
    if (cameras.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Cameras',
        description: 'Please add a camera in Settings first.'
      });
      return;
    }
    // This is a fallback for the sidebar button. It won't have a frame.
    handleOpenDetector(cameras[0], null);
  }

  const handleRecord = (camera: Camera, videoUri: string) => {
    toast({
      title: 'Processing Recording...',
      description: (
        <div className="flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>AI is summarizing your clip from {camera.name}.</span>
        </div>
      ),
      duration: 60000, // Long duration, will be dismissed programmatically
    });

    startRecordingTransition(async () => {
      const response = await summarizeRecordingAction({
        videoDataUri: videoUri,
        cameraName: camera.name,
      });

      if (response.success && response.data) {
         const newRecording: Recording = {
           id: `rec-${Date.now()}`,
           timestamp: new Date().toISOString(),
           videoDataUri: videoUri,
           cameraName: camera.name,
           ...response.data
         };
         
         const existingRecordings: Recording[] = JSON.parse(localStorage.getItem('recordings') || '[]');
         localStorage.setItem('recordings', JSON.stringify([...existingRecordings, newRecording]));

         const newEvent: Event = {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'Recording',
            cameraName: camera.name,
            description: `New clip saved: "${response.data.title}"`,
            referenceId: newRecording.id,
         };
         const existingEvents: Event[] = JSON.parse(localStorage.getItem('events') || '[]');
         localStorage.setItem('events', JSON.stringify([...existingEvents, newEvent]));

         toast({
           title: 'Recording Saved!',
           description: `Clip from ${camera.name} is now available in Playback.`,
         });

      } else {
        toast({
          variant: 'destructive',
          title: 'Summarization Failed',
          description: response.error,
        });
      }
    });
  }

  const gridStyle = activeLayout ? {
    gridTemplateColumns: `repeat(${activeLayout.grid.cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${activeLayout.grid.rows}, minmax(0, auto))`,
  } : {};
  
  const getCameraById = (id: string | null): Camera | undefined => cameras.find(c => c.id === id);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 text-primary hover:bg-transparent">
                  <Aperture className="h-6 w-6" />
                </Button>
                <h1 className="text-lg font-semibold tracking-tighter group-data-[collapsible=icon]:hidden">Argus Vision</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/dashboard" className="w-full">
                    <SidebarMenuButton tooltip="Live View" isActive={true}>
                        <LayoutGrid />
                        <span className="group-data-[collapsible=icon]:hidden">Live View</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/playback" className="w-full">
                    <SidebarMenuButton tooltip="Playback">
                       <ListVideo />
                       <span className="group-data-[collapsible=icon]:hidden">Playback</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Object Detection" onClick={handleOpenDetectorForFirstCamera}>
                       <ScanSearch />
                       <span className="group-data-[collapsible=icon]:hidden">Object Detection</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/events" className="w-full">
                        <SidebarMenuButton tooltip="Events">
                           <History />
                           <span className="group-data-[collapsible=icon]:hidden">Events</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <Link href="/settings" className="w-full">
                        <SidebarMenuButton tooltip="Settings">
                            <Settings/>
                            <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="flex items-center justify-between p-4 border-b gap-4 shrink-0">
            <SidebarTrigger />
            <h2 className="text-xl font-semibold whitespace-nowrap hidden sm:block">{activeLayout?.name ?? 'Live View'}</h2>
            <div className="flex items-center gap-2 ml-auto">
              <Select value={activeLayout?.id} onValueChange={handleLayoutChange} disabled={layouts.length === 0}>
                  <SelectTrigger className="w-[150px] md:w-[200px]">
                      <SelectValue placeholder="Select a layout" />
                  </SelectTrigger>
                  <SelectContent>
                      {layouts.map(layout => (
                          <SelectItem key={layout.id} value={layout.id}>{layout.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              <Button onClick={() => setIsLayoutManagerOpen(true)}>
                  <Wand2 className="mr-0 md:mr-2 h-4 w-4"/>
                  <span className="hidden md:inline">Manage Layouts</span>
              </Button>
            </div>
          </header>
          <div className="flex-1 p-4 bg-background/95 overflow-auto bg-grid-pattern">
            {activeLayout && activeLayout.grid.cameras.length > 0 ? (
                <div className="h-full w-full grid gap-4" style={gridStyle}>
                {activeLayout.grid.cameras.map((cameraId, index) => {
                    const camera = getCameraById(cameraId);
                    return (
                    <div key={cameraId ? `${cameraId}-${index}`: index} className="bg-card rounded-lg overflow-hidden min-h-[200px] group">
                        {camera ? (
                        <CameraFeed 
                            camera={camera} 
                            onFullscreen={setFullscreenCamera}
                            onDetect={handleOpenDetector}
                            onRecord={handleRecord}
                        />
                        ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted/50 rounded-lg">
                            <span className="text-muted-foreground text-sm">Empty Slot</span>
                        </div>
                        )}
                    </div>
                    );
                })}
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg bg-card">
                    <Aperture className="h-16 w-16 text-primary mb-4" />
                    <h2 className="text-2xl font-bold tracking-tight">Welcome to Argus Vision</h2>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                        Your self-hosted surveillance hub. To get started, add your first camera feed.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/settings">
                            <Settings className="mr-2 h-4 w-4" /> Add a Camera
                        </Link>
                    </Button>
                </div>
            )}
          </div>
        </main>
      </div>
      
      {fullscreenCamera && <FullscreenView camera={fullscreenCamera} onClose={() => setFullscreenCamera(null)} />}
      <LayoutManager open={isLayoutManagerOpen} onOpenChange={setIsLayoutManagerOpen} cameras={cameras} onLayoutSave={handleSaveLayout} />
      <ObjectDetectionPanel 
        open={isObjectDetectorOpen} 
        onOpenChange={setIsObjectDetectorOpen} 
        camera={detectionData?.camera ?? null} 
        initialFrame={detectionData?.frame ?? null}
      />
    </SidebarProvider>
  );
}
