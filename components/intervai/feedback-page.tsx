"use client";

import { useState } from "react";
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
  Code,
  Users,
  Sparkles,
  Trophy,
  Target,
  Zap
} from "lucide-react";

interface FeedbackPageProps {
  onNavigate: (page: string) => void;
}

const feedbackSections = [
  {
    title: "Technical Accuracy",
    score: 88,
    strengths: [
      "Strong understanding of React hooks and lifecycle",
      "Clear explanation of closure concepts",
      "Good knowledge of async/await patterns"
    ],
    improvements: [
      "Could elaborate more on error handling strategies",
      "Consider mentioning edge cases in system design"
    ]
  },
  {
    title: "Communication Skills",
    score: 92,
    strengths: [
      "Clear and structured responses",
      "Good use of examples to illustrate points",
      "Confident delivery throughout"
    ],
    improvements: [
      "Pause more to gather thoughts on complex questions",
      "Ask clarifying questions when needed"
    ]
  },
  {
    title: "Problem Solving",
    score: 85,
    strengths: [
      "Logical approach to breaking down problems",
      "Good time management",
      "Considered multiple approaches"
    ],
    improvements: [
      "Walk through thought process more explicitly",
      "Discuss trade-offs between solutions"
    ]
  }
];

const progressHistory = [
  { session: 1, score: 72 },
  { session: 2, score: 78 },
  { session: 3, score: 75 },
  { session: 4, score: 82 },
  { session: 5, score: 87 }
];

export function FeedbackPage({ onNavigate }: FeedbackPageProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [shared, setShared] = useState(false);

  const overallScore = 87;

  const CircularGauge = ({ value, size = 200 }: { value: number; size?: number }) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full"
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
            className="text-emerald-400"
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
          <span className="text-5xl font-bold text-white">{value}</span>
          <span className="text-sm text-zinc-500">out of 100</span>
        </div>
      </div>
    );
  };

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2 text-zinc-400 hover:text-white transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
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

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">Interview Complete</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Frontend Engineer Interview</h1>
          <p className="text-zinc-500 mb-8">December 16, 2024 • 45 minutes</p>

          <div className="flex justify-center mb-8">
            <CircularGauge value={overallScore} />
          </div>

          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-zinc-400">Excellent (80-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-zinc-400">Good (60-79)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-zinc-400">Needs Work (&lt;60)</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: MessageSquare, label: "Questions", value: "5", color: "emerald" },
            { icon: Code, label: "Code Problems", value: "2", color: "indigo" },
            { icon: Zap, label: "Avg Response", value: "2.5 min", color: "amber" },
            { icon: TrendingUp, label: "Improvement", value: "+5%", color: "emerald" }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4"
            >
              <stat.icon className={`w-5 h-5 text-${stat.color}-400 mb-2`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Section Breakdown */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Performance Breakdown
          </h2>

          {feedbackSections.map((section, index) => (
            <div
              key={index}
              className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      section.score >= 90
                        ? "bg-emerald-500/20 text-emerald-400"
                        : section.score >= 80
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {section.score}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-white">{section.title}</h3>
                    <p className="text-xs text-zinc-500">
                      {section.strengths.length} strengths • {section.improvements.length} areas to improve
                    </p>
                  </div>
                </div>
                {expandedSection === index ? (
                  <ChevronUp className="w-5 h-5 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-500" />
                )}
              </button>

              {expandedSection === index && (
                <div className="px-5 pb-5 border-t border-white/[0.05]">
                  <div className="grid md:grid-cols-2 gap-6 pt-5">
                    {/* Strengths */}
                    <div>
                      <h4 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {section.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Areas to Improve */}
                    <div>
                      <h4 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Areas to Improve
                      </h4>
                      <ul className="space-y-2">
                        {section.improvements.map((improvement, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Chart */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Score Progression
          </h2>

          <div className="h-48 flex items-end justify-between gap-4 px-4">
            {progressHistory.map((data, index) => {
              const height = `${data.score}%`;
              const isLatest = index === progressHistory.length - 1;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-sm font-medium text-white">{data.score}</span>
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      isLatest
                        ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                        : "bg-zinc-800"
                    }`}
                    style={{ height }}
                  />
                  <span className="text-xs text-zinc-500">#{data.session}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-white/[0.08] rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-white mb-1">Ready for another round?</h3>
            <p className="text-sm text-zinc-400">Practice makes perfect. Start another interview to keep improving.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="px-5 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium rounded-lg transition-all border border-white/[0.08]"
            >
              Share with Recruiter
            </button>
            <button
              onClick={() => onNavigate("interview")}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium rounded-lg transition-all hover:scale-105"
            >
              New Interview
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
