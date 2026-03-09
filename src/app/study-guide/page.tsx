
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, FileText, CheckCircle2, Bookmark, Lightbulb, HelpCircle } from "lucide-react";
import { generateStudyGuide, type GenerateStudyGuideOutput } from "@/ai/flows/generate-study-guide";

export default function StudyGuidePage() {
  const [guide, setGuide] = useState<GenerateStudyGuideOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      const content = sessionStorage.getItem("quiz_content");
      if (!content) {
        setIsLoading(false);
        return;
      }
      try {
        const result = await generateStudyGuide({ content });
        setGuide(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuide();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">Synthesizing study materials...</p>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <FileText className="h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold">No Study Guide Yet</h2>
        <p className="text-muted-foreground">Upload content to generate a comprehensive guide.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold">AI Study Guide</h1>
          <p className="text-muted-foreground">Automated summary and key concepts.</p>
        </div>
        <Badge variant="secondary" className="h-8 px-4 text-sm gap-2">
          <Bookmark className="h-4 w-4" /> Save for Offline
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-lg border-primary/10 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {guide.summary}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-primary/10 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" /> Important Practice Questions
              </CardTitle>
              <CardDescription>Test your mastery with these critical concepts and their explanations.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {guide.importantQuestions.map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-b-0 mb-4 bg-muted/30 rounded-xl px-4">
                    <AccordionTrigger className="hover:no-underline py-4 text-left font-bold text-base">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="p-4 bg-white rounded-lg border border-primary/10 text-muted-foreground">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase mb-2">
                          <Lightbulb className="h-3 w-3" /> AI Explanation
                        </div>
                        {item.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-md bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Key Takeaways</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {guide.keyPoints.map((point, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Vocabulary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {guide.vocabulary.map((vocab, i) => (
                  <div key={i} className="space-y-1">
                    <p className="font-bold text-primary">{vocab.word}</p>
                    <p className="text-xs text-muted-foreground">{vocab.definition}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
