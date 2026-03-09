
'use server';
/**
 * @fileOverview A flow to generate interactive flashcards from text content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FlashcardSchema = z.object({
  front: z.string().describe('The question or term on the front of the card.'),
  back: z.string().describe('The answer or definition on the back of the card.'),
});

const GenerateFlashcardsInputSchema = z.object({
  content: z.string().describe('The text content to extract flashcards from.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const GenerateFlashcardsOutputSchema = z.object({
  cards: z.array(FlashcardSchema),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: { schema: GenerateFlashcardsInputSchema },
  output: { schema: GenerateFlashcardsOutputSchema },
  prompt: `You are an expert tutor. Create a set of 8-12 high-quality flashcards from the following content.
  Focus on key concepts, vocabulary, and facts.
  Each card should have a clear question/term on the 'front' and a concise answer/definition on the 'back'.

  Content: """{{{content}}}"""
  `,
});

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  const { output } = await prompt(input);
  if (!output) throw new Error('Failed to generate flashcards.');
  return output;
}

export const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async (input) => {
    return generateFlashcards(input);
  }
);
