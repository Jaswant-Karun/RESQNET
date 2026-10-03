import { GeoCoordinates, LocationCoordinates } from "./location";

export type DroneRole =
  | "THERMAL_SURVEILLANCE"
  | "LIFE_JACKET_DROP"
  | "MEDICAL_PAYLOAD"
  | "MAPPING_LIDAR"
  | "COMMUNICATION_RELAY";

export type DroneFlightStatus =
  | "STANDBY_PAD"
  | "AIRBORNE_PATROL"
  | "IN_TRANSIT"
  | "HOVERING_INSPECTION"
  | "RETURNING_TO_BASE"
  | "CHARGING";

export interface Drone {
  id: string;
  callsign: string;
  model: string;
  role: DroneRole;
  flightStatus: DroneFlightStatus;
  batteryPercentage: number;
  altitudeMeters: number;
  groundSpeedKmH: number;
  payloadCapacityKg: number;
  payloadItemDescription?: string;
  maxRangeKm: number;
  telemetryLinkStrength: number; // 0-100%
  currentLocation: LocationCoordinates;
  targetWaypoints: GeoCoordinates[];
  assignedZoneId?: string;
  estimatedFlightTimeRemainingMin: number;
}
