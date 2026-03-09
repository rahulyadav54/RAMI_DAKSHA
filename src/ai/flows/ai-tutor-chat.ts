
'use server';
/**
 * @fileOverview A flow for the AI Tutor chat to answer questions about specific content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AITutorChatInputSchema = z.object({
  content: z.string().describe('The context text content being discussed.'),
  query: z.string().describe('The student\'s question about the content.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional()
});
export type AITutorChatInput = z.infer<typeof AITutorChatInputSchema>;

const AITutorChatOutputSchema = z.object({
  answer: z.string().describe('The AI tutor\'s helpful, encouraging response.'),
});
export type AITutorChatOutput = z.infer<typeof AITutorChatOutputSchema>;

const prompt = ai.definePrompt({
  name: 'aiTutorChatPrompt',
  input: { schema: AITutorChatInputSchema },
  output: { schema: AITutorChatOutputSchema },
  prompt: `You are a supportive and knowledgeable AI Reading Tutor. 
  Your goal is to help the student understand the provided text by answering their questions clearly and encouraging critical thinking.
  Only answer based on the provided content. If the answer isn't in the content, say you don't know but suggest what they should look for.

  Context Content: """{{{content}}}"""
  Student Question: {{{query}}}
  `,
});

export async function aiTutorChat(input: AITutorChatInput): Promise<AITutorChatOutput> {
  const { output } = await prompt(input);
  if (!output) throw new Error('AI Tutor could not generate a response.');
  return output;
}

export const aiTutorChatFlow = ai.defineFlow(
  {
    name: 'aiTutorChatFlow',
    inputSchema: AITutorChatInputSchema,
    outputSchema: AITutorChatOutputSchema,
  },
  async (input) => {
    return aiTutorChat(input);
  }
);
