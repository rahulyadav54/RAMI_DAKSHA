'use client';

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useUser, useFirestore } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, TrendingUp, Calendar, AlertCircle, CheckCircle2, Loader2, Sparkles, BookOpen, PenTool, Brain, Headphones, MessageSquare } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

export default function ParentPortalPage() {
  const { user, loading } = useUser();
  const db = useFirestore();
  const [studentData, setStudentData] = useState<any>(null);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [practices, setPractices] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    if (!user || !db) return;

    // Profile Listen
    const unsubUser = onSnapshot(collection(db, "users"), (snapshot) => {
      const current = snapshot.docs.find(d => d.id === user.uid);
      if (current) setStudentData(current.data());
    });

    // Quiz Attempts
    const qAttempts = query(collection(db, "users", user.uid, "attempts"), orderBy("completedAt", "desc"));
    const unsubAttempts = onSnapshot(qAttempts, (snapshot) => {
      setRecentAttempts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Practices
    const qPractice = query(collection(db, "users", user.uid, "practice"), orderBy("createdAt", "desc"));
    const unsubPractice = onSnapshot(qPractice, (snapshot) => {
      setPractices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Interactions
    const qInteractions = query(collection(db, "users", user.uid, "interactions"), orderBy("createdAt", "desc"));
    const unsubInteractions = onSnapshot(qInteractions, (snapshot) => {
      setInteractions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsSyncing(false);
    });

    return () => {
      unsubUser();
      unsubAttempts();
      unsubPractice();
      unsubInteractions();
    };
  }, [user, db]);

  const formatDate = (val: any) => {
    if (!val) return "Just now";
    if (typeof val.toDate === 'function') return val.toDate().toLocaleDateString();
    return new Date(val).toLocaleDateString();
  };

  if (loading || isSyncing) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  const avgScore = recentAttempts.length > 0 
    ? Math.round(recentAttempts.reduce((acc, curr) => acc + curr.score, 0) / recentAttempts.length)
    : 0;

  return (
    <div className="container mx-auto p-4 md:p-12 space-y-8 max-w-7xl animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-bold flex items-center gap-3">
            Parent Portal <Badge variant="secondary" className="bg-primary/10 text-primary">Live Sync</Badge>
          </h1>
          <p className="text-muted-foreground text-lg">Monitoring growth for {studentData?.displayName || "Scholar"}.</p>
        </div>
        <Button variant="outline" className="gap-2 rounded-2xl h-12 px-6 border-2 font-bold">
          <Mail className="h-4 w-4" /> Export Progress Report
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-4">
        <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-accent text-white rounded-[2rem]">
          <CardContent className="p-8 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Mastery Level</p>
            <h2 className="text-5xl font-black">{avgScore}%</h2>
            <p className="text-sm font-medium text-white/90">+5% from last week</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-xl rounded-[2rem]">
          <CardContent className="p-8 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Streak</p>
            <h2 className="text-4xl font-black flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-orange-500" /> {studentData?.currentStreak || 0} Days
            </h2>
            <Progress value={70} className="h-2 mt-4" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem] md:col-span-2 bg-muted/20">
          <CardContent className="p-8 flex items-center justify-between h-full">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Badges Earned</p>
              <div className="flex gap-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-primary/10 text-primary">
                    <Award className="h-6 w-6" />
                  </div>
                ))}
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/20 text-primary text-xs font-bold">+4</div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-primary">{studentData?.totalPoints || 0}</p>
              <p className="text-xs uppercase font-bold text-muted-foreground">Total XP</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assessments" className="space-y-8">
        <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 w-full justify-start overflow-x-auto no-scrollbar">
          <TabsTrigger value="assessments" className="rounded-xl px-8 h-12 data-[state=active]:shadow-lg">Assessments</TabsTrigger>
          <TabsTrigger value="skills" className="rounded-xl px-8 h-12 data-[state=active]:shadow-lg">Skill Lab Logs</TabsTrigger>
          <TabsTrigger value="conversations" className="rounded-xl px-8 h-12 data-[state=active]:shadow-lg">AI Conversations</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="grid gap-8 md:grid-cols-3">
          <Card className="md:col-span-2 border-none shadow-xl rounded-[2.5rem] bg-white">
            <CardHeader className="p-8"><CardTitle className="font-headline text-2xl">Quiz History</CardTitle></CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {recentAttempts.map((attempt, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-muted/30 border border-transparent hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${attempt.score > 80 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold">Assessment Round {recentAttempts.length - i}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(attempt.completedAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary">{attempt.score}%</p>
                    <Badge variant="outline" className="text-[10px] uppercase">Standard</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary/5">
            <CardHeader><CardTitle className="font-headline flex items-center gap-2"><AlertCircle className="h-5 w-5 text-accent" /> Advisory</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border-l-4 border-l-accent shadow-sm space-y-2">
                <p className="text-sm font-bold">Next Milestone</p>
                <p className="text-xs text-muted-foreground">Complete 2 more math sessions to earn the "Logic Master" badge.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="grid gap-6">
          {practices.map((p, i) => (
            <Card key={i} className="rounded-3xl border-none shadow-lg overflow-hidden group hover:scale-[1.01] transition-transform">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className={cn("p-4 rounded-2xl", 
                    p.skillType === 'handwriting' ? "bg-blue-100 text-blue-600" :
                    p.skillType === 'math' ? "bg-orange-100 text-orange-600" :
                    "bg-purple-100 text-purple-600"
                  )}>
                    {p.skillType === 'handwriting' ? <PenTool className="h-6 w-6" /> :
                     p.skillType === 'math' ? <Brain className="h-6 w-6" /> :
                     <Headphones className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold capitalize">{p.skillType} Practice</h3>
                    <p className="text-sm text-muted-foreground">Focus: {p.content}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-primary">{p.score}%</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{formatDate(p.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="conversations" className="grid gap-6">
          {interactions.map((chat, i) => (
            <Card key={i} className="rounded-3xl border-none shadow-lg overflow-hidden">
              <CardHeader className="bg-primary/5 p-6 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Chat with {chat.characterName}</CardTitle>
                </div>
                <Badge variant="outline">{formatDate(chat.createdAt)}</Badge>
              </CardHeader>
              <CardContent className="p-6 bg-muted/10">
                <p className="text-sm text-muted-foreground italic line-clamp-2">"{chat.messages[chat.messages.length - 1]?.content}"</p>
                <Button variant="ghost" size="sm" className="mt-4 text-primary font-bold text-xs uppercase tracking-widest">View Full Transcript</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
