"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock,
  Key,
  LogOut,
  Mail,
  Radio,
  Save,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";

interface CommanderProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onViewActivity?: () => void;
}

export function CommanderProfilePanel({
  isOpen,
  onClose,
  onLogout,
  onViewActivity,
}: CommanderProfilePanelProps) {
  const [isSendingTestAlert, setIsSendingTestAlert] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [activeTargetEmail, setActiveTargetEmail] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("resqnet_target_recipient_email") || "";
    }
    return "";
  });

  const [testAlertResult, setTestAlertResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const [emailConfig, setEmailConfig] = useState<{
    provider: string;
    configured: boolean;
    resendConfigured?: boolean;
    commanderAlertEmail: string;
    cooldownMinutes: number;
  }>({
    provider: "Resend",
    configured: false,
    resendConfigured: false,
    commanderAlertEmail: "",
    cooldownMinutes: 10,
  });

  const [preferredEmail, setPreferredEmail] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("resqnet_target_recipient_email") || "";
    }
    return "";
  });

  useEffect(() => {
    if (!isOpen) return;

    const savedLocal =
      typeof window !== "undefined"
        ? localStorage.getItem("resqnet_target_recipient_email")
        : null;

    fetch("/api/alerts/email")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const serverEmail = data.commanderAlertEmail || "";
          const chosenEmail = savedLocal || serverEmail;
          setEmailConfig({
            provider: data.provider || "Resend",
            configured: Boolean(data.configured),
            resendConfigured: Boolean(data.resendConfigured),
            commanderAlertEmail: chosenEmail,
            cooldownMinutes: data.cooldownMinutes || 10,
          });
          setPreferredEmail(chosenEmail);
          setActiveTargetEmail(chosenEmail);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const handleSaveTargetEmail = async () => {
    const trimmed = preferredEmail.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setTestAlertResult({
        success: false,
        message: "Please enter a valid recipient email address before saving.",
      });
      return;
    }

    setIsSavingEmail(true);
    setSaveSuccessMsg(null);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("resqnet_target_recipient_email", trimmed);
      }
      setActiveTargetEmail(trimmed);

      const res = await fetch("/api/alerts/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetEmail: trimmed }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccessMsg(`Target recipient locked: ${trimmed}`);
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      }
    } catch (e) {
      console.warn("Error saving recipient email:", e);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleSendTestAlert = async () => {
    const destinationEmail = preferredEmail.trim();
    if (!destinationEmail || !destinationEmail.includes("@")) {
      setTestAlertResult({
        success: false,
        message: "Please enter a valid recipient email address in the type bar.",
      });
      return;
    }

    // Automatically persist to localStorage and sync to server
    if (typeof window !== "undefined") {
      localStorage.setItem("resqnet_target_recipient_email", destinationEmail);
    }
    setActiveTargetEmail(destinationEmail);
    fetch("/api/alerts/email", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetEmail: destinationEmail }),
    }).catch(() => {});

    setIsSendingTestAlert(true);
    setTestAlertResult(null);

    try {
      const res = await fetch("/api/alerts/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isTest: true,
          commanderEmail: destinationEmail,
          area: "Zone A",
          hazard: "Flood",
          riskScore: 82,
          riskLevel: "CRITICAL",
          forecastWindow: "Next 24 hours",
          contributingFactors: [
            "Heavy rainfall",
            "High precipitation probability",
            "Population exposure",
            "Existing flood conditions",
          ],
          recommendedAction: "Review evacuation response plan.",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestAlertResult({
          success: true,
          message: `Test alert sent successfully to ${data.recipient || destinationEmail}.`,
          details: data.message,
        });
      } else {
        setTestAlertResult({
          success: false,
          message: data.error || data.message || "Failed to dispatch test alert.",
          details: res.status === 403 ? "Only authenticated COMMANDER can send test alerts." : undefined,
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setTestAlertResult({
        success: false,
        message: `Network error sending test alert: ${errMsg}`,
      });
    } finally {
      setIsSendingTestAlert(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] bg-[#080d1a] border border-slate-700/80 rounded-2xl shadow-2xl shadow-blue-950/50 overflow-hidden font-mono flex flex-col">
        {/* Top Accent Header */}
        <div className="bg-gradient-to-r from-blue-900/80 via-slate-900 to-indigo-900/80 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-950 border border-blue-600/50 text-blue-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                COMMANDER SETTINGS & CLEARANCE
              </div>
              <div className="text-[10px] text-slate-400 font-normal">
                Operator Clearance & Emergency Alerts Configuration
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close Panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Commander Details & Settings Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Avatar & Primary Info */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 shadow-inner">
            <div className="relative">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-800 border-2 border-blue-400/40 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-950/60">
                JK
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#080d1a]"></span>
              </span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white">Cmdr Jaswant Karun</span>
                <BadgeCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wide">
                Emergency Response Commander
              </div>
              <div className="text-[10px] text-slate-400">
                Clearance: Level 4 Executive Operator
              </div>
            </div>
          </div>

          {/* Structured Key Details Matrix */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-0.5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Name
              </div>
              <div className="text-white font-bold truncate">
                Cmdr Jaswant Karun
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-0.5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Role
              </div>
              <div className="text-amber-300 font-bold text-[11px] leading-tight">
                Emergency Response Commander
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-0.5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Authority
              </div>
              <div className="text-blue-300 font-bold text-[11px]">
                Response Coordination
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-0.5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Status
              </div>
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ON DUTY</span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* COMMANDER SETTINGS: EMERGENCY EMAIL ALERT SYSTEM */}
          {/* ============================================================ */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-red-950/40 border border-slate-700/80 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-red-950/80 border border-red-600/60 text-red-300">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white uppercase tracking-wider">
                    Emergency Email Alerts
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Server-Side Dispatch (Resend Provider)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 border border-slate-700 text-slate-300">
                <span className={`h-1.5 w-1.5 rounded-full ${emailConfig.configured ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span>{emailConfig.provider ? emailConfig.provider.toUpperCase() : "LIVE READY"}</span>
              </div>
            </div>

            {/* Preferred Email Type Bar & Protocol Details */}
            <div className="space-y-2 text-[11px] font-mono">
              <div className="space-y-1.5 p-2.5 rounded-lg bg-black/50 border border-slate-800">
                <div className="flex items-center justify-between text-[10px] uppercase font-mono font-bold">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-red-400" />
                    Target Recipient Email:
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Active: {activeTargetEmail || "Not Set"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="email"
                    value={preferredEmail}
                    onChange={(e) => setPreferredEmail(e.target.value)}
                    placeholder="Enter recipient email e.g. abc@gmail.com"
                    className="flex-1 px-3 py-2 rounded-md bg-slate-900/90 border border-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 text-white font-mono text-xs placeholder:text-slate-600 outline-none transition-all shadow-inner"
                  />
                  <button
                    onClick={handleSaveTargetEmail}
                    disabled={isSavingEmail}
                    className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    title="Lock this email address as the target for all emergency alerts"
                  >
                    {isSavingEmail ? (
                      <Zap className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span>SAVE</span>
                  </button>
                </div>

                {saveSuccessMsg && (
                  <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                    <Check className="h-3 w-3" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}
              </div>

              <div className="p-2 rounded bg-black/40 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Alert Level Routing Rules:</div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300">
                  <div>• <span className="text-emerald-400 font-bold">LOW:</span> No email</div>
                  <div>• <span className="text-amber-400 font-bold">MODERATE:</span> Dashboard only</div>
                  <div>• <span className="text-orange-400 font-bold">HIGH:</span> Commander email</div>
                  <div>• <span className="text-red-400 font-bold">CRITICAL:</span> Email + n8n</div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
                <span>Deduplication Cooldown:</span>
                <span className="text-slate-200 font-bold">{emailConfig.cooldownMinutes} minutes</span>
              </div>
            </div>

            {/* SEND TEST ALERT Button */}
            <div className="pt-1">
              <button
                onClick={handleSendTestAlert}
                disabled={isSendingTestAlert}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 transition-all border border-red-400/50 cursor-pointer"
                title="Send a test emergency alert to the authenticated commander"
              >
                {isSendingTestAlert ? (
                  <>
                    <Zap className="h-4 w-4 animate-spin" />
                    <span>SENDING TEST ALERT...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>SEND TEST ALERT</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Alert Dispatch Feedback */}
            {testAlertResult && (
              <div
                className={`p-2.5 rounded-lg border text-[11px] leading-relaxed animate-in fade-in duration-200 ${
                  testAlertResult.success
                    ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-200"
                    : "bg-red-950/60 border-red-500/60 text-red-200"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {testAlertResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                  )}
                  <span>{testAlertResult.message}</span>
                </div>
                {testAlertResult.details && (
                  <p className="text-[10px] text-slate-300 mt-1 pl-5">
                    {testAlertResult.details}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Required Explicit Hackathon Disclaimer Callout */}
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200/90 text-[11px] leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 uppercase">Prototype Notice: </span>
              This is the authenticated operator identity for the hackathon prototype.
              Not a real government emergency official.
            </div>
          </div>

          {/* Session Metrics Bar */}
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-slate-500" />
              <span>Session: Active (HTTP-Only)</span>
            </div>
            <div className="text-emerald-400 font-semibold">
              VERIFIED AUTHENTICATED
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            {onViewActivity && (
              <button
                onClick={() => {
                  onViewActivity();
                  onClose();
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer text-center"
              >
                VIEW LOGS
              </button>
            )}

            <button
              onClick={onLogout}
              className="flex-1 py-2 px-3 rounded-lg bg-red-950/80 hover:bg-red-900/90 border border-red-800/80 text-red-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>TERMINATE SESSION</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
