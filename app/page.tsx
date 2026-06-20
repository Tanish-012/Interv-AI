"use client";

import { useState, useEffect } from "react";
import { LandingPage } from "@/components/intervai/landing-page";
import { DashboardPage } from "@/components/intervai/dashboard-page";
import { InterviewPage } from "@/components/intervai/interview-page";
import { FeedbackPage } from "@/components/intervai/feedback-page";
import { useAuth } from "@clerk/nextjs";

type Page = "landing" | "dashboard" | "interview" | "feedback";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  // Incremented every time the user navigates to the dashboard so DashboardPage
  // always re-fetches fresh stats from the DB (e.g. after completing an interview).
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const { isSignedIn, isLoaded } = useAuth();

  // Sync route with Clerk authentication status
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      setCurrentPage("dashboard");
    } else {
      setCurrentPage("landing");
    }
  }, [isSignedIn, isLoaded]);

  const handleNavigate = (page: string) => {
    if (page === "dashboard") {
      // Bump the key so DashboardPage's useEffect re-runs and fetches fresh stats.
      setDashboardRefreshKey((prev) => prev + 1);
      // Clear the active session when returning to dashboard so stale IDs don't linger.
      setActiveSessionId(null);
    }
    setCurrentPage(page as Page);
  };

  const handleStartInterviewSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setCurrentPage("interview");
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {currentPage === "landing" && <LandingPage onNavigate={handleNavigate} />}
      {currentPage === "dashboard" && (
        <DashboardPage
          onNavigate={handleNavigate}
          onStartInterview={handleStartInterviewSession}
          refreshKey={dashboardRefreshKey}
        />
      )}
      {currentPage === "interview" && (
        <InterviewPage onNavigate={handleNavigate} sessionId={activeSessionId} />
      )}
      {currentPage === "feedback" && (
        <FeedbackPage onNavigate={handleNavigate} sessionId={activeSessionId} />
      )}
    </div>
  );
}
