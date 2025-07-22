
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Users as UsersIcon, ArrowLeft, History, Bell } from 'lucide-react';
import type { User } from '@/lib/types';
import { getUsers } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { LayoutGrid, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

const userSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional().or(z.literal('')),
  role: z.enum(['admin', 'viewer']),
}).refine(data => {
    // If it's a new user (no id), password must be provided and be long enough.
    if (!data.id && (!data.password || data.password.length < 6)) {
        return false;
    }
    // If a password IS provided for an existing user, it must be long enough.
    if (data.id && data.password && data.password.length > 0 && data.password.length < 6) {
        return false;
    }
    return true;
}, {
    message: "Password must be at least 6 characters.",
    path: ["password"],
});


type UserFormValues = z.infer<typeof userSchema>;

export default function UsersSettingsPage() {
    const { user: activeUser, logout, signup } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setUsers(getUsers());
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
        toast({ title: "Logged out successfully." });
    };

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            id: '',
            username: '',
            password: '',
            role: 'viewer',
        },
    });

    const handleSaveChanges = (values: UserFormValues) => {
        if (editingUser) { // Editing existing user
            const currentUsers = getUsers();
            const index = currentUsers.findIndex(u => u.id === editingUser.id);
            if (index > -1) {
                const updatedUser = { ...currentUsers[index], ...values };
                if (!values.password) { // Keep old password if not provided
                    updatedUser.password = currentUsers[index].password;
                }
                currentUsers[index] = updatedUser;
                localStorage.setItem('users', JSON.stringify(currentUsers));
                setUsers(currentUsers);
                toast({ title: 'User Updated', description: `User "${values.username}" has been updated.` });
            }
        } else { // Adding new user
            signup(values.username, values.password, values.role).then(success => {
                if (success) {
                    setUsers(getUsers());
                    toast({ title: 'User Added', description: `User "${values.username}" has been created.` });
                } else {
                    toast({ variant: 'destructive', title: 'Failed to add user', description: 'This username might already be taken.' });
                }
            });
        }
        
        setIsDialogOpen(false);
        setEditingUser(null);
    };

    const handleOpenDialog = (user: User | null = null) => {
        setEditingUser(user);
        if (user) {
            form.reset({
              ...user,
              password: '', // Don't show existing password hash
            });
        } else {
            form.reset({ id: undefined, username: '', password: '', role: 'viewer' });
        }
        setIsDialogOpen(true);
    };

    const handleDeleteUser = (userId: string) => {
        if (userId === activeUser?.id) {
            toast({ variant: 'destructive', title: 'Cannot delete yourself' });
            return;
        }
        const newUsers = users.filter(u => u.id !== userId);
        setUsers(newUsers);
        localStorage.setItem('users', JSON.stringify(newUsers));
        toast({
            variant: 'destructive',
            title: 'User Deleted',
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
                                <Bell />
                                <span className="group-data-[collapsible=icon]:hidden">Events</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        {activeUser?.role === 'admin' && (
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
                        <p className='font-semibold text-foreground'>{activeUser?.username}</p>
                        <p className='capitalize'>{activeUser?.role}</p>
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
                                    <UsersIcon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                                    <p className="text-muted-foreground">Add, edit, or remove system users.</p>
                                </div>
                            </div>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="mr-2 h-4 w-4" /> Add User
                            </Button>
                        </header>

                        <Card>
                            <CardHeader>
                                <CardTitle>System Users</CardTitle>
                                <CardDescription>A list of all users who can access this system.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {users.map(user => (
                                        <Card key={user.id} className="flex items-center p-4 bg-card/50">
                                            <div className="flex-grow">
                                                <p className="font-semibold flex items-center gap-2">
                                                    {user.username}
                                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{user.role}</Badge>
                                                </p>
                                                <p className="text-sm text-muted-foreground">User ID: {user.id}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteUser(user.id)} disabled={user.id === activeUser?.id}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleSaveChanges)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Username</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., john.doe" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder={editingUser ? "Leave blank to keep current password" : "At least 6 characters"} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Role</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a role" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                            <SelectItem value="viewer">Viewer</SelectItem>
                                                        </SelectContent>
                                                    </Select>
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
