
"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings as SettingsIcon, Camera, Users, ChevronRight } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { History, LayoutGrid, ListVideo, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export default function SettingsPage() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (!isLoading && user?.role !== 'admin') {
            router.push('/');
        }
    }, [user, isLoading, router]);

    const handleLogout = () => {
        logout();
        router.push('/login');
        toast({ title: "Logged out successfully." });
    };

    if (isLoading || !user || user.role !== 'admin') {
        return null; 
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
                        <h1 className="text-lg font-semibold tracking-tighter group-data-[collapsible=icon]:hidden">Sentra</h1>
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
                                <ListVideo />
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
                                        <SettingsIcon/>
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
                        <header className="flex items-center gap-4 mb-6">
                            <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                                <SettingsIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                                <p className="text-muted-foreground">Manage your cameras, users, and application settings.</p>
                            </div>
                        </header>

                        <div className="grid md:grid-cols-2 gap-6 mt-8">
                            <Link href="/settings/cameras" className="block">
                                <Card className="hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all bg-card/50 h-full">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className='space-y-1.5'>
                                            <CardTitle>Camera Management</CardTitle>
                                            <CardDescription>Add, edit, or remove your camera feeds.</CardDescription>
                                        </div>
                                        <Camera className="h-8 w-8 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-primary flex items-center font-semibold">
                                            Go to Camera Settings <ChevronRight className="h-4 w-4 ml-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                            <Link href="/settings/users" className="block">
                                <Card className="hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all bg-card/50 h-full">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className='space-y-1.5'>
                                            <CardTitle>User Management</CardTitle>
                                            <CardDescription>Add new users and manage their roles.</CardDescription>
                                        </div>
                                        <Users className="h-8 w-8 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-primary flex items-center font-semibold">
                                            Go to User Settings <ChevronRight className="h-4 w-4 ml-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
