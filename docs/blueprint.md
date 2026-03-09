# **App Name**: AI Smart Reading Tutor

## Core Features:

- Content Upload & Extraction: Users can securely upload text passages, PDF documents, or articles. The system automatically extracts readable text from the uploaded content.
- AI Question Generation: Leveraging a T5 model, this tool automatically generates diverse questions (MCQ, Short Answer, True/False, Fill in the blanks) from uploaded content, thoughtfully selecting questions contextually relevant to the material.
- AI Semantic Answer Evaluation: This tool uses Sentence Transformers to compare student answers against reference answers, providing a correctness score, personalized explanation feedback, and suggested improvements by intelligently analyzing semantic similarity.
- AI Reading Level Detection: Utilizing spaCy or textstat, this tool automatically assesses the reading complexity of uploaded texts, offering Flesch Reading Ease and Grade Level Scores to guide appropriate content assignment.
- User Authentication & Roles: Implement JWT authentication and role-based access control for Student, Teacher, Parent, and Admin roles.
- User-Specific Dashboards: Provide a personalized analytics dashboard for each user type (Student, Parent, Teacher) displaying relevant data like quiz scores, progress tracking, and performance analytics with basic charts and graphs.
- Data Persistence (PostgreSQL): Integrate with a PostgreSQL database to store and retrieve all application data including user information, uploaded content, generated questions, student answers, and analytics data.

## Style Guidelines:

- Primary color: A sophisticated, calming blue (`#57A1E0`) that evokes intelligence and clarity, ideal for educational content and key interactive elements.
- Background color: A very light, almost ethereal blue (`#ECF2F7`) to provide a clean and expansive canvas, promoting focus and readability within the light color scheme.
- Accent color: A deep, rich violet-blue (`#3E12CC`) chosen for its strong contrast and its ability to add a touch of creative depth and emphasis for call-to-actions and important highlights.
- Headline font: 'Space Grotesk' (sans-serif) for its modern, tech-savvy, and intellectually curious feel, suited for prominent titles and headings.
- Body font: 'Inter' (sans-serif) for its high readability and versatile, neutral aesthetic, ensuring clear presentation of quizzes, feedback, and analytical text.
- Utilize modern, clean, and academic-themed icons to enhance navigation and convey information clearly without clutter.
- Implement a clean, responsive, and spacious design that ensures user-friendliness across various devices, prioritizing readability and intuitive navigation for all features.
- Incorporate subtle and purposeful animations for transitions between sections, feedback confirmations, and loading states, enhancing user experience without being distracting.