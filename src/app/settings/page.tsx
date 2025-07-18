
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Camera, Users, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user?.role !== 'admin') {
            router.push('/');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user || user.role !== 'admin') {
        return null; 
    }

    return (
        <div className="h-full w-full p-4 md:p-6">
            <header className="flex items-center justify-between gap-4 mb-6 border-b pb-4">
                 <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <SettingsIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground">Manage your cameras, users, and application settings.</p>
                    </div>
                </div>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                <Link href="/settings/cameras">
                    <Card className="hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className='space-y-1.5'>
                                <CardTitle>Camera Management</CardTitle>
                                <CardDescription>Add, edit, or remove your camera feeds.</CardDescription>
                            </div>
                             <Camera className="h-8 w-8 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-primary flex items-center">
                                Go to Camera Settings <ChevronRight className="h-4 w-4 ml-1" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/settings/users">
                    <Card className="hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div className='space-y-1.5'>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>Add new users and manage their roles.</CardDescription>
                            </div>
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </CardHeader>
                         <CardContent>
                            <div className="text-sm text-primary flex items-center">
                                Go to User Settings <ChevronRight className="h-4 w-4 ml-1" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
