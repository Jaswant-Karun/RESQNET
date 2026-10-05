export interface MongoCoordinates {
  latitude: number;
  longitude: number;
}

export interface IncidentDocument {
  _id?: string;
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
  _id?: string;
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
  _id?: string;
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
  _id?: string;
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
  _id?: string;
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
  _id?: string;
  eventId: string;
  eventType: string;
  message: string;
  actor: string;
  incidentId: string;
  timestamp: string;
}

export interface UserDocument {
  _id?: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DroneMissionDocument {
  _id?: string;
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
