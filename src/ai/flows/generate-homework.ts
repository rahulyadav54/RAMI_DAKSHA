
'use server';
/**
 * @fileOverview Generates personalized homework based on student weak areas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateHomeworkInputSchema = z.object({
  weakAreas: z.array(z.string()).describe('List of topics the student struggled with.'),
  gradeLevel: z.number().describe('The student\'s current grade level.'),
});

const HomeworkTaskSchema = z.object({
  topic: z.string(),
  explanation: z.string().describe('Brief review of the concept.'),
  exercises: z.array(z.string()).describe('3-5 practice questions or tasks.'),
});

const GenerateHomeworkOutputSchema = z.object({
  assignments: z.array(HomeworkTaskSchema),
});

const prompt = ai.definePrompt({
  name: 'generateHomeworkPrompt',
  input: { schema: GenerateHomeworkInputSchema },
  output: { schema: GenerateHomeworkOutputSchema },
  prompt: `You are a personalized learning assistant. 
  Create a custom homework assignment for a Grade {{{gradeLevel}}} student.
  Focus specifically on improving these weak areas: {{#each weakAreas}}{{{this}}}, {{/each}}.
  
  Each assignment should include a supportive explanation and 3-5 engaging exercises.
  `,
});

export async function generateHomework(input: z.infer<typeof GenerateHomeworkInputSchema>) {
  const { output } = await prompt(input);
  if (!output) throw new Error('Failed to generate homework.');
  return output;
}

export const generateHomeworkFlow = ai.defineFlow(
  {
    name: 'generateHomeworkFlow',
    inputSchema: GenerateHomeworkInputSchema,
    outputSchema: GenerateHomeworkOutputSchema,
  },
  async (input) => generateHomework(input)
);
