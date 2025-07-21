
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
import { Plus, Edit, Trash2, Camera as CameraIcon, ArrowLeft, History } from 'lucide-react';
import type { Camera } from '@/lib/types';
import { getCameras } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { LayoutGrid, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/logo';

const cameraSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  streamUrl: z.string().min(1, 'Stream URL is required').url('Must be a valid URL'),
  thumbnailUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  server: z.string().optional(),
});

type CameraFormValues = z.infer<typeof cameraSchema>;

export default function CamerasSettingsPage() {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
    const { toast } = useToast();
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setCameras(getCameras());
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
        toast({ title: "Logged out successfully." });
    };

    const form = useForm<CameraFormValues>({
        resolver: zodResolver(cameraSchema),
        defaultValues: {
            id: '',
            name: '',
            description: '',
            streamUrl: '',
            thumbnailUrl: '',
            server: '',
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
            form.reset({ name: '', description: '', streamUrl: '', thumbnailUrl: '', server: '' });
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
        <SidebarProvider>
            <div className="flex min-h-screen bg-background text-foreground">
                <Sidebar>
                    <SidebarHeader>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-primary hover:bg-transparent">
                            <Logo className="h-6 w-auto" />
                        </Button>
                        <h1 className="text-lg font-semibold tracking-tighter group-data-[collapsible=icon]:hidden">Argus Vision</h1>
                    </div>
                    </SidebarHeader>
                    <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link href="/dashboard" className="w-full">
                                <SidebarMenuButton tooltip="Live View">
                                    <LayoutGrid />
                                    <span className="group-data-[collapsible=icon]:hidden">Live View</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/playback" className="w-full">
                                <SidebarMenuButton tooltip="Playback">
                                <History />
                                <span className="group-data-[collapsible=icon]:hidden">Playback</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/events" className="w-full">
                                <SidebarMenuButton tooltip="Events">
                                <History />
                                <span className="group-data-[collapsible=icon]:hidden">Events</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        {user?.role === 'admin' && (
                            <SidebarMenuItem>
                                <Link href="/settings" className="w-full">
                                    <SidebarMenuButton tooltip="Settings" isActive={true}>
                                        <Settings/>
                                        <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter>
                    <div className='p-2 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden'>
                        <p className='font-semibold text-foreground'>{user?.username}</p>
                        <p className='capitalize'>{user?.role}</p>
                    </div>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
                                <LogOut />
                                <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>
                <main className="flex-1">
                    <header className="flex items-center p-4 border-b shrink-0 h-[60px]">
                        <SidebarTrigger />
                    </header>
                    <div className="h-full w-full p-4 md:p-6">
                        <header className="flex items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="icon" asChild>
                                    <Link href="/settings"><ArrowLeft/></Link>
                                </Button>
                                <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                                    <CameraIcon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">Camera Management</h1>
                                    <p className="text-muted-foreground">Add, edit, or remove your camera feeds.</p>
                                </div>
                            </div>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="mr-2 h-4 w-4" /> Add Camera
                            </Button>
                        </header>

                        <Card>
                            <CardHeader>
                                <CardTitle>Your Cameras</CardTitle>
                                <CardDescription>A list of all configured cameras in your system.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {cameras.map(camera => (
                                        <Card key={camera.id} className="flex items-center p-4 bg-card/50 hover:bg-muted/50 transition-colors group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                                            <Image 
                                                src={camera.thumbnailUrl} 
                                                width={120} 
                                                height={90} 
                                                alt={camera.name} 
                                                className="aspect-video w-[120px] rounded-md object-cover mr-4 bg-muted"
                                            />
                                            <div className="flex-grow">
                                                <p className="font-semibold flex items-center gap-2">
                                                    {camera.name}
                                                    {camera.server && <Badge variant="secondary">{camera.server}</Badge>}
                                                </p>
                                                <p className="text-sm text-muted-foreground truncate">{camera.description}</p>
                                                <p className="text-xs text-muted-foreground/50 font-mono truncate">{camera.streamUrl}</p>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                        <FormField
                                            control={form.control}
                                            name="server"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Server Name (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Server 1" {...field} />
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
                </main>
            </div>
        </SidebarProvider>
    );
}
