"use client";

import React, { useState, useMemo } from "react";
import { TimelineEvent, TimelineCategory } from "@/types";
import { formatTimelineTime, formatRelativeTime, CATEGORY_STYLES } from "@/lib/eventService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, History, Search, Radio, Brain, Zap, ShieldCheck, GitBranch, Truck, Flame, Cpu, X } from "lucide-react";

interface TimelineFeedProps {
  timeline: TimelineEvent[];
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  DETECTION: Radio,
  ANALYSIS: Brain,
  DECISION: Zap,
  APPROVAL: ShieldCheck,
  AUTOMATION: GitBranch,
  RESOURCE: Truck,
  ESCALATION: Flame,
  SYSTEM: Cpu,
};

export function TimelineFeed({ timeline }: TimelineFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filtered = useMemo(() => {
    return timeline.filter((e) => {
      const matchCat = selectedCategory === "ALL" || e.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.authorOrSystem.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [timeline, selectedCategory, searchQuery]);

  return (
    <Card className="border-slate-800 bg-[#080d1a] shadow-xl">
      <CardHeader className="py-3 px-4 sm:px-6 bg-slate-950/90 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-blue-400" />
            <CardTitle className="text-xs sm:text-sm font-mono tracking-wider text-slate-100 flex items-center gap-2">
              EOC MISSION INCIDENT LOG & SEQUENCE
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">
              {filtered.length} of {timeline.length} LOGGED EVENTS
            </span>
          </div>
        </div>

        {/* Filters and search */}
        <div className="mt-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {["ALL", "DETECTION", "ANALYSIS", "DECISION", "APPROVAL", "AUTOMATION", "RESOURCE", "ESCALATION", "SYSTEM"].map(
              (cat) => {
                const isSelected = selectedCategory === cat;
                const style = cat !== "ALL" ? CATEGORY_STYLES[cat as TimelineCategory] : null;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold cursor-pointer shrink-0 transition-all border ${
                      isSelected
                        ? style
                          ? `${style.badgeBg} ${style.badgeBorder} ${style.badgeText} shadow-sm ring-1 ring-current`
                          : "bg-slate-100 text-slate-950 border-white"
                        : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    {cat}
                  </button>
                );
              }
            )}
          </div>

          <div className="relative min-w-[200px]">
            <Search className="h-3 w-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-7 py-1 text-[11px] font-mono bg-slate-900/90 border border-slate-800 rounded text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="relative border-l-2 border-slate-800/80 ml-3 sm:ml-4 space-y-4">
          {filtered.map((event, idx) => {
            const isLatest = idx === 0;
            const style = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.SYSTEM;
            const IconComp = CATEGORY_ICONS[event.category] || Cpu;
            const exactTime = formatTimelineTime(event.timestamp);
            const relTime = formatRelativeTime(event.timestamp);

            return (
              <div key={event.id} className="relative pl-6 sm:pl-7 group">
                {/* Connected Dot icon */}
                <div
                  className={`absolute -left-[7px] top-1.5 h-3 w-3 rounded-full ring-4 ring-slate-950 transition-transform group-hover:scale-125 ${
                    event.severity === "CRITICAL"
                      ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                      : event.severity === "WARNING"
                      ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                      : style.dotColor
                  }`}
                />

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70 group-hover:border-slate-700 transition-colors space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        suppressHydrationWarning
                        className="text-xs font-mono font-bold text-slate-100 flex items-center gap-1.5 tracking-wider"
                      >
                        <Clock className="h-3 w-3 text-slate-500" />
                        {exactTime}
                      </span>
                      {relTime && (
                        <span className="text-[10px] font-mono text-slate-500">
                          ({relTime})
                        </span>
                      )}
                      <Badge
                        variant="outline"
                        className={`${style.badgeBg} ${style.badgeBorder} ${style.badgeText} text-[10px] font-mono tracking-wider px-2 py-0 flex items-center gap-1`}
                      >
                        <IconComp className="h-2.5 w-2.5" />
                        {event.category}
                      </Badge>
                      {event.severity === "CRITICAL" && (
                        <Badge variant="critical" className="text-[9px] font-mono px-1.5 py-0">
                          CRITICAL
                        </Badge>
                      )}
                      {event.severity === "WARNING" && (
                        <Badge variant="warning" className="text-[9px] font-mono px-1.5 py-0">
                          WARNING
                        </Badge>
                      )}
                      {isLatest && (
                        <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-950/70 border border-blue-600/50 px-1.5 py-0 rounded">
                          LATEST
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      By: <span className="text-slate-400">{event.authorOrSystem}</span>
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                    {event.title}
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
