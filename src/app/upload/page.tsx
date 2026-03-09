"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, AlertCircle, Sparkles, FileUp, Settings2, Clock, BarChart } from "lucide-react";
import { generateQuizFromContent } from "@/ai/flows/generate-quiz-from-content";
import { detectReadingLevel } from "@/ai/flows/detect-reading-level";
import { generateStudyGuide } from "@/ai/flows/generate-study-guide";
import { generateFlashcards } from "@/ai/flows/generate-flashcards";
import { parseDocument } from "@/lib/document-parser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function UploadPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  
  const [mcqCount, setMcqCount] = useState(3);
  const [shortCount, setShortCount] = useState(2);
  const [tfCount, setTfCount] = useState(2);
  const [blankCount, setBlankCount] = useState(2);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [difficulty, setDifficulty] = useState<'easy' | 'intermediate' | 'hard'>('intermediate');

  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const text = await parseDocument(file);
      setContent(text);
      setShowConfig(true);
      toast({
        title: "Document processed",
        description: `Successfully extracted text from ${file.name}.`,
      });
    } catch (err: any) {
      console.error(err);
      setError("Failed to process document: " + err.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError("Please provide some text content or upload a document first.");
      return;
    }

    if (!user) {
      toast({
        title: "Sign in required",
        description: "You must be logged in to save your learning sessions."
      });
      router.push("/login");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const [readingLevel, quizData, studyGuide, flashcards] = await Promise.all([
        detectReadingLevel({ text: content }),
        generateQuizFromContent({ 
          content,
          mcqCount,
          shortCount,
          tfCount,
          blankCount,
          difficulty
        }),
        generateStudyGuide({ content }),
        generateFlashcards({ content })
      ]);
      
      if (!db) return;

      const sessionsRef = collection(db, "users", user.uid, "sessions");
      const sessionData = {
        content,
        createdAt: serverTimestamp(),
        readingLevel,
        quiz: quizData,
        studyGuide,
        flashcards: flashcards.cards,
        config: {
          timerSeconds,
          mcqCount,
          shortCount,
          tfCount,
          blankCount,
          difficulty
        }
      };

      addDoc(sessionsRef, sessionData)
        .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: sessionsRef.path,
            operation: 'create',
            requestResourceData: sessionData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

      sessionStorage.setItem("last_quiz_data", JSON.stringify(quizData));
      sessionStorage.setItem("last_reading_level", JSON.stringify(readingLevel));
      sessionStorage.setItem("quiz_content", content);
      sessionStorage.setItem("quiz_timer", timerSeconds.toString());
      sessionStorage.setItem("current_session_id", "new-temp-session"); 
      
      router.push("/quiz/preview");
    } catch (err: any) {
      setError("Failed to generate content: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-12 max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-12 space-y-6 text-center mb-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-full px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">
            <Sparkles className="h-3 w-3 mr-2" /> AI Intelligence Hub
          </Badge>
          <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tight text-foreground">
            Create Your <span className="text-primary">Study Kit</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The smarter way to master any material. Upload, configure, and let the AI build your personalized learning environment.
          </p>
        </div>

        <Card className="lg:col-span-7 border-none shadow-2xl shadow-primary/5 bg-white/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold font-headline">Reading Material</CardTitle>
              <div className="flex gap-2">
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-2xl border-2 hover:bg-primary hover:text-white transition-all gap-2 h-10 px-6 font-bold"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <FileUp className="h-4 w-4" /> Upload Document
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Textarea
              placeholder="Paste text or upload a document..."
              className="min-h-[300px] resize-none text-lg p-8 rounded-[2rem] border-none bg-muted/30 focus-visible:ring-primary shadow-inner"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (e.target.value.length > 50) setShowConfig(true);
              }}
              disabled={isProcessing}
            />
          </CardContent>
        </Card>

        <div className="lg:col-span-5 space-y-6">
          <Card className={cn(
            "border-none shadow-2xl shadow-primary/5 bg-white/50 backdrop-blur-sm rounded-[2.5rem] transition-all duration-700",
            showConfig ? "opacity-100 translate-x-0" : "opacity-50 blur-sm pointer-events-none translate-x-4"
          )}>
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-bold font-headline flex items-center gap-2">
                <Settings2 className="h-6 w-6 text-primary" /> Configuration
              </CardTitle>
              <CardDescription>Tailor the AI's generation parameters.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Multiple Choice</Label>
                  <Input type="number" value={mcqCount} onChange={(e) => setMcqCount(parseInt(e.target.value) || 0)} className="h-12 rounded-2xl bg-muted/50 border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Short Answer</Label>
                  <Input type="number" value={shortCount} onChange={(e) => setShortCount(parseInt(e.target.value) || 0)} className="h-12 rounded-2xl bg-muted/50 border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">True / False</Label>
                  <Input type="number" value={tfCount} onChange={(e) => setTfCount(parseInt(e.target.value) || 0)} className="h-12 rounded-2xl bg-muted/50 border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fill in Blanks</Label>
                  <Input type="number" value={blankCount} onChange={(e) => setBlankCount(parseInt(e.target.value) || 0)} className="h-12 rounded-2xl bg-muted/50 border-none" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-primary/5 p-6 rounded-3xl space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <Label className="font-bold text-sm">Timer (sec/question)</Label>
                  </div>
                  <Input type="number" value={timerSeconds} onChange={(e) => setTimerSeconds(parseInt(e.target.value) || 30)} className="h-12 rounded-2xl bg-white border-none" />
                </div>

                <div className="bg-primary/5 p-6 rounded-3xl space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart className="h-4 w-4 text-primary" />
                    <Label className="font-bold text-sm">Difficulty Level</Label>
                  </div>
                  <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                    <SelectTrigger className="h-12 rounded-2xl bg-white border-none">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy (Recall)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (Inference)</SelectItem>
                      <SelectItem value="hard">Hard (Analysis)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                className="w-full h-16 text-xl rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all gap-3 font-bold" 
                onClick={handleGenerate}
                disabled={isProcessing || !content.trim()}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6" />
                    Build Assessment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
