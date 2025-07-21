
"use client";

import Playback from '@/components/playback';
import { getRecordings } from '@/lib/storage';
import { useState, useEffect } from 'react';
import type { Recording } from '@/lib/types';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import { History, LayoutGrid, ListVideo, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export default function PlaybackPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setRecordings(getRecordings());
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
    toast({ title: "Logged out successfully." });
  };
  
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
                      <SidebarMenuButton tooltip="Playback" isActive={true}>
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
                              <SidebarMenuButton tooltip="Settings">
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
          <Playback recordings={recordings} />
        </main>
      </div>
    </SidebarProvider>
  );
}
