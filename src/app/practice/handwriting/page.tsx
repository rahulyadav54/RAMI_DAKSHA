
'use client';

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PenTool, Trash2, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { analyzeHandwriting } from "@/ai/flows/analyze-handwriting";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const TARGET_WORDS = ["Learning", "Excellence", "Scholar", "Discovery", "Knowledge"];

export default function HandwritingPracticePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [targetWord, setTargetWord] = useState(TARGET_WORDS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#3E12CC';
    
    // Draw guide lines
    drawGuideLines(ctx);
  }, []);

  const drawGuideLines = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.3); ctx.lineTo(w, h * 0.3);
    ctx.moveTo(0, h * 0.5); ctx.lineTo(w, h * 0.5);
    ctx.moveTo(0, h * 0.7); ctx.lineTo(w, h * 0.7);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#3E12CC';
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGuideLines(ctx);
    setFeedback(null);
  };

  const handleAnalyze = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsProcessing(true);
    try {
      const dataUri = canvas.toDataURL('image/png');
      const result = await analyzeHandwriting({
        photoDataUri: dataUri,
        targetText: targetWord
      });
      setFeedback(result);

      if (user && db) {
        addDoc(collection(db, "users", user.uid, "practice"), {
          skillType: "handwriting",
          content: targetWord,
          score: result.score,
          feedback: result.feedback,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not analyze handwriting." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-12 max-w-5xl space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary text-white">Foundational Skills</Badge>
          <h1 className="text-4xl font-headline font-bold">Handwriting Lab</h1>
          <p className="text-muted-foreground">Practice your penmanship with real-time AI feedback.</p>
        </div>
        <div className="flex gap-2">
          {TARGET_WORDS.map(word => (
            <Button 
              key={word} 
              variant={targetWord === word ? "default" : "outline"}
              onClick={() => { setTargetWord(word); clearCanvas(); }}
              className="rounded-full"
            >
              {word}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="bg-muted/30 p-8 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-headline">Practice Canvas</CardTitle>
                <CardDescription>Write the word: <span className="font-bold text-primary text-xl ml-2">{targetWord}</span></CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={clearCanvas} className="rounded-full h-12 w-12 hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-6 w-6" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-white">
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full aspect-[2/1] cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseOut={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
            />
          </CardContent>
          <div className="p-8 border-t bg-muted/10 flex justify-center">
             <Button 
              size="lg" 
              className="rounded-2xl h-14 px-12 gap-2 text-lg font-bold shadow-xl shadow-primary/20"
              onClick={handleAnalyze}
              disabled={isProcessing}
             >
               {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
               Analyze My Writing
             </Button>
          </div>
        </Card>

        <div className="lg:col-span-4 space-y-6">
          {feedback ? (
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-accent/5 animate-in fade-in slide-in-from-right-4">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="font-headline">AI Feedback</CardTitle>
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-black text-lg">
                    {feedback.score}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border-l-4 border-l-primary shadow-sm">
                  <p className="text-sm leading-relaxed">{feedback.feedback}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-accent" /> Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {feedback.suggestions.map((s: string, i: number) => (
                      <li key={i} className="text-sm flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-lg rounded-[2.5rem] bg-muted/20 h-full flex flex-col items-center justify-center text-center p-8 space-y-4 border-4 border-dashed">
              <PenTool className="h-16 w-16 text-muted-foreground opacity-20" />
              <h3 className="text-xl font-bold">Waiting for Sample</h3>
              <p className="text-sm text-muted-foreground">Pick a word, write it on the lines, and click analyze for a full report.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
