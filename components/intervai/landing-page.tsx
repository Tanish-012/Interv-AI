"use client";

import { ArrowRight, Zap, Users, FileText, ChevronRight, Sparkles, Brain, Target } from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">IntervAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
            <a href="#about" className="text-sm text-zinc-400 hover:text-white transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <SignInButton mode="modal">
              <button
                className="px-4 py-2 text-sm text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium rounded-lg transition-all hover:scale-105 cursor-pointer"
              >
                Get Started
              </button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-zinc-400">Now with GPT-5 Integration</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Master Your Next</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-indigo-400 bg-clip-text text-transparent">
              Technical Interview
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Practice with AI-powered mock interviews. Get real-time feedback,
            detailed analytics, and recruiter-ready performance reports.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignUpButton mode="modal">
              <button
                className="group px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)] flex items-center gap-2 cursor-pointer"
              >
                Start Free Mock Interview
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
            <button className="px-8 py-4 text-zinc-300 hover:text-white font-medium rounded-xl border border-white/[0.08] hover:border-white/20 transition-all flex items-center gap-2 bg-white/[0.02] hover:bg-white/[0.04]">
              Watch Demo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mock Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.05]">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Score</p>
                  <p className="text-2xl font-bold text-emerald-400">94%</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.05]">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Interviews</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.05]">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Streak</p>
                  <p className="text-2xl font-bold text-indigo-400">7 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-emerald-400 uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Our AI-powered platform gives you the tools to practice, improve, and land your dream job.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Real-time AI Feedback",
                description: "Get instant analysis of your responses with actionable suggestions to improve your performance.",
                color: "emerald"
              },
              {
                icon: Brain,
                title: "Behavioral & Tech Tracks",
                description: "Practice both behavioral questions and technical coding challenges tailored to your target role.",
                color: "indigo"
              },
              {
                icon: FileText,
                title: "Recruiter-Ready Reports",
                description: "Generate professional performance reports to share with recruiters and hiring managers.",
                color: "emerald"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-16 px-6 border-y border-white/[0.08]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10,000+", label: "Interviews Conducted" },
              { value: "94%", label: "Success Rate" },
              { value: "500+", label: "Companies Hired From" },
              { value: "4.9/5", label: "User Rating" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-b from-emerald-500/10 to-transparent p-12 rounded-3xl border border-emerald-500/20">
            <Target className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Ace Your Interview?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
              Join thousands of professionals who have landed their dream jobs with IntervAI.
            </p>
            <SignUpButton mode="modal">
              <button
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                Start Your Free Trial
              </button>
            </SignUpButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm text-zinc-500">IntervAI &copy; 2024. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
