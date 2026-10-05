import type { ObjectId } from "mongodb";

export interface MongoCoordinates {
  latitude: number;
  longitude: number;
}

export interface IncidentDocument {
  _id?: ObjectId | string;
  incidentId: string;
  type: string;
  location: string;
  coordinates: MongoCoordinates;
  severity: string;
  status: string;
  waterLevel: number;
  affectedPopulation: number;
  blockedRoads: string[];
  createdAt: string;
  updatedAt: string;
  source: string;
  simulationMode: boolean;
}

export interface ResourceDocument {
  _id?: ObjectId | string;
  resourceId: string;
  type: string;
  name: string;
  status: string;
  latitude: number;
  longitude: number;
  availability: boolean;
  updatedAt: string;
}

export interface ResourceAllocationDoc {
  ambulances: number;
  rescueTeams: number;
  drones: number;
}

export interface ResponsePlanDocument {
  _id?: ObjectId | string;
  incidentId: string;
  riskLevel: string;
  priorityZones: string[];
  immediateActions: string[];
  resourceAllocation: ResourceAllocationDoc;
  evacuationRoute: string;
  shelter: string;
  explanation: string;
  approvalRequired: boolean;
  createdAt: string;
}

export interface AlertDocument {
  _id?: ObjectId | string;
  alertId: string;
  incidentId: string;
  type: string;
  severity: string;
  recipient: string;
  channel: string;
  status: string;
  sentAt: string;
}

export interface RiskForecastDocument {
  _id?: ObjectId | string;
  forecastId: string;
  areaName: string;
  latitude: number;
  longitude: number;
  hazardType: string;
  riskScore: number;
  riskLevel: string;
  contributingFactors: string[];
  source: string;
  forecastTime: string;
  expiresAt: string;
  createdAt: string;
}

export interface ActivityLogDocument {
  _id?: ObjectId | string;
  eventId: string;
  eventType: string;
  message: string;
  actor: string;
  incidentId: string;
  timestamp: string;
}

export interface UserDocument {
  _id?: ObjectId | string;
  userId: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  passwordHash?: string;
  passwordSalt?: string;
  hashAlgorithm?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DroneMissionDocument {
  _id?: ObjectId | string;
  missionId: string;
  droneId: string;
  incidentId: string;
  status: string;
  missionType: string;
  waypoints?: MongoCoordinates[];
  batteryAtStart?: number;
  batteryAtEnd?: number;
  launchedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HospitalDocument {
  _id?: ObjectId | string;
  hospitalId: string;
  name: string;
  type: string;
  location: string;
  coordinates: MongoCoordinates;
  totalBeds: number;
  availableBeds: number;
  icuTotal: number;
  icuAvailable: number;
  status: string;
  contactRadio?: string;
  updatedAt: string;
}

export interface ShelterDocument {
  _id?: ObjectId | string;
  shelterId: string;
  name: string;
  location: string;
  coordinates: MongoCoordinates;
  capacityPersons: number;
  currentOccupancy: number;
  availableCapacity: number;
  status: string;
  contactRadio?: string;
  updatedAt: string;
}

export interface RoadDocument {
  _id?: ObjectId | string;
  roadId: string;
  name: string;
  status: "OPEN" | "RESTRICTED" | "IMPASSABLE" | "SUBMERGED" | string;
  waterDepthMeters: number;
  passableForHeavyVehicles: boolean;
  lengthKm: number;
  updatedAt: string;
}

export interface ZoneDocument {
  _id?: ObjectId | string;
  zoneId: string;
  name: string;
  severity: "CRITICAL" | "WARNING" | "WATCH" | "NORMAL" | string;
  waterLevelMeters: number;
  populationEstimate: number;
  evacuationStatus: string;
  coordinates: MongoCoordinates;
  updatedAt: string;
}
