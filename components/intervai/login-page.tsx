"use client";

import { useState } from "react";
import { Github, Chrome, Mail, Lock, Sparkles, Eye, EyeOff, ArrowLeft } from "lucide-react";

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate("dashboard");
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 -left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Back Button */}
      <button
        onClick={() => onNavigate("landing")}
        className="absolute top-6 left-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-2xl font-semibold text-white tracking-tight">IntervAI</span>
          </div>
          <h1 className="text-xl font-medium text-white">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isLogin
              ? "Sign in to continue your interview prep"
              : "Start your journey to interview success"}
          </p>
        </div>

        {/* Glass Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => onNavigate("dashboard")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] hover:border-white/[0.15] rounded-xl transition-all group"
            >
              <Github className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">Continue with GitHub</span>
            </button>
            <button
              onClick={() => onNavigate("dashboard")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] hover:border-white/[0.15] rounded-xl transition-all group"
            >
              <Chrome className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <div
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all ${
                  focusedField === "email" || email
                    ? "-translate-y-8 text-xs text-emerald-400"
                    : "text-zinc-500"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </span>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 pt-4 bg-zinc-900/50 border rounded-xl text-white placeholder-transparent focus:outline-none transition-all ${
                  focusedField === "email"
                    ? "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    : "border-white/[0.08] hover:border-white/[0.15]"
                }`}
                placeholder="Email"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all ${
                  focusedField === "password" || password
                    ? "-translate-y-8 text-xs text-emerald-400"
                    : "text-zinc-500"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </span>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 pt-4 bg-zinc-900/50 border rounded-xl text-white placeholder-transparent focus:outline-none transition-all ${
                  focusedField === "password"
                    ? "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    : "border-white/[0.08] hover:border-white/[0.15]"
                }`}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Forgot Password */}
            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(16,185,129,0.25)]"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <p className="text-center text-sm text-zinc-500 mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-zinc-600 mt-6">
          By continuing, you agree to our{" "}
          <a href="#" className="text-zinc-500 hover:text-white transition-colors">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-zinc-500 hover:text-white transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
