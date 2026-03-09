"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, CheckCircle, ChevronRight, GraduationCap, Info } from "lucide-react";
import { GenerateQuizFromContentOutput } from "@/ai/flows/generate-quiz-from-content";
import { DetectReadingLevelOutput } from "@/ai/flows/detect-reading-level";

export default function QuizPreview() {
  const router = useRouter();
  const [quizData, setQuizData] = useState<GenerateQuizFromContentOutput | null>(null);
  const [readingLevel, setReadingLevel] = useState<DetectReadingLevelOutput | null>(null);

  useEffect(() => {
    const rawQuiz = sessionStorage.getItem("last_quiz_data");
    const rawLevel = sessionStorage.getItem("last_reading_level");
    if (!rawQuiz) {
      router.push("/upload");
      return;
    }
    setQuizData(JSON.parse(rawQuiz));
    if (rawLevel) setReadingLevel(JSON.parse(rawLevel));
  }, [router]);

  if (!quizData) return null;

  const totalQuestions = 
    quizData.multipleChoiceQuestions.length + 
    quizData.shortAnswerQuestions.length + 
    quizData.trueFalseQuestions.length + 
    quizData.fillInTheBlanksQuestions.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="container mx-auto p-4 md:p-8 flex-1 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <h1 className="text-3xl font-headline font-bold">Quiz Preview</h1>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Questions Generated
              </CardTitle>
              <CardDescription>Review the structure of your custom assessment.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  <section>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Multiple Choice</h3>
                    <div className="space-y-3">
                      {quizData.multipleChoiceQuestions.map((q, i) => (
                        <div key={i} className="p-3 bg-muted/30 rounded border text-sm">
                          <p className="font-medium mb-1">{q.question}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {q.options.map((opt, j) => (
                              <div key={j} className="text-[12px] opacity-70">• {opt}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Short Answer</h3>
                    <div className="space-y-3">
                      {quizData.shortAnswerQuestions.map((q, i) => (
                        <div key={i} className="p-3 bg-muted/30 rounded border text-sm">
                          <p className="font-medium">{q.question}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" /> Reading Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Grade Level</span>
                <Badge variant="secondary" className="text-lg px-3">
                  Grade {readingLevel?.gradeLevelScore || "N/A"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Flesch Ease</span>
                <Badge variant="outline" className="text-lg px-3">
                  {readingLevel?.fleschReadingEase || "0"}
                </Badge>
              </div>
              <div className="p-3 bg-white rounded-lg border text-xs text-muted-foreground">
                <Info className="h-3 w-3 inline mr-1" />
                {readingLevel?.explanation || "Analyzing complexity..."}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-headline">Quiz Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Questions</span>
                <span className="font-bold">{totalQuestions}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Multiple Choice</span>
                <span>{quizData.multipleChoiceQuestions.length}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Short Answer</span>
                <span>{quizData.shortAnswerQuestions.length}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>True/False</span>
                <span>{quizData.trueFalseQuestions.length}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full gap-2" size="lg" onClick={() => router.push("/quiz/take")}>
                Start Assessment <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}