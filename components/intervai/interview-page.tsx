"use client";

import { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Send,
  Bot,
  Sparkles,
  Clock,
  ChevronLeft,
  Code,
  MessageSquare,
  Volume2
} from "lucide-react";

interface InterviewPageProps {
  onNavigate: (page: string) => void;
}

const questions = [
  "Tell me about a challenging technical problem you&apos;ve solved recently.",
  "How would you design a scalable real-time notification system?",
  "Explain the concept of closure in JavaScript with examples.",
  "What&apos;s your approach to debugging complex issues in production?",
  "Describe a time when you had to make a difficult technical decision.",
];

export function InterviewPage({ onNavigate }: InterviewPageProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [response, setResponse] = useState("");
  const [audioLevel, setAudioLevel] = useState([3, 5, 8, 6, 4, 7, 5, 3, 6, 8, 5, 4]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [mode, setMode] = useState<"verbal" | "code">("verbal");

  // Simulate audio visualizer
  useEffect(() => {
    const interval = setInterval(() => {
      setAudioLevel(
        Array(12)
          .fill(0)
          .map(() => Math.floor(Math.random() * 10) + 1)
      );
    }, 150);
    return () => clearInterval(interval);
  }, []);

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

  const handleSubmit = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setResponse("");
    } else {
      onNavigate("feedback");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.08] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Exit Interview</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-400 font-medium">Live Session</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Left Panel - AI Interviewer */}
        <div className="flex-1 flex flex-col gap-4">
          {/* AI Avatar Section */}
          <div className="flex-1 bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col">
            {/* Avatar */}
            <div className="flex-1 flex items-center justify-center p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
              <div className="relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-white/[0.08] flex items-center justify-center">
                  <Bot className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-400" />
                </div>
                {/* Audio Visualizer Ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-end gap-1 h-8 sm:h-10">
                    {audioLevel.map((level, index) => (
                      <div
                        key={index}
                        className="w-1 bg-emerald-400/60 rounded-full transition-all duration-150"
                        style={{ height: `${level * 8}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Question Display */}
            <div className="p-4 sm:p-6 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              <div className="bg-zinc-900/80 border border-white/[0.05] rounded-xl p-4 font-mono">
                <p className="text-white text-sm sm:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: questions[currentQuestion] }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - User Response */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Camera Preview */}
          <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-white/[0.08]">
            <div className="absolute inset-0 flex items-center justify-center">
              {isVideoOn ? (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">JD</span>
                  </div>
                  <p className="text-xs text-zinc-500">Camera Preview</p>
                </div>
              ) : (
                <div className="text-center">
                  <VideoOff className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500">Camera Off</p>
                </div>
              )}
            </div>
            {/* Live Indicator */}
            <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-white">Live</span>
            </div>
          </div>

          {/* Response Area */}
          <div className="flex-1 bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl overflow-hidden flex flex-col">
            {/* Mode Tabs */}
            <div className="flex border-b border-white/[0.08]">
              <button
                onClick={() => setMode("verbal")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  mode === "verbal"
                    ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Verbal Response
              </button>
              <button
                onClick={() => setMode("code")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  mode === "code"
                    ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                <Code className="w-4 h-4" />
                Code Editor
              </button>
            </div>

            {/* Editor */}
            <div className="flex-1 p-4">
              {mode === "verbal" ? (
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response here or speak directly..."
                  className="w-full h-full min-h-[150px] bg-transparent text-white placeholder-zinc-600 resize-none focus:outline-none text-sm leading-relaxed"
                />
              ) : (
                <div className="h-full min-h-[150px] font-mono text-sm">
                  <div className="flex items-center gap-2 text-xs text-zinc-600 mb-2">
                    <span className="px-2 py-0.5 bg-zinc-800 rounded">JavaScript</span>
                    <span>index.js</span>
                  </div>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="// Write your code here..."
                    className="w-full h-[calc(100%-2rem)] bg-zinc-900/50 text-emerald-400 placeholder-zinc-700 resize-none focus:outline-none p-3 rounded-lg border border-white/[0.05]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Control Bar */}
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl px-4 sm:px-6 py-4 flex items-center justify-between gap-2 sm:gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-xl transition-all ${
                  isMuted
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "bg-white/[0.05] text-white hover:bg-white/[0.1]"
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-xl transition-all ${
                  !isVideoOn
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "bg-white/[0.05] text-white hover:bg-white/[0.1]"
                }`}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Submit Response</span>
              <span className="sm:hidden">Submit</span>
            </button>

            {/* End Session */}
            <button
              onClick={() => onNavigate("feedback")}
              className="p-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-all"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
