"use client";

import React, { useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export function TacticalNotificationToast() {
  const { notification, dismissNotification } = useDashboard();

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      dismissNotification();
    }, 8000);
    return () => clearTimeout(timer);
  }, [notification, dismissNotification]);

  if (!notification) return null;

  const isSuccess = notification.type === "success";
  const isWarning = notification.type === "warning";
  const isError = notification.type === "error";

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`p-4 rounded-xl border-2 shadow-2xl backdrop-blur-md flex items-start gap-3 font-mono ${
          isSuccess
            ? "bg-[#061e14]/95 border-emerald-500 text-emerald-200 shadow-emerald-950/60"
            : isWarning
            ? "bg-[#251307]/95 border-amber-500 text-amber-200 shadow-amber-950/60"
            : isError
            ? "bg-[#250909]/95 border-red-500 text-red-200 shadow-red-950/60"
            : "bg-[#09152a]/95 border-blue-500 text-blue-200 shadow-blue-950/60"
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
          {isWarning && <AlertTriangle className="h-5 w-5 text-amber-400" />}
          {isError && <XCircle className="h-5 w-5 text-red-400" />}
          {!isSuccess && !isWarning && !isError && <Info className="h-5 w-5 text-blue-400" />}
        </div>

        <div className="flex-1 space-y-0.5">
          <div className="text-xs font-black tracking-wider uppercase">
            {notification.title}
          </div>
          <p className="text-[11px] leading-relaxed opacity-95 text-slate-200">
            {notification.message}
          </p>
          <span className="text-[9px] text-slate-400 block pt-1">
            TIMESTAMP: {new Date(notification.timestamp).toLocaleTimeString()}
          </span>
        </div>

        <button
          onClick={dismissNotification}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
