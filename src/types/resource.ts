import { LocationCoordinates } from "./location";

export type ResourceCategory =
  | "AMBULANCE"
  | "RESCUE_BOAT"
  | "SWIFTWATER_TEAM"
  | "HIGH_CLEARANCE_TRUCK"
  | "PARAMEDIC_SQUAD"
  | "MOBILE_PUMP_UNIT";

export type ResourceStatus =
  | "AVAILABLE"
  | "EN_ROUTE"
  | "ON_MISSION"
  | "REFUELING"
  | "OUT_OF_SERVICE";

export interface Resource {
  id: string;
  callsign: string;
  name: string;
  type: ResourceCategory;
  status: ResourceStatus;
  capacityPersons: number;
  fuelOrBatteryLevel: number;
  currentLocation: LocationCoordinates;
  assignedZoneId?: string;
  etaMinutes?: number;
  personnelCount: number;
  commander: string;
  equipmentInventory: string[];
}
