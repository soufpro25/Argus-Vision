"use client";

import { useState } from 'react';
import { Aperture, History, LayoutGrid, ScanSearch, Settings, Wand2 } from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockCameras, mockLayouts } from '@/lib/mock-data';
import type { Camera, Layout } from '@/lib/types';
import { CameraFeed, FullscreenView } from './camera-feed';
import { LayoutManager } from './layout-manager';
import { ObjectDetectionPanel } from './object-detection-panel';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [cameras, setCameras] = useState<Camera[]>(mockCameras);
  const [layouts, setLayouts] = useState<Layout[]>(mockLayouts);
  const [activeLayout, setActiveLayout] = useState<Layout>(mockLayouts[0]);
  const [fullscreenCamera, setFullscreenCamera] = useState<Camera | null>(null);
  const [isLayoutManagerOpen, setIsLayoutManagerOpen] = useState(false);
  const [isObjectDetectorOpen, setIsObjectDetectorOpen] = useState(false);
  const [detectionData, setDetectionData] = useState<{camera: Camera, frame: string | null} | null>(null);
  const { toast } = useToast();

  const handleLayoutChange = (layoutId: string) => {
    const newLayout = layouts.find(l => l.id === layoutId);
    if (newLayout) {
      setActiveLayout(newLayout);
    }
  };

  const handleSaveLayout = (newLayout: Layout) => {
    setLayouts(prev => [...prev, newLayout]);
    setActiveLayout(newLayout);
    setIsLayoutManagerOpen(false);
  };
  
  const handleOpenDetector = (camera: Camera, frame: string | null) => {
      setDetectionData({ camera, frame });
      setIsObjectDetectorOpen(true);
  }

  const handleOpenDetectorForFirstCamera = () => {
    // This is a fallback for the sidebar button. It won't have a frame.
    handleOpenDetector(cameras[0], null);
  }

  const gridStyle = {
    gridTemplateColumns: `repeat(${activeLayout.grid.cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${activeLayout.grid.rows}, minmax(0, auto))`,
  };
  
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
                    <SidebarMenuButton tooltip="Live View" isActive={true}>
                        <LayoutGrid />
                        <span className="group-data-[collapsible=icon]:hidden">Live View</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Object Detection" onClick={handleOpenDetectorForFirstCamera}>
                       <ScanSearch />
                       <span className="group-data-[collapsible=icon]:hidden">Object Detection</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Events" onClick={() => toast({title: "Coming Soon!", description: "Event history will be available in a future update."})}>
                       <History />
                       <span className="group-data-[collapsible=icon]:hidden">Events</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Settings" onClick={() => toast({title: "Coming Soon!", description: "Settings will be available in a future update."})}>
                        <Settings/>
                        <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="flex items-center justify-between p-4 border-b gap-4 shrink-0">
            <SidebarTrigger />
            <h2 className="text-xl font-semibold whitespace-nowrap hidden sm:block">{activeLayout.name}</h2>
            <div className="flex items-center gap-2 ml-auto">
              <Select value={activeLayout.id} onValueChange={handleLayoutChange}>
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
          <div className="flex-1 p-4 bg-background/90 overflow-auto">
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
