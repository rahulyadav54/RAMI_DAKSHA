
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Volume2, Sparkles, Loader2, CheckCircle2, XCircle, Headphones } from "lucide-react";
import { spellingFeedback } from "@/ai/flows/spelling-feedback";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const WORDS = ["Elephant", "Galaxy", "Philosophy", "Rhythm", "Environment"];

export default function SpellingPracticePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [score, setScore] = useState(0);

  const currentWord = WORDS[currentIndex];

  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.rate = 0.8; // Speak slightly slower
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCheck = async () => {
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const result = await spellingFeedback({
        targetWord: currentWord,
        attempt: input
      });
      
      setFeedback(result);
      if (result.isCorrect) {
        setScore(score + 1);
        toast({ title: "Perfect!", description: "You spelled it correctly!" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to analyze spelling." });
    } finally {
      setIsProcessing(false);
    }
  };

  const nextWord = () => {
    setCurrentIndex((currentIndex + 1) % WORDS.length);
    setInput("");
    setFeedback(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-12 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold">Phonics & Spelling</h1>
          <p className="text-muted-foreground text-sm">Listen and type the word you hear.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Session Progress</p>
          <div className="flex items-center gap-3">
            <Progress value={(currentIndex / WORDS.length) * 100} className="w-32 h-2" />
            <span className="text-sm font-bold">{currentIndex + 1} / {WORDS.length}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="bg-primary/5 p-12 flex flex-col items-center gap-6 border-b">
            <Button 
              size="lg" 
              className="h-24 w-24 rounded-full bg-primary hover:scale-110 transition-transform shadow-2xl shadow-primary/20"
              onClick={speak}
            >
              <Volume2 className="h-10 w-10 text-white" />
            </Button>
            <div className="text-center">
              <CardTitle className="text-2xl font-headline">Click to hear the word</CardTitle>
              <CardDescription className="text-base mt-1">Listen carefully for all the sounds!</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-12 space-y-8">
            <div className="space-y-4">
              <div className="relative">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type the word here..."
                  className="h-20 text-3xl text-center font-bold rounded-3xl border-4 border-muted focus:border-primary tracking-widest uppercase shadow-inner"
                  disabled={isProcessing}
                />
                {feedback && (
                  <div className="absolute -right-4 -top-4">
                    {feedback.isCorrect ? (
                      <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg animate-bounce">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-destructive flex items-center justify-center text-white shadow-lg">
                        <XCircle className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button 
                className="w-full h-16 text-xl rounded-2xl font-bold gap-2" 
                onClick={handleCheck}
                disabled={isProcessing || !input.trim()}
              >
                {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
                Check My Spelling
              </Button>
            </div>

            {feedback && (
              <div className={`p-8 rounded-[2rem] border-2 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${feedback.isCorrect ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-bold ${feedback.isCorrect ? 'text-green-800' : 'text-orange-800'}`}>
                    {feedback.isCorrect ? "Perfect Spelling!" : "Almost There!"}
                  </h3>
                  <Badge className={feedback.isCorrect ? 'bg-green-500' : 'bg-orange-500'}>
                    AI Analysis
                  </Badge>
                </div>
                <div className="space-y-2">
                   <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                     <Headphones className="h-3 w-3" /> Phonics Breakdown
                   </p>
                   <p className="text-lg leading-relaxed text-slate-700">{feedback.phoneticAnalysis}</p>
                </div>
                <div className="p-4 bg-white/80 rounded-2xl shadow-sm italic text-sm text-slate-600 border border-muted">
                  <Sparkles className="h-4 w-4 inline mr-2 text-primary" />
                  Tip: {feedback.tip}
                </div>
                {feedback.isCorrect && (
                   <Button className="w-full rounded-xl h-12" onClick={nextWord}>Next Word <Sparkles className="h-4 w-4 ml-2" /></Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
