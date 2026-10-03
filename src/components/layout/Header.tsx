"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertTriangle,
  Radio,
  Shield,
  Wifi,
} from "lucide-react";

export function Header() {
  const [timeString, setTimeString] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toISOString().replace("T", " ").substring(0, 19) + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-red-600 via-blue-600 to-indigo-700 shadow-md shadow-blue-900/30">
              <Shield className="h-5 w-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-widest text-white uppercase">
                  RESQ<span className="text-red-500">NET</span>
                </span>
                <Badge variant="critical" pulse>
                  CRITICAL INCIDENT ACTIVE
                </Badge>
                <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  EOC-ALPHA
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                From disaster detection to rescue decision — in seconds.
              </p>
            </div>
          </div>

          {/* System Telemetry & Live Clock */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 font-mono text-slate-300">
              <Activity className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
              <span className="text-slate-400">SYS TIME:</span>
              <span className="text-emerald-400 font-semibold">{timeString || "SYNCHRONIZING..."}</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 font-mono text-slate-300">
              <Radio className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-slate-400">TELEMETRY:</span>
              <span className="text-amber-300 font-semibold">14 SENSORS LIVE</span>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 font-mono">
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-slate-400">DISPATCH:</span>
              <span className="text-emerald-400 font-semibold">CONNECTED</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/60 border border-red-800/80 text-red-300 font-semibold uppercase text-[11px]">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              <span>DEFCON 2</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
