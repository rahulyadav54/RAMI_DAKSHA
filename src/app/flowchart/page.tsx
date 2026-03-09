"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Workflow, Download, ZoomIn, ZoomOut, RefreshCw, AlertCircle } from "lucide-react";
import mermaid from "mermaid";

export default function FlowchartPage() {
  const [mermaidCode, setMermaidCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [renderError, setRenderError] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const code = sessionStorage.getItem("last_flowchart");
    if (code) {
      setMermaidCode(code);
    }
    setIsLoading(false);
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
          const { svg } = await mermaid.render('mermaid-svg', mermaidCode);
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">Visualizing complex structures...</p>
      </div>
    );
  }

  if (!mermaidCode) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-8 text-center space-y-4">
        <Workflow className="h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold">No Flowchart Found</h2>
        <p className="text-muted-foreground">Upload content first to generate a visual process map.</p>
        <Button asChild className="rounded-full px-8"><a href="/upload">Go to Upload</a></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-6xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold">AI Process Map</h1>
          <p className="text-muted-foreground">A logical flowchart generated from your text material.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Redraw
          </Button>
          <Button variant="secondary" size="sm" className="rounded-full">
            <Download className="h-4 w-4 mr-2" /> Export SVG
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem]">
        <CardHeader className="bg-primary/5 p-8 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="font-headline flex items-center gap-2">
              <Workflow className="h-5 w-5 text-primary" /> Conceptual Logic
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full bg-white">Mermaid JS</Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><ZoomIn className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><ZoomOut className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 md:p-12 overflow-x-auto">
          {renderError ? (
            <div className="p-12 text-center space-y-4">
              <div className="bg-destructive/10 text-destructive p-4 rounded-2xl inline-block">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Diagram Rendering Error</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                The AI generated a complex diagram that Mermaid couldn't render. Try uploading a simpler version of the text.
              </p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : (
            <div ref={mermaidRef} className="flex justify-center min-h-[400px] w-full" />
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Usage Tip</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Use this flowchart to understand sequences of events, hierarchical relationships, or conditional logic within your study material. Visual learning has been shown to increase information retention by up to 60%.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
