import React from "react";
import { ShieldAlert, Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-4 mt-auto">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500" />
          <span>
            <strong className="text-slate-400">RESQNET</strong> Tactical Command Core — Emergency Management Simulation Environment.
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Terminal className="h-3 w-3 text-blue-400" />
            FLOW: Simulate → Analyze → Recommend → Human Approval → Orchestrate
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Next.js App Router v16</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-500 font-semibold">FOUNDATION VERIFIED</span>
        </div>
      </div>
    </footer>
  );
}
