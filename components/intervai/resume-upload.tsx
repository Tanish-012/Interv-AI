"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { generateQuestionsAction } from "@/app/actions/generate-questions";

interface ResumeUploadProps {
  onStartInterview?: (sessionId: string) => void;
}

export function ResumeUpload({ onStartInterview }: ResumeUploadProps) {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "parsing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [position, setPosition] = useState("Software Engineer Intern");
  const [extractedPreview, setExtractedPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      setStatus("error");
      setErrorMessage("Only PDF files are supported. Please upload a valid PDF.");
      return;
    }

    setFile(selectedFile);
    setStatus("uploading");
    setErrorMessage("");

    let timer: NodeJS.Timeout | null = null;

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Transition to parsing state after a short delay
      timer = setTimeout(() => {
        setStatus((prev) => (prev === "uploading" ? "parsing" : prev));
      }, 800);

      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (timer) {
        clearTimeout(timer);
      }

      // Verify the response is OK and has a JSON content type
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.includes("application/json")) {
        // Safely extract the response as text string instead of parsing JSON directly
        const errorText = await response.text();
        setStatus("error");

        let friendlyMessage = "";
        if (contentType.includes("application/json")) {
          try {
            const errObj = JSON.parse(errorText);
            friendlyMessage = errObj.error || errObj.message;
          } catch (e) {
            // Ignore parsing error for raw error object
          }
        }

        if (!friendlyMessage) {
          if (errorText.includes("<!DOCTYPE") || errorText.includes("<html")) {
            friendlyMessage = `Server error (${response.status}): The server returned an invalid response format (HTML error page).`;
          } else {
            friendlyMessage = errorText.slice(0, 150) || `Server error (${response.status}): ${response.statusText || "Unknown error"}`;
          }
        }

        setErrorMessage(friendlyMessage);
        return;
      }

      // Safely parse JSON result now that we checked the header and status
      const result = await response.json();

      if (result.success === false) {
        throw new Error(result.error || "Failed to parse PDF resume");
      }

      setStatus("success");
      setExtractedPreview(result.data?.preview || "");
      setResumeId(result.data?.id || null);
    } catch (error: any) {
      if (timer) {
        clearTimeout(timer);
      }
      setStatus("error");
      setErrorMessage(error.message || "An unexpected error occurred during upload.");
    }
  };

  const handleStartInterview = async (uploadedResumeId: string) => {
    setIsGenerating(true);
    const result = await generateQuestionsAction(uploadedResumeId, position);
    if (result.success && result.sessionId) {
      if (onStartInterview) {
        onStartInterview(result.sessionId);
      } else {
        router.push(`/interview/${result.sessionId}`);
      }
    } else {
      alert(`Error: ${result.error || "Failed to start interview"}`);
      setIsGenerating(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setFile(null);
    setStatus("idle");
    setErrorMessage("");
    setExtractedPreview("");
    setShowPreview(false);
    setResumeId(null);
    setIsGenerating(false);
  };

  return (
    <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-xl p-6 hover:border-white/[0.12] transition-all">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-emerald-400" />
        <h2 className="text-lg font-semibold text-white">AI Resume Analysis</h2>
      </div>

      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        Upload your resume in PDF format. Our AI will extract your skills, experience, and projects to customize interview questions specifically for your profile.
      </p>

      {/* Drag & Drop Area */}
      {status === "idle" && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${dragActive
              ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
              : "border-white/[0.08] hover:border-white/20 hover:bg-white/[0.01]"
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleChange}
          />
          <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-zinc-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Drag & drop your resume, or <span className="text-emerald-400 hover:text-emerald-300">browse</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1">Supports PDF format only (max 10MB)</p>
          </div>
        </div>
      )}

      {/* Progress / Loading State */}
      {(status === "uploading" || status === "parsing") && (
        <div className="border border-white/[0.08] bg-white/[0.01] rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
            <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full" />
          </div>
          <div className="space-y-1 w-full max-w-xs mx-auto">
            <p className="text-sm font-medium text-white">
              {status === "uploading" ? "Uploading resume..." : "Extracting plain text..."}
            </p>
            <p className="text-xs text-zinc-500">
              {status === "uploading" ? "Transferring document securely..." : "Parsing file using pdf-parse..."}
            </p>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-700 ${status === "uploading" ? "w-1/3 animate-pulse" : "w-4/5"
                  }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {status === "success" && (
        <div className="border border-emerald-500/20 bg-emerald-500/[0.02] rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{file?.name}</p>
              <p className="text-xs text-emerald-400/80 mt-0.5">Resume processed & stored successfully</p>
            </div>
            <button
              onClick={resetUpload}
              className="text-xs text-zinc-500 hover:text-white border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              Upload New
            </button>
          </div>

          {/* Target Position Input */}
          <div className="space-y-1.5 border-t border-b border-white/[0.05] py-4 my-1">
            <label className="text-xs font-mono font-medium text-zinc-400">Target Position / Job Role</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g., Software Engineer Intern, Data Scientist"
              className="w-full bg-black/40 border border-white/[0.08] hover:border-white/20 focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono"
            />
          </div>

          {/* Action button to generate questions and start active session */}
          <button
            onClick={() => handleStartInterview(resumeId || "")}
            disabled={isGenerating || !resumeId}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-lg text-sm transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer font-mono"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                <span>Generating custom questions...</span>
              </>
            ) : (
              <span>Start Custom AI Interview</span>
            )}
          </button>

          {/* Parsed Text Preview collapsible */}
          <div className="border border-white/[0.05] rounded-lg bg-black/40 overflow-hidden">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-mono text-zinc-400 hover:text-white transition-colors border-b border-white/[0.05] cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Parsed Plain Text Preview
              </span>
              {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showPreview && (
              <div className="p-4 max-h-48 overflow-y-auto text-xs font-mono text-zinc-500 leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/20">
                {extractedPreview}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {status === "error" && (
        <div className="border border-red-500/20 bg-red-500/[0.02] rounded-xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm font-medium text-white">Upload failed</p>
              <p className="text-xs text-red-400/80 mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={resetUpload}
              className="px-4 py-2 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
