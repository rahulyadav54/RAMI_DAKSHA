
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Video, Play, Download, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { generateVideoSummary } from "@/ai/flows/generate-video-summary-flow";
import { useToast } from "@/hooks/use-toast";

export default function VideoSummaryPage() {
  const [video, setVideo] = useState<{ videoDataUri: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchVideo = async () => {
    const content = sessionStorage.getItem("quiz_content");
    if (!content) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateVideoSummary({ content });
      setVideo(result);
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Video Generation Error", description: "Veo models are currently at capacity. Please try again in a few minutes." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideo();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[70vh] space-y-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-headline font-bold">Producing Your Video Summary...</h2>
          <p className="text-muted-foreground max-w-sm">This can take up to 60 seconds. Our Veo AI is visualizing your content.</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <AlertCircle className="h-16 w-16 text-destructive opacity-20" />
        <h2 className="text-2xl font-bold">Generation Unsuccessful</h2>
        <p className="text-muted-foreground">We couldn't generate the video summary at this time.</p>
        <Button onClick={fetchVideo} className="rounded-full gap-2">
           <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-12 max-w-5xl space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-black">AI Video Overview</h1>
          <p className="text-muted-foreground text-lg">A cinematic visualization generated from your material.</p>
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
           <Sparkles className="h-3 w-3 text-primary" /> Veo 3 Engine
        </div>
      </Card>

      <div className="flex justify-center gap-4">
        <Button size="lg" className="rounded-2xl h-14 px-10 font-bold gap-2 shadow-xl shadow-primary/20" onClick={() => window.open(video.videoDataUri)}>
          <Download className="h-5 w-5" /> Download MP4
        </Button>
        <Button variant="outline" size="lg" className="rounded-2xl h-14 px-10 font-bold gap-2" onClick={fetchVideo}>
          <RefreshCw className="h-5 w-5" /> Regenerate
        </Button>
      </div>

      <Card className="border-none shadow-lg bg-muted/30 rounded-[2.5rem] p-8">
        <CardHeader>
           <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
             <Sparkles className="h-4 w-4" /> AI Visualization Note
           </CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-slate-600 leading-relaxed">
             This video was synthesized using Google's Veo-3 model. It uses the semantic context of your source material to create a high-fidelity visual summary. Ideal for visual learners to grasp the 'big picture' before diving into details.
           </p>
        </CardContent>
      </Card>
    </div>
  );
}
