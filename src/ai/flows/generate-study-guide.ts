
'use server';
/**
 * @fileOverview A flow to generate a structured study guide from text content including summary, vocabulary, and practice questions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  })).describe('Critical practice questions with detailed answers to help students learn.')
});
export type GenerateStudyGuideOutput = z.infer<typeof GenerateStudyGuideOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateStudyGuidePrompt',
  input: { schema: GenerateStudyGuideInputSchema },
  output: { schema: GenerateStudyGuideOutputSchema },
  prompt: `You are a professional study assistant. Create a detailed study guide from the provided text.
  
  Include:
  1. A high-level, detailed executive summary.
  2. A bulleted list of critical takeaways (key points).
  3. A vocabulary list for difficult or important terms.
  4. A set of 5-8 'Important Questions' with detailed 'Answers' that explain core concepts from the text to help the student master the material.

  Content: """{{{content}}}"""
  `,
});

export async function generateStudyGuide(input: GenerateStudyGuideInput): Promise<GenerateStudyGuideOutput> {
  const { output } = await prompt(input);
  if (!output) throw new Error('Failed to generate study guide.');
  return output;
}

export const generateStudyGuideFlow = ai.defineFlow(
  {
    name: 'generateStudyGuideFlow',
    inputSchema: GenerateStudyGuideInputSchema,
    outputSchema: GenerateStudyGuideOutputSchema,
  },
  async (input) => {
    return generateStudyGuide(input);
  }
);
