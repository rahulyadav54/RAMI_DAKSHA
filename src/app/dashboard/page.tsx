
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, limit, onSnapshot, getDoc, doc } from "firebase/firestore";
import { useUser, useFirestore } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, History, Plus, Award, Loader2, Users, GraduationCap, School } from "lucide-react";
import Link from "next/link";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function Dashboard() {
  const { user, loading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [stats, setStats] = useState({ avgScore: 0, totalQuizzes: 0, xp: 0 });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!db) return;

    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();

    const q = query(collection(db, "users", user.uid, "attempts"), orderBy("completedAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().completedAt?.toDate?.()?.toLocaleDateString() || '...'
      }));
      setAttempts(data);
      if (data.length > 0) {
        const avg = Math.round(data.reduce((acc, curr) => acc + (curr.score || 0), 0) / data.length);
        setStats({ avgScore: avg, totalQuizzes: data.length, xp: data.length * 100 });
      }
    });
  }, [user, loading, db, router]);

  if (loading || !profile) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  const isTeacher = profile.role === "teacher";
  const isParent = profile.role === "parent";

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold">Welcome, {profile.displayName}</h1>
          <p className="text-muted-foreground">Logged in as <Badge variant="secondary" className="capitalize">{profile.role}</Badge></p>
        </div>
        {!isTeacher && !isParent && (
          <Button size="lg" className="rounded-2xl" asChild>
            <Link href="/upload"><Plus className="mr-2" /> New Session</Link>
          </Button>
        )}
        {isTeacher && (
          <Button size="lg" variant="accent" className="rounded-2xl" asChild>
            <Link href="/teacher/classroom"><School className="mr-2" /> Class Management</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isTeacher ? (
          <>
            <Card className="rounded-[2rem]">
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">My Students</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">--</CardContent>
            </Card>
            <Card className="rounded-[2rem]">
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Pending Approvals</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold text-accent">0</CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="rounded-[2rem]">
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Mastery Score</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">{stats.avgScore}%</CardContent>
            </Card>
            <Card className="rounded-[2rem]">
              <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">XP Points</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold text-primary">{stats.xp}</CardContent>
            </Card>
          </>
        )}
        <Card className="rounded-[2rem]">
          <CardHeader><CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Activity</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">Active</CardContent>
        </Card>
      </div>

      {!isTeacher && !isParent && (
        <Card className="rounded-[2rem] p-8">
          <CardHeader>
            <CardTitle className="font-headline">Learning Progress</CardTitle>
            <CardDescription>Your quiz performance over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {attempts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attempts}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Start a session to see your data.</div>
            )}
          </CardContent>
        </Card>
      )}

      {isParent && (
        <Card className="rounded-[2rem] p-12 bg-accent/5 border-dashed border-2 border-accent/20">
          <div className="text-center space-y-4">
            <Users className="h-16 w-16 mx-auto text-accent opacity-20" />
            <h2 className="text-2xl font-bold">Parent View Enabled</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Link your child's account in the portal to see their live performance reports.</p>
            <Button variant="accent" className="rounded-xl" asChild>
              <Link href="/parent-portal">Open Parent Portal</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
