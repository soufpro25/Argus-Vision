"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Settings as SettingsIcon, Plus, Edit, Trash2, Camera as CameraIcon } from 'lucide-react';
import type { Camera } from '@/lib/types';
import { getCameras } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const cameraSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  streamUrl: z.string().min(1, 'Stream URL is required').url('Must be a valid URL'),
  thumbnailUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type CameraFormValues = z.infer<typeof cameraSchema>;

export default function Settings() {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setCameras(getCameras());
    }, []);

    const form = useForm<CameraFormValues>({
        resolver: zodResolver(cameraSchema),
        defaultValues: {
            id: '',
            name: '',
            description: '',
            streamUrl: '',
            thumbnailUrl: '',
        },
    });

    const handleSaveChanges = (values: CameraFormValues) => {
        const newCameras = [...cameras];
        const thumbnailUrl = values.thumbnailUrl || `https://placehold.co/800x600.png`;

        if (editingCamera) {
            const index = newCameras.findIndex(c => c.id === editingCamera.id);
            if (index > -1) {
                newCameras[index] = { ...editingCamera, ...values, thumbnailUrl };
            }
        } else {
            const newCamera: Camera = {
                id: `cam-${Date.now()}`,
                ...values,
                thumbnailUrl,
            };
            newCameras.push(newCamera);
        }

        setCameras(newCameras);
        localStorage.setItem('cameras', JSON.stringify(newCameras));
        toast({
            title: `Camera ${editingCamera ? 'updated' : 'added'}`,
            description: `Camera "${values.name}" has been saved.`,
        });
        setIsDialogOpen(false);
        setEditingCamera(null);
    };

    const handleOpenDialog = (camera: Camera | null = null) => {
        setEditingCamera(camera);
        if (camera) {
            form.reset(camera);
        } else {
            form.reset({ name: '', description: '', streamUrl: '', thumbnailUrl: '' });
        }
        setIsDialogOpen(true);
    };

    const handleDeleteCamera = (cameraId: string) => {
        const newCameras = cameras.filter(c => c.id !== cameraId);
        setCameras(newCameras);
        localStorage.setItem('cameras', JSON.stringify(newCameras));
        toast({
            variant: 'destructive',
            title: 'Camera Deleted',
        });
    }

    return (
        <div className="h-full w-full p-4 md:p-6">
            <header className="flex items-center justify-between gap-4 mb-6">
                 <div className="flex items-center gap-4">
                    <SettingsIcon className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground">Manage your cameras and application settings.</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Camera
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Camera Management</CardTitle>
                    <CardDescription>Add, edit, or remove your camera feeds.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {cameras.map(camera => (
                            <Card key={camera.id} className="flex items-center p-4">
                                <Image 
                                    src={camera.thumbnailUrl} 
                                    width={120} 
                                    height={90} 
                                    alt={camera.name} 
                                    className="aspect-video w-[120px] rounded-md object-cover mr-4 bg-muted"
                                />
                                <div className="flex-grow">
                                    <p className="font-semibold">{camera.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{camera.description}</p>
                                    <p className="text-xs text-muted-foreground/50 font-mono truncate">{camera.streamUrl}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(camera)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCamera(camera.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                         {cameras.length === 0 && (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                                <CameraIcon className="h-12 w-12 mb-4" />
                                <p className="font-semibold">No cameras have been added yet.</p>
                                <p className="text-sm">Click "Add Camera" to get started.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCamera ? 'Edit Camera' : 'Add New Camera'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSaveChanges)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Camera Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Front Door" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="e.g., Covers the main entrance" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="streamUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stream URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="rtsp://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="thumbnailUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thumbnail URL (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://placehold.co/800x600.png" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
