
'use server';
/**
 * @fileOverview A flow to generate a structured study guide from text content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const maxDuration = 60;

const GenerateStudyGuideInputSchema = z.object({
  content: z.string().describe('The text content to summarize into a study guide.'),
});
export type GenerateStudyGuideInput = z.infer<typeof GenerateStudyGuideInputSchema>;

const GenerateStudyGuideOutputSchema = z.object({
  summary: z.string().describe('A comprehensive executive summary of the content.'),
  keyPoints: z.array(z.string()).describe('A list of critical takeaways.'),
  vocabulary: z.array(z.object({
    word: z.string(),
    definition: z.string()
  })).describe('Key terms and their definitions found in the text.'),
  importantQuestions: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).describe('Critical practice questions with detailed answers.')
});
export type GenerateStudyGuideOutput = z.infer<typeof GenerateStudyGuideOutputSchema>;

export async function generateStudyGuide(input: GenerateStudyGuideInput): Promise<GenerateStudyGuideOutput> {
  return generateStudyGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudyGuidePrompt',
  input: { schema: GenerateStudyGuideInputSchema },
  output: { schema: GenerateStudyGuideOutputSchema },
  prompt: `You are a professional study assistant. Create a detailed study guide from the provided text.
  Include a summary, key takeaways, vocabulary, and practice questions.

  Content: """{{{content}}}"""
  `,
});

export const generateStudyGuideFlow = ai.defineFlow(
  {
    name: 'generateStudyGuideFlow',
    inputSchema: GenerateStudyGuideInputSchema,
    outputSchema: GenerateStudyGuideOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to generate study guide.');
    return output;
  }
);
