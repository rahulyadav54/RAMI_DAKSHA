
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useUser, useFirestore } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, History, Plus, Award, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function Dashboard() {
  const { user, loading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgScore: 0,
    totalSessions: 0,
    topGrade: "N/A"
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    if (!db) return;

    // Real-time listener for sessions
    const sessionsQ = query(
      collection(db, "users", user.uid, "sessions"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribeSessions = onSnapshot(sessionsQ, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Real-time listener for attempts
    const attemptsQ = query(
      collection(db, "users", user.uid, "attempts"),
      orderBy("completedAt", "desc"),
      limit(10)
    );

    const unsubscribeAttempts = onSnapshot(attemptsQ, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAttempts(data);

      if (data.length > 0) {
        const avg = Math.round(data.reduce((acc, curr) => acc + (curr.score || 0), 0) / data.length);
        setStats(prev => ({ ...prev, avgScore: avg, totalSessions: data.length }));
      }
    });

    return () => {
      unsubscribeSessions();
      unsubscribeAttempts();
    };
  }, [user, loading, db, router]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold">Hello, {user?.displayName || "Reader"}!</h1>
          <p className="text-muted-foreground text-lg">Your AI learning dashboard is ready.</p>
        </div>
        <Button size="lg" className="rounded-full shadow-lg gap-2" asChild>
          <Link href="/upload"><Plus className="h-5 w-5" /> New Reading Session</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Total quizzes taken</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Avg. Mastery</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all subjects</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Skill Rank</CardTitle>
            <Award className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Gold</div>
            <p className="text-xs text-muted-foreground mt-1">Advanced Comprehension</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">XP Points</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,250</div>
            <p className="text-xs text-muted-foreground mt-1">Mastery level progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline font-bold">Mastery Trend</CardTitle>
            <CardDescription>Visualizing your reading growth over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {attempts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...attempts].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="completedAt" hide />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
                <TrendingUp className="h-12 w-12 opacity-20" />
                <p>No activity recorded yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline font-bold">Recent Material</CardTitle>
            <CardDescription>Continue where you left off.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.length > 0 ? sessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer">
                  <div className="space-y-1">
                    <p className="text-sm font-bold truncate max-w-[200px]">
                      {s.content.substring(0, 40)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Grade {s.readingLevel?.gradeLevelScore || "?"} • Analysis Ready
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="group-hover:text-primary">
                    <History className="h-4 w-4" />
                  </Button>
                </div>
              )) : (
                <p className="text-sm text-center py-12 text-muted-foreground italic">
                  Upload your first article to see history.
                </p>
              )}
              <Button variant="outline" className="w-full h-12 rounded-xl" asChild>
                <Link href="/history">View Session Library</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
