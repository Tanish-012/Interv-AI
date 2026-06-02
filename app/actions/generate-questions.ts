"use server";

import { GoogleGenAI } from "@google/genai";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server"; // Use your Clerk authentication

// Initialize the Gemini client using the environment variable automatically
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuestionsAction(resumeId: string, positionTitle: string) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized access");

        // 1. Fetch the extracted resume text saved on Day 3
        const resumeRecord = await db.userResume.findUnique({
            where: { id: resumeId },
        });

        if (!resumeRecord || resumeRecord.userId !== userId) {
            throw new Error("Resume record not found");
        }

        // 2. Formulate the prompt using structured JSON instructions for clean parsing
        const structuralPrompt = `
      Act as a senior software engineering interviewer.
      
      Based on this resume:
      ---
      ${resumeRecord.extractedText}
      ---
      
      Generate exactly 10 technical and structural interview questions tailored to the candidate's background and the target position: "${positionTitle}".
      
      Return the output as a raw JSON array of strings matching this exact format:
      [
        "Question 1 text?",
        "Question 2 text?"
      ]
    `;

        // 3. Call the Gemini API using the fast, modern gemini-2.5-flash model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: structuralPrompt,
            config: {
                // Enforce a strict JSON array output to prevent markdown text or conversational fluff
                responseMimeType: 'application/json',
            }
        });

        const rawText = response.text;
        if (!rawText) throw new Error("Failed to capture a response from the AI engine");

        // 4. Parse the output text into an official JSON object array
        const questionsArray = JSON.parse(rawText);

        // 5. Store the structured session records into your Neon PostgreSQL instance
        const session = await db.interviewSession.create({
            data: {
                userId: userId,
                position: positionTitle,
                questions: questionsArray,
            },
        });

        return { success: true, sessionId: session.id };

    } catch (error: any) {
        console.error("Question Generation Failure:", error);
        return { success: false, error: error.message || "Failed to initialize interview questions." };
    }
}

export async function getInterviewSessionAction(sessionId: string) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized access");

        const session = await db.interviewSession.findUnique({
            where: { id: sessionId },
        });

        if (!session || session.userId !== userId) {
            throw new Error("Interview session not found");
        }

        return { 
            success: true, 
            questions: session.questions as string[], 
            position: session.position 
        };
    } catch (error: any) {
        console.error("Failed to fetch interview session:", error);
        return { success: false, error: error.message || "Failed to retrieve interview session." };
    }
}