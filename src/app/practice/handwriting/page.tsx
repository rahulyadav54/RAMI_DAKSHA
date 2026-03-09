'use client';

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, Trash2, Sparkles, Loader2, CheckCircle2, FileImage, Image as ImageIcon } from "lucide-react";
import { analyzeHandwriting } from "@/ai/flows/analyze-handwriting";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const TARGET_WORDS = ["Learning", "Excellence", "Scholar", "Discovery", "Knowledge"];

export default function HandwritingPracticePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [targetWord, setTargetWord] = useState(TARGET_WORDS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an image file (PNG, JPG, JPEG).",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setFeedback(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setFeedback(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!previewUrl) return;
    
    setIsProcessing(true);
    try {
      const result = await analyzeHandwriting({
        photoDataUri: previewUrl,
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
      
      toast({
        title: "Analysis Complete",
        description: "AI has evaluated your handwriting sample.",
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not analyze handwriting image." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-12 max-w-5xl space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary text-white rounded-full px-4 font-bold uppercase tracking-widest text-[10px]">
            Foundational Skills
          </Badge>
          <h1 className="text-4xl font-headline font-bold">Physical Handwriting Lab</h1>
          <p className="text-muted-foreground">Upload a photo of your written work for real-time AI feedback.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {TARGET_WORDS.map(word => (
            <Button 
              key={word} 
              variant={targetWord === word ? "default" : "outline"}
              onClick={() => { setTargetWord(word); setFeedback(null); }}
              className="rounded-full h-10 px-6 font-bold"
            >
              {word}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden flex flex-col">
          <CardHeader className="bg-muted/30 p-8 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-headline">Handwriting Sample</CardTitle>
                <CardDescription>
                  Word to check: <span className="font-bold text-primary text-xl ml-2">{targetWord}</span>
                </CardDescription>
              </div>
              {previewUrl && (
                <Button variant="ghost" size="icon" onClick={clearImage} className="rounded-full h-12 w-12 hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-6 w-6" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-8 flex-1 flex flex-col items-center justify-center min-h-[400px]">
            {previewUrl ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/10">
                <img 
                  src={previewUrl} 
                  alt="Handwriting Preview" 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div 
                className="w-full h-full min-h-[300px] border-4 border-dashed border-muted rounded-[2rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-muted/10 transition-all group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="p-6 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                  <Upload className="h-12 w-12" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold">Upload Your Writing</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">Click to browse or drag and drop a photo of your paper work.</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
              </div>
            )}
          </CardContent>
          <div className="p-8 border-t bg-muted/10 flex flex-col sm:flex-row justify-center gap-4">
             {!previewUrl ? (
               <Button 
                size="lg" 
                className="rounded-2xl h-14 px-12 gap-2 text-lg font-bold shadow-xl shadow-primary/20"
                onClick={() => fileInputRef.current?.click()}
               >
                 <Camera className="h-5 w-5" /> Take Photo / Upload
               </Button>
             ) : (
               <Button 
                size="lg" 
                className="rounded-2xl h-14 px-12 gap-2 text-lg font-bold shadow-xl shadow-primary/20"
                onClick={handleAnalyze}
                disabled={isProcessing}
               >
                 {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                 Analyze Handwriting
               </Button>
             )}
          </div>
        </Card>

        <div className="lg:col-span-4 space-y-6">
          {feedback ? (
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-accent/5 animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="font-headline text-xl">AI Report</CardTitle>
                  <div className="h-14 w-14 rounded-2xl bg-primary flex flex-col items-center justify-center text-white font-black shadow-lg">
                    <span className="text-xs uppercase tracking-tighter opacity-80">Score</span>
                    <span className="text-xl">{feedback.score}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-white rounded-2xl border-l-4 border-l-primary shadow-sm space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Teacher's Feedback
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-700">{feedback.feedback}</p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-accent" /> Mastery Tips
                  </h4>
                  <ul className="space-y-3">
                    {feedback.suggestions.map((s: string, i: number) => (
                      <li key={i} className="text-sm flex gap-3 p-3 bg-white/50 rounded-xl border border-white">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-slate-600">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-lg rounded-[2.5rem] bg-muted/20 h-full flex flex-col items-center justify-center text-center p-8 space-y-4 border-4 border-dashed">
              <div className="bg-white/50 p-6 rounded-full">
                <FileImage className="h-16 w-16 text-muted-foreground opacity-20" />
              </div>
              <h3 className="text-xl font-bold">Waiting for Sample</h3>
              <p className="text-sm text-muted-foreground">Upload a photo of your writing. The AI will check your letter formation, spacing, and alignment instantly.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
