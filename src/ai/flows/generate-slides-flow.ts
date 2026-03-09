
'use server';
/**
 * @fileOverview A flow to generate a slide deck structure from text content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SlideSchema = z.object({
  title: z.string(),
  content: z.array(z.string()),
  visualSuggestion: z.string(),
});

const GenerateSlidesInputSchema = z.object({
  content: z.string().describe('The content to convert into a slide deck.'),
});

const GenerateSlidesOutputSchema = z.object({
  slides: z.array(SlideSchema),
});

export async function generateSlides(input: z.infer<typeof GenerateSlidesInputSchema>) {
  return generateSlidesFlow(input);
}

export const generateSlidesFlow = ai.defineFlow(
  {
    name: 'generateSlidesFlow',
    inputSchema: GenerateSlidesInputSchema,
    outputSchema: GenerateSlidesOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateSlidesPrompt',
      input: { schema: GenerateSlidesInputSchema },
      output: { schema: GenerateSlidesOutputSchema },
      prompt: `You are an expert presenter. Create a structured 5-8 slide deck based on the following content.
      Each slide should have a clear title, 3-4 bullet points of content, and a suggestion for a visual or image to include on the slide.
      
      Content: """{{{content}}}"""
      `,
    });

    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to generate slides.');
    return output;
  }
);
