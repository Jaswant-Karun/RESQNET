import { TimelineCategory, TimelineEvent } from "@/types";

export interface LogEventParams {
  title: string;
  description?: string;
  category: TimelineCategory;
  severity?: "CRITICAL" | "WARNING" | "INFO";
  authorOrSystem?: string;
  incidentId?: string;
  timestamp?: string; // ISO string or Date
  metadata?: Record<string, string | number | boolean>;
}

type EventListener = (event: TimelineEvent) => void;

class CommonEventService {
  private listeners: EventListener[] = [];
  private eventHistory: TimelineEvent[] = [];

  /**
   * Subscribe to new timeline events. Returns unsubscribe function.
   */
  subscribe(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== listener);
    };
  }

  /**
   * Emits a new timeline event to all active subscribers.
   */
  logEvent(params: LogEventParams): TimelineEvent {
    const event: TimelineEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      incidentId: params.incidentId || "FL-902",
      timestamp: params.timestamp || new Date().toISOString(),
      title: params.title,
      description: params.description || params.title,
      category: params.category,
      severity: params.severity || "INFO",
      authorOrSystem: params.authorOrSystem || "RESQNET Event Engine",
      metadata: params.metadata,
    };

    this.eventHistory.unshift(event);
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error("[EventService] Listener notification error:", err);
      }
    });

    return event;
  }

  getHistory(): TimelineEvent[] {
    return [...this.eventHistory];
  }

  clearHistory(): void {
    this.eventHistory = [];
  }
}

export const eventService = new CommonEventService();

/**
 * Format timestamp to display exactly as HH:mm:ss (e.g., "19:02:10")
 */
export function formatTimelineTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

/**
 * Format relative time (e.g. "Just now", "2m ago")
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 5) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
  } catch {
    return "";
  }
}

/**
 * Visual metadata for event categories
 */
export interface CategoryStyle {
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  dotColor: string;
  iconName: string;
}

export const CATEGORY_STYLES: Record<TimelineCategory, CategoryStyle> = {
  DETECTION: {
    label: "DETECTION",
    badgeBg: "bg-cyan-950/70",
    badgeBorder: "border-cyan-500/50",
    badgeText: "text-cyan-300",
    dotColor: "bg-cyan-400",
    iconName: "Radio",
  },
  ANALYSIS: {
    label: "ANALYSIS",
    badgeBg: "bg-purple-950/70",
    badgeBorder: "border-purple-500/50",
    badgeText: "text-purple-300",
    dotColor: "bg-purple-400",
    iconName: "Brain",
  },
  DECISION: {
    label: "DECISION",
    badgeBg: "bg-amber-950/70",
    badgeBorder: "border-amber-500/50",
    badgeText: "text-amber-300",
    dotColor: "bg-amber-400",
    iconName: "Zap",
  },
  APPROVAL: {
    label: "APPROVAL",
    badgeBg: "bg-emerald-950/70",
    badgeBorder: "border-emerald-500/50",
    badgeText: "text-emerald-300",
    dotColor: "bg-emerald-400",
    iconName: "ShieldCheck",
  },
  AUTOMATION: {
    label: "AUTOMATION",
    badgeBg: "bg-blue-950/70",
    badgeBorder: "border-blue-500/50",
    badgeText: "text-blue-300",
    dotColor: "bg-blue-400",
    iconName: "GitBranch",
  },
  RESOURCE: {
    label: "RESOURCE",
    badgeBg: "bg-teal-950/70",
    badgeBorder: "border-teal-500/50",
    badgeText: "text-teal-300",
    dotColor: "bg-teal-400",
    iconName: "Truck",
  },
  ESCALATION: {
    label: "ESCALATION",
    badgeBg: "bg-rose-950/70",
    badgeBorder: "border-rose-500/60",
    badgeText: "text-rose-300",
    dotColor: "bg-rose-400",
    iconName: "Flame",
  },
  SYSTEM: {
    label: "SYSTEM",
    badgeBg: "bg-slate-900/80",
    badgeBorder: "border-slate-700/60",
    badgeText: "text-slate-300",
    dotColor: "bg-slate-400",
    iconName: "Cpu",
  },
  DISPATCH: {
    label: "DISPATCH",
    badgeBg: "bg-teal-950/70",
    badgeBorder: "border-teal-500/50",
    badgeText: "text-teal-300",
    dotColor: "bg-teal-400",
    iconName: "Truck",
  },
  STATUS_UPDATE: {
    label: "STATUS",
    badgeBg: "bg-slate-900/80",
    badgeBorder: "border-slate-700/60",
    badgeText: "text-slate-300",
    dotColor: "bg-slate-400",
    iconName: "Info",
  },
  RESOLUTION: {
    label: "RESOLUTION",
    badgeBg: "bg-emerald-950/70",
    badgeBorder: "border-emerald-500/50",
    badgeText: "text-emerald-300",
    dotColor: "bg-emerald-400",
    iconName: "CheckCircle2",
  },
  ENVIRONMENTAL: {
    label: "DETECTION",
    badgeBg: "bg-cyan-950/70",
    badgeBorder: "border-cyan-500/50",
    badgeText: "text-cyan-300",
    dotColor: "bg-cyan-400",
    iconName: "Waves",
  },
  HAZARD: {
    label: "ESCALATION",
    badgeBg: "bg-rose-950/70",
    badgeBorder: "border-rose-500/60",
    badgeText: "text-rose-300",
    dotColor: "bg-rose-400",
    iconName: "AlertTriangle",
  },
  AI_DECISION: {
    label: "DECISION",
    badgeBg: "bg-amber-950/70",
    badgeBorder: "border-amber-500/50",
    badgeText: "text-amber-300",
    dotColor: "bg-amber-400",
    iconName: "Bot",
  },
  OPERATOR_APPROVAL: {
    label: "APPROVAL",
    badgeBg: "bg-emerald-950/70",
    badgeBorder: "border-emerald-500/50",
    badgeText: "text-emerald-300",
    dotColor: "bg-emerald-400",
    iconName: "ShieldCheck",
  },
};
