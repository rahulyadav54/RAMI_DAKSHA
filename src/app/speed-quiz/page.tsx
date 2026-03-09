
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Timer, AlertCircle, Trophy, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TIMER_SECONDS = 30;

export default function SpeedQuizPage() {
  const router = useRouter();
  const [quizData, setQuizData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    const rawQuiz = sessionStorage.getItem("last_quiz_data");
    if (!rawQuiz) {
      router.push("/upload");
      return;
    }
    const data = JSON.parse(rawQuiz);
    setQuizData(data.multipleChoiceQuestions);
  }, [router]);

  const handleNext = useCallback(() => {
    if (!quizData) return;
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(TIMER_SECONDS);
      setSelectedOption(null);
    } else {
      setIsGameOver(true);
    }
  }, [currentIndex, quizData]);

  useEffect(() => {
    if (isGameOver || !quizData) return;

    if (timeLeft <= 0) {
      handleNext();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isGameOver, quizData, handleNext]);

  const handleAnswer = (option: string) => {
    if (selectedOption || isGameOver) return;
    
    setSelectedOption(option);
    const correct = option === quizData[currentIndex].correctAnswer;
    if (correct) {
      setScore(score + Math.ceil(timeLeft * 10)); // Bonus points for speed
    }

    // Auto-advance after 1 second
    setTimeout(handleNext, 1000);
  };

  if (!quizData) return null;

  if (isGameOver) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[80vh] space-y-6">
        <div className="bg-primary/10 p-8 rounded-full">
          <Trophy className="h-24 w-24 text-primary animate-bounce" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-headline font-bold">Session Complete!</h1>
          <p className="text-muted-foreground text-xl">You've mastered the speed round.</p>
        </div>
        <div className="text-6xl font-black text-primary bg-muted px-12 py-6 rounded-3xl shadow-inner">
          {score} <span className="text-2xl font-normal text-muted-foreground">pts</span>
        </div>
        <div className="flex gap-4">
          <Button size="lg" className="rounded-full px-8" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8" onClick={() => window.location.reload()}>
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = quizData[currentIndex];
  const progress = (currentIndex / quizData.length) * 100;
  const timerPercentage = (timeLeft / TIMER_SECONDS) * 100;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl text-white">
            <Zap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-headline font-bold">Speed Quiz</h1>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-1 gap-2">
          Score: <span className="text-primary font-bold">{score}</span>
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <span>Question {currentIndex + 1} of {quizData.length}</span>
          <span className={cn(timeLeft < 10 && "text-destructive animate-pulse")}>
            {timeLeft}s remaining
          </span>
        </div>
        <Progress value={timerPercentage} className={cn("h-3", timeLeft < 10 ? "bg-destructive/20" : "bg-primary/20")} />
      </div>

      <Card className="shadow-2xl border-primary/10 overflow-hidden">
        <CardHeader className="p-8">
          <CardTitle className="text-2xl md:text-3xl leading-relaxed font-headline">
            {currentQ.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 grid gap-4">
          {currentQ.options.map((opt: string, i: number) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt === currentQ.correctAnswer;
            
            return (
              <Button
                key={i}
                variant="outline"
                className={cn(
                  "h-auto p-6 text-left justify-start text-lg rounded-2xl border-2 transition-all",
                  selectedOption && isCorrect && "bg-green-100 border-green-500 text-green-700",
                  isSelected && !isCorrect && "bg-red-100 border-red-500 text-red-700"
                )}
                onClick={() => handleAnswer(opt)}
                disabled={!!selectedOption}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-bold">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="flex-1">{opt}</span>
                </div>
              </Button>
            );
          })}
        </CardContent>
        <CardFooter className="bg-muted/30 p-4 flex justify-center italic text-sm text-muted-foreground">
          <Timer className="h-4 w-4 mr-2" /> Speed is rewarded! The faster you answer, the higher your score.
        </CardFooter>
      </Card>
    </div>
  );
}
