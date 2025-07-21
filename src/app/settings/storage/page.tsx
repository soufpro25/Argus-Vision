
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRecordings, getStorageConfig, saveRecordings, saveStorageConfig, getStorageUsage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { ArrowLeft, History, LayoutGrid, LogOut, Settings, HardDrive, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

const BROWSER_STORAGE_LIMIT_MB = 5; // A conservative estimate for most browsers' localStorage limit

export default function StorageSettingsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [recordingsCount, setRecordingsCount] = useState(0);
    const [storageUsage, setStorageUsage] = useState({ bytes: 0, formatted: '0 KB' });
    const [retentionDays, setRetentionDays] = useState('0'); // '0' for 'keep forever'

    useEffect(() => {
        updateStorageInfo();
        const config = getStorageConfig();
        setRetentionDays(String(config.retentionDays));
    }, []);
    
    const updateStorageInfo = () => {
        setRecordingsCount(getRecordings().length);
        setStorageUsage(getStorageUsage());
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
        toast({ title: "Logged out successfully." });
    };

    const handleClearAll = () => {
        saveRecordings([]);
        updateStorageInfo();
        toast({ title: 'All recordings have been deleted.' });
    };

    const handleRetentionChange = (value: string) => {
        const days = parseInt(value, 10);
        setRetentionDays(value);
        saveStorageConfig({ retentionDays: days });
        toast({ title: 'Retention policy updated.', description: `Recordings will be kept for ${days === 0 ? 'all time' : `${days} days`}.` });
    };
    
    const usagePercentage = Math.min(((storageUsage.bytes / 1024 / 1024) / BROWSER_STORAGE_LIMIT_MB) * 100, 100);

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background text-foreground">
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary hover:bg-transparent">
                                <Logo className="h-6 w-auto" />
                            </Button>
                            <h1 className="text-lg font-semibold tracking-tighter group-data-[collapsible=icon]:hidden">Sentra</h1>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link href="/dashboard" className="w-full">
                                    <SidebarMenuButton tooltip="Live View"><LayoutGrid /><span className="group-data-[collapsible=icon]:hidden">Live View</span></SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/playback" className="w-full">
                                    <SidebarMenuButton tooltip="Playback"><History /><span className="group-data-[collapsible=icon]:hidden">Playback</span></SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/events" className="w-full">
                                    <SidebarMenuButton tooltip="Events"><History /><span className="group-data-[collapsible=icon]:hidden">Events</span></SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            {user?.role === 'admin' && (
                                <SidebarMenuItem>
                                    <Link href="/settings" className="w-full">
                                        <SidebarMenuButton tooltip="Settings" isActive={true}><Settings /><span className="group-data-[collapsible=icon]:hidden">Settings</span></SidebarMenuButton>
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
                                <SidebarMenuButton tooltip="Logout" onClick={handleLogout}><LogOut /><span className="group-data-[collapsible=icon]:hidden">Logout</span></SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>
                <main className="flex-1">
                    <header className="flex items-center p-4 border-b shrink-0 h-[60px]"><SidebarTrigger /></header>
                    <div className="h-full w-full p-4 md:p-6">
                        <header className="flex items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="icon" asChild>
                                    <Link href="/settings"><ArrowLeft /></Link>
                                </Button>
                                <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                                    <HardDrive className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">Storage Management</h1>
                                    <p className="text-muted-foreground">Manage saved recordings and data policies.</p>
                                </div>
                            </div>
                        </header>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Storage Information</CardTitle>
                                    <CardDescription>Details about your browser's local storage usage.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-baseline">
                                            <Label htmlFor="storage-usage">Browser Storage Usage</Label>
                                            <span className="text-sm font-medium">{storageUsage.formatted} / ~5 MB</span>
                                        </div>
                                        <Progress id="storage-usage" value={usagePercentage} />
                                        <p className="text-xs text-muted-foreground">
                                            All data is stored in your browser's local storage. This is an estimate of usage.
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                        <span className="text-sm font-medium">Total Recordings</span>
                                        <span className="text-lg font-bold">{recordingsCount}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Data Policies</CardTitle>
                                    <CardDescription>Set rules for managing your data automatically.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="retention-policy">Recording Retention</Label>
                                        <Select value={retentionDays} onValueChange={handleRetentionChange}>
                                            <SelectTrigger id="retention-policy">
                                                <SelectValue placeholder="Select retention period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">Keep Forever</SelectItem>
                                                <SelectItem value="1">1 Day</SelectItem>
                                                <SelectItem value="7">7 Days</SelectItem>
                                                <SelectItem value="30">30 Days</SelectItem>
                                                <SelectItem value="90">90 Days</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Automatically delete recordings older than the selected period. This runs when the app loads.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Danger Zone</Label>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" className="w-full">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Clear All Recordings
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete all
                                                        of your saved recordings.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleClearAll}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                         <p className="text-xs text-muted-foreground">
                                            Permanently delete all recordings from your browser's storage.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
