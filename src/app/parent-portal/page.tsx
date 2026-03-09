
'use client';

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { useUser, useFirestore } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Mail, TrendingUp, Calendar, AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function ParentPortalPage() {
  const { user, loading } = useUser();
  const db = useFirestore();
  const [studentData, setStudentData] = useState<any>(null);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    if (!user || !db) return;

    // Listen to user profile for points and streaks
    const unsubUser = onSnapshot(collection(db, "users"), (snapshot) => {
      const current = snapshot.docs.find(d => d.id === user.uid);
      if (current) setStudentData(current.data());
    });

    // Listen to quiz attempts for skill tracking
    const q = query(collection(db, "users", user.uid, "attempts"), orderBy("completedAt", "desc"));
    const unsubAttempts = onSnapshot(q, (snapshot) => {
      setRecentAttempts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsSyncing(false);
    });

    return () => {
      unsubUser();
      unsubAttempts();
    };
  }, [user, db]);

  if (loading || isSyncing) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Syncing real-time records...</p>
    </div>
  );

  const avgScore = recentAttempts.length > 0 
    ? Math.round(recentAttempts.reduce((acc, curr) => acc + curr.score, 0) / recentAttempts.length)
    : 0;

  const skillData = [
    { name: "Vocabulary", value: 85 },
    { name: "Inference", value: 62 },
    { name: "Recall", value: 94 },
    { name: "Synthesis", value: 45 },
  ];

  const COLORS = ['#57A1E0', '#3E12CC', '#10B981', '#F59E0B'];

  return (
    <div className="container mx-auto p-4 md:p-12 space-y-8 max-w-7xl animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-bold flex items-center gap-3">
            Parent Portal <Badge variant="secondary" className="bg-primary/10 text-primary">Live Sync</Badge>
          </h1>
          <p className="text-muted-foreground text-lg">Monitoring academic growth for {studentData?.displayName || "Scholar"}.</p>
        </div>
        <Button variant="outline" className="gap-2 rounded-2xl h-12 px-6 border-2 font-bold">
          <Mail className="h-4 w-4" /> Share Progress Report
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

        <Card className="border-none shadow-xl rounded-[2rem] md:col-span-2 overflow-hidden">
          <CardHeader className="pb-0">
             <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Skill Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[120px] p-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={80} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                  {skillData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-2 border-none shadow-xl rounded-[2.5rem] bg-white">
          <CardHeader className="p-8">
            <CardTitle className="font-headline text-2xl">Recent Assessment History</CardTitle>
            <CardDescription>Live feed of student quiz performance.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            {recentAttempts.length > 0 ? recentAttempts.map((attempt, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-muted/30 border border-transparent hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${attempt.score > 80 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold">Assessment #{recentAttempts.length - i}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {attempt.completedAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-primary">{attempt.score}%</p>
                  <Badge variant="outline" className="text-[10px]">{attempt.type || "Standard"}</Badge>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground italic">No assessments logged yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary/5">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-accent" /> Action Needed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border-l-4 border-l-accent shadow-sm space-y-2">
                <p className="text-sm font-bold">Focus Area: Synthesis</p>
                <p className="text-xs text-muted-foreground leading-relaxed">The AI assistant has noticed a struggle with connecting abstract concepts. Suggested focus: Flowchart study.</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border-l-4 border-l-green-500 shadow-sm space-y-2">
                <p className="text-sm font-bold">Achievement Milestone</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Student reached a 5-day reading streak! Encourage them to keep going.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-accent text-white">
              <CardTitle className="text-sm font-bold uppercase tracking-widest">Parent Controls</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 bg-white">
               <div className="flex items-center justify-between">
                 <span className="text-sm font-medium">Daily Limit (30m)</span>
                 <CheckCircle2 className="h-5 w-5 text-green-500" />
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-medium">AI Feedback Level</span>
                 <Badge variant="secondary">Detailed</Badge>
               </div>
               <Button className="w-full h-12 rounded-xl mt-4" variant="outline">Adjust Settings</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
