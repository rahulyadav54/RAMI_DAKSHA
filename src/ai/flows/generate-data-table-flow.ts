
'use server';
/**
 * @fileOverview A flow to extract tabular data from content into a Markdown table.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateDataTableInputSchema = z.object({
  content: z.string().describe('The content to extract tabular data from.'),
});

const GenerateDataTableOutputSchema = z.object({
  markdownTable: z.string().describe('The extracted data as a markdown table.'),
  description: z.string().describe('What this table represents.'),
});

export async function generateDataTable(input: z.infer<typeof GenerateDataTableInputSchema>) {
  return generateDataTableFlow(input);
}

export const generateDataTableFlow = ai.defineFlow(
  {
    name: 'generateDataTableFlow',
    inputSchema: GenerateDataTableInputSchema,
    outputSchema: GenerateDataTableOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateDataTablePrompt',
      input: { schema: GenerateDataTableInputSchema },
      output: { schema: GenerateDataTableOutputSchema },
      prompt: `Extract any quantitative data, comparisons, or structured information from the text into a clean Markdown table.
      If no obvious table exists, synthesize one that compares the key concepts or entities mentioned.
      Provide a brief description of what the table shows.
      
      Content: """{{{content}}}"""
      `,
    });

    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to generate data table.');
    return output;
  }
);
