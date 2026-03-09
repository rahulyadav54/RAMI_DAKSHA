"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { GenerateQuizFromContentOutput } from "@/ai/flows/generate-quiz-from-content";
import { evaluateStudentAnswer } from "@/ai/flows/evaluate-student-answer";

export default function TakeQuiz() {
  const router = useRouter();
  const [quizData, setQuizData] = useState<GenerateQuizFromContentOutput | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const rawQuiz = sessionStorage.getItem("last_quiz_data");
    if (!rawQuiz) {
      router.push("/upload");
      return;
    }
    setQuizData(JSON.parse(rawQuiz));
  }, [router]);

  if (!quizData) return null;

  // Flatten questions for linear progression
  const allQuestions = [
    ...quizData.multipleChoiceQuestions.map(q => ({ ...q, type: 'mcq' })),
    ...quizData.shortAnswerQuestions.map(q => ({ ...q, type: 'short' })),
    ...quizData.trueFalseQuestions.map(q => ({ ...q, type: 'tf' })),
    ...quizData.fillInTheBlanksQuestions.map(q => ({ ...q, type: 'fill' })),
  ];

  const currentQuestion = allQuestions[currentIndex];
  const progress = ((currentIndex + 1) / allQuestions.length) * 100;

  const handleNext = () => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, evaluate all answers and save to DB
      // We will evaluate at least one short answer for the demonstration of Semantic Evaluation
      const evaluations = [];
      
      // We only evaluate short answers semantically
      const shortAnswers = allQuestions.filter(q => q.type === 'short');
      
      for (const q of shortAnswers) {
        const studentAns = answers[`q-${allQuestions.indexOf(q)}`] || "";
        const evalResult = await evaluateStudentAnswer({
          question: q.question,
          studentAnswer: studentAns,
          correctAnswer: (q as any).correctAnswer || ""
        });
        evaluations.push({ 
          question: q.question, 
          studentAnswer: studentAns,
          ...evalResult 
        });
      }

      sessionStorage.setItem("last_quiz_evaluations", JSON.stringify(evaluations));
      router.push("/results");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="container mx-auto p-4 md:p-8 flex-1 flex flex-col items-center">
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-muted-foreground">Question {currentIndex + 1} of {allQuestions.length}</span>
            <span className="text-primary">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />

          <Card className="shadow-lg border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-headline leading-relaxed">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 min-h-[200px]">
              {currentQuestion.type === 'mcq' && (
                <RadioGroup 
                  value={answers[`q-${currentIndex}`]} 
                  onValueChange={(v) => setAnswers({ ...answers, [`q-${currentIndex}`]: v })}
                  className="space-y-3"
                >
                  {(currentQuestion as any).options.map((opt: string, i: number) => (
                    <div key={i} className="flex items-center space-x-3 space-y-0 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value={opt} id={`opt-${i}`} />
                      <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer text-base font-normal">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === 'short' && (
                <div className="space-y-4">
                  <Label htmlFor="answer">Write your answer below:</Label>
                  <Textarea
                    id="answer"
                    placeholder="Type your response in your own words..."
                    className="min-h-[150px] text-lg focus:ring-primary"
                    value={answers[`q-${currentIndex}`] || ""}
                    onChange={(e) => setAnswers({ ...answers, [`q-${currentIndex}`]: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground italic">
                    Note: Our AI evaluates your answer based on meaning, not just keywords.
                  </p>
                </div>
              )}

              {currentQuestion.type === 'tf' && (
                <RadioGroup 
                  value={answers[`q-${currentIndex}`]} 
                  onValueChange={(v) => setAnswers({ ...answers, [`q-${currentIndex}`]: v })}
                  className="grid grid-cols-2 gap-4"
                >
                  {['True', 'False'].map((opt) => (
                    <div key={opt} className="flex items-center space-x-3 space-y-0 p-6 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value={opt} id={opt} />
                      <Label htmlFor={opt} className="flex-1 text-center font-bold text-lg">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {currentQuestion.type === 'fill' && (
                <div className="space-y-4">
                  <Label htmlFor="fill">Complete the sentence:</Label>
                  <Textarea
                    id="fill"
                    placeholder="Provide the missing words..."
                    className="min-h-[100px] focus:ring-primary"
                    value={answers[`q-${currentIndex}`] || ""}
                    onChange={(e) => setAnswers({ ...answers, [`q-${currentIndex}`]: e.target.value })}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <Button 
                variant="ghost" 
                onClick={handlePrev} 
                disabled={currentIndex === 0 || isSubmitting}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button 
                onClick={handleNext} 
                className="px-8 gap-2"
                disabled={isSubmitting || !answers[`q-${currentIndex}`]}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Evaluating...
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
          
          <div className="flex justify-center">
            <Button variant="link" className="text-muted-foreground gap-2">
              <Save className="h-4 w-4" /> Save and resume later
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}