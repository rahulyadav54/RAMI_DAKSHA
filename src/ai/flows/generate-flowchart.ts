'use server';
/**
 * @fileOverview A flow to generate a Mermaid.js flowchart from text content.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFlowchartInputSchema = z.object({
  content: z.string().describe('The text content to visualize as a flowchart.'),
});
export type GenerateFlowchartInput = z.infer<typeof GenerateFlowchartInputSchema>;

const GenerateFlowchartOutputSchema = z.object({
  mermaidCode: z.string().describe('A valid Mermaid.js flowchart definition (starting with graph TD or LR).'),
});
export type GenerateFlowchartOutput = z.infer<typeof GenerateFlowchartOutputSchema>;

export async function generateFlowchart(input: GenerateFlowchartInput): Promise<GenerateFlowchartOutput> {
  return generateFlowchartFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlowchartPrompt',
  input: { schema: GenerateFlowchartInputSchema },
  output: { schema: GenerateFlowchartOutputSchema },
  prompt: `You are an expert at information visualization. Analyze the provided content and create a logical flowchart that represents its core process, structure, or sequence of events.
  
  The output MUST be a valid Mermaid.js flowchart definition. 
  - Start with "graph TD" (Top-Down) or "graph LR" (Left-Right).
  - Use concise labels for nodes.
  - CRITICAL SYNTAX RULE: Every node label MUST be wrapped in double quotes. Example: A["Step One"] --> B["Step Two"]
  - Avoid using special characters like brackets or parentheses inside labels.
  - Output only the raw Mermaid code, do not wrap it in markdown code blocks.

  Content: """{{{content}}}"""
  `,
});

export const generateFlowchartFlow = ai.defineFlow(
  {
    name: 'generateFlowchartFlow',
    inputSchema: GenerateFlowchartInputSchema,
    outputSchema: GenerateFlowchartOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to generate flowchart.');
    
    // Sanitize output
    let code = output.mermaidCode.trim();
    if (code.includes('```')) {
      code = code.replace(/```mermaid/g, '').replace(/```/g, '').trim();
    }
    
    return { mermaidCode: code };
  }
);
