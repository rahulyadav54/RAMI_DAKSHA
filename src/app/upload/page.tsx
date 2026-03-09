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
import { Loader2, Upload, FileText, AlertCircle, Sparkles, FileUp, BookOpen, Settings2, Clock } from "lucide-react";
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

export default function UploadPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  
  // Quiz Configuration State
  const [mcqCount, setMcqCount] = useState(3);
  const [shortCount, setShortCount] = useState(2);
  const [tfCount, setTfCount] = useState(2);
  const [blankCount, setBlankCount] = useState(2);
  const [timerSeconds, setTimerSeconds] = useState(60);

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
          blankCount
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
          blankCount
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
      
      router.push("/quiz/preview");
    } catch (err: any) {
      setError("Failed to generate content: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="container mx-auto p-4 md:p-8 flex-1 flex flex-col items-center justify-center">
        <Card className="w-full max-w-3xl shadow-2xl border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-headline font-bold">Create Study Session</CardTitle>
            <CardDescription className="text-lg mt-2">
              Customize your AI assessment based on your reading material.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="content" className="text-lg font-semibold">Reading Material</Label>
                <div>
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
                    className="gap-2 rounded-xl"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    <FileUp className="h-4 w-4" /> Upload Document
                  </Button>
                </div>
              </div>
              
              <Textarea
                id="content"
                placeholder="Paste your article or notes here... AI will build a quiz based on this."
                className="min-h-[200px] resize-none text-base p-6 rounded-2xl border-primary/10 focus:ring-primary shadow-inner bg-white/50"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (e.target.value.length > 50) setShowConfig(true);
                }}
                disabled={isProcessing}
              />
            </div>

            {showConfig && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
                  <Settings2 className="h-4 w-4" /> Configure Your Quiz
                </div>
                <Separator />
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Multiple Choice</Label>
                      <Input 
                        type="number" 
                        min={0} 
                        value={mcqCount} 
                        onChange={(e) => setMcqCount(parseInt(e.target.value) || 0)} 
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Short Answer</Label>
                      <Input 
                        type="number" 
                        min={0} 
                        value={shortCount} 
                        onChange={(e) => setShortCount(parseInt(e.target.value) || 0)} 
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">True / False</Label>
                      <Input 
                        type="number" 
                        min={0} 
                        value={tfCount} 
                        onChange={(e) => setTfCount(parseInt(e.target.value) || 0)} 
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Fill in Blanks</Label>
                      <Input 
                        type="number" 
                        min={0} 
                        value={blankCount} 
                        onChange={(e) => setBlankCount(parseInt(e.target.value) || 0)} 
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <Label className="font-bold">Session Timer (seconds per question)</Label>
                    </div>
                  </div>
                  <Input 
                    type="number" 
                    min={5} 
                    value={timerSeconds} 
                    onChange={(e) => setTimerSeconds(parseInt(e.target.value) || 30)} 
                    className="rounded-xl"
                  />
                </div>
              </div>
            )}

            <Button 
              className="w-full h-16 text-xl rounded-2xl shadow-lg hover:shadow-primary/20 transition-all gap-3" 
              onClick={handleGenerate}
              disabled={isProcessing || !content.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Generating Study Kit...
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6" />
                  Build Assessment
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="justify-center border-t bg-muted/20 p-6 rounded-b-2xl">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold text-center">
              AI will generate your custom questions from the material
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
