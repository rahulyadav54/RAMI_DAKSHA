'use server';
/**
 * @fileOverview A flow to semantically evaluate a student's answer against a correct answer.
 *
 * - evaluateStudentAnswer - A function that handles the semantic evaluation process.
 * - EvaluateStudentAnswerInput - The input type for the evaluateStudentAnswer function.
 * - EvaluateStudentAnswerOutput - The return type for the evaluateStudentAnswer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EvaluateStudentAnswerInputSchema = z.object({
  question: z.string().describe('The question that was asked.'),
  studentAnswer: z.string().describe('The student\'s response to the question.'),
  correctAnswer: z.string().describe('The expected correct answer to the question.'),
});
export type EvaluateStudentAnswerInput = z.infer<typeof EvaluateStudentAnswerInputSchema>;

const EvaluateStudentAnswerOutputSchema = z.object({
  correctnessScore: z.number().min(0).max(100).describe('A numerical score from 0 to 100 indicating the correctness of the student\'s answer based on semantic similarity to the correct answer.'),
  explanationFeedback: z.string().describe('Detailed feedback explaining why the student\'s answer is correct or incorrect, highlighting key points from the correct answer.'),
  suggestedImprovement: z.string().describe('Suggestions for how the student could improve their answer or understanding.'),
});
export type EvaluateStudentAnswerOutput = z.infer<typeof EvaluateStudentAnswerOutputSchema>;

export async function evaluateStudentAnswer(input: EvaluateStudentAnswerInput): Promise<EvaluateStudentAnswerOutput> {
  return evaluateStudentAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateStudentAnswerPrompt',
  input: { schema: EvaluateStudentAnswerInputSchema },
  output: { schema: EvaluateStudentAnswerOutputSchema },
  prompt: `You are an AI tutor designed to semantically evaluate student answers.
Compare the student's answer with the correct answer for semantic similarity and factual accuracy.
Provide a correctness score from 0 to 100.
Offer detailed explanation feedback, highlighting what was good, what was missing, or what was incorrect in the student's response compared to the correct answer.
Finally, give specific suggestions for improvement.

Question: {{{question}}}
Correct Answer: {{{correctAnswer}}}
Student's Answer: {{{studentAnswer}}}

Your output must be a JSON object matching the following structure:
{{jsonSchema EvaluateStudentAnswerOutputSchema}}`,
});

const evaluateStudentAnswerFlow = ai.defineFlow(
  {
    name: 'evaluateStudentAnswerFlow',
    inputSchema: EvaluateStudentAnswerInputSchema,
    outputSchema: EvaluateStudentAnswerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to evaluate student answer: No output from model.');
    }
    return output;
  }
);
