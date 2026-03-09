
'use server';
/**
 * @fileOverview A flow for analyzing handwriting from a data URI image.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeHandwritingInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the student's handwriting, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetText: z.string().describe('The word or sentence the student was supposed to write.'),
});

const AnalyzeHandwritingOutputSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string().describe('Encouraging feedback focusing on letter formation, spacing, and alignment.'),
  suggestions: z.array(z.string()).describe('Specific things the student can improve.'),
});

const prompt = ai.definePrompt({
  name: 'analyzeHandwritingPrompt',
  input: { schema: AnalyzeHandwritingInputSchema },
  output: { schema: AnalyzeHandwritingOutputSchema },
  prompt: `You are an expert elementary school teacher. Analyze this handwriting sample: {{media url=photoDataUri}}.
  The student was trying to write: "{{{targetText}}}".
  
  Evaluate:
  1. Letter Formation: Are the letters recognizable and correctly shaped?
  2. Spacing: Is there consistent space between letters and words?
  3. Alignment: Are the letters sitting on the line?

  Provide a score from 0-100. Be extremely encouraging and supportive. Use language suitable for a young child.
  `,
});

export async function analyzeHandwriting(input: z.infer<typeof AnalyzeHandwritingInputSchema>) {
  const { output } = await prompt(input);
  if (!output) throw new Error('Handwriting analysis failed.');
  return output;
}
