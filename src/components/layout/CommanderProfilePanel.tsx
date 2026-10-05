"use client";

import React from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Key,
  LogOut,
  Radio,
  Shield,
  ShieldAlert,
  User,
  X,
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-md bg-[#080d1a] border border-slate-700/80 rounded-2xl shadow-2xl shadow-blue-950/50 overflow-hidden font-mono">
        {/* Top Accent Header */}
        <div className="bg-gradient-to-r from-blue-900/80 via-slate-900 to-indigo-900/80 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-950 border border-blue-600/50 text-blue-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                EOC OPERATOR CLEARANCE
              </div>
              <div className="text-[10px] text-slate-400 font-normal">
                Command Center Personnel Verification
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

        {/* Commander Details Body */}
        <div className="p-5 space-y-4">
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
            {/* Field: Name */}
            <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Name
              </div>
              <div className="text-white font-bold truncate">
                Cmdr Jaswant Karun
              </div>
            </div>

            {/* Field: Role */}
            <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Role
              </div>
              <div className="text-amber-300 font-bold text-[11px] leading-tight">
                Emergency Response Commander
              </div>
            </div>

            {/* Field: Authority */}
            <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Authority
              </div>
              <div className="text-blue-300 font-bold text-[11px]">
                Response Coordination
              </div>
            </div>

            {/* Field: Status */}
            <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Status
              </div>
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ON DUTY</span>
              </div>
            </div>
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
