"use client";

import { useState, useEffect, useRef } from "react";
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
  CheckCircle,
  Loader2,
  TrendingUp
} from "lucide-react";
import { getDashboardStatsAction } from "@/app/actions/generate-questions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onStartInterview?: (sessionId: string) => void;
  /** Increment this value from the parent to force a stats refetch (e.g. after returning from an interview). */
  refreshKey?: number;
}

const recommendations = [
  { title: "System Design: Distributed Cache", duration: "45 min", difficulty: "Hard" },
  { title: "Behavioral: Leadership Scenarios", duration: "30 min", difficulty: "Medium" },
  { title: "Coding: Dynamic Programming", duration: "60 min", difficulty: "Hard" },
];

export function DashboardPage({ onNavigate, onStartInterview, refreshKey = 0 }: DashboardPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Dashboard" | "Interviews" | "Analytics" | "Settings">("Dashboard");

  const { user } = useUser();
  
  const userInitials = user ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}` : "JD";
  const userFullName = user ? user.fullName : "John Doe";
  const userEmail = user ? user.primaryEmailAddress?.emailAddress : "john@example.com";
  const userFirstName = user ? user.firstName : "John";

  const navItems = [
    { icon: Home, label: "Dashboard" as const, active: activeTab === "Dashboard" },
    { icon: Video, label: "Interviews" as const, active: activeTab === "Interviews" },
    { icon: BarChart3, label: "Analytics" as const, active: activeTab === "Analytics" },
    { icon: Settings, label: "Settings" as const, active: activeTab === "Settings" },
  ];

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const result = await getDashboardStatsAction();
        if (result.success && result.stats && active) {
          setStats(result.stats);
        }
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchStats();

    return () => {
      active = false;
    };
  // refreshKey changes whenever the user returns from an interview so stats stay current.
  }, [refreshKey]);

  const CircularProgress = ({ value, size = 40 }: { value: number; size?: number }) => {
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="relative shrink-0" style={{ width: size, height: size }}>
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
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white font-mono">
          {value}
        </span>
      </div>
    );
  };

  const totalInterviews = stats?.totalInterviews ?? 0;
  const averageScore = stats?.averageScore ?? null;
  const bestScore = stats?.bestScore ?? null;
  const recentRole = stats?.recentRole ?? null;
  const chartData = stats?.chartData ?? [];
  const pastInterviews = stats?.pastInterviews ?? [];

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
              <span className="text-lg font-semibold text-white tracking-tight">IntervAI</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
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
                  onClick={() => {
                    setActiveTab(item.label);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer ${
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
                className="lg:hidden p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">Welcome back, {userFirstName}</h1>
                <p className="text-sm text-zinc-500">Ready for your next interview?</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="relative p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {totalInterviews > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                  )}
                </button>

                {/* Notifications dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-white/[0.10] rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
                      <span className="text-xs font-semibold text-white font-mono uppercase tracking-wider">Notifications</span>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        aria-label="Close notifications"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-6 flex flex-col items-center justify-center gap-2 text-center">
                      <Bell className="w-8 h-8 text-zinc-700" />
                      <p className="text-sm font-medium text-zinc-400">No new notifications</p>
                      <p className="text-xs text-zinc-600">You&apos;re all caught up!</p>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => onNavigate("interview")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium rounded-lg transition-all hover:scale-105 cursor-pointer font-mono text-sm"
              >
                <Plus className="w-4 h-4" />
                New Interview
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        {isLoading ? (
          <div className="p-6 h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
            <p className="text-sm font-mono text-zinc-500">Fetching dashboard metrics...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            
            {activeTab === "Dashboard" && (
              <>
                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Interviews */}
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <Video className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Total Interviews</span>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white font-mono leading-none">{totalInterviews}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Sessions completed</p>
                    </div>
                  </div>

                  {/* Average Score */}
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10">
                        <Target className="w-5 h-5 text-indigo-400" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Average Score</span>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white font-mono leading-none">
                        {averageScore !== null ? `${averageScore}` : "--"}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1">Weighted average %</p>
                    </div>
                  </div>

                  {/* Best Score */}
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Trophy className="w-5 h-5 text-amber-400" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Best Score</span>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white font-mono leading-none">
                        {bestScore !== null ? `${bestScore}` : "--"}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1">Highest result attained</p>
                    </div>
                  </div>

                  {/* Recent Interview Role */}
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <Clock className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Recent Interview</span>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white truncate leading-tight">
                        {recentRole !== null ? recentRole : "None"}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1">Last active role session</p>
                    </div>
                  </div>
                </div>

                {/* Score Progression Line Chart (Recharts) */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-6 font-sans">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Interview Score Progression
                  </h2>
                  {chartData.length === 0 ? (
                    <div className="h-[200px] border border-dashed border-white/[0.08] rounded-lg flex flex-col items-center justify-center p-4 text-center">
                      <TrendingUp className="w-8 h-8 text-zinc-600 mb-2" />
                      <p className="text-xs font-mono text-zinc-500">No score progression data available yet.</p>
                      <p className="text-[10px] text-zinc-600 mt-1 font-sans">Complete an interview session to render the progression line graph.</p>
                    </div>
                  ) : (
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                          <XAxis
                            dataKey="name"
                            stroke="#71717a"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={8}
                            fontFamily="monospace"
                          />
                          <YAxis
                            stroke="#71717a"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                            dx={-8}
                            fontFamily="monospace"
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#09090b",
                              borderColor: "rgba(255, 255, 255, 0.08)",
                              borderRadius: "8px",
                              color: "#fff",
                              fontFamily: "monospace",
                              fontSize: "11px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            name="Score"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ fill: "#10b981", strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* AI Resume Upload Section */}
                <ResumeUpload onStartInterview={onStartInterview} />

                {/* Mobile New Interview Button */}
                <button
                  onClick={() => onNavigate("interview")}
                  className="sm:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium rounded-xl transition-all font-mono text-sm cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  Start New Interview
                </button>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Past Interviews */}
                  <div className="lg:col-span-2 bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl overflow-hidden shadow-lg">
                    <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-white font-sans">Past Interviews</h2>
                      {pastInterviews.length > 0 && (
                        <button
                          onClick={() => setActiveTab("Interviews")}
                          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-0.5 cursor-pointer font-mono"
                        >
                          View All
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {pastInterviews.length === 0 ? (
                      <div className="p-8 text-center border-b border-white/[0.05]">
                        <Video className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                        <p className="text-xs font-mono text-zinc-500">No mock interviews completed yet.</p>
                        <p className="text-[10px] text-zinc-600 mt-1 font-sans">Upload your resume above to start a session.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/[0.05]">
                        {pastInterviews.map((interview: any) => (
                          <button
                            key={interview.id}
                            onClick={() => {
                              onStartInterview?.(interview.id);
                              onNavigate("feedback");
                            }}
                            className="w-full p-4 hover:bg-white/[0.02] transition-colors flex items-center gap-4 text-left cursor-pointer"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{interview.role}</p>
                              <p className="text-xs text-zinc-500">Practice Session</p>
                            </div>
                            <div className="hidden sm:block text-right">
                              <p className="text-xs text-zinc-500 font-mono">{interview.date}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[10px] text-zinc-400 uppercase font-mono">{interview.status}</span>
                            </div>
                            <CircularProgress value={interview.score} />
                            <ChevronRight className="w-4 h-4 text-zinc-600" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl shadow-lg">
                    <div className="p-5 border-b border-white/[0.08]">
                      <h2 className="text-sm font-semibold text-white font-sans">Recommended Topics</h2>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Based on your performance</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {recommendations.map((rec, index) => (
                        <button
                          key={index}
                          onClick={() => onNavigate("interview")}
                          className="w-full p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/[0.1] rounded-xl transition-all text-left group cursor-pointer"
                        >
                          <p className="text-sm font-medium text-white mb-2 group-hover:text-emerald-400 transition-colors">
                            {rec.title}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                              <Clock className="w-3 h-3" />
                              {rec.duration}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                rec.difficulty === "Hard"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
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

                {/* Upcoming Schedule Banner */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-white/[0.08] rounded-xl p-6 shadow-md">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="p-3 bg-emerald-500/20 rounded-xl shrink-0">
                      <Calendar className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white">Schedule Your Next Session</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Consistent practice leads to better results. Book your next mock interview now.
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate("interview")}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg text-xs transition-all hover:scale-105 cursor-pointer font-mono"
                    >
                      Schedule Now
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "Interviews" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white font-sans">Interview History</h2>
                    <p className="text-xs text-zinc-500 mt-1">Review your past performance and restart pending reviews.</p>
                  </div>
                  <button
                    onClick={() => onNavigate("interview")}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium rounded-lg transition-all hover:scale-105 cursor-pointer font-mono text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    New Session
                  </button>
                </div>

                {pastInterviews.length === 0 ? (
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-12 text-center max-w-2xl mx-auto">
                    <Video className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-sm font-semibold text-white mb-1">No Practice Sessions</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
                      You haven't conducted any mock interviews yet. Upload your resume to generate customized questions.
                    </p>
                    <button
                      onClick={() => onNavigate("interview")}
                      className="px-5 py-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl transition-all text-xs font-mono"
                    >
                      Start Practicing
                    </button>
                  </div>
                ) : (
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden shadow-lg">
                    <div className="p-5 border-b border-white/[0.08]">
                      <h3 className="text-sm font-semibold text-white font-sans">Completed & Pending Sessions</h3>
                    </div>
                    <div className="divide-y divide-white/[0.05]">
                      {pastInterviews.map((interview: any) => (
                        <button
                          key={interview.id}
                          onClick={() => {
                            onStartInterview?.(interview.id);
                            onNavigate("feedback");
                          }}
                          className="w-full p-5 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center gap-4 text-left cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-medium text-white truncate">{interview.role}</p>
                            <p className="text-xs text-zinc-500 mt-1">Practice Session • ID: {interview.id.substring(0, 8)}...</p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                            <span className="text-xs text-zinc-500 font-mono">{interview.date}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[10px] text-zinc-400 uppercase font-mono">{interview.status}</span>
                            </div>
                            <CircularProgress value={interview.score} />
                            <ChevronRight className="w-4 h-4 text-zinc-600" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "Analytics" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white font-sans">Performance Analytics</h2>
                  <p className="text-xs text-zinc-500 mt-1">Detailed breakdown of your interview metrics over time.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Summary Metric 1 */}
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 flex flex-col justify-between shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <Trophy className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Top Score</span>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white font-mono leading-none">
                        {bestScore !== null ? `${bestScore}%` : "--"}
                      </p>
                      <p className="text-xs text-zinc-500 mt-2">Highest overall feedback score</p>
                    </div>
                  </div>

                  {/* Summary Metric 2 */}
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 flex flex-col justify-between shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10">
                        <Target className="w-5 h-5 text-indigo-400" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Average accuracy</span>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white font-mono leading-none">
                        {averageScore !== null ? `${averageScore}%` : "--"}
                      </p>
                      <p className="text-xs text-zinc-500 mt-2">Weighted average across all sessions</p>
                    </div>
                  </div>

                  {/* Summary Metric 3 */}
                  <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 flex flex-col justify-between shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-violet-500/10">
                        <Video className="w-5 h-5 text-violet-400" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Total Practice Time</span>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white font-mono leading-none">
                        {totalInterviews * 15} mins
                      </p>
                      <p className="text-xs text-zinc-500 mt-2">Estimated prep time logged</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6 shadow-lg">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-6 font-sans">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Interview-by-Interview Progress
                  </h3>
                  {chartData.length === 0 ? (
                    <div className="h-[250px] border border-dashed border-white/[0.08] rounded-lg flex flex-col items-center justify-center p-4 text-center">
                      <TrendingUp className="w-8 h-8 text-zinc-600 mb-2" />
                      <p className="text-xs font-mono text-zinc-500">No data points available yet</p>
                      <p className="text-[10px] text-zinc-600 mt-1 font-sans">Complete an interview session to render the progression line graph.</p>
                    </div>
                  ) : (
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                          <XAxis
                            dataKey="name"
                            stroke="#71717a"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={8}
                            fontFamily="monospace"
                          />
                          <YAxis
                            stroke="#71717a"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                            dx={-8}
                            fontFamily="monospace"
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#09090b",
                              borderColor: "rgba(255, 255, 255, 0.08)",
                              borderRadius: "8px",
                              color: "#fff",
                              fontFamily: "monospace",
                              fontSize: "11px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            name="Score"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ fill: "#10b981", strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "Settings" && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h2 className="text-xl font-bold text-white font-sans">Account & Platform Settings</h2>
                  <p className="text-xs text-zinc-500 mt-1">Manage your active configuration and Clerk session.</p>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-6 shadow-lg space-y-6">
                  {/* Profile info */}
                  <div className="flex items-center gap-4 border-b border-white/[0.08] pb-6">
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={userFullName || "Avatar"}
                        className="w-16 h-16 rounded-full object-cover border border-white/[0.1] shadow"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center border border-white/[0.1] shadow">
                        <span className="text-xl font-semibold text-white">{userInitials}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-semibold text-white">{userFullName}</h3>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">{userEmail}</p>
                      <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono">
                        Clerk Verified
                      </span>
                    </div>
                  </div>

                  {/* Setup parameters */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Platform Options</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/[0.01] border border-white/[0.05] rounded-xl">
                        <p className="text-xs text-zinc-400 font-medium">Questions Per Session</p>
                        <p className="text-base font-bold text-white mt-1 font-mono">10 Questions</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">Fixed for comprehensive grading</p>
                      </div>

                      <div className="p-4 bg-white/[0.01] border border-white/[0.05] rounded-xl">
                        <p className="text-xs text-zinc-400 font-medium">AI Generation Engine</p>
                        <p className="text-base font-bold text-white mt-1 font-mono">gemini-2.5-flash</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">Fastest, low-latency reasoning</p>
                      </div>

                      <div className="p-4 bg-white/[0.01] border border-white/[0.05] rounded-xl">
                        <p className="text-xs text-zinc-400 font-medium">Database Node</p>
                        <p className="text-base font-bold text-white mt-1 font-mono">Neon Serverless</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">PostgreSQL (US East, AWS)</p>
                      </div>

                      <div className="p-4 bg-white/[0.01] border border-white/[0.05] rounded-xl">
                        <p className="text-xs text-zinc-400 font-medium">Authentication</p>
                        <p className="text-base font-bold text-white mt-1 font-mono">Clerk JWT</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">Secure SSO integration</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-white/[0.08] pt-6 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-medium text-white">Log Out Session</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Safely exit your current session and authentication context.</p>
                    </div>
                    <SignOutButton>
                      <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all text-xs font-mono font-medium cursor-pointer">
                        Sign Out
                      </button>
                    </SignOutButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
