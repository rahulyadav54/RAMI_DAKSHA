'use server';
/**
 * @fileOverview A flow to generate an AI podcast summary (audio) from text content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import { googleAI } from '@genkit-ai/google-genai';

const GeneratePodcastInputSchema = z.object({
  content: z.string().describe('The text content to convert into a podcast overview.'),
});

const GeneratePodcastOutputSchema = z.object({
  audioDataUri: z.string().describe('The base64 encoded WAV audio data URI.'),
  transcript: z.string().describe('The transcript of the podcast.'),
});

export async function generatePodcast(input: z.infer<typeof GeneratePodcastInputSchema>) {
  return generatePodcastFlow(input);
}

export const generatePodcastFlow = ai.defineFlow(
  {
    name: 'generatePodcastFlow',
    inputSchema: GeneratePodcastInputSchema,
    outputSchema: GeneratePodcastOutputSchema,
  },
  async (input) => {
    try {
      // 1. Generate the script using a structured object schema for stability
      const scriptPrompt = ai.definePrompt({
        name: 'podcastScriptPrompt',
        input: { schema: GeneratePodcastInputSchema },
        output: { 
          schema: z.object({
            transcript: z.string().describe('The full conversational transcript between Host1 and Host2.')
          })
        },
        prompt: `You are an expert podcast writer. Create a natural, engaging conversation between two speakers, Host1 and Host2, summarizing the following content.
        The conversation should be informative, slightly casual, and explain the key concepts clearly for a student.
        
        Structure the response as a single string transcript where speakers are identified as 'Host1:' and 'Host2:'.
        
        Content: """{{{content}}}"""
        `,
      });

      const { output } = await scriptPrompt(input);
      if (!output || !output.transcript) throw new Error('Failed to generate podcast script: Empty output.');
      
      const transcript = output.transcript;

      // 2. Generate the Audio using TTS
      const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: 'Host1',
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' },
                  },
                },
                {
                  speaker: 'Host2',
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Achernar' },
                  },
                },
              ],
            },
          },
        },
        prompt: transcript,
      });

      if (!media || !media.url) throw new Error('Failed to generate podcast audio.');

      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );

      const wavBase64 = await toWav(audioBuffer);

      return {
        audioDataUri: 'data:audio/wav;base64,' + wavBase64,
        transcript,
      };
    } catch (error: any) {
      console.error('Podcast Flow Error:', error);
      throw new Error(error.message || 'Podcast generation failed due to an internal error.');
    }
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
