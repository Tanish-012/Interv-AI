"use server";

import { GoogleGenAI } from "@google/genai";
import { db, withDbRetry } from "@/lib/db";
import { auth } from "@clerk/nextjs/server"; // Use your Clerk authentication

// Initialize the Gemini client using the environment variable automatically
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuestionsAction(resumeId: string, positionTitle: string) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized access");

        // 1. Fetch the extracted resume text saved on Day 3
        const resumeRecord = await withDbRetry(() => db.userResume.findUnique({
            where: { id: resumeId },
        }));

        if (!resumeRecord || resumeRecord.userId !== userId) {
            throw new Error("Resume record not found");
        }

        // 2. Formulate the prompt using structured JSON instructions and a dynamic random factor to prevent repeated questions
        const randomSalt = Math.random().toString(36).substring(7) + "-" + Date.now();
        const structuralPrompt = `
      Act as a senior software engineering interviewer.
      
      Based on this resume:
      ---
      ${resumeRecord.extractedText}
      ---
      
      Generate exactly 10 technical and structural interview questions tailored to the candidate's background and the target position: "${positionTitle}".
      
      CRITICAL INSTRUCTIONS FOR RANDOMIZATION AND VARIETY:
      - Do NOT generate the same questions as previous sessions. Vary the concepts, style, difficulty, and focus areas.
      - Cover dynamic technical topics relevant to the position (e.g. system design, problem solving, language specifics, coding challenges, behavioral and soft skills).
      - Randomizer Salt: ${randomSalt}
      
      Return the output as a raw JSON array of strings matching this exact format:
      [
        "Question 1 text?",
        "Question 2 text?"
      ]
    `;

        // 3. Call the Gemini API using the fast, modern gemini-2.5-flash model with a temperature of 1.0 for creative variety
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: structuralPrompt,
            config: {
                // Enforce a strict JSON array output to prevent markdown text or conversational fluff
                responseMimeType: 'application/json',
                temperature: 1.0,
            }
        });

        const rawText = response.text;
        if (!rawText) throw new Error("Failed to capture a response from the AI engine");

        // 4. Parse the output text into an official JSON object array
        const questionsArray = JSON.parse(rawText);

        // 5. Store the structured session records into your Neon PostgreSQL instance
        const session = await withDbRetry(() => db.interviewSession.create({
            data: {
                userId: userId,
                position: positionTitle,
                questions: questionsArray,
            },
        }));

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

        const session = await withDbRetry(() => db.interviewSession.findUnique({
            where: { id: sessionId },
        }));

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

export async function saveInterviewAnswersAction(sessionId: string, answers: string[]) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized access");

        const session = await withDbRetry(() => db.interviewSession.findUnique({
            where: { id: sessionId },
        }));

        if (!session || session.userId !== userId) {
            throw new Error("Interview session not found");
        }

        const updatedSession = await withDbRetry(() => db.interviewSession.update({
            where: { id: sessionId },
            data: {
                answers: answers,
            },
        }));

        return { success: true };
    } catch (error: any) {
        console.error("Failed to save answers:", error);
        return { success: false, error: error.message || "Failed to save answers." };
    }
}

function isAnswerInvalid(ans: string | null | undefined): boolean {
    if (!ans) return true;
    const trimmed = ans.trim();

    // 1. Empty or whitespace-only
    if (trimmed.length === 0) return true;

    // 2. Too short to convey any meaning (fewer than 20 characters)
    if (trimmed.length < 20) return true;

    const cleaned = trimmed.toLowerCase();

    // 3. Exact match against known non-responsive placeholders
    const invalidPlaceholders = [
        "ok", "yes", "no", "test", "none", "na", "n/a", "hello", "hi",
        "bye", "okey", "okay", "i don't know", "dont know", "skip",
        "idk", "nothing", "blah", "gibberish", "xyz", "abc", "asd",
        "asdf", "test answer", "my answer", "something", "whatever",
        "no comment", "pass", "no idea", "empty", "blank", "idk lol",
        "i have no idea", "i dont know", "no clue", "not sure",
    ];
    if (invalidPlaceholders.includes(cleaned)) return true;

    // 4. Fewer than 3 distinct words → not a real answer
    const words = cleaned.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 3) return true;

    // 5. Low character-diversity gibberish detector:
    //    If more than 60% of the string is the same character, it's garbage (e.g. "aaaaaaaaa", "kkkkkkk")
    const charCounts: Record<string, number> = {};
    for (const ch of cleaned) {
        if (ch !== " ") charCounts[ch] = (charCounts[ch] || 0) + 1;
    }
    const nonSpaceLen = trimmed.replace(/\s/g, "").length;
    const maxCharFreq = Math.max(...Object.values(charCounts));
    if (nonSpaceLen > 0 && maxCharFreq / nonSpaceLen > 0.6) return true;

    // 6. Keyboard-mash / low unique-character ratio:
    //    Fewer than 5 distinct non-space characters for answers > 15 chars → gibberish
    const uniqueChars = new Set(cleaned.replace(/\s/g, "")).size;
    if (trimmed.length > 15 && uniqueChars < 5) return true;

    return false;
}

export async function generateInterviewFeedbackAction(sessionId: string) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized access");

        const session = await withDbRetry(() => db.interviewSession.findUnique({
            where: { id: sessionId },
        }));

        if (!session || session.userId !== userId) {
            throw new Error("Interview session not found");
        }

        // Return cached feedback records if they already exist
        const existingFeedback = await withDbRetry(() => db.feedback.findMany({
            where: { sessionId },
            orderBy: { createdAt: "asc" },
        }));

        if (existingFeedback.length > 0) {
            return {
                success: true,
                feedbacks: existingFeedback,
                position: session.position,
                createdAt: session.createdAt
            };
        }

        const questionsArray = (session.questions as string[]) || [];
        const answersArray = (session.answers as string[]) || [];

        // Pre-validate answers to identify placeholder/blank inputs
        const validatedAnswers = answersArray.map(ans => {
            if (isAnswerInvalid(ans)) {
                return `[INVALID RESPONSE - candidate typed a non-responsive placeholder/blank: "${ans || ''}"]`;
            }
            return ans;
        });

        // If ALL answers are invalid, we can directly save the 0 scores and avoid calling the Gemini API
        const allInvalid = answersArray.every(ans => isAnswerInvalid(ans));
        if (allInvalid) {
            const feedbackData = questionsArray.map((q: string, idx: number) => ({
                sessionId,
                question: q,
                answer: answersArray[idx] || "",
                score: 0,
                strengths: [],
                weaknesses: ["No responsive answer provided."],
                betterAnswer: "Please provide a detailed, technical answer explaining your experience and knowledge relevant to the question.",
            }));

            const createdFeedbacks = await withDbRetry(async () => {
                await db.feedback.deleteMany({
                    where: { sessionId },
                });

                await db.feedback.createMany({
                    data: feedbackData,
                });

                return await db.feedback.findMany({
                    where: { sessionId },
                    orderBy: { createdAt: "asc" },
                });
            });

            return {
                success: true,
                feedbacks: createdFeedbacks,
                position: session.position,
                createdAt: session.createdAt
            };
        }

        // System instruction: kept separate so Gemini treats it as an authoritative directive
        // rather than just part of the conversation, making strict grading much harder to override.
        const systemInstruction = `You are a brutally honest senior software engineering interviewer conducting a mock interview for the position of "${session.position}".
Your sole task is to evaluate each candidate answer STRICTLY against the ideal answer provided.

ABSOLUTE GRADING RULES — you must follow these without exception:
1. Any answer tagged [INVALID RESPONSE] receives a score of EXACTLY 0. No exceptions.
2. A blank, whitespace-only, or near-empty answer receives a score of EXACTLY 0.
3. An answer that is off-topic, irrelevant, or does not address the question receives a score of 0-2.
4. Scores of 8, 9, or 10 are RARE and only awarded when the answer matches or exceeds the ideal answer in accuracy, depth, and clarity.
5. DO NOT award scores generously or give the benefit of the doubt. Default to a lower score when in doubt.
6. Your output must be a raw JSON array — no markdown, no prose, no explanation outside the JSON.`;

        // Build per-question blocks that include an ideal answer so Gemini has a concrete benchmark.
        // The user's actual answer (validatedAnswers[idx]) is dynamically interpolated here.
        const questionBlocks = questionsArray.map((question: string, idx: number) => {
            const userAnswer = validatedAnswers[idx] ?? "[INVALID RESPONSE - no answer provided]";
            return `--- QUESTION ${idx + 1} ---
Question: ${question}
Ideal Answer (benchmark): A strong answer should accurately explain the core concept, include relevant technical details or examples specific to ${session.position} work, demonstrate practical experience, and be at least 2-3 sentences long.
Candidate's Actual Answer: ${userAnswer}`;
        }).join("\n\n");

        // Build evaluation prompt for Gemini — user_answer is injected via questionBlocks above
        const evaluationPrompt = `You are evaluating ${questionsArray.length} interview question(s) for the position: "${session.position}".

For EACH question block below, compare the "Candidate's Actual Answer" directly against what an "Ideal Answer" would look like.

${questionBlocks}

For each question-answer pair return a JSON object with:
- "question": exact question text (string)
- "answer": the candidate's verbatim answer (string)
- "score": integer from 0 to 10, evaluated STRICTLY against the ideal answer benchmark
- "strengths": JSON array of 1-3 strings describing genuine strengths. MUST be [] if score <= 2.
- "weaknesses": JSON array of 1-3 strings. MUST include "No responsive answer provided." if the answer is [INVALID RESPONSE] or score is 0.
- "betterAnswer": a model answer that is professional, technically accurate, and at least 3 sentences long.

SCORING REFERENCE:
0   = blank, gibberish, [INVALID RESPONSE], or completely off-topic
1-3 = vaguely relevant but missing technical substance
4-5 = partially correct with some relevant points but lacks depth or examples
6-7 = mostly correct, reasonably detailed, minor gaps
8-9 = accurate, detailed, demonstrates real experience, close to ideal
10  = exceptional, matches or surpasses the ideal answer in every dimension

Return ONLY a raw JSON array of objects — no markdown fences, no commentary.
[
  {
    "question": "...",
    "answer": "...",
    "score": 0,
    "strengths": [],
    "weaknesses": ["..."],
    "betterAnswer": "..."
  }
]`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: evaluationPrompt,
            config: {
                // Separate system instruction gives the grading rules authoritative weight
                systemInstruction,
                responseMimeType: 'application/json',
                // temperature: 0 → deterministic, prevents Gemini from "rounding up" scores creatively
                temperature: 0,
            }
        });

        const rawText = response.text;
        if (!rawText) throw new Error("Failed to capture a response from the AI engine");

        const parsedFeedback = JSON.parse(rawText);

        if (!Array.isArray(parsedFeedback)) {
            throw new Error("Invalid feedback format received from AI engine");
        }

        // Save generated feedback records to the Feedback table (now using createMany)
        // Ensure that any invalid answer gets 0 score, empty strengths, and standard weakness/betterAnswer even if Gemini hallucinated a high score
        const feedbackData = parsedFeedback.map((item: any, idx: number) => {
            const originalAnswer = answersArray[idx] || "";
            const isInvalid = isAnswerInvalid(originalAnswer);
            
            return {
                sessionId,
                question: item.question || questionsArray[idx] || "",
                answer: originalAnswer,
                score: isInvalid ? 0 : (Number(item.score) || 0),
                strengths: isInvalid ? [] : (item.strengths || []),
                weaknesses: isInvalid ? ["No responsive answer provided."] : (item.weaknesses || []),
                betterAnswer: isInvalid 
                    ? "Please provide a detailed, technical answer explaining your experience and knowledge relevant to the question." 
                    : (item.betterAnswer || ""),
            };
        });

        const createdFeedbacks = await withDbRetry(async () => {
            await db.feedback.deleteMany({
                where: { sessionId },
            });

            await db.feedback.createMany({
                data: feedbackData,
            });

            return await db.feedback.findMany({
                where: { sessionId },
                orderBy: { createdAt: "asc" },
            });
        });

        return {
            success: true,
            feedbacks: createdFeedbacks,
            position: session.position,
            createdAt: session.createdAt
        };

    } catch (error: any) {
        console.error("Feedback Generation Failure:", error);
        return { success: false, error: error.message || "Failed to generate interview feedback." };
    }
}

export async function getDashboardStatsAction() {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized access");

        const sessions = await withDbRetry(() => db.interviewSession.findMany({
            where: { userId },
            include: {
                feedbacks: true,
            },
            orderBy: {
                createdAt: "asc", // Chronological order for chart
            },
        }));

        // A session counts as "completed" when:
        //   1. The user saved their answers (answers field is a non-empty JSON array), OR
        //   2. Feedback has already been generated (guards sessions completed before this fix).
        const completedSessions = sessions.filter(s => {
            const hasAnswers =
                s.answers !== null &&
                Array.isArray(s.answers) &&
                (s.answers as string[]).length > 0;
            const hasFeedback = s.feedbacks.length > 0;
            return hasAnswers || hasFeedback;
        });

        const totalInterviews = completedSessions.length;
        
        let overallScores: number[] = [];
        let chartData: Array<{ name: string; score: number }> = [];
        let pastInterviews: Array<{ id: string; role: string; date: string; status: string; score: number }> = [];

        completedSessions.forEach((session, index) => {
            const hasFeedback = session.feedbacks.length > 0;
            const sumOfFeedbackScores = session.feedbacks.reduce((sum, f) => sum + (f.score || 0), 0);
            const overallScore = hasFeedback
                ? Math.round((sumOfFeedbackScores / (session.feedbacks.length * 10)) * 100)
                : null;

            if (overallScore !== null) {
                overallScores.push(overallScore);
                chartData.push({
                    name: `Session ${index + 1}`,
                    score: overallScore,
                });
            }

            const sessionDate = new Date(session.createdAt);

            pastInterviews.push({
                id: session.id,
                role: session.position,
                date: sessionDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }),
                status: hasFeedback ? "Completed" : "Pending",
                score: overallScore || 0,
            });
        });

        // Compute KPIs
        const averageScore = overallScores.length > 0
            ? Math.round(overallScores.reduce((sum, val) => sum + val, 0) / overallScores.length)
            : null;

        const bestScore = overallScores.length > 0
            ? Math.max(...overallScores)
            : null;

        // Recent interview details (take the last from completedSessions)
        const recentSession = completedSessions[completedSessions.length - 1];
        const recentRole = recentSession ? recentSession.position : null;

        // Reverse pastInterviews to show newest first in table
        pastInterviews.reverse();

        return {
            success: true,
            stats: {
                totalInterviews,
                averageScore,
                bestScore,
                recentRole,
                chartData,
                pastInterviews,
            }
        };

    } catch (error: any) {
        console.error("Dashboard Stats Failure:", error);
        return { success: false, error: error.message || "Failed to load dashboard statistics." };
    }
}