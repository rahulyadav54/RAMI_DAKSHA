
'use client';

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useUser, useFirestore } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, BookCheck, Sparkles, Brain, History, ArrowRight } from "lucide-react";
import { generateHomework } from "@/ai/flows/generate-homework";
import { useToast } from "@/hooks/use-toast";

export default function HomeworkPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !db) return;
    const fetchHistory = async () => {
      const q = query(collection(db, "users", user.uid, "homework"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchHistory();
  }, [user, db]);

  const handleGenerate = async () => {
    if (!user || !db) return;
    setIsLoading(true);
    try {
      // Analyze recent quiz attempts for weak areas
      const attemptsQ = query(collection(db, "users", user.uid, "attempts"), orderBy("completedAt", "desc"));
      const attemptsSnap = await getDocs(attemptsQ);
      const weakAreas: string[] = [];
      
      attemptsSnap.docs.slice(0, 3).forEach(doc => {
        const data = doc.data();
        data.evaluations?.forEach((evalItem: any) => {
          if (evalItem.correctnessScore < 60) {
            weakAreas.push(evalItem.question.substring(0, 30));
          }
        });
      });

      const result = await generateHomework({
        weakAreas: weakAreas.length > 0 ? weakAreas.slice(0, 3) : ["General Reading Comprehension"],
        gradeLevel: 9
      });

      const homeworkRef = collection(db, "users", user.uid, "homework");
      const data = {
        assignments: result.assignments,
        createdAt: serverTimestamp(),
        isCompleted: false
      };
      
      const newDoc = await addDoc(homeworkRef, data);
      
      // Optimistically update history with a JS Date to avoid toDate() crash
      setHistory(prev => [{ id: newDoc.id, ...data, createdAt: new Date() }, ...prev]);
      setAssignments(result.assignments);
      
      toast({ title: "Homework Ready!", description: "Tailored to your recent performance." });
    } catch (err) {
      toast({ variant: "destructive", title: "Failed", description: "AI Assistant is resting." });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (val: any) => {
    if (!val) return "Just now";
    if (typeof val.toDate === 'function') return val.toDate().toLocaleDateString();
    if (val instanceof Date) return val.toLocaleDateString();
    return "Just now";
  };

  return (
    <div className="container mx-auto p-4 md:p-12 max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-accent text-white rounded-full px-4 font-bold uppercase tracking-widest text-[10px]">
            <Sparkles className="h-3 w-3 mr-2" /> Learning Assistant
          </Badge>
          <h1 className="text-4xl font-headline font-bold">Personalized Homework</h1>
          <p className="text-muted-foreground text-lg">AI-powered tasks focused on your growth areas.</p>
        </div>
        <Button size="lg" className="rounded-2xl h-14 px-8 gap-2 shadow-xl shadow-primary/20" onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Brain className="h-5 w-5" />}
          Generate New Task
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {assignments.length > 0 ? assignments.map((assign, i) => (
            <Card key={i} className="border-none shadow-xl overflow-hidden rounded-[2rem] bg-white">
              <CardHeader className="bg-primary/5 p-8 border-b">
                <CardTitle className="text-2xl font-headline text-primary">{assign.topic}</CardTitle>
                <CardDescription className="text-base mt-2">{assign.explanation}</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Exercises</h4>
                  {assign.exercises.map((ex: string, j: number) => (
                    <div key={j} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/10">
                      <Checkbox id={`ex-${i}-${j}`} className="mt-1" />
                      <label htmlFor={`ex-${i}-${j}`} className="text-lg leading-relaxed cursor-pointer">{ex}</label>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 p-4 justify-center">
                <Button variant="ghost" className="gap-2">Submit for Review <ArrowRight className="h-4 w-4" /></Button>
              </CardFooter>
            </Card>
          )) : (
             <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 rounded-[3rem] border-4 border-dashed border-muted">
                <BookCheck className="h-20 w-20 text-muted-foreground opacity-20" />
                <h3 className="text-2xl font-bold">No Active Assignment</h3>
                <p className="text-muted-foreground max-w-sm">Click generate to receive a custom learning plan based on your quiz history.</p>
             </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg rounded-[2rem]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-accent" /> History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {history.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 text-sm">
                  <div className="space-y-1">
                    <p className="font-bold">Task {history.length - i}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                  </div>
                  <Badge variant={item.isCompleted ? "default" : "secondary"}>
                    {item.isCompleted ? "Done" : "Pending"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
