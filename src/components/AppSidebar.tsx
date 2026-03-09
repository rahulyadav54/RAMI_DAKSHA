
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BookOpen, 
  LayoutDashboard, 
  PlusCircle, 
  Zap, 
  Layers, 
  Bot, 
  FileText, 
  Users, 
  Trophy, 
  LogOut,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { href: "/upload", label: "Take a Quiz", icon: PlusCircle, highlight: true },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/speed-quiz", label: "Speed Quiz", icon: Zap },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/ai-tutor", label: "AI Tutor", icon: Bot },
  { href: "/study-guide", label: "Study Guide", icon: FileText },
  { href: "/parent-portal", label: "Parent Portal", icon: Users },
  { href: "/achievements", label: "Achievements", icon: Trophy },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname === "/" || pathname === "/login") return null;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out",
        description: "See you again soon!",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    }
  };

  const displayName = mounted && user ? (user.displayName || "Scholar") : "Scholar";
  const userUid = mounted && user ? user.uid : "guest";

  return (
    <Sidebar className="border-r border-primary/5 bg-white/50 backdrop-blur-xl">
      <SidebarHeader className="p-8">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-2xl text-white shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <Bot className="h-7 w-7" />
          </div>
          <div>
            <span className="text-2xl font-headline font-bold text-foreground tracking-tight block">SmartRead</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] -mt-1 block">AI Tutor</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarMenu className="gap-2">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === item.href}
                className={cn(
                  "h-12 px-4 rounded-2xl transition-all duration-300 group relative",
                  pathname === item.href 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                  item.highlight && pathname !== item.href && "border-2 border-primary/20 bg-primary/5 text-primary"
                )}
              >
                <Link href={item.href} className="flex items-center w-full">
                  <item.icon className={cn(
                    "h-5 w-5 mr-3 transition-transform group-hover:scale-110",
                    pathname === item.href ? "text-primary-foreground" : "text-current"
                  )} />
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.highlight && pathname !== item.href && (
                    <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
                  )}
                  {pathname === item.href && (
                    <div className="absolute right-4 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-primary/5">
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-destructive/5 transition-all duration-300 cursor-pointer group border border-transparent hover:border-destructive/10 text-left"
        >
          <Avatar className="h-11 w-11 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
            <AvatarImage src={`https://picsum.photos/seed/${userUid}/100/100`} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 group-hover:text-destructive transition-colors">
              <LogOut className="h-3 w-3" /> Sign Out
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
