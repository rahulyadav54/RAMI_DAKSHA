"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Video, Play, Download, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { generateVideoSummary } from "@/ai/flows/generate-video-summary-flow";
import { useToast } from "@/hooks/use-toast";

// Increase timeout for video generation
export const maxDuration = 120;

export default function VideoSummaryPage() {
  const [video, setVideo] = useState<{ videoDataUri: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchVideo = async () => {
    const content = sessionStorage.getItem("quiz_content");
    if (!content) {
      toast({ variant: "destructive", title: "Missing Content", description: "Please upload text in New Session first." });
      return;
    }
    
    setIsLoading(true);
    setVideo(null);
    try {
      const result = await generateVideoSummary({ content });
      setVideo(result);
      toast({ title: "Video Ready!", description: "Your cinematic summary has been produced." });
    } catch (err: any) {
      console.error(err);
      toast({ 
        variant: "destructive", 
        title: "Video Generation Error", 
        description: err.message || "The AI engine is busy. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const code = sessionStorage.getItem("last_video_uri");
    if (code) {
      setVideo({ videoDataUri: code });
    }
  }, []);

  useEffect(() => {
    if (video) {
      sessionStorage.setItem("last_video_uri", video.videoDataUri);
    }
  }, [video]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[70vh] space-y-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-headline font-bold">Producing Your Video Summary...</h2>
          <p className="text-muted-foreground max-w-sm">This can take up to 60 seconds. Our Veo AI is visualizing your content into a cinematic experience.</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 min-h-[70vh]">
        <Video className="h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold">No Video Overview Yet</h2>
        <p className="text-muted-foreground max-w-md">Transform your text into a high-fidelity cinematic video overview using Veo 3.</p>
        <Button onClick={fetchVideo} size="lg" className="rounded-full px-8 gap-2">
           <Sparkles className="h-4 w-4" /> Generate Video Summary
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-12 max-w-5xl space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-black">AI Video Overview</h1>
          <p className="text-muted-foreground text-lg">A cinematic visualization of your learning material.</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-2xl text-primary">
          <Video className="h-8 w-8" />
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] bg-black overflow-hidden relative group">
        <video 
          controls 
          className="w-full aspect-video shadow-2xl"
          src={video.videoDataUri}
        />
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
           <Sparkles className="h-3 w-3 text-primary" /> Veo 3 Intelligence
        </div>
      </Card>

      <div className="flex justify-center gap-4">
        <Button size="lg" className="rounded-2xl h-14 px-10 font-bold gap-2 shadow-xl shadow-primary/20" asChild>
          <a href={video.videoDataUri} download="summary.mp4">
            <Download className="h-5 w-5" /> Save MP4
          </a>
        </Button>
        <Button variant="outline" size="lg" className="rounded-2xl h-14 px-10 font-bold gap-2" onClick={fetchVideo}>
          <RefreshCw className="h-5 w-5" /> Regenerate
        </Button>
      </div>

      <Card className="border-none shadow-lg bg-muted/30 rounded-[2rem] p-8">
        <CardHeader>
           <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
             <Sparkles className="h-4 w-4" /> Cognitive Visualization
           </CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-slate-600 leading-relaxed">
             This video was synthesized using Google's Veo-3 model. It uses the semantic context of your source material to create a high-fidelity visual summary, perfect for rapid conceptual anchoring.
           </p>
        </CardContent>
      </Card>
    </div>
  );
}
