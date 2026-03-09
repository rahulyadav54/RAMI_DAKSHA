
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-quiz-from-content.ts';
import '@/ai/flows/evaluate-student-answer.ts';
import '@/ai/flows/detect-reading-level.ts';
import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/generate-study-guide.ts';
import '@/ai/flows/ai-tutor-chat.ts';
import '@/ai/flows/generate-flowchart.ts';
import '@/ai/flows/character-chat.ts';
import '@/ai/flows/generate-homework.ts';
import '@/ai/flows/generate-math-problem.ts';
import '@/ai/flows/math-step-feedback.ts';
import '@/ai/flows/spelling-feedback.ts';
import '@/ai/flows/analyze-handwriting.ts';
import '@/ai/flows/generate-podcast-flow.ts';
import '@/ai/flows/generate-video-summary-flow.ts';
import '@/ai/flows/generate-infographic-flow.ts';
import '@/ai/flows/generate-slides-flow.ts';
import '@/ai/flows/generate-data-table-flow.ts';
