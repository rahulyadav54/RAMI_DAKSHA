
'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Loader2, CheckCircle2, HelpCircle, ArrowRight } from "lucide-react";
import { mathStepFeedback } from "@/ai/flows/math-step-feedback";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const PROBLEMS = [
  { id: 1, text: "What is 15 + 27?", answer: "42" },
  { id: 2, text: "Solve for x: 2x + 5 = 13", answer: "4" },
  { id: 3, text: "What is 1/2 + 1/4?", answer: "3/4" }
];

export default function MathPracticePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [currentProblem, setCurrentProblem] = useState(PROBLEMS[0]);
  const [steps, setSteps] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const handleSubmitStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const result = await mathStepFeedback({
        problem: currentProblem.text,
        steps: steps,
        currentInput: input
      });
      
      setFeedback(result);
      if (result.isCorrect) {
        setSteps([...steps, input]);
        setInput("");
        if (input.trim() === currentProblem.answer) {
          toast({ title: "Correct!", description: "You solved the problem!" });
          if (user && db) {
            addDoc(collection(db, "users", user.uid, "practice"), {
              skillType: "math",
              content: currentProblem.text,
              score: 100,
              createdAt: serverTimestamp()
            });
          }
        }
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to get feedback." });
    } finally {
      setIsProcessing(false);
    }
  };

  const nextProblem = () => {
    const idx = PROBLEMS.indexOf(currentProblem);
    const next = PROBLEMS[(idx + 1) % PROBLEMS.length];
    setCurrentProblem(next);
    setSteps([]);
    setFeedback(null);
    setInput("");
  };

  return (
    <div className="container mx-auto p-4 md:p-12 max-w-4xl space-y-8">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="rounded-full px-6 py-1 bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-widest text-[10px]">
          <Brain className="h-3 w-3 mr-2" /> Math Intelligence
        </Badge>
        <h1 className="text-5xl font-headline font-black">Step-by-Step Logic</h1>
        <p className="text-xl text-muted-foreground">Master math concepts with guided AI reasoning.</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
          <CardHeader className="bg-primary p-12 text-white text-center">
            <CardTitle className="text-4xl font-headline mb-4">{currentProblem.text}</CardTitle>
            <CardDescription className="text-white/80 text-lg">Work through the problem step by step.</CardDescription>
          </CardHeader>
          <CardContent className="p-12 space-y-8">
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-4 animate-in slide-in-from-left duration-300">
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">
                    {i + 1}
                  </div>
                  <div className="flex-1 p-4 bg-muted/40 rounded-2xl font-mono text-xl">
                    {step}
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              ))}
            </div>

            {feedback && !feedback.isCorrect && (
              <div className="p-6 bg-orange-50 border-2 border-orange-200 rounded-[2rem] space-y-3 animate-in zoom-in duration-300">
                <div className="flex items-center gap-2 text-orange-700 font-bold">
                  <HelpCircle className="h-5 w-5" /> AI Hint
                </div>
                <p className="text-orange-900 leading-relaxed">{feedback.hint}</p>
                <p className="text-sm text-orange-800 italic">"Try looking at it this way: {feedback.feedback}"</p>
              </div>
            )}

            <form onSubmit={handleSubmitStep} className="relative mt-8">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your next step or final answer..."
                className="h-20 text-2xl px-8 rounded-3xl border-4 border-muted focus:border-primary transition-all shadow-inner"
                disabled={isProcessing}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="absolute right-4 top-4 h-12 w-12 rounded-2xl shadow-xl shadow-primary/20"
                disabled={isProcessing || !input.trim()}
              >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-6 w-6" />}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-muted/10 p-8 flex justify-between items-center">
             <p className="text-sm text-muted-foreground flex items-center gap-2 italic">
               <Sparkles className="h-4 w-4 text-primary" /> The AI understands multiple solution paths.
             </p>
             <Button variant="ghost" className="rounded-full" onClick={nextProblem}>Skip Problem</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
