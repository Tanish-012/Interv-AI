This is an AI-powered mock interview platform that helps users prepare for technical interviews by generating personalized interview questions from their resume,evaluating
responses using AI, and providing detailed feedback reports.

Live URL: https://interv-ai-kappa.vercel.app/

Repository: https://github.com/Tanish-012/Interv-AI

### Project Overview

The AI Mock Interview Platform simulates real interview experiences by leveraging AI to generate interview questions based on a user's uploaded resume.
Users can take mock interviews, submit answers, and receive detailed feedback including strengths, weaknesses, scores, and suggested improvements.

The platform aims to help students and job seekers improve their interview skills through personalized AI-driven evaluations.

### Features:
Authentication

* Secure user authentication using Clerk
* Sign up, sign in, and sign out functionality
* Protected routes for authenticated users

Resume Upload & Parsing

* Upload PDF resumes
* Extract resume text automatically
* Generate personalized interview questions from resume content

AI-Powered Interview Generation

* Interview questions generated using Google Gemini AI
* Resume-specific and role-specific questions
* Dynamic interview sessions

Interview Experience

* Interactive mock interview sessions
* Multiple question handling
* User answer recording

AI Feedback System

* Automated answer evaluation
* Question-wise scoring
* Strengths analysis
* Weakness identification
* Better answer suggestions
* Overall interview performance review

Dashboard

* Interview history tracking
* Feedback review
* Performance monitoring

Deployment

* Production deployment using Vercel
* Cloud-hosted and accessible from anywhere

### Tech Stack

Frontend
* Next.js 16
* React
* TypeScript
* Tailwind CSS

Backend
* Next.js Server Actions
* API Routes

Database
* PostgreSQL
* Prisma ORM

Authentication
Clerk

AI
Google Gemini API

File Processing
PDF Parsing

Deployment
Vercel

### Setup Instructions
Clone Repository

```bash
git clone https://github.com/Tanish-012/Interv-AI.git
cd Interv-AI
```

Install Dependencies

```bash
npm install
```

Environment Variables

Create a `.env` file in the project root and add:

```env
DATABASE_URL=your_database_url

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

CLERK_SECRET_KEY=your_clerk_secret_key

GEMINI_API_KEY=your_gemini_api_key
```

Generate Prisma Client

```bash
npx prisma generate
```

Run Development Server

```bash
npm run dev
```

Production Build

```bash
npm run build
```
### Future Improvements:
* Voice-based interviews
* Video interview support
* Interview analytics dashboard
* Interview difficulty levels
* Company-specific interview preparation
* Real-time AI interviewer

Author
Tanish Kumar

GitHub: https://github.com/Tanish-012
