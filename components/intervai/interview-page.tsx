"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Clock, ChevronLeft, Loader2, Sparkles, Send, CheckCircle } from "lucide-react";
import { getInterviewSessionAction, saveInterviewAnswersAction } from "@/app/actions/generate-questions";
import { Progress } from "@/components/ui/progress";

interface InterviewPageProps {
  onNavigate: (page: string) => void;
  sessionId?: string | null;
}

const defaultQuestions = [
  "Tell me about a challenging technical problem you've solved recently.",
  "How would you design a scalable real-time notification system?",
  "Explain the concept of closure in JavaScript with examples.",
  "What's your approach to debugging complex issues in production?",
  "Describe a time when you had to make a difficult technical decision.",
];

export function InterviewPage({ onNavigate, sessionId }: InterviewPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState<string[]>(defaultQuestions);
  // responses is the single source of truth for all typed answers
  const [responses, setResponses] = useState<string[]>(Array(defaultQuestions.length).fill(""));
  const [elapsedTime, setElapsedTime] = useState(0);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Track whether we have already initialized responses for the loaded session.
  // This prevents the DB-question load from wiping any answers the user typed
  // during the brief loading window (when defaultQuestions were showing).
  const sessionLoadedRef = useRef(false);

  // Always keep a ref in sync with the responses state so that async callbacks
  // (like handleNext) always read the LATEST values and never close over stale state.
  const responsesRef = useRef<string[]>(responses);
  useEffect(() => {
    responsesRef.current = responses;
  }, [responses]);

  // Fetch custom questions from database session if sessionId is provided.
  // Resets currentQuestion and responses atomically so the two are never out of sync.
  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionData = async () => {
      setIsLoading(true);
      const result = await getInterviewSessionAction(sessionId);
      if (result.success && result.questions && result.questions.length > 0) {
        // Reset the question index AND responses together so they always match.
        setCurrentQuestion(0);
        setActiveQuestions(result.questions);
        // Initialize a fresh answers array sized to match the loaded questions.
        const freshResponses = Array(result.questions.length).fill("");
        setResponses(freshResponses);
        responsesRef.current = freshResponses;
        sessionLoadedRef.current = true;

        if (result.position) {
          setTargetRole(result.position);
        }
      } else {
        console.error("Failed to load custom AI questions:", result.error);
        // Fall back to defaultQuestions already in state — no reset needed.
        sessionLoadedRef.current = true;
      }
      setIsLoading(false);
    };

    fetchSessionData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentAnswer = responses[currentQuestion] ?? "";

  const handleAnswerChange = (value: string) => {
    setResponses((prev) => {
      const updated = [...prev];
      updated[currentQuestion] = value;
      return updated;
    });
  };

  const handleNext = useCallback(async () => {
    // Read the latest responses from the ref — never the potentially stale closure value.
    const latestResponses = responsesRef.current;

    if (currentQuestion < activeQuestions.length - 1) {
      // Advance to the next question.
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // ── Last question submitted ──────────────────────────────────────────────
      if (sessionId) {
        setIsSubmitting(true);
        try {
          // Ensure the answers array is correctly sized for the session questions.
          // Pad with empty strings if somehow responses is shorter than expected.
          const answersToSave = Array(activeQuestions.length)
            .fill("")
            .map((_, i) => latestResponses[i] ?? "");

          const result = await saveInterviewAnswersAction(sessionId, answersToSave);
          if (!result.success) {
            console.error("Failed to save responses:", result.error);
            alert(`Failed to save responses: ${result.error}`);
            setIsSubmitting(false);
            return; // Don't navigate away if save failed
          }
        } catch (err) {
          console.error("Unexpected error saving responses:", err);
          setIsSubmitting(false);
          return;
        }
        setIsSubmitting(false);
      }
      onNavigate("feedback");
    }
  // activeQuestions and sessionId are stable for the life of a session
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, activeQuestions, sessionId, onNavigate]);

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const progressPercent = activeQuestions.length > 0
    ? Math.round(((currentQuestion + 1) / activeQuestions.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.08] px-6 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setShowExitDialog(true)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors cursor-pointer group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Exit Interview</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs uppercase tracking-wider font-mono">Role:</span>
            <span className="text-emerald-400 text-sm font-medium font-mono">{targetRole}</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400 bg-white/[0.03] border border-white/[0.05] rounded-full px-3 py-1">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-mono font-medium">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="max-w-2xl w-full">
          {isLoading ? (
            <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.08] rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
              <div className="space-y-1">
                <p className="text-white font-medium text-lg">Initializing Interview Session</p>
                <p className="text-zinc-500 text-sm font-mono">Loading custom AI questions tailored to your profile...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              {/* Progress & Info Bar */}
              <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-500 mb-2">
                  <span>QUESTION {currentQuestion + 1} OF {activeQuestions.length}</span>
                  <span className="text-emerald-400 font-semibold">{progressPercent}% COMPLETE</span>
                </div>
                <Progress value={progressPercent} className="h-1.5 bg-zinc-800" />
              </div>

              {/* Question Text */}
              <div className="px-6 sm:px-8 py-6 border-b border-white/[0.05]">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold font-mono mt-0.5 shrink-0">
                    Q
                  </div>
                  <h2
                    className="text-white text-base sm:text-lg font-medium leading-relaxed font-sans"
                    dangerouslySetInnerHTML={{ __html: activeQuestions[currentQuestion] || "" }}
                  />
                </div>
              </div>

              {/* Answer Input Area */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Your Written Answer</label>
                  <span className="text-xs font-mono text-zinc-600">{currentAnswer.length} characters</span>
                </div>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type your response in detail here. You can outline logic, explain trade-offs, or share relevant experience..."
                  className="w-full min-h-[220px] bg-zinc-900/40 border border-white/[0.08] focus:border-emerald-500/50 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono text-sm leading-relaxed resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Bottom Actions Footer */}
              <div className="px-6 sm:px-8 py-4 sm:py-5 bg-white/[0.01] border-t border-white/[0.05] flex justify-between items-center gap-4">
                {/* Back Button */}
                <button
                  onClick={handleBack}
                  disabled={currentQuestion === 0 || isSubmitting}
                  className="px-4 py-2.5 text-zinc-500 hover:text-white disabled:text-zinc-800 font-medium text-sm transition-all rounded-lg hover:bg-white/[0.03] disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>

                {/* Next / Submit Button */}
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-semibold rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Response...</span>
                    </>
                  ) : currentQuestion === activeQuestions.length - 1 ? (
                    <>
                      <span>Finish &amp; Submit</span>
                      <CheckCircle className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Next Question</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Exit Confirmation Dialog overlay */}
      {showExitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl space-y-4">
            <h3 className="text-lg font-semibold text-white">Exit Interview?</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Are you sure you want to leave? Your answers in this session will not be saved and the interview will be cancelled.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExitDialog(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => onNavigate("dashboard")}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-400 text-white rounded-lg transition-colors font-semibold cursor-pointer"
              >
                Exit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
