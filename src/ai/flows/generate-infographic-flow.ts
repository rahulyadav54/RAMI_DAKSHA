
'use server';
/**
 * @fileOverview A flow to generate a visual infographic-style image from content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateInfographicInputSchema = z.object({
  content: z.string().describe('The content to visualize as an infographic.'),
});

const GenerateInfographicOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated infographic image.'),
});

export async function generateInfographic(input: z.infer<typeof GenerateInfographicInputSchema>) {
  return generateInfographicFlow(input);
}

export const generateInfographicFlow = ai.defineFlow(
  {
    name: 'generateInfographicFlow',
    inputSchema: GenerateInfographicInputSchema,
    outputSchema: GenerateInfographicOutputSchema,
  },
  async (input) => {
    // 1. Generate a descriptive image prompt
    const { text: imagePrompt } = await ai.generate({
      prompt: `Generate a detailed visual prompt for an AI image generator. The prompt should describe a clean, modern educational infographic or visual summary illustrating the key concepts of the following text. Use a professional, vibrant style.
      
      Text: ${input.content}`,
    });

    // 2. Generate the image using Imagen 4
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: imagePrompt,
    });

    if (!media || !media.url) throw new Error('Failed to generate infographic image.');

    return {
      imageUrl: media.url,
    };
  }
);
