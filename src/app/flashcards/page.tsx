"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Layers, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { generateFlashcards } from "@/ai/flows/generate-flashcards";
import { cn } from "@/lib/utils";

export default function FlashcardsPage() {
  const [cards, setCards] = useState<{ front: string; back: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      const content = sessionStorage.getItem("quiz_content");
      if (!content) {
        setIsLoading(false);
        return;
      }
      try {
        const result = await generateFlashcards({ content });
        setCards(result.cards);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCards();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium animate-pulse">Creating your study deck...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <Layers className="h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold">No Content Found</h2>
        <p className="text-muted-foreground">Upload text first to generate flashcards.</p>
        <Button asChild><a href="/upload">Go to Upload</a></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 h-full flex flex-col max-w-4xl">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-headline font-bold">Smart Flashcards</h1>
        <p className="text-muted-foreground">Master key concepts from your reading.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="w-full max-w-2xl perspective-1000">
          <div 
            className={cn(
              "relative w-full aspect-[16/10] cursor-pointer transition-all duration-500 preserve-3d",
              isFlipped && "rotate-y-180"
            )}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front */}
            <Card className="absolute inset-0 backface-hidden shadow-xl border-2 flex items-center justify-center p-8 text-center">
              <CardContent>
                <p className="text-2xl md:text-3xl font-medium leading-tight">
                  {cards[currentIndex].front}
                </p>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-muted-foreground">
                  <RotateCw className="h-3 w-3" /> Click to flip
                </div>
              </CardContent>
            </Card>

            {/* Back */}
            <Card className="absolute inset-0 backface-hidden rotate-y-180 shadow-xl border-2 border-primary/20 bg-primary/5 flex items-center justify-center p-8 text-center">
              <CardContent>
                <p className="text-xl md:text-2xl leading-relaxed text-primary-foreground/90 bg-primary p-6 rounded-2xl shadow-inner">
                  {cards[currentIndex].back}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-12 w-12"
            disabled={currentIndex === 0}
            onClick={() => {
              setIsFlipped(false);
              setTimeout(() => setCurrentIndex(currentIndex - 1), 150);
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="text-sm font-bold bg-muted px-4 py-2 rounded-full">
            {currentIndex + 1} / {cards.length}
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-12 w-12"
            disabled={currentIndex === cards.length - 1}
            onClick={() => {
              setIsFlipped(false);
              setTimeout(() => setCurrentIndex(currentIndex + 1), 150);
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
