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
  mermaidCode: z.string().describe('A valid Mermaid.js flowchart definition (starting with graph TD or LR) representing the logic, process, or hierarchy of the content.'),
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
  - CRITICAL SYNTAX RULE: Every node label MUST be wrapped in double quotes to prevent syntax errors with special characters. Example: A["Step One"] --> B["Step Two"]
  - ILLEGAL CHARACTERS: Do not use square brackets [], parentheses (), or additional quotes inside the labels themselves. If the source text has them, replace them with spaces.
  - NO MARKDOWN: Output only the raw Mermaid code, do not wrap it in markdown code blocks like \`\`\`mermaid.

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
    
    // Sanitize output to remove markdown blocks if the AI accidentally included them
    let code = output.mermaidCode.trim();
    if (code.startsWith('```')) {
      code = code.replace(/^```mermaid\n?/, '').replace(/```$/, '').trim();
    }
    
    return { mermaidCode: code };
  }
);
