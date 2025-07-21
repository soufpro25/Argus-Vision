
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getUsers } from '@/lib/storage';
import { Logo } from '@/components/logo';

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If a user already exists, redirect away from signup
    if (getUsers().length > 0) {
      toast({
        variant: "destructive",
        title: "Admin already exists",
        description: "Please log in instead.",
      });
      router.push('/login');
    }
  }, [router, toast]);


  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    const success = await signup(data.username, data.password);
    setIsLoading(false);

    if (success) {
      toast({ title: 'Admin account created successfully!' });
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'This username might already be taken.',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <Logo className="mx-auto h-12 w-auto text-primary" />
          <CardTitle className="text-2xl mt-4">Create Admin Account</CardTitle>
          <CardDescription>
            This will be the primary administrator account for Argus Vision.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
