import { config } from 'dotenv';
config();

import '@/ai/flows/generate-quiz-from-content.ts';
import '@/ai/flows/evaluate-student-answer.ts';
import '@/ai/flows/detect-reading-level.ts';