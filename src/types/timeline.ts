export type TimelineCategory =
  | "DETECTION"
  | "ANALYSIS"
  | "DECISION"
  | "APPROVAL"
  | "AUTOMATION"
  | "RESOURCE"
  | "ESCALATION"
  | "SYSTEM"
  | "DISPATCH"
  | "STATUS_UPDATE"
  | "RESOLUTION"
  | "ENVIRONMENTAL"
  | "HAZARD"
  | "AI_DECISION"
  | "OPERATOR_APPROVAL";

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
