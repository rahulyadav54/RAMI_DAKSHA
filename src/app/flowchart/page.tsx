"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Workflow, Download, ZoomIn, ZoomOut, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import mermaid from "mermaid";
import { generateFlowchart } from "@/ai/flows/generate-flowchart";
import { useToast } from "@/hooks/use-toast";

export default function FlowchartPage() {
  const [mermaidCode, setMermaidCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchFlowchart = async () => {
    const content = sessionStorage.getItem("quiz_content");
    if (!content) {
      toast({
        variant: "destructive",
        title: "No Content Found",
        description: "Please upload or paste text in the New Session page first.",
      });
      return;
    }

    setIsGenerating(true);
    setRenderError(false);
    try {
      const result = await generateFlowchart({ content });
      setMermaidCode(result.mermaidCode);
      sessionStorage.setItem("last_flowchart", result.mermaidCode);
      toast({
        title: "Flowchart Generated",
        description: "Your visual process map is ready.",
      });
    } catch (err) {
      console.error("Flowchart generation failed:", err);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI was unable to structure the logic. Try a shorter text.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const code = sessionStorage.getItem("last_flowchart");
    if (code) {
      setMermaidCode(code);
    }
  }, []);

  useEffect(() => {
    if (mermaidCode && mermaidRef.current) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          primaryColor: '#57A1E0',
          primaryTextColor: '#fff',
          primaryBorderColor: '#3E12CC',
          lineColor: '#3E12CC',
          secondaryColor: '#3E12CC',
          tertiaryColor: '#f3f4f6',
        },
        securityLevel: 'loose',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        }
      });

      const renderDiagram = async () => {
        try {
          // Clear previous content
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = '';
          }
          const { svg } = await mermaid.render('mermaid-svg-' + Date.now(), mermaidCode);
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
          setRenderError(false);
        } catch (err) {
          console.error("Mermaid rendering failed:", err);
          setRenderError(true);
        }
      };

      renderDiagram();
    }
  }, [mermaidCode]);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-headline font-bold">Mapping Conceptual Logic...</h2>
          <p className="text-muted-foreground max-w-sm">Our AI is analyzing sequences and hierarchies in your text.</p>
        </div>
      </div>
    );
  }

  if (!mermaidCode) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-8 text-center space-y-4">
        <Workflow className="h-20 w-20 text-muted-foreground opacity-20" />
        <h2 className="text-3xl font-headline font-bold">No Process Map Found</h2>
        <p className="text-muted-foreground max-w-md">Transform your text into a logical flowchart to better understand processes and hierarchies.</p>
        <Button onClick={fetchFlowchart} size="lg" className="rounded-full px-10 h-14 gap-2 shadow-xl shadow-primary/20">
           <Sparkles className="h-5 w-5" /> Generate Mind Map
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-12 space-y-8 max-w-6xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-black">AI Process Map</h1>
          <p className="text-muted-foreground text-lg">A visual logic summary generated from your material.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full h-12" onClick={fetchFlowchart}>
            <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
          </Button>
          <Button className="rounded-full h-12 shadow-lg shadow-primary/10">
            <Download className="h-4 w-4 mr-2" /> Export SVG
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[3rem]">
        <CardHeader className="bg-primary/5 p-8 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="font-headline flex items-center gap-2">
              <Workflow className="h-5 w-5 text-primary" /> Conceptual Structure
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full bg-white font-bold px-3">Mermaid JS</Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><ZoomIn className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><ZoomOut className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 md:p-16 overflow-x-auto flex justify-center">
          {renderError ? (
            <div className="p-12 text-center space-y-6">
              <div className="bg-destructive/10 text-destructive p-6 rounded-3xl inline-block">
                <AlertCircle className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Complex Logic Detected</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  The AI generated a structure that is too complex for the current renderer. Try regenerating or using a smaller text segment.
                </p>
              </div>
              <Button onClick={fetchFlowchart} variant="outline" className="rounded-full">Try Regenerating</Button>
            </div>
          ) : (
            <div ref={mermaidRef} className="flex justify-center min-h-[500px] w-full transition-all duration-1000" />
          )}
        </CardContent>
        <CardFooter className="bg-muted/10 p-6 flex justify-center">
           <p className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Visual Intelligence Engine
           </p>
        </CardFooter>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-lg bg-muted/30 rounded-[2rem] p-8">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Why Visual Maps?</CardTitle>
          </CardHeader>
          <p className="text-sm leading-relaxed text-slate-600">
            Flowcharts help bypass "Linear Processing" fatigue. By seeing how concepts connect spatially, your brain can map hierarchical relationships and sequences 60,000x faster than reading plain text.
          </p>
        </Card>
        <Card className="border-none shadow-lg bg-primary/5 rounded-[2rem] p-8">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Usage Tip</CardTitle>
          </CardHeader>
          <p className="text-sm leading-relaxed text-slate-600">
            Use this map as a "Mental Skeleton" before diving into your detailed study guide. If a connection looks wrong, regenerate to see a different structural interpretation.
          </p>
        </Card>
      </div>
    </div>
  );
}
