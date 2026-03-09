
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Presentation, ChevronLeft, ChevronRight, Sparkles, Download, ImageIcon } from "lucide-react";
import { generateSlides } from "@/ai/flows/generate-slides-flow";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function SlidesPage() {
  const [slides, setSlides] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSlides = async () => {
      const content = sessionStorage.getItem("quiz_content");
      if (!content) {
        setIsLoading(false);
        return;
      }
      try {
        const result = await generateSlides({ content });
        setSlides(result.slides);
      } catch (err) {
        console.error(err);
        toast({ variant: "destructive", title: "Slide Generation Failed", description: "Our AI designer is away. Try again later." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlides();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[70vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xl font-headline font-bold">Structuring Your Presentation...</p>
        <p className="text-muted-foreground">Building 5-8 professional slides from your text.</p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <Presentation className="h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold">No Deck Found</h2>
        <p className="text-muted-foreground">Upload content first to generate a structured slide deck.</p>
        <Button asChild><a href="/upload">Go to Upload</a></Button>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="container mx-auto p-4 md:p-12 max-w-6xl space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-black">AI Slide Deck</h1>
          <p className="text-muted-foreground text-lg">A structured presentation based on your material.</p>
        </div>
        <Button variant="outline" className="rounded-full h-12 gap-2 font-bold">
           <Download className="h-4 w-4" /> Export PPTX (Simulated)
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="flex-1 space-y-6">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden aspect-video flex flex-col relative transition-all duration-500">
            <div className="bg-primary p-8 md:p-12 text-white">
               <h2 className="text-3xl md:text-5xl font-headline font-black leading-tight">{currentSlide.title}</h2>
            </div>
            <CardContent className="p-8 md:p-12 flex-1 flex flex-col justify-center">
               <ul className="space-y-4">
                 {currentSlide.content.map((point: string, i: number) => (
                   <li key={i} className="flex items-start gap-4 text-xl font-medium text-slate-700">
                     <span className="h-2 w-2 rounded-full bg-primary mt-3 shrink-0" />
                     {point}
                   </li>
                 ))}
               </ul>
            </CardContent>
            <div className="absolute bottom-6 right-12 text-[10px] font-black uppercase tracking-widest text-slate-300">
               SmartRead AI • Page {currentIndex + 1}
            </div>
          </Card>

          <div className="flex items-center justify-center gap-6">
             <Button 
              variant="outline" 
              size="icon" 
              className="h-14 w-14 rounded-full border-2" 
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
             >
               <ChevronLeft className="h-6 w-6" />
             </Button>
             <div className="bg-muted px-6 py-2 rounded-full font-black text-sm">
                {currentIndex + 1} / {slides.length}
             </div>
             <Button 
              variant="outline" 
              size="icon" 
              className="h-14 w-14 rounded-full border-2" 
              disabled={currentIndex === slides.length - 1}
              onClick={() => setCurrentIndex(currentIndex + 1)}
             >
               <ChevronRight className="h-6 w-6" />
             </Button>
          </div>
        </div>

        <aside className="lg:w-80 space-y-6">
           <Card className="border-none shadow-xl rounded-[2rem] bg-accent/5 overflow-hidden">
              <CardHeader className="bg-accent/10">
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2">
                    <ImageIcon className="h-3 w-3" /> Visual Suggestion
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 <p className="text-sm italic leading-relaxed text-slate-600">
                    "{currentSlide.visualSuggestion}"
                 </p>
                 <Button variant="outline" size="sm" className="w-full mt-4 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    Search Images
                 </Button>
              </CardContent>
           </Card>

           <Card className="border-none shadow-xl rounded-[2rem] bg-muted/20">
              <CardHeader>
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> Presentation Tip
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 <p className="text-xs leading-relaxed text-slate-500">
                    When presenting this slide, focus on the emotional impact of the data. Use the bullet points as cues rather than reading them verbatim.
                 </p>
              </CardContent>
           </Card>
        </aside>
      </div>
    </div>
  );
}
