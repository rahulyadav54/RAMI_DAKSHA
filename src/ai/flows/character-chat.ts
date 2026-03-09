'use server';
/**
 * @fileOverview A flow for personality-driven character conversations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CharacterChatInputSchema = z.object({
  characterName: z.string().describe('The name of the character to portray.'),
  characterBio: z.string().describe('The personality and background of the character.'),
  message: z.string().describe('The user\'s message.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).optional()
});

const CharacterChatOutputSchema = z.object({
  response: z.string().describe('The character\'s response in their unique voice.'),
});

const prompt = ai.definePrompt({
  name: 'characterChatPrompt',
  input: { schema: CharacterChatInputSchema },
  output: { schema: CharacterChatOutputSchema },
  prompt: `You are portraying the legendary character: {{{characterName}}}.
  Bio/Personality & Backstory: {{{characterBio}}}
  
  GUIDELINES:
  - Converse with the user naturally as this character.
  - Maintain your character traits, vocabulary, and unique quirks at all times.
  - If you are Einstein, use physics metaphors and be kindly but eccentric.
  - If you are Athena, be wise, strategic, and noble.
  - If you are Sherlock, be observant, deductive, and slightly aloof but sharp.
  - Be age-appropriate (supportive elementary/middle school level) but keep the depth of the character.
  - Encourage curiosity and critical thinking.
  - Use your backstory and expertise to provide interesting facts if relevant.

  User says: {{{message}}}
  `,
});

export async function characterChat(input: z.infer<typeof CharacterChatInputSchema>) {
  const { output } = await prompt(input);
  if (!output) throw new Error('Character failed to respond.');
  return output;
}

export const characterChatFlow = ai.defineFlow(
  {
    name: 'characterChatFlow',
    inputSchema: CharacterChatInputSchema,
    outputSchema: CharacterChatOutputSchema,
  },
  async (input) => characterChat(input)
);
