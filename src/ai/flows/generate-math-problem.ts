'use server';
/**
 * @fileOverview A flow for generating a specific math problem based on topic and difficulty.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMathProblemInputSchema = z.object({
  topic: z.string().describe('The math topic or chapter (e.g., "Fractions", "Algebraic Expressions").'),
  difficulty: z.enum(['easy', 'intermediate', 'hard']).default('intermediate'),
});

const GenerateMathProblemOutputSchema = z.object({
  problem: z.string().describe('The math problem text.'),
  correctAnswer: z.string().describe('The final numeric or algebraic answer.'),
  explanation: z.string().describe('A brief explanation of how to solve it.'),
});

const prompt = ai.definePrompt({
  name: 'generateMathProblemPrompt',
  input: { schema: GenerateMathProblemInputSchema },
  output: { schema: GenerateMathProblemOutputSchema },
  prompt: `You are a creative math teacher. 
  Generate a math problem for a Grade 9 student based on the following:
  Topic: "{{{topic}}}"
  Difficulty: {{{difficulty}}}
  
  Ensure the problem is clear and solvable. Provide the final answer and a brief explanation of the logic required.
  `,
});

export async function generateMathProblem(input: z.infer<typeof GenerateMathProblemInputSchema>) {
  const { output } = await prompt(input);
  if (!output) throw new Error('Failed to generate math problem.');
  return output;
}

export const generateMathProblemFlow = ai.defineFlow(
  {
    name: 'generateMathProblemFlow',
    inputSchema: GenerateMathProblemInputSchema,
    outputSchema: GenerateMathProblemOutputSchema,
  },
  async (input) => generateMathProblem(input)
);
