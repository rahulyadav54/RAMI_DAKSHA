
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Headphones, Play, Download, Volume2, Sparkles, MessageSquare, RefreshCw } from "lucide-react";
import { generatePodcast } from "@/ai/flows/generate-podcast-flow";
import { useToast } from "@/hooks/use-toast";

export default function PodcastPage() {
  const [podcast, setPodcast] = useState<{ audioDataUri: string; transcript: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchPodcast = async () => {
    const content = sessionStorage.getItem("quiz_content");
    if (!content) {
      toast({ variant: "destructive", title: "Missing Content", description: "Please upload or paste some text first." });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await generatePodcast({ content });
      setPodcast(result);
      toast({ title: "Podcast Ready!", description: "Host1 and Host2 have summarized your material." });
    } catch (err) {
      console.error(err);
      toast({ 
        variant: "destructive", 
        title: "Podcast Generation Failed", 
        description: "The audio engine is currently at capacity or timed out. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const content = sessionStorage.getItem("quiz_content");
    if (content && !podcast) {
      fetchPodcast();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[70vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xl font-headline font-bold">Synthesizing Audio Overview...</p>
        <p className="text-muted-foreground">Host1 and Host2 are reviewing your material. This may take 30-60 seconds.</p>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 min-h-[70vh]">
        <Headphones className="h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold">No Podcast Generated</h2>
        <p className="text-muted-foreground max-w-md">Click the button below to transform your uploaded content into an AI-powered conversational podcast.</p>
        <Button onClick={fetchPodcast} size="lg" className="rounded-full px-8 gap-2">
           <Sparkles className="h-4 w-4" /> Generate Audio Overview
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-12 max-w-4xl space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-black">AI Podcast Overview</h1>
          <p className="text-muted-foreground text-lg">A conversational summary of your learning material.</p>
        </div>
        <Button variant="outline" className="rounded-full h-12 gap-2 font-bold" onClick={fetchPodcast}>
          <RefreshCw className="h-4 w-4" /> Regenerate
        </Button>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10 p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary p-6 rounded-full shadow-2xl shadow-primary/20">
               <Volume2 className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline">Now Playing: Content Deep Dive</CardTitle>
          <CardDescription className="text-lg mt-2 font-medium">Featuring Host1 and Host2</CardDescription>
        </CardHeader>
        <CardContent className="p-12 flex flex-col items-center gap-8">
          <audio controls className="w-full h-16 rounded-full shadow-inner bg-muted">
            <source src={podcast.audioDataUri} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
          
          <div className="flex gap-4">
            <Button size="lg" className="rounded-2xl h-14 px-8 font-bold gap-2" onClick={() => {
              const audio = document.querySelector('audio');
              audio?.play();
            }}>
              <Play className="h-5 w-5" /> Start Listening
            </Button>
            <Button variant="outline" size="lg" className="rounded-2xl h-14 px-8 font-bold gap-2" asChild>
              <a href={podcast.audioDataUri} download="podcast.wav">
                <Download className="h-5 w-5" /> Download Audio
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl rounded-[2.5rem] bg-muted/20 overflow-hidden">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Script Transcript
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="bg-white/50 p-6 rounded-2xl border border-white/50 whitespace-pre-wrap leading-relaxed text-slate-700 font-medium italic">
            {podcast.transcript}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
