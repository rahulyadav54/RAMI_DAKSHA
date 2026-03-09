"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useUser, useFirestore } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronRight, ChevronLeft, Timer, AlertCircle } from "lucide-react";
import { evaluateStudentAnswer } from "@/ai/flows/evaluate-student-answer";
import { cn } from "@/lib/utils";

export default function TakeQuiz() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const [quizData, setQuizData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  useEffect(() => {
    const rawQuiz = sessionStorage.getItem("last_quiz_data");
    const rawTimer = sessionStorage.getItem("quiz_timer");
    if (!rawQuiz) {
      router.push("/upload");
      return;
    }
    setQuizData(JSON.parse(rawQuiz));
    if (rawTimer) setTimeLeft(parseInt(rawTimer));
  }, [router]);

  const allQuestions = quizData ? [
    ...quizData.multipleChoiceQuestions.map((q: any) => ({ ...q, type: 'mcq' })),
    ...quizData.shortAnswerQuestions.map((q: any) => ({ ...q, type: 'short' })),
    ...quizData.trueFalseQuestions.map((q: any) => ({ ...q, type: 'tf' })),
    ...quizData.fillInTheBlanksQuestions.map((q: any) => ({ ...q, type: 'blank' })),
  ] : [];

  const handleNext = useCallback(() => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      const rawTimer = sessionStorage.getItem("quiz_timer");
      if (rawTimer) setTimeLeft(parseInt(rawTimer));
    } else {
      handleSubmit();
    }
  }, [currentIndex, allQuestions.length]);

  useEffect(() => {
    if (isSubmitting || allQuestions.length === 0 || isTimerPaused) return;

    if (timeLeft <= 0) {
      handleNext();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isSubmitting, allQuestions.length, handleNext, isTimerPaused]);

  if (!quizData || allQuestions.length === 0) return null;

  const currentQuestion = allQuestions[currentIndex];
  const progress = ((currentIndex + 1) / allQuestions.length) * 100;

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmit = async () => {
    if (!user || !db) return;
    setIsSubmitting(true);
    setIsTimerPaused(true);
    
    try {
      const evaluations = [];
      let correctCount = 0;
      
      for (const [idx, q] of allQuestions.entries()) {
        const studentAns = answers[`q-${idx}`]?.trim() || "";
        
        if (q.type === 'short') {
          const evalResult = await evaluateStudentAnswer({
            question: q.question,
            studentAnswer: studentAns,
            correctAnswer: q.correctAnswer || ""
          });
          evaluations.push({ question: q.question, studentAnswer: studentAns, ...evalResult });
          if (evalResult.correctnessScore > 70) correctCount++;
        } else if (q.type === 'tf') {
          // Normalize True/False check
          const normalizedAns = studentAns.toLowerCase();
          const correctVal = String(q.answer).toLowerCase();
          const isCorrect = normalizedAns === correctVal;
          if (isCorrect) correctCount++;
          evaluations.push({ 
            question: q.question, 
            studentAnswer: studentAns, 
            correctnessScore: isCorrect ? 100 : 0,
            explanationFeedback: isCorrect ? "Correct!" : `The correct answer was ${q.answer ? "True" : "False"}.`
          });
        } else if (q.type === 'blank') {
          const isCorrect = q.blanks.some((b: string) => b.toLowerCase() === studentAns.toLowerCase());
          if (isCorrect) correctCount++;
          evaluations.push({
            question: q.question,
            studentAnswer: studentAns,
            correctnessScore: isCorrect ? 100 : 0,
            explanationFeedback: isCorrect ? "Correct!" : `The expected answer was: ${q.blanks.join(", ")}.`
          });
        } else {
          // MCQ
          const isCorrect = studentAns === q.correctAnswer;
          if (isCorrect) correctCount++;
          evaluations.push({ 
            question: q.question, 
            studentAnswer: studentAns, 
            correctnessScore: isCorrect ? 100 : 0,
            explanationFeedback: isCorrect ? "Correct!" : `The correct answer was ${q.correctAnswer}.`
          });
        }
      }

      const score = Math.round((correctCount / allQuestions.length) * 100);
      
      await addDoc(collection(db, "users", user.uid, "attempts"), {
        sessionId: sessionStorage.getItem("current_session_id") || "unknown",
        type: "standard",
        score,
        evaluations,
        completedAt: serverTimestamp()
      });

      sessionStorage.setItem("last_quiz_evaluations", JSON.stringify(evaluations));
      router.push("/results");
    } catch (err) {
      console.error(err);
      setIsTimerPaused(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <span>Question {currentIndex + 1} / {allQuestions.length}</span>
              <span className="text-primary">• {currentQuestion.type.toUpperCase()}</span>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full font-black text-lg transition-colors",
            timeLeft < 10 ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-primary/10 text-primary"
          )}>
            <Timer className="h-5 w-5" /> {timeLeft}s
          </div>
        </div>
        
        <Progress value={progress} className="h-3" />

        <Card className="shadow-2xl border-primary/10 overflow-hidden min-h-[500px] flex flex-col">
          <CardHeader className="p-8 bg-muted/20 border-b">
            <CardTitle className="text-2xl font-headline leading-tight">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 flex-1 flex flex-col justify-center">
            {currentQuestion.type === 'mcq' && (
              <RadioGroup 
                value={answers[`q-${currentIndex}`]} 
                onValueChange={(v) => setAnswers({ ...answers, [`q-${currentIndex}`]: v })}
                className="space-y-4"
              >
                {currentQuestion.options.map((opt: string, i: number) => (
                  <div key={i} className="flex items-center space-x-4 p-5 rounded-2xl border-2 hover:bg-muted/50 transition-all cursor-pointer">
                    <RadioGroupItem value={opt} id={`opt-${i}`} />
                    <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer text-lg font-medium">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'short' && (
              <div className="space-y-4">
                <Textarea
                  placeholder="Explain your reasoning based on the text..."
                  className="min-h-[200px] text-lg p-6 rounded-2xl border-2 focus:ring-primary shadow-inner"
                  value={answers[`q-${currentIndex}`] || ""}
                  onChange={(e) => setAnswers({ ...answers, [`q-${currentIndex}`]: e.target.value })}
                />
              </div>
            )}

            {currentQuestion.type === 'tf' && (
              <RadioGroup 
                value={answers[`q-${currentIndex}`]} 
                onValueChange={(v) => setAnswers({ ...answers, [`q-${currentIndex}`]: v })}
                className="grid grid-cols-2 gap-6"
              >
                {['True', 'False'].map((opt) => (
                  <div key={opt} className="flex items-center space-x-4 p-8 rounded-2xl border-2 hover:bg-muted/50 transition-all cursor-pointer">
                    <RadioGroupItem value={opt} id={opt} />
                    <Label htmlFor={opt} className="flex-1 text-center font-bold text-xl">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'blank' && (
              <div className="space-y-6 text-center">
                <div className="p-6 bg-muted/30 rounded-2xl italic text-xl">
                   {currentQuestion.question}
                </div>
                <Input 
                  placeholder="Type the missing word..." 
                  className="h-16 text-center text-2xl rounded-2xl border-2 font-bold"
                  value={answers[`q-${currentIndex}`] || ""}
                  onChange={(e) => setAnswers({ ...answers, [`q-${currentIndex}`]: e.target.value })}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-8 bg-muted/10">
            <Button 
              variant="ghost" 
              onClick={handlePrev} 
              disabled={currentIndex === 0 || isSubmitting}
              className="rounded-xl px-6"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button 
              onClick={handleNext} 
              className="rounded-xl px-10 h-12 text-lg gap-2"
              disabled={isSubmitting || !answers[`q-${currentIndex}`]}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Finalizing...
                </>
              ) : (
                <>
                  {currentIndex === allQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
