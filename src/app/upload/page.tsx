"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  FileUp, 
  Settings2, 
  Clock, 
  BarChart,
  Headphones,
  Video,
  Workflow,
  FileSpreadsheet,
  Layers,
  Presentation,
  Image as ImageIcon,
  BookOpen,
  BookCheck
} from "lucide-react";
import { generateQuizFromContent } from "@/ai/flows/generate-quiz-from-content";
import { detectReadingLevel } from "@/ai/flows/detect-reading-level";
import { generateStudyGuide } from "@/ai/flows/generate-study-guide";
import { generateFlashcards } from "@/ai/flows/generate-flashcards";
import { generateFlowchart } from "@/ai/flows/generate-flowchart";
import { parseDocument } from "@/lib/document-parser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function UploadPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTools, setShowTools] = useState(false);
  
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
      setShowTools(true);
      sessionStorage.setItem("quiz_content", text);
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

  const handleBuildAssessment = async () => {
    if (!content.trim()) {
      setError("Please provide some text content or upload a document first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const [readingLevel, quizData, studyGuide, flashcards, flowchart] = await Promise.all([
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
        generateFlashcards({ content }),
        generateFlowchart({ content })
      ]);
      
      if (!db || !user) {
         sessionStorage.setItem("last_quiz_data", JSON.stringify(quizData));
         sessionStorage.setItem("last_reading_level", JSON.stringify(readingLevel));
         sessionStorage.setItem("last_flowchart", flowchart.mermaidCode);
         sessionStorage.setItem("quiz_timer", timerSeconds.toString());
         router.push("/quiz/preview");
         return;
      }

      const sessionsRef = collection(db, "users", user.uid, "sessions");
      const sessionData = {
        content,
        createdAt: serverTimestamp(),
        readingLevel,
        quiz: quizData,
        studyGuide,
        flashcards: flashcards.cards,
        flowchart: flowchart.mermaidCode,
        config: {
          timerSeconds,
          mcqCount,
          shortCount,
          tfCount,
          blankCount,
          difficulty
        }
      };

      await addDoc(sessionsRef, sessionData);

      sessionStorage.setItem("last_quiz_data", JSON.stringify(quizData));
      sessionStorage.setItem("last_reading_level", JSON.stringify(readingLevel));
      sessionStorage.setItem("last_flowchart", flowchart.mermaidCode);
      sessionStorage.setItem("quiz_timer", timerSeconds.toString());
      sessionStorage.setItem("current_session_id", "new-temp-session"); 
      
      router.push("/quiz/preview");
    } catch (err: any) {
      setError("Failed to generate content: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const tools = [
    { name: "Audio Overview", icon: Headphones, href: "/podcast", color: "bg-blue-500", desc: "Generate an AI podcast based on your sources" },
    { name: "Video Summary", icon: Video, href: "/video", color: "bg-purple-500", desc: "Create a short cinematic overview" },
    { name: "Mind Map", icon: Workflow, href: "/flowchart", color: "bg-emerald-500", desc: "Visualize concepts and logic" },
    { name: "Study Guide", icon: FileSpreadsheet, href: "/study-guide", color: "bg-amber-500", desc: "Comprehensive summary & key points" },
    { name: "Flashcards", icon: Layers, href: "/flashcards", color: "bg-rose-500", desc: "Master terms with active recall" },
    { name: "Quiz Hub", icon: BookCheck, href: "#", onClick: handleBuildAssessment, color: "bg-indigo-500", desc: "AI-generated adaptive assessment" },
    { name: "Infographic", icon: ImageIcon, href: "/infographic", color: "bg-orange-500", desc: "Visual concept visualization" },
    { name: "Slide Deck", icon: Presentation, href: "/slides", color: "bg-teal-500", desc: "Generate a structured presentation" },
    { name: "Data Table", icon: FileSpreadsheet, href: "/data-table", color: "bg-slate-500", desc: "Extract structured tabular data" },
  ];

  return (
    <div className="container mx-auto p-4 md:p-12 max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="space-y-6 text-center mb-12">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-full px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">
          <Sparkles className="h-3 w-3 mr-2" /> AI Intelligence Hub
        </Badge>
        <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tight text-foreground">
          Create Your <span className="text-primary">Study Kit</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Upload any material and watch our AI transform it into a personalized interactive study ecosystem.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        <Card className="lg:col-span-12 border-none shadow-2xl shadow-primary/5 bg-white rounded-[2.5rem] overflow-hidden">
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
              placeholder="Paste text or upload a document to get started..."
              className="min-h-[250px] resize-none text-lg p-8 rounded-[2rem] border-none bg-muted/30 focus-visible:ring-primary shadow-inner"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                sessionStorage.setItem("quiz_content", e.target.value);
                if (e.target.value.length > 20) setShowTools(true);
              }}
              disabled={isProcessing}
            />
          </CardContent>
        </Card>

        {showTools && (
          <div className="lg:col-span-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in zoom-in duration-500">
            {tools.map((tool, i) => (
              <Card 
                key={i} 
                className="group relative overflow-hidden border-none shadow-xl rounded-3xl bg-white hover:scale-[1.02] transition-all cursor-pointer"
                onClick={() => {
                  if (tool.onClick) {
                    tool.onClick();
                  } else {
                    router.push(tool.href);
                  }
                }}
              >
                <div className={cn("absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity", tool.color)} />
                <CardContent className="p-8 flex items-start gap-6">
                  <div className={cn("p-4 rounded-2xl text-white shadow-lg shrink-0", tool.color)}>
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold font-headline">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showTools && (
        <Card className="mt-12 border-none shadow-2xl rounded-[2.5rem] bg-muted/20">
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-bold font-headline flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" /> Assessment Config
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 grid gap-8 md:grid-cols-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Multiple Choice</Label>
                  <Input type="number" value={mcqCount} onChange={(e) => setMcqCount(parseInt(e.target.value) || 0)} className="h-12 rounded-2xl bg-white border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Short Answer</Label>
                  <Input type="number" value={shortCount} onChange={(e) => setShortCount(parseInt(e.target.value) || 0)} className="h-12 rounded-2xl bg-white border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">True / False</Label>
                  <Input type="number" value={tfCount} onChange={(e) => setTfCount(parseInt(e.target.value) || 0)} className="h-12 rounded-2xl bg-white border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fill in Blanks</Label>
                  <Input type="number" value={blankCount} onChange={(e) => setBlankCount(parseInt(e.target.value) || 0)} className="h-12 rounded-2xl bg-white border-none" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Timer (sec/q)</Label>
                    <Input type="number" value={timerSeconds} onChange={(e) => setTimerSeconds(parseInt(e.target.value) || 30)} className="h-12 rounded-2xl bg-white border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Difficulty</Label>
                    <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                      <SelectTrigger className="h-12 rounded-2xl bg-white border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}