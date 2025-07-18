
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, Camera, GripVertical } from 'lucide-react';
import type { Camera as CameraType, Layout } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

interface LayoutManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cameras: CameraType[];
  layouts: Layout[];
  onLayoutsUpdate: (layouts: Layout[], activeLayoutId?: string) => void;
}

const MAX_GRID_SIZE = 8;

export function LayoutManager({ open, onOpenChange, cameras, layouts, onLayoutsUpdate }: LayoutManagerProps) {
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!open) {
      setSelectedLayout(null);
      setIsCreatingNew(false);
    }
  }, [open]);

  if (user?.role !== 'admin') return null;
  
  const handleSelectLayout = (layoutId: string) => {
    const layout = layouts.find(l => l.id === layoutId);
    setSelectedLayout(layout || null);
    setIsCreatingNew(false);
  }

  const handleCreateNew = () => {
    const newLayout: Layout = {
      id: `layout-new-${Date.now()}`,
      name: 'New Custom Layout',
      grid: {
        rows: 2,
        cols: 2,
        cameras: Array(4).fill(null),
      }
    };
    setSelectedLayout(newLayout);
    setIsCreatingNew(true);
  };
  
  const handleSaveLayout = (layoutToSave: Layout) => {
    if (!layoutToSave.name) {
      toast({ variant: 'destructive', title: 'Layout name cannot be empty.' });
      return;
    }
    
    let newLayouts = [...layouts];
    if (isCreatingNew) {
      newLayouts.push({ ...layoutToSave, id: `layout-${Date.now()}` });
      toast({ title: 'Layout Created', description: `"${layoutToSave.name}" has been saved.` });
    } else {
      const index = newLayouts.findIndex(l => l.id === layoutToSave.id);
      if (index > -1) {
        newLayouts[index] = layoutToSave;
        toast({ title: 'Layout Updated', description: `"${layoutToSave.name}" has been updated.` });
      }
    }
    onLayoutsUpdate(newLayouts, layoutToSave.id);
    setSelectedLayout(null);
    setIsCreatingNew(false);
  }

  const handleDeleteLayout = (layoutId: string) => {
    const newLayouts = layouts.filter(l => l.id !== layoutId);
    onLayoutsUpdate(newLayouts);
    toast({ variant: 'destructive', title: 'Layout Deleted' });
    if (selectedLayout?.id === layoutId) {
      setSelectedLayout(null);
    }
  };

  const renderLayoutList = () => (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-lg">Manage Layouts</h3>
      <Button onClick={handleCreateNew}><Plus className="mr-2 h-4 w-4" /> Create New Layout</Button>
      <Separator />
      <h4 className="font-semibold text-md text-muted-foreground">Existing Layouts</h4>
      <ScrollArea className="pr-4 -mr-4 flex-grow">
          {layouts.length > 0 ? (
              <div className="space-y-2">
                  {layouts.map(layout => (
                      <Card key={layout.id} className="flex items-center p-3 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleSelectLayout(layout.id)}>
                          <GripVertical className="h-5 w-5 text-muted-foreground mr-2" />
                          <div className="flex-grow">
                              <p className="font-medium">{layout.name}</p>
                              <p className="text-sm text-muted-foreground">{layout.grid.cameras.length} cells ({layout.grid.rows}x{layout.grid.cols})</p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteLayout(layout.id)}}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </Card>
                  ))}
              </div>
          ) : (
              <div className="flex items-center justify-center h-full border-2 border-dashed rounded-md p-8">
                  <p className="text-muted-foreground text-sm text-center">No layouts created yet. Click "Create New Layout" to start.</p>
              </div>
          )}
      </ScrollArea>
    </div>
  );
  
  const renderLayoutEditor = (layout: Layout) => {
    
    const setEditorState = (newValues: Partial<Layout> | ((prev: Layout) => Layout)) => {
        setSelectedLayout(prev => {
            if (!prev) return null;
            const updated = typeof newValues === 'function' ? newValues(prev) : {...prev, ...newValues};
            return updated;
        });
    }

    const handleGridChange = (rows: number, cols: number) => {
      const currentCameras = layout.grid.cameras;
      const newSize = rows * cols;
      const newCameras = Array(newSize).fill(null);
      // Preserve cameras that fit in the new grid
      for (let i = 0; i < Math.min(currentCameras.length, newSize); i++) {
        newCameras[i] = currentCameras[i];
      }
      setEditorState(prev => ({ ...prev, grid: { rows, cols, cameras: newCameras }}));
    };
    
    const handleCellChange = (index: number, cameraId: string) => {
       const newCameras = [...layout.grid.cameras];
       newCameras[index] = cameraId === 'empty' ? null : cameraId;
       setEditorState(prev => ({ ...prev, grid: { ...prev.grid, cameras: newCameras }}));
    };

    const gridStyle = {
      gridTemplateColumns: `repeat(${layout.grid.cols}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${layout.grid.rows}, minmax(0, 1fr))`,
    };

    return (
       <div className="flex flex-col gap-4 h-full">
            <h3 className="font-semibold text-lg">{isCreatingNew ? "Create New Layout" : `Editing: ${layout.name}`}</h3>
            
            <div className="space-y-2">
                <Label htmlFor="layout-name">Layout Name</Label>
                <Input id="layout-name" value={layout.name} onChange={e => setEditorState({name: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Rows: {layout.grid.rows}</Label>
                    <Slider defaultValue={[layout.grid.rows]} min={1} max={MAX_GRID_SIZE} step={1} onValueChange={(val) => handleGridChange(val[0], layout.grid.cols)} />
                </div>
                 <div className="space-y-2">
                    <Label>Columns: {layout.grid.cols}</Label>
                    <Slider defaultValue={[layout.grid.cols]} min={1} max={MAX_GRID_SIZE} step={1} onValueChange={(val) => handleGridChange(layout.grid.rows, val[0])} />
                </div>
            </div>
            
            <Separator />

            <ScrollArea className="flex-grow -mx-6 px-6">
                <Card className="bg-muted/30 p-4">
                    <CardContent className="p-0">
                         <div className="grid gap-2" style={gridStyle}>
                            {layout.grid.cameras.map((camId, index) => (
                                <div key={index} className="aspect-video bg-background rounded-md flex flex-col items-center justify-center p-2">
                                     <Select value={camId ?? 'empty'} onValueChange={(val) => handleCellChange(index, val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Camera" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="empty">-- Empty --</SelectItem>
                                            <Separator />
                                            {cameras.map(cam => (
                                                <SelectItem key={cam.id} value={cam.id}>{cam.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </ScrollArea>
             <div className="flex justify-between items-center mt-auto pt-4">
                <Button variant="outline" onClick={() => setSelectedLayout(null)}>Back to List</Button>
                <Button onClick={() => handleSaveLayout(layout)}><Save className="mr-2 h-4 w-4" /> Save Layout</Button>
            </div>
       </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Layout Manager</DialogTitle>
          <DialogDescription>
            Create, edit, and manage your custom camera layouts.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-hidden">
            {selectedLayout ? renderLayoutEditor(selectedLayout) : renderLayoutList()}
        </div>
        
      </DialogContent>
    </Dialog>
  );
}
