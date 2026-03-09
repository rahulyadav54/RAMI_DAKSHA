
'use server';
/**
 * @fileOverview A flow for spelling and phonics feedback.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SpellingInputSchema = z.object({
  targetWord: z.string(),
  attempt: z.string(),
});

const SpellingOutputSchema = z.object({
  isCorrect: z.boolean(),
  phoneticAnalysis: z.string().describe('Analysis of the spelling based on phonics (sounds).'),
  feedback: z.string().describe('Encouraging feedback.'),
  tip: z.string().describe('A tip for remembering how to spell this word.'),
});

const prompt = ai.definePrompt({
  name: 'spellingPrompt',
  input: { schema: SpellingInputSchema },
  output: { schema: SpellingOutputSchema },
  prompt: `You are a literacy coach.
  Target Word: "{{{targetWord}}}"
  Student's Attempt: "{{{attempt}}}"

  Analyze the student's attempt. If it's incorrect, identify which phonetic sounds they are struggling with (e.g., "the 'ph' sound in elephant"). 
  Provide a mnemonic or a phonics tip to help them.
  `,
});

export async function spellingFeedback(input: z.infer<typeof SpellingInputSchema>) {
  const { output } = await prompt(input);
  if (!output) throw new Error('Spelling feedback failed.');
  return output;
}
