export type TimelineCategory =
  | "DETECTION"
  | "ANALYSIS"
  | "DECISION"
  | "DISPATCH"
  | "ESCALATION"
  | "STATUS_UPDATE"
  | "RESOLUTION";

export interface TimelineEvent {
  id: string;
  incidentId: string;
  timestamp: string;
  title: string;
  description: string;
  category: TimelineCategory;
  severity: "CRITICAL" | "WARNING" | "INFO";
  authorOrSystem: string;
  metadata?: Record<string, string | number | boolean>;
}
