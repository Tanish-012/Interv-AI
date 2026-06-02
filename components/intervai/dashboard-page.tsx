"use client";

import { useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { ResumeUpload } from "./resume-upload";
import {
  Home,
  Video,
  BarChart3,
  Settings,
  Bell,
  Plus,
  ChevronRight,
  Calendar,
  Trophy,
  Target,
  Sparkles,
  LogOut,
  Menu,
  X,
  Clock,
  CheckCircle
} from "lucide-react";

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

const pastInterviews = [
  { id: 1, role: "Frontend Engineer", company: "TechCorp", date: "Dec 15, 2024", status: "Completed", score: 92 },
  { id: 2, role: "Full Stack Developer", company: "StartupX", date: "Dec 12, 2024", status: "Completed", score: 88 },
  { id: 3, role: "React Developer", company: "DigitalCo", date: "Dec 10, 2024", status: "Completed", score: 85 },
  { id: 4, role: "Software Engineer", company: "MegaTech", date: "Dec 8, 2024", status: "Completed", score: 91 },
];

const recommendations = [
  { title: "System Design: Distributed Cache", duration: "45 min", difficulty: "Hard" },
  { title: "Behavioral: Leadership Scenarios", duration: "30 min", difficulty: "Medium" },
  { title: "Coding: Dynamic Programming", duration: "60 min", difficulty: "Hard" },
];

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useUser();
  
  const userInitials = user ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}` : "JD";
  const userFullName = user ? user.fullName : "John Doe";
  const userEmail = user ? user.primaryEmailAddress?.emailAddress : "john@example.com";
  const userFirstName = user ? user.firstName : "John";

  const navItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: Video, label: "Interviews", active: false },
    { icon: BarChart3, label: "Analytics", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];

  const CircularProgress = ({ value, size = 40 }: { value: number; size?: number }) => {
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className="text-zinc-800"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
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
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
          {value}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-zinc-950 border-r border-white/[0.08] flex flex-col transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            {sidebarOpen && (
              <span className="text-lg font-semibold text-white">IntervAI</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item, index) => (
              <li key={index}>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    item.active
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-3">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={userFullName || "Avatar"}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-white">{userInitials}</span>
              </div>
            )}
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userFullName}</p>
                <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
              </div>
            )}
            {sidebarOpen && (
              <SignOutButton>
                <button
                  className="p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </SignOutButton>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.08] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">Welcome back, {userFirstName}</h1>
                <p className="text-sm text-zinc-500">Ready for your next interview?</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              </button>
              <button
                onClick={() => onNavigate("interview")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium rounded-lg transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                New Interview
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Video, label: "Interviews Completed", value: "24", change: "+3 this week", color: "emerald" },
              { icon: Target, label: "Average Score", value: "84%", change: "+5% improvement", color: "indigo" },
              { icon: Trophy, label: "Current Streak", value: "7 days", change: "Personal best!", color: "amber" },
            ].map((metric, index) => (
              <div
                key={index}
                className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-5 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-${metric.color}-500/10`}>
                    <metric.icon className={`w-5 h-5 text-${metric.color}-400`} />
                  </div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">{metric.label}</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{metric.value}</p>
                <p className="text-xs text-emerald-400">{metric.change}</p>
              </div>
            ))}
          </div>

          {/* AI Resume Upload Section */}
          <ResumeUpload />

          {/* Mobile New Interview Button */}
          <button
            onClick={() => onNavigate("interview")}
            className="sm:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Start New Interview
          </button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Past Interviews */}
            <div className="lg:col-span-2 bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl overflow-hidden">
              <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Past Interviews</h2>
                <button
                  onClick={() => onNavigate("feedback")}
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-white/[0.05]">
                {pastInterviews.map((interview) => (
                  <button
                    key={interview.id}
                    onClick={() => onNavigate("feedback")}
                    className="w-full p-4 hover:bg-white/[0.02] transition-colors flex items-center gap-4 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{interview.role}</p>
                      <p className="text-xs text-zinc-500">{interview.company}</p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-zinc-500">{interview.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-zinc-400">{interview.status}</span>
                    </div>
                    <CircularProgress value={interview.score} />
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl">
              <div className="p-5 border-b border-white/[0.08]">
                <h2 className="text-lg font-semibold text-white">Recommended</h2>
                <p className="text-xs text-zinc-500 mt-1">Based on your performance</p>
              </div>
              <div className="p-4 space-y-3">
                {recommendations.map((rec, index) => (
                  <button
                    key={index}
                    onClick={() => onNavigate("interview")}
                    className="w-full p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/[0.1] rounded-xl transition-all text-left group"
                  >
                    <p className="text-sm font-medium text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {rec.title}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Clock className="w-3 h-3" />
                        {rec.duration}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          rec.difficulty === "Hard"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {rec.difficulty}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-white/[0.08] rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Schedule Your Next Session</h3>
                <p className="text-sm text-zinc-400">
                  Consistent practice leads to better results. Book your next mock interview now.
                </p>
              </div>
              <button
                onClick={() => onNavigate("interview")}
                className="hidden sm:flex px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium rounded-lg transition-all hover:scale-105"
              >
                Schedule Now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
