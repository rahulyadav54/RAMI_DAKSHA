'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Bot, 
  LayoutDashboard, 
  PlusCircle, 
  Zap, 
  Layers, 
  Users, 
  Trophy, 
  LogOut,
  Workflow,
  BookCheck,
  Languages,
  School,
  UserCheck,
  PenTool,
  Brain,
  Headphones,
  FileText,
  Video,
  Presentation,
  FileSpreadsheet,
  Image as ImageIcon
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user && db) {
      getDoc(doc(db, "users", user.uid)).then(snap => {
        if (snap.exists()) setProfile(snap.data());
      });
    }
  }, [user, db]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed out", description: "See you again soon!" });
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const role = profile?.role || "student";

  const getNavItems = () => {
    const common = [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ];

    if (role === "teacher") {
      return [
        ...common,
        { href: "/upload", label: "Teacher Tools", icon: School },
        { href: "/teacher/classroom", label: "My Class", icon: UserCheck },
        { href: "/achievements", label: "Achievements", icon: Trophy },
      ];
    }

    if (role === "parent") {
      return [
        ...common,
        { href: "/parent-portal", label: "Parent Portal", icon: Users },
        { href: "/achievements", label: "Achievements", icon: Trophy },
      ];
    }

    // Student Role (Matches requested list)
    return [
      ...common,
      { href: "/upload", label: "New Session", icon: PlusCircle },
      { href: "/speed-quiz", label: "Speed Quiz", icon: Zap },
      { href: "/flashcards", label: "Flashcards", icon: Layers },
      { href: "/ai-tutor", label: "AI Tutor", icon: Bot },
      { href: "/study-guide", label: "Study Guide", icon: FileText },
      { href: "/homework", label: "Homework Hub", icon: BookCheck },
      { href: "/character-chat", label: "Character Chat", icon: Languages },
      { href: "/achievements", label: "Achievements", icon: Trophy },
    ];
  };

  const practiceItems = [
    { href: "/practice/handwriting", label: "Handwriting", icon: PenTool },
    { href: "/practice/math", label: "Math Tutor", icon: Brain },
    { href: "/practice/spelling", label: "Spelling Lab", icon: Headphones },
  ];

  const deepDiveItems = [
    { href: "/podcast", label: "Podcast", icon: Headphones },
    { href: "/video", label: "Video", icon: Video },
    { href: "/flowchart", label: "Process Map", icon: Workflow },
    { href: "/infographic", label: "Infographic", icon: ImageIcon },
    { href: "/slides", label: "Slide Deck", icon: Presentation },
    { href: "/data-table", label: "Data Table", icon: FileSpreadsheet },
  ];

  const navItems = getNavItems();
  const displayName = profile?.displayName || "Scholar";
  const userUid = user?.uid || "guest";

  if (!mounted) return null;

  return (
    <Sidebar className="border-r border-primary/5 bg-white/80 backdrop-blur-xl">
      <SidebarHeader className="p-6 md:p-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-primary p-2.5 rounded-2xl text-white shadow-xl shadow-primary/20 shrink-0">
            <Bot className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <span className="text-2xl font-headline font-bold text-foreground tracking-tight block truncate">SmartRead</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] -mt-1 block">{role} Portal</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarMenu className="gap-1.5">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === item.href}
                className={cn(
                  "h-12 px-4 rounded-2xl transition-all duration-300",
                  pathname === item.href 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5 mr-3 shrink-0" />
                  <span className="font-bold text-[11px] uppercase tracking-wide truncate">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {role === 'student' && (
          <>
            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="px-4 font-black uppercase tracking-widest text-[9px] text-muted-foreground/60 mb-2">Deep Dive Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {deepDiveItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === item.href}
                        className={cn(
                          "h-10 px-4 rounded-xl transition-all duration-300",
                          pathname === item.href 
                            ? "bg-accent/10 text-accent font-bold" 
                            : "text-muted-foreground hover:bg-slate-100"
                        )}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4 mr-3 shrink-0" />
                          <span className="font-bold text-[10px] uppercase tracking-wide truncate">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="px-4 font-black uppercase tracking-widest text-[9px] text-muted-foreground/60 mb-2">Foundation Lab</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {practiceItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === item.href}
                        className={cn(
                          "h-10 px-4 rounded-xl transition-all duration-300",
                          pathname === item.href 
                            ? "bg-accent text-accent-foreground shadow-md" 
                            : "text-muted-foreground hover:bg-accent/5 hover:text-accent"
                        )}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4 mr-3 shrink-0" />
                          <span className="font-bold text-[10px] uppercase tracking-wide truncate">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 md:p-6 border-t border-primary/5">
        <div 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-destructive/5 cursor-pointer group transition-colors"
        >
          <Avatar className="h-10 w-10 border-2 border-white shrink-0">
            <AvatarImage src={`https://picsum.photos/seed/${userUid}/100/100`} />
            <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate leading-none mb-1">{displayName}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 group-hover:text-destructive">
              <LogOut className="h-2.5 w-2.5" /> Log Out
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}