
"use client";

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { suggestLayoutAction } from '@/app/actions';
import { Loader2, Wand2, AlertCircle } from 'lucide-react';
import type { Camera, Layout } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

interface LayoutManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cameras: Camera[];
  onLayoutSave: (newLayout: Layout) => void;
}

export function LayoutManager({ open, onOpenChange, cameras, onLayoutSave }: LayoutManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [cameraDescriptions, setCameraDescriptions] = useState<Pick<Camera, 'id' | 'description'>[]>(cameras.map(c => ({id: c.id, description: c.description})));
  const [suggestedLayout, setSuggestedLayout] = useState<{ layout: string[], reasoning: string } | null>(null);
  const [layoutName, setLayoutName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  if (user?.role !== 'admin') return null;

  const handleDescriptionChange = (id: string, description: string) => {
    setCameraDescriptions(prev => prev.map(c => c.id === id ? { ...c, description } : c));
  };
  
  const handleSuggestLayout = () => {
    setError(null);
    setSuggestedLayout(null);
    startTransition(async () => {
      const response = await suggestLayoutAction(cameraDescriptions);
      if (response.success && response.data) {
        setSuggestedLayout({ layout: response.data.suggestedLayout, reasoning: response.data.reasoning });
        setLayoutName('AI Suggested Layout');
      } else {
        setError(response.error || 'An unexpected error occurred.');
        toast({
          variant: 'destructive',
          title: 'Layout Suggestion Failed',
          description: response.error,
        });
      }
    });
  };

  const handleSaveLayout = () => {
    if (!suggestedLayout || !layoutName) {
        toast({
          variant: 'destructive',
          title: 'Cannot Save Layout',
          description: 'Please generate a layout and provide a name first.',
        });
        return;
    }
    const cols = Math.ceil(Math.sqrt(suggestedLayout.layout.length));
    const rows = Math.ceil(suggestedLayout.layout.length / cols);
    
    const newLayout: Layout = {
        id: `layout-${Date.now()}`,
        name: layoutName,
        grid: {
            rows,
            cols,
            cameras: suggestedLayout.layout,
        }
    };
    onLayoutSave(newLayout);
    toast({
        title: 'Layout Saved!',
        description: `New layout "${layoutName}" has been added.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Layout Manager</DialogTitle>
          <DialogDescription>
            Describe your camera locations and let AI suggest an optimal grid layout.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            {cameraDescriptions.map(cam => (
                <div key={cam.id} className="space-y-2">
                    <Label htmlFor={`desc-${cam.id}`}>{cameras.find(c => c.id === cam.id)?.name}</Label>
                    <Textarea
                        id={`desc-${cam.id}`}
                        value={cam.description}
                        onChange={e => handleDescriptionChange(cam.id, e.target.value)}
                        placeholder="e.g., 'Covers the main entrance and porch'"
                    />
                </div>
            ))}
        </div>

        <Button onClick={handleSuggestLayout} disabled={isPending}>
          <Wand2 className="mr-2 h-4 w-4" />
          {isPending ? 'Generating...' : 'Suggest Layout'}
        </Button>

        {isPending && <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
        
        {error && (
            <div className="flex items-center text-destructive p-3 bg-destructive/10 rounded-md">
                <AlertCircle className="h-5 w-5 mr-3" />
                <span>{error}</span>
            </div>
        )}

        {suggestedLayout && (
          <div className="mt-4 space-y-4 p-4 border rounded-lg bg-background/50">
            <h3 className="font-semibold">Suggested Layout</h3>
            <div className="space-y-2">
              <Label htmlFor="layout-name">Layout Name</Label>
              <Input id="layout-name" value={layoutName} onChange={e => setLayoutName(e.target.value)} />
            </div>
            <div className="p-4 border rounded-md">
              <h4 className="text-sm font-medium mb-2">Preview</h4>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(suggestedLayout.layout.length))}, minmax(0, 1fr))` }}>
                {suggestedLayout.layout.map(camId => (
                  <div key={camId} className="bg-muted p-2 rounded-md text-center text-sm text-muted-foreground">
                    {cameras.find(c => c.id === camId)?.name || 'Unknown'}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border rounded-md">
                <h4 className="text-sm font-medium mb-2">AI Reasoning</h4>
                <p className="text-sm text-muted-foreground">{suggestedLayout.reasoning}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleSaveLayout} disabled={!suggestedLayout || !layoutName || isPending}>
            Save Layout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
