
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useUser, useFirestore } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, History, Plus, Award, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function Dashboard() {
  const { user, loading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgScore: 0,
    totalQuizzes: 0,
    masteryLevel: "Beginner",
    xpPoints: 0
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    if (!db) return;

    // Real-time listener for recent sessions
    const sessionsQ = query(
      collection(db, "users", user.uid, "sessions"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribeSessions = onSnapshot(sessionsQ, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Real-time listener for quiz attempts to calculate analytics
    const attemptsQ = query(
      collection(db, "users", user.uid, "attempts"),
      orderBy("completedAt", "asc")
    );

    const unsubscribeAttempts = onSnapshot(attemptsQ, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Format date for chart
        date: doc.data().completedAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || '...'
      }));
      setAttempts(data);

      if (data.length > 0) {
        const totalScore = data.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const avg = Math.round(totalScore / data.length);
        const xp = data.length * 100 + totalScore;
        
        let level = "Scholar";
        if (xp > 5000) level = "Sage";
        else if (xp > 2000) level = "Expert";
        else if (xp > 500) level = "Adept";

        setStats({
          avgScore: avg,
          totalQuizzes: data.length,
          masteryLevel: level,
          xpPoints: xp
        });
      }
    });

    return () => {
      unsubscribeSessions();
      unsubscribeAttempts();
    };
  }, [user, loading, db, router]);

  const formatDate = (val: any) => {
    if (!val) return "Just now";
    if (typeof val.toDate === 'function') return val.toDate().toLocaleDateString();
    if (val instanceof Date) return val.toLocaleDateString();
    return "Just now";
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Loading your academic universe...</p>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-headline font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Hello, {user?.displayName || "Reader"}!
          </h1>
          <p className="text-muted-foreground text-lg">Track your reading growth and academic milestones.</p>
        </div>
        <Button size="lg" className="rounded-2xl shadow-xl shadow-primary/20 gap-2 h-14 px-8 text-lg hover:scale-105 transition-transform" asChild>
          <Link href="/upload"><Plus className="h-6 w-6" /> New Session</Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Mastery Score", value: `${stats.avgScore}%`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Quizzes Taken", value: stats.totalQuizzes, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
          { label: "Rank", value: stats.masteryLevel, icon: Award, color: "text-accent", bg: "bg-accent/10" },
          { label: "XP Gained", value: stats.xpPoints.toLocaleString(), icon: Award, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{item.label}</CardTitle>
              <div className={`${item.bg} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-headline font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Mastery Trend
            </CardTitle>
            <CardDescription>Your quiz performance over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] mt-4">
            {attempts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attempts}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)"
                    dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <div className="bg-muted p-6 rounded-full">
                  <TrendingUp className="h-12 w-12 opacity-20" />
                </div>
                <p className="font-medium">Complete your first quiz to see your progress!</p>
                <Button variant="outline" className="rounded-xl" asChild>
                  <Link href="/upload">Upload Material</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="font-headline font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-accent" /> Recent Activity
              </CardTitle>
              <CardDescription>Your latest study materials.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.length > 0 ? sessions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-all group cursor-pointer border border-transparent hover:border-primary/10">
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-bold truncate pr-4">
                        {s.content.substring(0, 50)}...
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(s.createdAt)}
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          Grade {s.readingLevel?.gradeLevelScore || "?"}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )) : (
                  <div className="text-center py-12 space-y-4">
                    <History className="h-12 w-12 mx-auto opacity-10" />
                    <p className="text-sm text-muted-foreground italic">No history found.</p>
                  </div>
                )}
                <Button variant="outline" className="w-full h-12 rounded-xl border-dashed" asChild>
                  <Link href="/upload">New Session</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
