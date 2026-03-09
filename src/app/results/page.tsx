"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, AlertCircle, RefreshCcw, Home, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { EvaluateStudentAnswerOutput } from "@/ai/flows/evaluate-student-answer";

type EvaluationResult = EvaluateStudentAnswerOutput & { question: string; studentAnswer: string };

export default function ResultsPage() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);

  useEffect(() => {
    const rawEvals = sessionStorage.getItem("last_quiz_evaluations");
    if (!rawEvals) {
      router.push("/dashboard");
      return;
    }
    setEvaluations(JSON.parse(rawEvals));
  }, [router]);

  const avgScore = evaluations.length > 0 
    ? Math.round(evaluations.reduce((acc, curr) => acc + curr.correctnessScore, 0) / evaluations.length)
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="container mx-auto p-4 md:p-8 flex-1 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-headline font-bold">Quiz Complete!</h1>
            <div className="inline-flex items-center justify-center p-8 rounded-full bg-primary/10 border-4 border-primary/20 shadow-inner">
              <span className="text-6xl font-bold text-primary">{avgScore}%</span>
            </div>
            <p className="text-xl text-muted-foreground">
              {avgScore >= 80 ? "Excellent work! Your comprehension is strong." : 
               avgScore >= 60 ? "Good effort! A few areas could be refined." : 
               "Keep practicing! Focus on the details in the text."}
            </p>
          </div>

          <div className="grid gap-6">
            <h2 className="text-2xl font-headline font-bold flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary" /> Semantic Feedback
            </h2>
            {evaluations.map((evalItem, i) => (
              <Card key={i} className="overflow-hidden border-l-4 border-l-primary">
                <CardHeader className="bg-muted/30">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg leading-relaxed pr-8">{evalItem.question}</CardTitle>
                    <Badge className={evalItem.correctnessScore > 70 ? "bg-green-500" : "bg-orange-500"}>
                      Score: {evalItem.correctnessScore}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Your Answer</span>
                    <p className="text-sm italic p-3 bg-muted/20 rounded-lg">{evalItem.studentAnswer}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2 p-4 bg-green-50/50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                        <CheckCircle2 className="h-4 w-4" /> Feedback
                      </div>
                      <p className="text-sm text-green-900 leading-relaxed">
                        {evalItem.explanationFeedback}
                      </p>
                    </div>
                    <div className="space-y-2 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                        <TrendingUp className="h-4 w-4" /> Suggested Improvement
                      </div>
                      <p className="text-sm text-blue-900 leading-relaxed">
                        {evalItem.suggestedImprovement}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="px-8 gap-2" asChild>
              <Link href="/dashboard"><Home className="h-4 w-4" /> Go to Dashboard</Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 gap-2" asChild>
              <Link href="/upload"><RefreshCcw className="h-4 w-4" /> Take Another Quiz</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}