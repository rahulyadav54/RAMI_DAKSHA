"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ImageIcon, Download, Sparkles, RefreshCw, ZoomIn } from "lucide-react";
import { generateInfographic } from "@/ai/flows/generate-infographic-flow";
import { useToast } from "@/hooks/use-toast";

export const maxDuration = 60;

export default function InfographicPage() {
  const [infographic, setInfographic] = useState<{ imageUrl: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchInfographic = async () => {
    const content = sessionStorage.getItem("quiz_content");
    if (!content) {
      toast({ variant: "destructive", title: "No Content", description: "Please upload or paste text first." });
      return;
    }
    setIsLoading(true);
    setInfographic(null);
    try {
      const result = await generateInfographic({ content });
      setInfographic(result);
      toast({ title: "Visual Generated", description: "Concepts mapped successfully." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Image Generation Failed", description: "The AI engine is busy. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const code = sessionStorage.getItem("last_infographic");
    if (code) {
      setInfographic({ imageUrl: code });
    }
  }, []);

  useEffect(() => {
    if (infographic) {
      sessionStorage.setItem("last_infographic", infographic.imageUrl);
    }
  }, [infographic]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[70vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xl font-headline font-bold">Designing Infographic...</p>
        <p className="text-muted-foreground">Translating text into visual concepts. This may take 15-30 seconds.</p>
      </div>
    );
  }

  if (!infographic) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 min-h-[70vh]">
        <ImageIcon className="h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold">No Visual Found</h2>
        <p className="text-muted-foreground max-w-md">Transform your text into a visual infographic map designed for rapid conceptual learning.</p>
        <Button onClick={fetchInfographic} size="lg" className="rounded-full px-8 gap-2">
           <Sparkles className="h-4 w-4" /> Generate Infographic
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-12 max-w-6xl space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-black">AI Infographic</h1>
          <p className="text-muted-foreground text-lg">A visual summary optimized for rapid comprehension.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full h-12" onClick={fetchInfographic}>
            <RefreshCw className="h-4 w-4 mr-2" /> Redraw
          </Button>
          <Button className="rounded-full h-12 gap-2" asChild>
            <a href={infographic.imageUrl} download="infographic.png">
              <Download className="h-4 w-4" /> Save Image
            </a>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden p-8 flex items-center justify-center bg-slate-50">
        <div className="relative w-full max-w-4xl aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white group">
          <img 
            src={infographic.imageUrl} 
            alt="AI Generated Infographic" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Button variant="secondary" className="rounded-full font-bold gap-2" onClick={() => window.open(infographic.imageUrl, '_blank')}>
               <ZoomIn className="h-5 w-5" /> View Fullscreen
             </Button>
          </div>
          <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-primary/10 flex items-center gap-3">
             <Sparkles className="h-6 w-6 text-primary" />
             <div className="text-xs">
                <p className="font-black uppercase tracking-widest text-primary">AI Engine</p>
                <p className="text-slate-500 font-bold">Visual Intelligence</p>
             </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
