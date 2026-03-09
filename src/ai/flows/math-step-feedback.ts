
'use server';
/**
 * @fileOverview A flow for providing step-by-step math feedback.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MathStepInputSchema = z.object({
  problem: z.string().describe('The math problem being solved.'),
  steps: z.array(z.string()).describe('The steps taken by the student so far.'),
  currentInput: z.string().describe('The latest step or answer provided by the student.'),
});

const MathStepOutputSchema = z.object({
  isCorrect: z.boolean(),
  feedback: z.string().describe('Helpful feedback for the student.'),
  hint: z.string().optional().describe('A hint to help the student if they are wrong or stuck.'),
  nextGoal: z.string().optional().describe('What the student should focus on next.'),
});

const prompt = ai.definePrompt({
  name: 'mathStepPrompt',
  input: { schema: MathStepInputSchema },
  output: { schema: MathStepOutputSchema },
  prompt: `You are a supportive math tutor. 
  Problem: "{{{problem}}}"
  Student's Previous Steps: {{#each steps}}{{{this}}}, {{/each}}
  Current Input: "{{{currentInput}}}"

  Evaluate the current input. If it's correct, offer praise and move to the next goal. 
  If it's incorrect, explain WHY it might be wrong without giving the final answer immediately. 
  Provide a gentle hint to guide them toward the correct next step.
  `,
});

export async function mathStepFeedback(input: z.infer<typeof MathStepInputSchema>) {
  const { output } = await prompt(input);
  if (!output) throw new Error('Math feedback failed.');
  return output;
}
