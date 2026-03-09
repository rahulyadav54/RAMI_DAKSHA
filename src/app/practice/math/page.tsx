'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Sparkles, Loader2, CheckCircle2, HelpCircle, ArrowRight, RefreshCw } from "lucide-react";
import { mathStepFeedback } from "@/ai/flows/math-step-feedback";
import { generateMathProblem } from "@/ai/flows/generate-math-problem";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ProblemState = 'setup' | 'solving' | 'completed';

export default function MathPracticePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  // Setup State
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<'easy' | 'intermediate' | 'hard'>('intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Solving State
  const [currentProblem, setCurrentProblem] = useState<{ text: string; answer: string } | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isProcessingStep, setIsProcessingStep] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [gameState, setGameState] = useState<ProblemState>('setup');

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a topic or chapter name." });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateMathProblem({ topic, difficulty });
      setCurrentProblem({ text: result.problem, answer: result.correctAnswer });
      setGameState('solving');
      setSteps([]);
      setFeedback(null);
      setInput("");
      toast({ title: "Problem Generated", description: "Let's solve it together!" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "AI could not generate a problem. Try another topic." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessingStep || !currentProblem) return;

    setIsProcessingStep(true);
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
        
        // Check if student reached final answer (semantic check via AI is better but we can check string match for simple cases)
        // If the AI says it's correct and it matches the final target, we're done.
        if (input.trim() === currentProblem.answer || result.nextGoal?.toLowerCase().includes("finish") || result.nextGoal?.toLowerCase().includes("complete")) {
          toast({ title: "Success!", description: "Problem solved correctly!" });
          if (user && db) {
            addDoc(collection(db, "users", user.uid, "practice"), {
              skillType: "math",
              content: currentProblem.text,
              score: 100,
              topic: topic,
              difficulty: difficulty,
              createdAt: serverTimestamp()
            });
          }
          setGameState('completed');
        }
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to get feedback." });
    } finally {
      setIsProcessingStep(false);
    }
  };

  const resetSession = () => {
    setGameState('setup');
    setCurrentProblem(null);
    setSteps([]);
    setFeedback(null);
    setInput("");
  };

  return (
    <div className="container mx-auto p-4 md:p-12 max-w-4xl space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="rounded-full px-6 py-1 bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-widest text-[10px]">
          <Brain className="h-3 w-3 mr-2" /> Math Intelligence
        </Badge>
        <h1 className="text-5xl font-headline font-black">Step-by-Step Logic</h1>
        <p className="text-xl text-muted-foreground">Master any math topic with guided AI reasoning.</p>
      </div>

      {gameState === 'setup' && (
        <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
          <CardHeader className="p-12 text-center space-y-2">
            <CardTitle className="text-3xl font-headline">What are we learning today?</CardTitle>
            <CardDescription>Enter a chapter or topic to generate a custom challenge.</CardDescription>
          </CardHeader>
          <CardContent className="p-12 pt-0 space-y-8">
            <form onSubmit={handleStartSession} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Topic or Chapter Name</Label>
                <Input 
                  placeholder="e.g. Fractions, Linear Equations, Geometry..." 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-14 text-lg rounded-2xl border-2 focus:ring-primary shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                  <SelectTrigger className="h-14 rounded-2xl border-2">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy (Fundamentals)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (Standard)</SelectItem>
                    <SelectItem value="hard">Hard (Advanced Logic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl shadow-primary/20 gap-3"
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
                Generate Math Problem
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {gameState === 'solving' && currentProblem && (
        <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
          <CardHeader className="bg-primary p-12 text-white text-center relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 left-4 text-white hover:bg-white/10"
              onClick={resetSession}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-none uppercase tracking-widest text-[10px]">
                {topic} • {difficulty}
              </Badge>
              <CardTitle className="text-4xl font-headline">{currentProblem.text}</CardTitle>
            </div>
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
                disabled={isProcessingStep}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="absolute right-4 top-4 h-12 w-12 rounded-2xl shadow-xl shadow-primary/20"
                disabled={isProcessingStep || !input.trim()}
              >
                {isProcessingStep ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-6 w-6" />}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-muted/10 p-8 flex justify-between items-center">
             <p className="text-sm text-muted-foreground flex items-center gap-2 italic">
               <Sparkles className="h-4 w-4 text-primary" /> The AI understands multiple solution paths.
             </p>
             <Button variant="ghost" className="rounded-full" onClick={resetSession}>New Topic</Button>
          </CardFooter>
        </Card>
      )}

      {gameState === 'completed' && (
        <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden p-12 text-center space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="bg-green-100 p-8 rounded-full text-green-600 animate-bounce">
              <CheckCircle2 className="h-20 w-20" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-headline font-bold">Excellent Logic!</h2>
              <p className="text-xl text-muted-foreground">You successfully navigated the steps of the problem.</p>
            </div>
            <div className="flex gap-4">
              <Button size="lg" className="rounded-2xl h-14 px-8" onClick={resetSession}>
                Practice More
              </Button>
              <Button size="lg" variant="outline" className="rounded-2xl h-14 px-8" onClick={() => window.location.reload()}>
                Try Same Topic
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
