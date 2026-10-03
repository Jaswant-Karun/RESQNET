export type AlertSeverity = "CRITICAL" | "WARNING" | "INFO" | "SUCCESS";

export type AlertSource =
  | "HYDROLOGICAL_GAUGE"
  | "WEATHER_DOPPLER_RADAR"
  | "CIVIC_HOTLINE"
  | "UAV_TELEMETRY"
  | "DAM_AUTHORITY"
  | "AI_ANOMALY_DETECTOR";

export interface Alert {
  id: string;
  incidentId: string;
  code: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  source: AlertSource;
  zoneId?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  actionableStep?: string;
}
