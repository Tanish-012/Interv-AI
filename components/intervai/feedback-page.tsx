"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Share2,
  Download,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Trophy,
  Target,
  Zap,
  Loader2,
  AlertCircle
} from "lucide-react";
import { generateInterviewFeedbackAction } from "@/app/actions/generate-questions";

interface FeedbackPageProps {
  onNavigate: (page: string) => void;
  sessionId?: string | null;
}

const mockFeedbacksFallback = [
  {
    id: "mock-1",
    question: "Tell me about a challenging technical problem you've solved recently.",
    answer: "I optimized a slow SQL query by adding an index on the foreign key column, which reduced page load time from 5 seconds to 200 milliseconds.",
    score: 8,
    strengths: [
      "Concrete metrics provided (5s to 200ms)",
      "Clear explanation of the problem and resolution"
    ],
    weaknesses: [
      "Could elaborate more on how the query was identified",
      "No mention of query analyzer tools used"
    ],
    betterAnswer: "Recently, we noticed dashboard pages lagging. I profiled the database using EXPLAIN ANALYZE and identified a sequential scan on the orders table. By creating a composite index on user_id, I reduced query latency and page load times from 5s to 200ms."
  },
  {
    id: "mock-2",
    question: "Explain the concept of closure in JavaScript with examples.",
    answer: "Closure is when a function can access variables from its outer scope even after the outer function has finished executing.",
    score: 9,
    strengths: [
      "Accurate technical definition",
      "Shows conceptual clarity"
    ],
    weaknesses: [
      "Lacks a practical code snippet example as requested in the question prompt"
    ],
    betterAnswer: "A closure is the combination of a function bundled together with references to its surrounding state. Example: \n\n```js\nfunction createCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst counter = createCounter();\nconsole.log(counter()); // 1\n```"
  }
];

const progressHistory = [
  { session: 1, score: 72 },
  { session: 2, score: 78 },
  { session: 3, score: 75 },
  { session: 4, score: 82 },
  { session: 5, score: 85 }
];

export function FeedbackPage({ onNavigate, sessionId }: FeedbackPageProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [shared, setShared] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>(mockFeedbacksFallback);
  const [position, setPosition] = useState<string>("Software Engineer");
  const [createdAtDate, setCreatedAtDate] = useState<string>("December 16, 2024");

  useEffect(() => {
    if (!sessionId) return;

    const fetchFeedback = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await generateInterviewFeedbackAction(sessionId);
        if (result.success && result.feedbacks && result.feedbacks.length > 0) {
          setFeedbacks(result.feedbacks);
          if (result.position) {
            setPosition(result.position);
          }
          if (result.createdAt) {
            const date = new Date(result.createdAt);
            setCreatedAtDate(
              date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })
            );
          }
        } else {
          setError(result.error || "Failed to generate interview feedback.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while loading feedback.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [sessionId]);

  // Compute dynamic overall score as average score * 10
  const totalScoreSum = feedbacks.reduce((acc, f) => acc + (f.score || 0), 0);
  const overallScore = feedbacks.length > 0
    ? Math.round((totalScoreSum / (feedbacks.length * 10)) * 100)
    : 85;

  const CircularGauge = ({ value, size = 200 }: { value: number; size?: number }) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="relative animate-in fade-in zoom-in-95 duration-500" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-500"
          style={{
            boxShadow: `0 0 60px rgba(16, 185, 129, ${value / 200})`,
          }}
        />
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            className="text-zinc-800"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          <circle
            className="text-emerald-400 transition-all duration-500"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{
              filter: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-white transition-all duration-500">{value}</span>
          <span className="text-sm text-zinc-500 font-mono">out of 100</span>
        </div>
      </div>
    );
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard API not available in this context — silently skip
    }
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  };

  const handleDownload = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorative Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.08] rounded-3xl p-12 max-w-md w-full text-center space-y-6 shadow-2xl relative z-10">
          <div className="relative inline-block">
            <Loader2 className="w-16 h-16 text-emerald-400 animate-spin mx-auto" />
            <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Analyzing Your Answers</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Our AI is scoring each of your responses out of 10, mapping concrete strengths, noting weaknesses, and crafting improved answers...
            </p>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="bg-white/[0.02] backdrop-blur-md border border-white/[0.08] rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative z-10">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Feedback Generation Failed</h2>
            <p className="text-zinc-500 text-sm leading-relaxed">{error}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate("dashboard")}
              className="flex-1 px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-white text-sm font-medium rounded-lg transition-all cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold rounded-lg transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[130px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              title="Download / Print report"
              className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                shared
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/[0.05] text-white hover:bg-white/[0.1]"
              }`}
            >
              {shared ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 flex-1 z-10 w-full">
        {/* Hero Section */}
        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-3xl p-8 text-center relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">Evaluation Complete</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{position} Mock Interview</h1>
          <p className="text-zinc-500 mb-8 font-mono text-xs uppercase tracking-wider">{createdAtDate}</p>

          <div className="flex justify-center mb-8">
            <CircularGauge value={overallScore} />
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-zinc-400 text-xs font-mono">Strong (8-10)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-zinc-400 text-xs font-mono">Average (6-7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="text-zinc-400 text-xs font-mono">Needs Work (&lt;6)</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: MessageSquare, label: "Questions asked", value: feedbacks.length.toString(), color: "emerald" },
            { icon: Target, label: "Overall Score", value: `${overallScore}/100`, color: "indigo" },
            { icon: Zap, label: "AI Reviewer", value: "Gemini 2.5", color: "amber" },
            { icon: TrendingUp, label: "Feedback Status", value: "Generated", color: "emerald" }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
            >
              <stat.icon className={`w-5 h-5 text-${stat.color}-400 mb-4`} />
              <div>
                <p className="text-2xl font-bold text-white font-mono leading-none mb-1">{stat.value}</p>
                <p className="text-xs text-zinc-500 font-sans">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Question-by-Question Review */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Detailed Question-by-Question Review
          </h2>

          {feedbacks.map((f: any, index: number) => {
            const strengths = Array.isArray(f.strengths) ? f.strengths : [];
            const weaknesses = Array.isArray(f.weaknesses) ? f.weaknesses : [];

            return (
              <div
                key={f.id || index}
                className="bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] rounded-2xl overflow-hidden shadow-lg transition-all"
              >
                {/* Header Toggle Button */}
                <button
                  onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                  className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-4 text-left mr-4">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 font-mono text-xs shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-white text-sm sm:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: f.question || "" }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border ${
                        f.score >= 8
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : f.score >= 6
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}
                    >
                      {f.score}/10
                    </div>
                    {expandedSection === index ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </button>

                {/* Collapsible Content */}
                {expandedSection === index && (
                  <div className="px-5 pb-6 border-t border-white/[0.05] bg-black/[0.1] space-y-6 pt-5 animate-in slide-in-from-top-2 duration-300">
                    
                    {/* User Answer */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">Your Answer:</h4>
                      <div className="bg-zinc-900/40 border border-white/[0.04] rounded-xl p-4 font-mono text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {f.answer || <span className="text-zinc-600 italic">No answer provided.</span>}
                      </div>
                    </div>

                    {/* Strengths & Weaknesses Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Strengths */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          Strengths
                        </h4>
                        {strengths.length > 0 ? (
                          <ul className="space-y-2">
                            {strengths.map((str: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                {str}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-zinc-600 italic">None noted.</p>
                        )}
                      </div>

                      {/* Weaknesses */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono font-medium text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-amber-400" />
                          Weaknesses
                        </h4>
                        {weaknesses.length > 0 ? (
                          <ul className="space-y-2">
                            {weaknesses.map((weak: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                                {weak}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-zinc-600 italic">None noted.</p>
                        )}
                      </div>
                    </div>

                    {/* Better Answer suggestions */}
                    {f.betterAnswer && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          Suggested Better Answer:
                        </h4>
                        <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl p-4 sm:p-5 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                          {f.betterAnswer}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Score Progression Map */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Score Progression
          </h2>

          <div className="h-48 flex items-end justify-between gap-4 px-4 pt-4">
            {progressHistory.map((data, index) => {
              const isLatest = index === progressHistory.length - 1;
              const heightValue = isLatest ? overallScore : data.score;
              const height = `${heightValue}%`;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-sm font-medium text-white">{heightValue}</span>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isLatest
                        ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                        : "bg-zinc-800"
                    }`}
                    style={{ height }}
                  />
                  <span className="text-xs text-zinc-500 font-mono">#{data.session}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-white/[0.08] rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-white mb-1">Ready for another round?</h3>
            <p className="text-sm text-zinc-400 font-sans">Practice makes perfect. Start another interview to keep improving your score.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="px-5 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium rounded-lg transition-all border border-white/[0.08] cursor-pointer"
            >
              Share Report
            </button>
            <button
              onClick={() => onNavigate("interview")}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium rounded-lg transition-all hover:scale-105 cursor-pointer"
            >
              New Interview
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
