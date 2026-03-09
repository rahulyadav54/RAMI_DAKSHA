'use client';

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, Trash2, Sparkles, Loader2, CheckCircle2, FileImage, Image as ImageIcon, RotateCcw, AlertCircle } from "lucide-react";
import { analyzeHandwriting } from "@/ai/flows/analyze-handwriting";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TARGET_WORDS = ["Learning", "Excellence", "Scholar", "Discovery", "Knowledge"];

export default function HandwritingPracticePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [targetWord, setTargetWord] = useState(TARGET_WORDS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'camera'>('upload');
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mode === 'camera') {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
        }
      };
      getCameraPermission();
    } else {
      // Stop camera if switching back to upload
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    }
  }, [mode, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ variant: "destructive", title: "Invalid file type", description: "Please upload an image file." });
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

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPreviewUrl(dataUrl);
      setMode('upload'); // Switch back to preview mode
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
      toast({ title: "Analysis Complete", description: "Feedback generated successfully." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not analyze image." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-12 max-w-5xl space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-primary text-white rounded-full px-4 font-bold uppercase tracking-widest text-[10px]">Foundational Skills</Badge>
          <h1 className="text-4xl font-headline font-bold">Handwriting Lab</h1>
          <p className="text-muted-foreground">Upload or snap a photo of your paper work for AI evaluation.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {TARGET_WORDS.map(word => (
            <Button key={word} variant={targetWord === word ? "default" : "outline"} onClick={() => { setTargetWord(word); setFeedback(null); }} className="rounded-full font-bold">
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
                <CardTitle className="text-2xl font-headline">Writing Sample</CardTitle>
                <CardDescription>Target word: <span className="font-bold text-primary text-xl ml-2">{targetWord}</span></CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setMode(mode === 'upload' ? 'camera' : 'upload')}>
                  {mode === 'upload' ? <Camera className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Switch to {mode === 'upload' ? 'Camera' : 'Upload'}
                </Button>
                {previewUrl && <Button variant="ghost" size="icon" onClick={clearImage} className="rounded-full hover:bg-destructive/10 text-destructive"><Trash2 className="h-5 w-5" /></Button>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 flex-1 flex flex-col items-center justify-center min-h-[400px]">
            {previewUrl ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-primary/20">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              </div>
            ) : mode === 'camera' ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                {!hasCameraPermission && (
                  <Alert variant="destructive" className="absolute m-4">
                    <AlertTitle>Camera Required</AlertTitle>
                    <AlertDescription>Please grant camera access to use this feature.</AlertDescription>
                  </Alert>
                )}
                <canvas ref={canvasRef} className="hidden" />
                <Button size="lg" className="absolute bottom-6 h-16 w-16 rounded-full shadow-2xl" onClick={capturePhoto} disabled={!hasCameraPermission}>
                  <div className="h-12 w-12 rounded-full border-4 border-white" />
                </Button>
              </div>
            ) : (
              <div className="w-full h-full min-h-[300px] border-4 border-dashed border-muted rounded-[2rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-muted/10 transition-all group" onClick={() => fileInputRef.current?.click()}>
                <div className="p-6 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform"><Upload className="h-12 w-12" /></div>
                <div className="text-center"><h3 className="text-xl font-bold">Choose File</h3><p className="text-sm text-muted-foreground">Select a photo from your gallery</p></div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
            )}
          </CardContent>
          <div className="p-8 border-t bg-muted/10 flex justify-center">
            {previewUrl && (
              <Button size="lg" className="rounded-2xl h-14 px-12 gap-2 text-lg font-bold shadow-xl" onClick={handleAnalyze} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                Analyze Penmanship
              </Button>
            )}
          </div>
        </Card>

        <div className="lg:col-span-4 space-y-6">
          {feedback ? (
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="font-headline text-xl">AI Feedback</CardTitle>
                  <div className="h-14 w-14 rounded-2xl bg-primary flex flex-col items-center justify-center text-white font-black">
                    <span className="text-xs uppercase opacity-80">Score</span>
                    <span className="text-xl">{feedback.score}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm leading-relaxed text-slate-700 italic">"{feedback.feedback}"</p>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Sparkles className="h-3 w-3" /> Tips for Mastery</h4>
                  <ul className="space-y-2">
                    {feedback.suggestions.map((s: string, i: number) => (
                      <li key={i} className="text-xs flex gap-2 p-3 bg-white/50 rounded-xl border border-white">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-lg rounded-[2.5rem] bg-muted/20 h-full flex flex-col items-center justify-center text-center p-8 space-y-4 border-4 border-dashed">
              <div className="bg-white/50 p-6 rounded-full"><ImageIcon className="h-12 w-12 text-muted-foreground opacity-20" /></div>
              <h3 className="text-xl font-bold">Awaiting Sample</h3>
              <p className="text-sm text-muted-foreground">Upload or take a photo of your written words. AI will check formation and spacing.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
