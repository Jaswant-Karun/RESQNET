"use client";

import React, { useState, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { TimelineCategory, TimelineEvent } from "@/types";
import { formatTimelineTime, formatRelativeTime, CATEGORY_STYLES } from "@/lib/eventService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  History,
  Search,
  Filter,
  Flame,
  Radio,
  Brain,
  Zap,
  ShieldCheck,
  GitBranch,
  Truck,
  Cpu,
  PlusCircle,
  X,
  Layers,
  List,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Send,
} from "lucide-react";

const REQUIRED_CATEGORIES: { id: TimelineCategory; label: string; icon: React.ElementType }[] = [
  { id: "DETECTION", label: "DETECTION", icon: Radio },
  { id: "ANALYSIS", label: "ANALYSIS", icon: Brain },
  { id: "DECISION", label: "DECISION", icon: Zap },
  { id: "APPROVAL", label: "APPROVAL", icon: ShieldCheck },
  { id: "AUTOMATION", label: "AUTOMATION", icon: GitBranch },
  { id: "RESOURCE", label: "RESOURCE", icon: Truck },
  { id: "ESCALATION", label: "ESCALATION", icon: Flame },
  { id: "SYSTEM", label: "SYSTEM", icon: Cpu },
];

export function IncidentTimeline() {
  const { timeline, addTimelineEvent, incident } = useDashboard();

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"STREAM" | "RADAR">("STREAM");
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  // Quick Log form state
  const [logTitle, setLogTitle] = useState("");
  const [logCategory, setLogCategory] = useState<TimelineCategory>("SYSTEM");
  const [logSeverity, setLogSeverity] = useState<"INFO" | "WARNING" | "CRITICAL">("INFO");
  const [logDescription, setLogDescription] = useState("");

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: timeline.length };
    REQUIRED_CATEGORIES.forEach((c) => {
      counts[c.id] = timeline.filter((e) => e.category === c.id).length;
    });
    return counts;
  }, [timeline]);

  // Filtered timeline
  const filteredTimeline = useMemo(() => {
    return timeline.filter((event) => {
      const matchesCategory =
        selectedCategory === "ALL" || event.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        event.title.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q) ||
        event.category.toLowerCase().includes(q) ||
        event.authorOrSystem.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [timeline, selectedCategory, searchQuery]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle.trim()) return;

    addTimelineEvent({
      title: logTitle.trim(),
      description: logDescription.trim() || logTitle.trim(),
      category: logCategory,
      severity: logSeverity,
      authorOrSystem: "Incident Watch Operator",
      incidentId: incident.id,
      timestamp: new Date().toISOString(),
    });

    setLogTitle("");
    setLogDescription("");
    setShowLogModal(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "DETECTION":
        return <Radio className="h-3 w-3" />;
      case "ANALYSIS":
        return <Brain className="h-3 w-3" />;
      case "DECISION":
        return <Zap className="h-3 w-3" />;
      case "APPROVAL":
        return <ShieldCheck className="h-3 w-3" />;
      case "AUTOMATION":
        return <GitBranch className="h-3 w-3" />;
      case "RESOURCE":
        return <Truck className="h-3 w-3" />;
      case "ESCALATION":
        return <Flame className="h-3 w-3" />;
      case "SYSTEM":
      default:
        return <Cpu className="h-3 w-3" />;
    }
  };

  return (
    <Card className="border-slate-800 bg-[#080d1a] shadow-xl overflow-hidden">
      {/* 1. Header Bar */}
      <CardHeader className="py-3 px-4 sm:px-6 bg-slate-950/95 border-b border-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <History className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs sm:text-sm font-mono tracking-wider text-slate-100 flex items-center gap-2">
                  INCIDENT EVENT CHRONOLOGY
                </CardTitle>
                <Badge
                  variant="outline"
                  className="bg-blue-950/50 border-blue-500/40 text-blue-400 text-[10px] font-mono px-2 py-0"
                >
                  AUDIT LOG
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Complete real-time sequence of detections, analyses, decisions, approvals, and dispatches
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5">
              <button
                onClick={() => setViewMode("STREAM")}
                className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 cursor-pointer transition-all ${
                  viewMode === "STREAM"
                    ? "bg-blue-600 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <List className="h-3 w-3" />
                Chronological Log
              </button>
              <button
                onClick={() => setViewMode("RADAR")}
                className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 cursor-pointer transition-all ${
                  viewMode === "RADAR"
                    ? "bg-blue-600 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="h-3 w-3" />
                Milestone Radar
              </button>
            </div>

            {/* Quick Log Manual Event Button (Demonstrating Reusable Event Service) */}
            <Button
              onClick={() => setShowLogModal(true)}
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white font-mono text-[11px] h-7 px-2.5 cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="h-3 w-3 text-cyan-400" />
              Log Event
            </Button>

            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400 bg-slate-900/80 border border-slate-800 px-2 py-1 rounded-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-semibold">{timeline.length}</span>
              <span className="text-slate-500">EVENTS</span>
            </div>
          </div>
        </div>

        {/* 2. Category Filters & Search Controls */}
        <div className="mt-3 pt-3 border-t border-slate-850/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold cursor-pointer shrink-0 transition-all border ${
                selectedCategory === "ALL"
                  ? "bg-slate-100 text-slate-950 border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              ALL ({categoryCounts.ALL})
            </button>

            {REQUIRED_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;
              const style = CATEGORY_STYLES[cat.id];
              const IconComp = cat.icon;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold cursor-pointer shrink-0 flex items-center gap-1 transition-all border ${
                    isSelected
                      ? `${style.badgeBg} ${style.badgeBorder} ${style.badgeText} shadow-md ring-1 ring-current`
                      : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:border-slate-700 hover:text-slate-300"
                  }`}
                >
                  <IconComp className="h-2.5 w-2.5" />
                  <span>{cat.label}</span>
                  <span
                    className={`ml-0.5 px-1 py-0 rounded text-[9px] ${
                      isSelected
                        ? "bg-black/30 font-bold"
                        : "text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] md:w-56 shrink-0">
            <Search className="h-3 w-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search event title, author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-7 py-1 text-[11px] font-mono bg-slate-900/90 border border-slate-800 rounded text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
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

      {/* 3. Main Content: Stream View or Radar View */}
      <CardContent className="p-4 sm:p-5">
        {filteredTimeline.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="h-10 w-10 mx-auto rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-slate-600">
              <History className="h-5 w-5" />
            </div>
            <div className="text-xs font-mono text-slate-400">
              No timeline events match the filter &ldquo;{selectedCategory}&rdquo; {searchQuery ? `with query &ldquo;${searchQuery}&rdquo;` : ""}.
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
              }}
              className="border-slate-800 text-xs font-mono text-slate-300 hover:text-white"
            >
              Reset Filters
            </Button>
          </div>
        ) : viewMode === "STREAM" ? (
          /* CHRONOLOGICAL EVENT STREAM (Vertical Timeline with Neon Connective Spine) */
          <div className="relative max-h-[420px] overflow-y-auto pr-2 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {/* Connected Vertical Spine */}
            <div className="absolute left-[152px] sm:left-[172px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-blue-500/60 via-purple-500/40 to-slate-800" />

            {filteredTimeline.map((event, idx) => {
              const isLatest = idx === 0;
              const isCritical = event.severity === "CRITICAL";
              const isWarning = event.severity === "WARNING";
              const style =
                CATEGORY_STYLES[event.category] || CATEGORY_STYLES.SYSTEM;
              const exactTime = formatTimelineTime(event.timestamp);
              const relTime = formatRelativeTime(event.timestamp);

              return (
                <div
                  key={event.id}
                  className={`group relative flex items-start gap-4 transition-all duration-200 ${
                    isLatest
                      ? "p-2.5 -mx-1 rounded-lg bg-blue-950/20 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                      : "p-1.5"
                  }`}
                >
                  {/* Left Column: Formatted Exact Time (HH:mm:ss) */}
                  <div className="w-[130px] sm:w-[150px] shrink-0 text-right pr-2 space-y-0.5">
                    <div className="text-xs sm:text-sm font-mono font-bold text-slate-100 tracking-wider flex items-center justify-end gap-1.5">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>{exactTime}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {relTime || "IST"}
                    </div>
                  </div>

                  {/* Center Node on the Spine */}
                  <div className="relative z-10 shrink-0 mt-1">
                    <div
                      className={`h-3.5 w-3.5 rounded-full border-2 border-slate-950 flex items-center justify-center transition-transform group-hover:scale-125 ${
                        isCritical
                          ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                          : isWarning
                          ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]"
                          : style.dotColor
                      }`}
                    >
                      {isLatest && (
                        <span className="absolute -top-0.5 -left-0.5 h-4.5 w-4.5 rounded-full bg-blue-400 animate-ping opacity-40" />
                      )}
                    </div>
                  </div>

                  {/* Right Column: Event Content Card */}
                  <div className="flex-1 min-w-0 bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 group-hover:border-slate-700 transition-colors">
                    {/* Header Row: Category Badge + Severity Tag + Author */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`${style.badgeBg} ${style.badgeBorder} ${style.badgeText} text-[10px] font-mono font-bold tracking-wider px-2 py-0 flex items-center gap-1`}
                        >
                          {getCategoryIcon(event.category)}
                          <span>{event.category}</span>
                        </Badge>

                        {isCritical && (
                          <Badge
                            variant="critical"
                            pulse
                            className="text-[9px] font-mono font-bold px-1.5 py-0"
                          >
                            CRITICAL
                          </Badge>
                        )}
                        {isWarning && (
                          <Badge
                            variant="warning"
                            className="text-[9px] font-mono font-bold px-1.5 py-0"
                          >
                            WARNING
                          </Badge>
                        )}

                        {isLatest && (
                          <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-950/80 border border-blue-600/60 px-1.5 py-0 rounded">
                            LATEST ACTION
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-slate-500 truncate">
                        By: <span className="text-slate-400">{event.authorOrSystem}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors leading-snug">
                      {event.title}
                    </h4>

                    {/* Description */}
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-1">
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* RADAR VIEW: Horizontal milestone cards */
          <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
            <div className="min-w-[900px] flex items-stretch gap-3">
              {filteredTimeline.slice(0, 8).map((event, idx) => {
                const isFirst = idx === 0;
                const style =
                  CATEGORY_STYLES[event.category] || CATEGORY_STYLES.SYSTEM;
                const exactTime = formatTimelineTime(event.timestamp);

                return (
                  <div
                    key={event.id}
                    className={`flex-1 min-w-[220px] max-w-[260px] p-3.5 rounded-lg border flex flex-col justify-between transition-all ${
                      isFirst
                        ? "bg-slate-900 border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/30"
                        : "bg-slate-950/80 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-300 font-bold flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {exactTime}
                        </span>
                        <Badge
                          variant="outline"
                          className={`${style.badgeBg} ${style.badgeBorder} ${style.badgeText} text-[9px] px-1.5 py-0`}
                        >
                          {event.category}
                        </Badge>
                      </div>

                      <div className="text-xs font-bold text-white leading-snug">
                        {event.title}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-normal line-clamp-3 font-sans">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span className="truncate">{event.authorOrSystem}</span>
                      {isFirst && (
                        <span className="text-blue-400 font-bold shrink-0">LATEST</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      {/* 4. Quick Log Manual Event Modal (Proving Reusable Common Event Service) */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-blue-500/20 text-blue-400">
                  <PlusCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-slate-100">
                    LOG OPERATOR EVENT
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Dispatches directly through Common Event Service
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-500 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  EVENT TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flood barrier deployed at Sector 4"
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    CATEGORY
                  </label>
                  <select
                    value={logCategory}
                    onChange={(e) => setLogCategory(e.target.value as TimelineCategory)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {REQUIRED_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    SEVERITY
                  </label>
                  <select
                    value={logSeverity}
                    onChange={(e) =>
                      setLogSeverity(e.target.value as "INFO" | "WARNING" | "CRITICAL")
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="INFO">INFO</option>
                    <option value="WARNING">WARNING</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  placeholder="Operational details, coordinates, or mission updates..."
                  value={logDescription}
                  onChange={(e) => setLogDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-100 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogModal(false)}
                  className="border-slate-800 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Emit Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
