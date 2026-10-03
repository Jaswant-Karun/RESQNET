export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationCoordinates extends GeoCoordinates {
  address?: string;
  name?: string;
  elevationMeters?: number;
  zoneId?: string;
}

export type RiskLevel = "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
export type EmergencyStatus = "ACTIVE" | "CONTAINED" | "ESCALATING" | "RESOLVED";
export type DisasterType = "FLOOD" | "CYCLONE" | "EARTHQUAKE" | "LANDSLIDE";

export interface Zone {
  id: string;
  name: string;
  code: string;
  riskLevel: RiskLevel;
  waterDepthMeters: number;
  populationEstimate: number;
  evacuationProgressPercentage: number;
  status: "EVACUATING" | "SUBMERGED" | "AT_RISK" | "SAFE_BUFFER";
  polygonCoordinates: [number, number][];
  center: GeoCoordinates;
}

export interface Hospital {
  id: string;
  name: string;
  type: "LEVEL_1_TRAUMA" | "DISTRICT_HOSPITAL" | "COMMUNITY_CLINIC";
  location: LocationCoordinates;
  totalBeds: number;
  availableBeds: number;
  icuTotal: number;
  icuAvailable: number;
  powerBackupStatus: "OPERATIONAL" | "AUXILIARY_GENERATOR" | "FAILING";
  floodRisk: "MINIMAL" | "MODERATE" | "FLOOD_SURROUNDED";
  contactRadio: string;
}

export interface Shelter {
  id: string;
  name: string;
  type: "CIVIC_STAGING_CENTER" | "HIGH_SCHOOL_GYM" | "INDOOR_STADIUM";
  location: LocationCoordinates;
  totalCapacity: number;
  currentOccupancy: number;
  waterSupplyDays: number;
  foodRationsDays: number;
  medicalStationPresent: boolean;
  status: "OPEN" | "NEAR_CAPACITY" | "FULL" | "STANDBY";
}

export interface RoadSegment {
  id: string;
  name: string;
  routeCode: string;
  status: "CLEAR" | "WATERLOGGED" | "IMPASSABLE" | "SUBMERGED";
  waterDepthCm: number;
  clearanceVehicleTypes: ("AMBULANCE" | "HIGH_CLEARANCE_TRUCK" | "RESCUE_BOAT")[];
  detourRouteName?: string;
  startPoint: GeoCoordinates;
  endPoint: GeoCoordinates;
}
