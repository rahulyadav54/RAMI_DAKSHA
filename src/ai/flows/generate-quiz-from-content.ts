'use server';
/**
 * @fileOverview A Genkit flow for generating various types of comprehension questions
 * from provided text content.
 *
 * - generateQuizFromContent - A function that handles the question generation process.
 * - GenerateQuizFromContentInput - The input type for the generateQuizFromContent function.
 * - GenerateQuizFromContentOutput - The return type for the generateQuizFromContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizFromContentInputSchema = z.object({
  content: z.string().describe('The text content from which to generate questions.'),
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
  prompt: `You are an expert educator tasked with creating a comprehensive quiz from provided text content.
Generate a variety of comprehension questions based on the following content.

Your output MUST be a JSON object conforming to the provided schema, with arrays for each question type.
Ensure questions are contextually relevant and cover the main points of the text.

Content: """{{{content}}}"""

Generate:
- At least 3 multiple-choice questions.
- At least 3 short answer questions.
- At least 2 true/false questions.
- At least 2 fill-in-the-blanks questions.
`,
});

const generateQuizFromContentFlow = ai.defineFlow(
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
