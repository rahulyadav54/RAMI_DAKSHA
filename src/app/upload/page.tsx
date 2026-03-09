"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileText, X, AlertCircle } from "lucide-react";
import { generateQuizFromContent } from "@/ai/flows/generate-quiz-from-content";
import { detectReadingLevel } from "@/ai/flows/detect-reading-level";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function UploadPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError("Please provide some text content first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Analyze content first
      const readingLevel = await detectReadingLevel({ text: content });
      
      // Generate quiz
      const quizData = await generateQuizFromContent({ content });
      
      // In a real app, we'd save this to a database. 
      // For this demo, we'll store in sessionStorage and navigate.
      sessionStorage.setItem("last_quiz_data", JSON.stringify(quizData));
      sessionStorage.setItem("last_reading_level", JSON.stringify(readingLevel));
      sessionStorage.setItem("quiz_content", content);
      
      router.push("/quiz/preview");
    } catch (err) {
      setError("Failed to generate quiz. Please try again with different content.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="container mx-auto p-4 md:p-8 flex-1 flex flex-col items-center justify-center">
        <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
              <Upload className="h-6 w-6 text-primary" /> Create New Assessment
            </CardTitle>
            <CardDescription>
              Paste an article, text passage, or textbook chapter below. Our AI will analyze the reading level and generate a comprehensive quiz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="content">Content Body</Label>
              <Textarea
                id="content"
                placeholder="Paste your text here (min 100 words recommended)..."
                className="min-h-[300px] resize-none focus:ring-primary"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isProcessing}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{content.length} characters</span>
                <span>Supports plain text</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="flex items-center gap-2 h-16" disabled={isProcessing}>
                <FileText className="h-5 w-5" />
                <div className="text-left">
                  <div className="text-sm font-bold">Upload PDF</div>
                  <div className="text-[10px]">Extract text automatically</div>
                </div>
              </Button>
              <Button 
                variant="default" 
                className="flex items-center gap-2 h-16" 
                onClick={handleGenerate}
                disabled={isProcessing || !content.trim()}
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <BrainCircuit className="h-5 w-5" />
                )}
                <div className="text-left">
                  <div className="text-sm font-bold">Generate Quiz</div>
                  <div className="text-[10px]">AI-powered comprehension</div>
                </div>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 text-[11px] text-muted-foreground p-4 flex justify-between">
            <p>Maximum content length: 10,000 characters</p>
            <p>AI Tutor is ready</p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

function BrainCircuit({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 5V3a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2Z" />
      <path d="M9 13a3 3 0 0 1 3-3h1" />
      <path d="M15 20h-3a3 3 0 0 1-3-3v-1" />
      <path d="M3 13v-1a2 2 0 0 1 2-2h1" />
      <path d="M18 10h1a2 2 0 0 1 2 2v1" />
      <path d="M12 17v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}