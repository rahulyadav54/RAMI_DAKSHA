
'use server';
/**
 * @fileOverview A flow to generate a short AI video summary using Veo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateVideoInputSchema = z.object({
  content: z.string().describe('The text content to visualize in a video summary.'),
});

const GenerateVideoOutputSchema = z.object({
  videoDataUri: z.string().describe('The base64 encoded MP4 video data URI.'),
});

export async function generateVideoSummary(input: z.infer<typeof GenerateVideoInputSchema>) {
  return generateVideoSummaryFlow(input);
}

export const generateVideoSummaryFlow = ai.defineFlow(
  {
    name: 'generateVideoSummaryFlow',
    inputSchema: GenerateVideoInputSchema,
    outputSchema: GenerateVideoOutputSchema,
  },
  async (input) => {
    // 1. Get a visual prompt from the content
    const visualPromptRes = await ai.generate({
      prompt: `Create a single, detailed visual description for an AI video generator based on the core concept of this text. The video should be cinematic and educational.
      Content: ${input.content}`,
    });
    const visualPrompt = visualPromptRes.text;

    // 2. Generate video using Veo
    let { operation } = await ai.generate({
      model: googleAI.model('veo-3.0-generate-preview'),
      prompt: visualPrompt,
      config: {
        aspectRatio: '16:9',
        personGeneration: 'allow_all',
      },
    });

    if (!operation) throw new Error('Expected the model to return an operation');

    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      if (!operation.done) await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (operation.error) throw new Error('failed to generate video: ' + operation.error.message);

    const videoPart = operation.output?.message?.content.find((p) => !!p.media);
    if (!videoPart || !videoPart.media) throw new Error('Failed to find the generated video');

    const fetch = (await import('node-fetch')).default;
    const videoDownloadResponse = await fetch(
      `${videoPart.media.url}&key=${process.env.GEMINI_API_KEY}`
    );
    
    if (!videoDownloadResponse || !videoDownloadResponse.ok) throw new Error('Failed to fetch video');

    const buffer = await videoDownloadResponse.buffer();
    const base64Video = buffer.toString('base64');

    return {
      videoDataUri: `data:video/mp4;base64,${base64Video}`,
    };
  }
);
