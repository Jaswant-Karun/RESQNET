"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  History,
  Radio,
  Sparkles,
} from "lucide-react";

export function IncidentTimeline() {
  const { timeline, isActionApproved } = useDashboard();

  return (
    <Card className="border-slate-800 bg-[#080d1a] shadow-lg">
      <CardHeader className="py-2.5 px-4 bg-slate-950/90 border-b border-slate-800 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-blue-400" />
          <CardTitle className="text-xs sm:text-sm font-mono tracking-wider text-slate-100 flex items-center gap-2">
            MISSION INCIDENT TIMELINE
            <span className="text-slate-600 font-normal">|</span>
            <span className="text-[11px] text-slate-400 font-mono">
              EOC EVENT CHRONOLOGY
            </span>
          </CardTitle>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>REAL-TIME STREAM ACTIVE</span>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Horizontal scrollable timeline track on desktop, vertical on mobile */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[850px] flex items-stretch gap-3">
            {timeline.slice(0, 7).map((event, idx) => {
              const isFirst = idx === 0;
              const isCritical = event.severity === "CRITICAL";
              const isWarning = event.severity === "WARNING";

              return (
                <div
                  key={event.id}
                  className={`flex-1 min-w-[210px] p-3 rounded-lg border flex flex-col justify-between transition-all ${
                    isFirst
                      ? "bg-slate-900 border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/30"
                      : "bg-slate-950/70 border-slate-800/80"
                  }`}
                >
                  <div className="space-y-1.5">
                    {/* Timestamp & Category */}
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {new Date(event.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                      <Badge
                        variant={
                          isCritical
                            ? "critical"
                            : isWarning
                            ? "warning"
                            : "info"
                        }
                        className="text-[9px] px-1.5 py-0"
                      >
                        {event.category}
                      </Badge>
                    </div>

                    {/* Event Title */}
                    <div className="text-xs font-semibold text-white leading-snug line-clamp-2">
                      {event.title}
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-400 leading-normal line-clamp-3 font-sans">
                      {event.description}
                    </p>
                  </div>

                  {/* System/Author footer */}
                  <div className="pt-2 mt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span className="truncate">By: {event.authorOrSystem}</span>
                    {isFirst && (
                      <span className="text-blue-400 font-bold shrink-0">LATEST</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
