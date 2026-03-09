"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  Award, 
  BookOpen, 
  Loader2, 
  CheckCircle2, 
  Target,
  PenTool,
  Brain,
  Headphones,
  MessageSquare,
  Sparkles
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
  const [practices, setPractices] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !studentId) return;

    const fetchData = async () => {
      // Fetch Profile
      const profileSnap = await getDoc(doc(db, "users", studentId));
      if (profileSnap.exists()) {
        setStudentProfile(profileSnap.data());
      }

      // Quiz Attempts
      const qAttempts = query(collection(db, "users", studentId, "attempts"), orderBy("completedAt", "asc"));
      const unsubAttempts = onSnapshot(qAttempts, (snapshot) => {
        setAttempts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // Skill Practice
      const qPractice = query(collection(db, "users", studentId, "practice"), orderBy("createdAt", "desc"));
      const unsubPractice = onSnapshot(qPractice, (snapshot) => {
        setPractices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // Character Interactions
      const qInteractions = query(collection(db, "users", studentId, "interactions"), orderBy("createdAt", "desc"));
      const unsubInteractions = onSnapshot(qInteractions, (snapshot) => {
        setInteractions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });

      return () => {
        unsubAttempts();
        unsubPractice();
        unsubInteractions();
      };
    };

    fetchData();
  }, [db, studentId]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  const formatDate = (val: any) => {
    if (!val) return "Just now";
    if (typeof val.toDate === 'function') return val.toDate().toLocaleDateString();
    return new Date(val).toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-4 md:p-12 space-y-8 max-w-7xl">
      <Button variant="ghost" className="mb-4 gap-2 rounded-xl" onClick={() => router.back()}>
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

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-muted/50 p-1 rounded-2xl h-14">
          <TabsTrigger value="overview" className="rounded-xl px-8 h-12 data-[state=active]:shadow-lg">Performance Overview</TabsTrigger>
          <TabsTrigger value="practice" className="rounded-xl px-8 h-12 data-[state=active]:shadow-lg">Skill Lab Logs</TabsTrigger>
          <TabsTrigger value="chat" className="rounded-xl px-8 h-12 data-[state=active]:shadow-lg">Character Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-primary to-accent text-white">
              <CardContent className="p-8 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">Quiz Mastery</p>
                <h2 className="text-5xl font-black">
                  {attempts.length > 0 ? Math.round(attempts.reduce((a,c) => a + (c.score||0), 0) / attempts.length) : 0}%
                </h2>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Award className="h-4 w-4" /> {attempts.length} Assessments Completed
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[2.5rem] border-none shadow-xl">
              <CardContent className="p-8 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Practice Sessions</p>
                <h2 className="text-4xl font-black">{practices.length}</h2>
                <p className="text-sm text-muted-foreground">Handwriting, Math, Spelling</p>
              </CardContent>
            </Card>
            <Card className="rounded-[2.5rem] border-none shadow-xl">
              <CardContent className="p-8 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Character Interactions</p>
                <h2 className="text-4xl font-black text-primary">{interactions.length}</h2>
                <p className="text-sm text-muted-foreground">Deep comprehension chats</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[2.5rem] border-none shadow-xl p-8">
            <CardHeader><CardTitle className="font-headline text-2xl">Mastery Progression</CardTitle></CardHeader>
            <CardContent className="h-[350px] mt-6">
              {attempts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attempts.map(a => ({ score: a.score, date: formatDate(a.completedAt) }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-muted-foreground">No assessment data yet.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          <div className="grid gap-6">
            {practices.length > 0 ? practices.map((p, i) => (
              <Card key={i} className="rounded-3xl border-none shadow-lg overflow-hidden group">
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
                      <h3 className="text-xl font-bold capitalize">{p.skillType} Lab</h3>
                      <p className="text-sm text-muted-foreground italic">"{p.content}"</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={p.score >= 80 ? "bg-green-500" : "bg-orange-500"}>{p.score}% Mastery</Badge>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">{formatDate(p.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            )) : <div className="text-center py-20 bg-muted/20 rounded-3xl border-4 border-dashed italic">No practice logs found.</div>}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid gap-6">
            {interactions.length > 0 ? interactions.map((chat, i) => (
              <Card key={i} className="rounded-3xl border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-primary/5 p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Conversation with {chat.characterName}</CardTitle>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase">{formatDate(chat.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-4">
                      {chat.messages.map((m: any, j: number) => (
                        <div key={j} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "")}>
                          <div className={cn("max-w-[80%] p-3 rounded-2xl text-sm", 
                            m.role === 'user' ? "bg-primary text-white rounded-tr-none" : "bg-muted text-foreground rounded-tl-none")}>
                            {m.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )) : <div className="text-center py-20 bg-muted/20 rounded-3xl border-4 border-dashed italic">No conversation logs yet.</div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
