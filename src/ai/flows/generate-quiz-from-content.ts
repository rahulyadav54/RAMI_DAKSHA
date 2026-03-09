'use server';
/**
 * @fileOverview A Genkit flow for generating various types of comprehension questions
 * from provided text content with configurable counts and difficulty levels.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizFromContentInputSchema = z.object({
  content: z.string().describe('The text content from which to generate questions.'),
  mcqCount: z.number().default(3),
  shortCount: z.number().default(3),
  tfCount: z.number().default(2),
  blankCount: z.number().default(2),
  difficulty: z.enum(['easy', 'intermediate', 'hard']).default('intermediate'),
});
export type GenerateQuizFromContentInput = z.infer<typeof GenerateQuizFromContentInputSchema>;

const GenerateQuizFromContentOutputSchema = z.object({
  multipleChoiceQuestions: z
    .array(
      z.object({
        question: z.string().describe('The multiple-choice question.'),
        options: z.array(z.string()).describe('An array of possible answers for the MCQ.'),
        correctAnswer: z.string().describe('The correct answer for the MCQ, which must be one of the options.'),
      })
    )
    .describe('A list of generated multiple-choice questions.'),
  shortAnswerQuestions: z
    .array(
      z.object({
        question: z.string().describe('The short answer question.'),
        correctAnswer: z.string().describe('The correct answer for the short answer question.'),
      })
    )
    .describe('A list of generated short answer questions.'),
  trueFalseQuestions: z
    .array(
      z.object({
        question: z.string().describe('The true/false question.'),
        answer: z.boolean().describe('The correct answer (true or false) for the question.'),
      })
    )
    .describe('A list of generated true/false questions.'),
  fillInTheBlanksQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe(
            'The fill-in-the-blanks question, with placeholders like ___ for the blanks.'
          ),
        blanks: z.array(z.string()).describe('An array of words that fill the blanks in order.'),
      })
    )
    .describe('A list of generated fill-in-the-blanks questions.'),
});
export type GenerateQuizFromContentOutput = z.infer<typeof GenerateQuizFromContentOutputSchema>;

export async function generateQuizFromContent(
  input: GenerateQuizFromContentInput
): Promise<GenerateQuizFromContentOutput> {
  return generateQuizFromContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizFromContentPrompt',
  input: { schema: GenerateQuizFromContentInputSchema },
  output: { schema: GenerateQuizFromContentOutputSchema },
  prompt: `You are an expert educator. Generate a high-quality assessment from the provided text.
  
  Difficulty Level: {{{difficulty}}}
  
  Requested Question Counts:
  - Multiple Choice: {{{mcqCount}}}
  - Short Answer: {{{shortCount}}}
  - True/False: {{{tfCount}}}
  - Fill in the Blanks: {{{blankCount}}}

  Content: """{{{content}}}"""

  Adjust the complexity of the questions based on the difficulty level:
  - Easy: Focus on basic recall and literal understanding.
  - Intermediate: Require some inference and application of concepts.
  - Hard: Demand high-level critical thinking, deep analysis, and synthesis of ideas.

  Ensure questions are factually grounded in the text. For fill-in-the-blanks, use "___" for the blank space.
`,
});

export const generateQuizFromContentFlow = ai.defineFlow(
  {
    name: 'generateQuizFromContentFlow',
    inputSchema: GenerateQuizFromContentInputSchema,
    outputSchema: GenerateQuizFromContentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate quiz questions.');
    }
    return output;
  }
);
