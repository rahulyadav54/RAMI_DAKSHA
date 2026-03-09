
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  LayoutDashboard, 
  Upload, 
  Zap, 
  Layers, 
  Bot, 
  FileText, 
  Users, 
  Trophy, 
  LogOut,
  ChevronRight,
  PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarProvider
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/firebase";

const navItems = [
  { href: "/upload", label: "Take a Quiz", icon: PlusCircle },
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
  const { user } = useUser();

  if (pathname === "/") return null;

  return (
    <Sidebar className="border-r border-border/50 bg-background">
      <SidebarHeader className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
            <Bot className="h-6 w-6" />
          </div>
          <span className="text-xl font-headline font-bold text-primary tracking-tight">SmartRead AI</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === item.href}
                className={cn(
                  "h-12 px-4 rounded-xl transition-all duration-200 group",
                  pathname === item.href 
                    ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/20" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Link href={item.href} className="flex items-center w-full">
                  <item.icon className={cn(
                    "h-5 w-5 mr-3 transition-transform group-hover:scale-110",
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="flex-1">{item.label}</span>
                  {pathname === item.href && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
          <Avatar className="h-10 w-10 border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
            <AvatarImage src={`https://picsum.photos/seed/${user?.uid || 'guest'}/100/100`} />
            <AvatarFallback className="bg-primary/5 text-primary">
              {user?.displayName?.substring(0, 2).toUpperCase() || "AN"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.displayName || "Alex Newman"}</p>
            <Link href="/" className="text-xs text-muted-foreground flex items-center gap-1 hover:text-destructive transition-colors">
              <LogOut className="h-3 w-3" /> Exit Session
            </Link>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
