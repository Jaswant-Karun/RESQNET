import React from "react";
import { Alert } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertOctagon, Bell, CheckCheck } from "lucide-react";

interface AlertsFeedProps {
  alerts: Alert[];
}

export function AlertsFeed({ alerts }: AlertsFeedProps) {
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs sm:text-sm">
            <Bell className="h-4 w-4 text-red-400" />
            Live Tactical Alerts & Warnings
          </CardTitle>
          <span className="text-[11px] font-mono text-slate-400">
            {alerts.length} BROADCASTS
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-3.5 space-y-2.5 max-h-[460px] overflow-y-auto">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className={`p-3 rounded-lg border space-y-1.5 transition-all ${
              alt.severity === "CRITICAL"
                ? "bg-red-950/30 border-red-900/60"
                : alt.severity === "WARNING"
                ? "bg-amber-950/20 border-amber-900/50"
                : "bg-slate-950/60 border-slate-800"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Badge
                  variant={
                    alt.severity === "CRITICAL"
                      ? "critical"
                      : alt.severity === "WARNING"
                      ? "warning"
                      : "info"
                  }
                  pulse={alt.severity === "CRITICAL"}
                >
                  {alt.severity}
                </Badge>
                <span className="font-mono text-[10px] text-slate-400">
                  {alt.code}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {new Date(alt.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-100">
              {alt.title}
            </div>

            <p className="text-[11px] text-slate-300 leading-normal">
              {alt.message}
            </p>

            {alt.actionableStep && (
              <div className="p-1.5 rounded bg-slate-900/90 border border-slate-800 text-[11px] text-amber-300 font-mono flex items-center gap-1.5">
                <AlertOctagon className="h-3 w-3 shrink-0 text-amber-400" />
                <span>Directive: {alt.actionableStep}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
              <span>Src: {alt.source.replace(/_/g, " ")}</span>
              {alt.acknowledged && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCheck className="h-3 w-3" />
                  ACK by {alt.acknowledgedBy || "HQ"}
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
