
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileText, AlertCircle, Sparkles } from "lucide-react";
import { generateQuizFromContent } from "@/ai/flows/generate-quiz-from-content";
import { detectReadingLevel } from "@/ai/flows/detect-reading-level";
import { generateStudyGuide } from "@/ai/flows/generate-study-guide";
import { generateFlashcards } from "@/ai/flows/generate-flashcards";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function UploadPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError("Please provide some text content first.");
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
      // Parallel GenAI processing for efficiency
      const [readingLevel, quizData, studyGuide, flashcards] = await Promise.all([
        detectReadingLevel({ text: content }),
        generateQuizFromContent({ content }),
        generateStudyGuide({ content }),
        generateFlashcards({ content })
      ]);
      
      if (!db) return;

      // Save to Firestore
      const sessionsRef = collection(db, "users", user.uid, "sessions");
      const docRef = await addDoc(sessionsRef, {
        content,
        createdAt: serverTimestamp(),
        readingLevel,
        quiz: quizData,
        studyGuide,
        flashcards: flashcards.cards
      });

      // Maintain session storage for current workflow
      sessionStorage.setItem("last_quiz_data", JSON.stringify(quizData));
      sessionStorage.setItem("last_reading_level", JSON.stringify(readingLevel));
      sessionStorage.setItem("quiz_content", content);
      sessionStorage.setItem("current_session_id", docRef.id);
      
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
        <Card className="w-full max-w-2xl shadow-2xl border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-headline font-bold">New Reading Session</CardTitle>
            <CardDescription className="text-lg mt-2">
              Transform any text into a masterclass.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <Label htmlFor="content" className="text-lg font-semibold">What are we studying today?</Label>
              <Textarea
                id="content"
                placeholder="Paste an article, chapter, or essay here..."
                className="min-h-[350px] resize-none text-base p-6 rounded-2xl border-primary/10 focus:ring-primary shadow-inner bg-white/50"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isProcessing}
              />
              <div className="flex justify-between items-center px-2">
                <span className="text-xs text-muted-foreground font-mono">{content.length} chars</span>
                <span className="text-xs text-primary/60 flex items-center gap-1">
                   <Sparkles className="h-3 w-3" /> GenAI Optimized
                </span>
              </div>
            </div>

            <Button 
              className="w-full h-16 text-xl rounded-2xl shadow-lg hover:shadow-primary/20 transition-all gap-3" 
              onClick={handleGenerate}
              disabled={isProcessing || !content.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Generating Intelligence...
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6" />
                  Generate Smart Study Kit
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="justify-center border-t bg-muted/20 p-6 rounded-b-2xl">
            <div className="flex gap-8 text-xs text-muted-foreground uppercase tracking-widest font-bold">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> PDF Support
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> AI Quiz
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Flashcards
              </div>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
