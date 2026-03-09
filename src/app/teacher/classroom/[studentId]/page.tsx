
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  Award, 
  BookOpen, 
  Loader2, 
  CheckCircle2, 
  Target 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";

export default function StudentStatsPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params);
  const db = useFirestore();
  const router = useRouter();
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !studentId) return;

    const fetchData = async () => {
      // Fetch Profile
      const profileSnap = await getDoc(doc(db, "users", studentId));
      if (profileSnap.exists()) {
        setStudentProfile(profileSnap.data());
      }

      // Fetch Attempts
      const q = query(
        collection(db, "users", studentId, "attempts"), 
        orderBy("completedAt", "asc")
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().completedAt?.toDate?.()?.toLocaleDateString() || '...'
        }));
        setAttempts(data);
        setLoading(false);
      });

      return unsubscribe;
    };

    fetchData();
  }, [db, studentId]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Gathering student insights...</p>
    </div>
  );

  const avgScore = attempts.length > 0 
    ? Math.round(attempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / attempts.length)
    : 0;

  return (
    <div className="container mx-auto p-4 md:p-12 space-y-8 max-w-6xl">
      <Button 
        variant="ghost" 
        className="mb-4 gap-2 rounded-xl"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Classroom
      </Button>

      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-xl">
          <AvatarImage src={`https://picsum.photos/seed/${studentId}/200/200`} />
          <AvatarFallback>{studentProfile?.displayName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-4xl font-headline font-bold">{studentProfile?.displayName}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <Badge variant="secondary" className="rounded-full px-4">{studentProfile?.email}</Badge>
            <Badge variant="outline" className="rounded-full px-4 border-primary/20">Grade {studentProfile?.gradeLevel || 'N/A'}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-primary to-accent text-white">
          <CardContent className="p-8 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Average Mastery</p>
            <h2 className="text-5xl font-black">{avgScore}%</h2>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Award className="h-4 w-4" /> {attempts.length} Assessments Completed
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl">
          <CardContent className="p-8 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Learning Streak</p>
            <h2 className="text-4xl font-black">{studentProfile?.currentStreak || 0} Days</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-500" /> Goal: 10 Days
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl">
          <CardContent className="p-8 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total XP</p>
            <h2 className="text-4xl font-black text-primary">{attempts.length * 100}</h2>
            <p className="text-sm text-muted-foreground">Ranked #4 in Class</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-xl p-8">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Mastery Progression</CardTitle>
          <CardDescription>Visualizing performance trends over time.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] mt-6">
          {attempts.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attempts}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <TrendingUp className="h-12 w-12 opacity-20" />
              <p>No assessment data available for this student yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden">
          <CardHeader className="p-8 bg-muted/30 border-b">
            <CardTitle className="font-headline">Recent Assessment History</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            {attempts.slice().reverse().map((attempt, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${attempt.score >= 80 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Assessment Round {attempts.length - i}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {attempt.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-primary">{attempt.score}%</p>
                  <Badge variant="outline" className="text-[10px] uppercase">{attempt.type || 'Standard'}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl">
          <CardHeader className="p-8">
            <CardTitle className="font-headline">Skill Gap Analysis</CardTitle>
            <CardDescription>AI-identified areas for improvement.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Reading Speed</span>
                  <span className="font-bold">Above Average</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[85%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Vocabulary Recall</span>
                  <span className="font-bold">Average</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[65%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Abstract Synthesis</span>
                  <span className="font-bold text-destructive">Needs Focus</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-destructive w-[35%]" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border-l-4 border-l-primary mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Teacher Advisory</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {studentProfile?.displayName} is excelling in literal recall but struggles with synthesis. Suggest assigning more flowchart-based study tasks.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
