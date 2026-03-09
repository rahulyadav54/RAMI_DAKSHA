'use server';
/**
 * @fileOverview A Genkit flow for detecting the reading level of provided text content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectReadingLevelInputSchema = z.object({
  text: z.string().describe('The text content to analyze for reading level.'),
});
export type DetectReadingLevelInput = z.infer<typeof DetectReadingLevelInputSchema>;

const DetectReadingLevelOutputSchema = z.object({
  fleschReadingEase: z
    .number()
    .describe(
      'An estimated Flesch Reading Ease score for the text, typically between 0 (very difficult) and 100 (very easy).'
    ),
  gradeLevelScore: z
    .number()
    .describe(
      'An estimated U.S. grade level score for the text, indicating the number of years of education required to understand it.'
    ),
  explanation: z
    .string()
    .describe(
      'A brief explanation of the reading level scores and what they imply about the text complexity.'
    ),
});
export type DetectReadingLevelOutput = z.infer<typeof DetectReadingLevelOutputSchema>;

export async function detectReadingLevel(
  input: DetectReadingLevelInput
): Promise<DetectReadingLevelOutput> {
  return detectReadingLevelFlow(input);
}

const detectReadingLevelPrompt = ai.definePrompt({
  name: 'detectReadingLevelPrompt',
  input: {schema: DetectReadingLevelInputSchema},
  output: {schema: DetectReadingLevelOutputSchema},
  prompt: `Analyze the following text content and determine its reading complexity.
  
  Based on the content, provide:
  1. An estimated Flesch Reading Ease score (a number between 0 and 100, where higher scores indicate easier readability).
  2. An estimated U.S. grade level score (a number representing the approximate grade level required to understand the text).
  3. A brief explanation of these scores and what they suggest about the text's difficulty.
  
  Text:
  {{{text}}}
  `,
});

export const detectReadingLevelFlow = ai.defineFlow(
  {
    name: 'detectReadingLevelFlow',
    inputSchema: DetectReadingLevelInputSchema,
    outputSchema: DetectReadingLevelOutputSchema,
  },
  async input => {
    const {output} = await detectReadingLevelPrompt(input);
    if (!output) throw new Error('Reading level detection failed.');
    return output;
  }
);
