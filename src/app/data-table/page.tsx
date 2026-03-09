
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileSpreadsheet, Download, Copy, Sparkles, Table as TableIcon, RefreshCw } from "lucide-react";
import { generateDataTable } from "@/ai/flows/generate-data-table-flow";
import { useToast } from "@/hooks/use-toast";

export default function DataTablePage() {
  const [tableData, setTableData] = useState<{ markdownTable: string; description: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTable = async () => {
    const content = sessionStorage.getItem("quiz_content");
    if (!content) {
      toast({ variant: "destructive", title: "No Content", description: "Please upload text first." });
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateDataTable({ content });
      setTableData(result);
      toast({ title: "Extraction Complete", description: "Structured data has been synthesized." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Data Extraction Failed", description: "The AI engine is busy. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const content = sessionStorage.getItem("quiz_content");
    if (content && !tableData) {
      fetchTable();
    }
  }, []);

  const copyToClipboard = () => {
    if (tableData) {
      navigator.clipboard.writeText(tableData.markdownTable);
      toast({ title: "Copied!", description: "Markdown table copied to clipboard." });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[70vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xl font-headline font-bold">Extracting Structured Data...</p>
        <p className="text-muted-foreground">Our AI is parsing quantitative data and comparisons.</p>
      </div>
    );
  }

  if (!tableData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 min-h-[70vh]">
        <FileSpreadsheet className="h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold">No Structured Data Found</h2>
        <p className="text-muted-foreground max-w-md">Click generate to identify tabular data, numbers, or comparisons in your uploaded content.</p>
        <Button onClick={fetchTable} size="lg" className="rounded-full px-8 gap-2">
           <Sparkles className="h-4 w-4" /> Extract Data Table
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-12 max-w-5xl space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-black">Data Table</h1>
          <p className="text-muted-foreground text-lg">Structured quantitative extraction from your material.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full h-12" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" /> Copy Markdown
          </Button>
          <Button variant="ghost" className="rounded-full h-12" onClick={fetchTable}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
        <CardHeader className="bg-muted/30 p-8 border-b text-left">
           <CardTitle className="font-headline flex items-center gap-2">
              <TableIcon className="h-5 w-5 text-primary" /> Extracted Insights
           </CardTitle>
           <CardDescription className="text-base font-medium text-slate-600 mt-2">
              {tableData.description}
           </CardDescription>
        </CardHeader>
        <CardContent className="p-8 md:p-12 overflow-x-auto">
          <div className="prose prose-slate max-w-none">
             <div className="bg-slate-50 p-8 rounded-3xl font-mono text-sm leading-relaxed overflow-x-auto border-2 border-dashed border-slate-200">
                {tableData.markdownTable}
             </div>
          </div>
        </CardContent>
        <CardFooter className="bg-primary/5 p-6 flex justify-center">
           <p className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> AI-Synthesized Comparison Model
           </p>
        </CardFooter>
      </Card>

      <div className="p-8 bg-muted/20 rounded-[2.5rem] space-y-4 text-left">
         <h3 className="text-lg font-bold">Why use Data Tables?</h3>
         <p className="text-sm text-slate-600 leading-relaxed">
           Data tables are excellent for "Synoptic Learning"—the ability to see how different parts of a subject relate to one another. By isolating variables, comparisons, or numbers, you can identify patterns that are often lost in paragraph-style text.
         </p>
      </div>
    </div>
  );
}
