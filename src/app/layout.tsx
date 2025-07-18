import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/hooks/use-auth';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Argus Vision',
  description: 'A self-hosted NVR/VMS system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn("font-sans antialiased", fontSans.variable)}>
          <AuthProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
            <Toaster />
          </AuthProvider>
      </body>
    </html>
  );
}
