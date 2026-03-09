
'use client';

import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import { usePathname } from 'next/navigation';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/" || pathname === "/login";

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground overflow-x-hidden">
        <FirebaseClientProvider>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              {!isAuthPage && <AppSidebar />}
              <div className="flex flex-col flex-1 min-w-0">
                {!isAuthPage && (
                  <header className="md:hidden flex items-center h-16 px-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-40 shrink-0">
                    <SidebarTrigger />
                    <div className="ml-4 flex items-center gap-2">
                       <Bot className="h-6 w-6 text-primary" />
                       <span className="font-headline font-bold tracking-tight">SmartRead</span>
                    </div>
                  </header>
                )}
                <main className={cn("flex-1 overflow-y-auto", isAuthPage ? "" : "bg-slate-50/30")}>
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
