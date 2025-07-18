"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { detectObjectsAction } from '@/app/actions';
import { Loader2, AlertCircle } from 'lucide-react';
import type { SmartObjectDetectionOutput } from '@/ai/flows/smart-object-detection';
import type { Camera } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ObjectDetectionPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  camera: Camera | null;
  initialFrame: string | null;
}

export function ObjectDetectionPanel({ open, onOpenChange, camera, initialFrame }: ObjectDetectionPanelProps) {
  const [criteria, setCriteria] = useState('any person or vehicle');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SmartObjectDetectionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (open) {
      if (initialFrame) {
        setImagePreview(initialFrame);
      } else if (camera?.thumbnailUrl) {
        setImagePreview(camera.thumbnailUrl);
      } else {
        setImagePreview(null);
      }
      setResult(null);
      setError(null);
    }
  }, [camera, initialFrame, open]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!imagePreview) {
      toast({
        variant: "destructive",
        title: "No Image",
        description: "Please select an image or use a camera feed.",
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    const response = await detectObjectsAction({
      videoDataUri: imagePreview,
      detectionCriteria: criteria,
    });

    setIsLoading(false);
    if (response.success && response.data) {
      setResult(response.data);
    } else {
      setError(response.error || 'An unknown error occurred.');
      toast({
        variant: "destructive",
        title: "Detection Failed",
        description: response.error,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Object Detection</SheetTitle>
          <SheetDescription>
            Analyze a frame for objects. {camera ? `Using feed from ${camera.name}.` : 'Upload a custom image.'}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Image Frame</Label>
            {imagePreview && (
              <div className="relative w-full aspect-video border rounded-md overflow-hidden bg-muted">
                <Image src={imagePreview} alt="Frame to analyze" layout="fill" objectFit="contain" />
                {result?.filteredObjects && result.filteredObjects.map((obj, index) => (
                    <div key={index} 
                         className="absolute border-2 border-accent rounded-sm"
                         style={{ 
                            left: `${obj.box[0] * 100}%`, 
                            top: `${obj.box[1] * 100}%`,
                            width: `${(obj.box[2] - obj.box[0]) * 100}%`,
                            height: `${(obj.box[3] - obj.box[1]) * 100}%`,
                         }}>
                        <span className="absolute -top-6 left-0 bg-accent text-accent-foreground text-xs px-1 py-0.5 rounded-sm">
                            {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
                        </span>
                    </div>
                ))}
              </div>
            )}
            <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="criteria">Detection Criteria</Label>
            <Textarea
              id="criteria"
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="e.g., 'a person wearing a red shirt'"
            />
          </div>
        </div>
        
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-4">Analyzing image...</span>
          </div>
        )}
        
        {error && (
            <div className="flex items-center text-destructive p-4 bg-destructive/10 rounded-md">
                <AlertCircle className="h-5 w-5 mr-3" />
                <span>{error}</span>
            </div>
        )}

        {result && (
          <div className="space-y-4">
            <Card>
                <CardHeader><CardTitle>Detection Summary</CardTitle></CardHeader>
                <CardContent>
                    <p>{result.summary}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Detected Objects</CardTitle></CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {result.filteredObjects.length > 0 ? result.filteredObjects.map((obj, index) => (
                           <li key={index} className="text-sm flex justify-between">
                               <span>{obj.label}</span>
                               <span className="font-mono text-muted-foreground">{(obj.confidence * 100).toFixed(1)}%</span>
                           </li>
                        )) : <p className="text-muted-foreground">No objects matched the criteria.</p>}
                    </ul>
                </CardContent>
            </Card>
          </div>
        )}

        <SheetFooter className="mt-6">
          <Button onClick={handleSubmit} disabled={isLoading || !imagePreview}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Detect Objects
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
