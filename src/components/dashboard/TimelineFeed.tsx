import React from "react";
import { TimelineEvent } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, History } from "lucide-react";

interface TimelineFeedProps {
  timeline: TimelineEvent[];
}

export function TimelineFeed({ timeline }: TimelineFeedProps) {
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs sm:text-sm">
            <History className="h-4 w-4 text-blue-400" />
            EOC Mission Incident Log & Sequence
          </CardTitle>
          <span className="text-[11px] font-mono text-slate-400">
            {timeline.length} LOGGED EVENTS
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative border-l border-slate-800 ml-2.5 space-y-4">
          {timeline.map((event) => (
            <div key={event.id} className="relative pl-5 group">
              {/* Dot icon */}
              <div
                className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-slate-950 ${
                  event.severity === "CRITICAL"
                    ? "bg-red-500"
                    : event.severity === "WARNING"
                    ? "bg-amber-500"
                    : "bg-blue-500"
                }`}
              />

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    suppressHydrationWarning
                    className="text-[11px] font-mono text-slate-400 flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3 text-slate-500" />
                    {new Date(event.timestamp).toLocaleTimeString()} IST
                  </span>
                  <Badge
                    variant={
                      event.severity === "CRITICAL"
                        ? "critical"
                        : event.severity === "WARNING"
                        ? "warning"
                        : "info"
                    }
                  >
                    {event.category}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">
                    by {event.authorOrSystem}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-200">
                  {event.title}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
