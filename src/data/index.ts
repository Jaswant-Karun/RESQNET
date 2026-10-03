import { MOCK_FLOOD_INCIDENT } from "./mock-flood-incident";
import { MOCK_ZONES } from "./mock-zones";
import {
  MOCK_HOSPITALS,
  MOCK_ROADS,
  MOCK_SHELTERS,
} from "./mock-infrastructure";
import {
  MOCK_AMBULANCES,
  MOCK_DRONES,
  MOCK_RESCUE_TEAMS,
} from "./mock-resources";
import {
  MOCK_ALERTS,
  MOCK_RESPONSE_PLAN,
  MOCK_TIMELINE_EVENTS,
} from "./mock-plan-alerts";

export * from "./mock-flood-incident";
export * from "./mock-zones";
export * from "./mock-infrastructure";
export * from "./mock-resources";
export * from "./mock-plan-alerts";

export interface DisasterDataSet {
  incident: typeof MOCK_FLOOD_INCIDENT;
  zones: typeof MOCK_ZONES;
  hospitals: typeof MOCK_HOSPITALS;
  shelters: typeof MOCK_SHELTERS;
  roads: typeof MOCK_ROADS;
  ambulances: typeof MOCK_AMBULANCES;
  rescueTeams: typeof MOCK_RESCUE_TEAMS;
  drones: typeof MOCK_DRONES;
  plan: typeof MOCK_RESPONSE_PLAN;
  alerts: typeof MOCK_ALERTS;
  timeline: typeof MOCK_TIMELINE_EVENTS;
}

export const getDisasterDataSet = (): DisasterDataSet => {
  return {
    incident: MOCK_FLOOD_INCIDENT,
    zones: MOCK_ZONES,
    hospitals: MOCK_HOSPITALS,
    shelters: MOCK_SHELTERS,
    roads: MOCK_ROADS,
    ambulances: MOCK_AMBULANCES,
    rescueTeams: MOCK_RESCUE_TEAMS,
    drones: MOCK_DRONES,
    plan: MOCK_RESPONSE_PLAN,
    alerts: MOCK_ALERTS,
    timeline: MOCK_TIMELINE_EVENTS,
  };
};
