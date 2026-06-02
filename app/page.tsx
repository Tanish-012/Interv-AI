"use client";

import { useState, useEffect } from "react";
import { LandingPage } from "@/components/intervai/landing-page";
import { LoginPage } from "@/components/intervai/login-page";
import { DashboardPage } from "@/components/intervai/dashboard-page";
import { InterviewPage } from "@/components/intervai/interview-page";
import { FeedbackPage } from "@/components/intervai/feedback-page";
import { useAuth } from "@clerk/nextjs";

type Page = "landing" | "login" | "dashboard" | "interview" | "feedback";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
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
    setCurrentPage(page as Page);
  };

  const handleStartInterviewSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setCurrentPage("interview");
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {currentPage === "landing" && <LandingPage onNavigate={handleNavigate} />}
      {currentPage === "login" && <LoginPage onNavigate={handleNavigate} />}
      {currentPage === "dashboard" && (
        <DashboardPage onNavigate={handleNavigate} onStartInterview={handleStartInterviewSession} />
      )}
      {currentPage === "interview" && (
        <InterviewPage onNavigate={handleNavigate} sessionId={activeSessionId} />
      )}
      {currentPage === "feedback" && <FeedbackPage onNavigate={handleNavigate} />}
    </div>
  );
}
