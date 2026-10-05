"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Shield,
  ShieldAlert,
  Sparkles,
  UserCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("jaswant@resqnet.gov.in");
  const [password, setPassword] = useState<string>("ResqNet2026!Commander");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Authentication failed. Access denied.");
        setIsSubmitting(false);
        return;
      }

      // Success: cookie is set via HTTP-only by server. No password/token in localStorage.
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Network error connecting to authentication server.");
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("jaswant@resqnet.gov.in");
    setPassword("ResqNet2026!Commander");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#050811] relative overflow-hidden">
      {/* Background Ambience & Radial Gradients */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Login Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand & Command Center Header */}
        <div className="text-center space-y-2">
          {/* RESQNET Logo */}
          <div className="inline-flex items-center justify-center mb-1">
            <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-red-600 via-blue-600 to-indigo-700 shadow-xl shadow-blue-900/40 border border-white/20">
              <Shield className="h-8 w-8 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-black tracking-widest text-white uppercase font-sans">
              RESQ<span className="text-red-500">NET</span>
            </h1>
          </div>
          <p className="text-sm font-semibold text-slate-300 tracking-wide uppercase font-mono">
            Emergency Response Command Center
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SECURE CLEARANCE GATE • ENCRYPTED</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#080d1a]/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-5">
          {/* Error Notification Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div className="font-mono text-[11px] leading-relaxed">
                <span className="font-bold text-red-300 uppercase">ACCESS DENIED: </span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider"
              >
                Commander Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commander@resqnet.gov.in"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider"
                >
                  Authorization Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 border border-blue-400/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>AUTHENTICATING COMMANDER...</span>
                </>
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Identity Quick Access Pill */}
          <div className="pt-2 border-t border-slate-800/80">
            <div
              onClick={handleFillDemo}
              className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 hover:border-blue-600/50 hover:bg-slate-900 transition-all cursor-pointer group"
              title="Click to auto-fill Commander credentials"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400 font-bold font-mono text-xs">
                    JK
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                      <span>Cmdr Jaswant Karun</span>
                      <UserCheck className="h-3 w-3 text-emerald-400" />
                    </div>
                    <div className="text-[10px] font-mono text-amber-400 font-semibold tracking-wider">
                      ROLE: COMMANDER
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50 uppercase">
                  DEMO IDENTITY
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-2 flex items-center gap-1">
                <span>Click to auto-populate authorized EOC credentials</span>
              </p>
            </div>
          </div>
        </div>

        {/* Security Disclaimers */}
        <div className="text-center text-[11px] font-mono text-slate-500 space-y-1">
          <div>Authorized State Emergency Operations Center Personnel Only.</div>
          <div className="text-[10px] text-slate-600">
            HTTP-Only Session Security • Multi-Tier Verification • 24-Hour Expiry
          </div>
        </div>
      </div>
    </div>
  );
}
