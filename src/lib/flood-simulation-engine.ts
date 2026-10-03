import {
  Drone,
  Hospital,
  Incident,
  Resource,
  RoadSegment,
  Shelter,
  TimelineEvent,
  Zone,
} from "@/types";

export interface DeterministicFloodScenarioResult {
  incident: Incident;
  zones: Zone[];
  hospitals: Hospital[];
  shelters: Shelter[];
  roads: RoadSegment[];
  ambulances: Resource[];
  rescueTeams: Resource[];
  drones: Drone[];
  timelineEvent: TimelineEvent;
  simulationStatusText: string;
}

/**
 * Creates the deterministic initial flood scenario matching exact hackathon parameters:
 * - Incident: type FLOOD, location Zone A, severity CRITICAL, water level 2.4m, affected pop 1240, blocked roads R1 & R3
 * - Hospitals: H1 80% usage, H2 42% usage, H3 95% usage
 * - Resources: 8 ambulances, 4 rescue teams, 3 drones
 * - Shelters: Shelter B capacity 700, Shelter C capacity 1500
 */
export function generateDeterministicFloodScenario(): DeterministicFloodScenarioResult {
  const deterministicTimestamp = "2026-10-03T20:00:00Z";
  const incidentId = "INC-SIM-FLOOD-001";

  // 1. INCIDENT
  const incident: Incident = {
    id: incidentId,
    code: "FL-902-CRIT",
    title: "Zone A Flash Inundation & Embankment Sluice Breach",
    disasterType: "FLOOD",
    severity: "CRITICAL",
    status: "ACTIVE",
    zoneId: "zone-a",
    zoneName: "Zone A",
    blockedRoads: ["R1", "R3"],
    primaryLocation: {
      latitude: 13.0135,
      longitude: 80.2312,
      address: "Riverfront Lowlands, Zone A Sector",
      name: "Zone A (Kotturpuram Basin)",
      elevationMeters: 5.4,
      zoneId: "zone-a",
    },
    detectedAt: deterministicTimestamp,
    lastUpdatedAt: deterministicTimestamp,
    metrics: {
      waterLevelMeters: 2.4, // exactly 2.4 meters
      waterLevelTrend: "RISING_RAPID",
      rainfallRateMmPerHour: 72.0,
      dischargeCusecs: 38000,
      riverBasinName: "Adyar River Zone A Catchment",
      affectedPopulationEstimated: 1240, // exactly 1240
      confirmedEvacuated: 340,
      reportedStranded: 180,
      criticalInfrastructureAtRisk: 6,
      activeHazardsCount: 8,
    },
    commandChief: "Col. Raghav Menon (EOC Chief Commander)",
    operationalSummary:
      "DETERMINISTIC SIMULATION: Embankment sluice breach triggered in Zone A. Water level measured at 2.4 meters with 1,240 civilians in inundation hazard zone. Arterials R1 (Maraimalai Causeway) and R3 (Anna Salai Riverway) are completely blocked. Rerouting all convoys via R4 Guindy Elevated Pass.",
    primaryThreats: [
      "Water level reached 2.4m in Zone A residential lowlands",
      "Arterial Roads R1 and R3 submerged and impassable",
      "Hospital H3 operating at critical 95% capacity",
      "180 stranded residents awaiting boat & drone extraction",
    ],
  };

  // 2. ZONES (Zone A is Critical 2.4m, Zone B is High-Risk)
  const zones: Zone[] = [
    {
      id: "zone-a",
      name: "Flood affected Zone A",
      code: "Zone A",
      riskLevel: "CRITICAL",
      waterDepthMeters: 2.4, // exactly 2.4m
      populationEstimate: 1240, // exactly 1240
      evacuationProgressPercentage: 35,
      status: "SUBMERGED",
      center: { latitude: 13.0135, longitude: 80.2312 },
      polygonCoordinates: [
        [13.008, 80.224],
        [13.018, 80.228],
        [13.022, 80.239],
        [13.011, 80.241],
        [13.004, 80.232],
      ],
    },
    {
      id: "zone-b",
      name: "Flood affected Zone B",
      code: "Zone B",
      riskLevel: "HIGH",
      waterDepthMeters: 1.2,
      populationEstimate: 3100,
      evacuationProgressPercentage: 62,
      status: "EVACUATING",
      center: { latitude: 13.0211, longitude: 80.2195 },
      polygonCoordinates: [
        [13.016, 80.212],
        [13.026, 80.215],
        [13.028, 80.227],
        [13.019, 80.225],
      ],
    },
    {
      id: "zone-c",
      name: "Sector C - Residential Uplands",
      code: "Zone C",
      riskLevel: "MODERATE",
      waterDepthMeters: 0.4,
      populationEstimate: 4200,
      evacuationProgressPercentage: 88,
      status: "AT_RISK",
      center: { latitude: 13.0078, longitude: 80.2074 },
      polygonCoordinates: [
        [13.001, 80.201],
        [13.012, 80.203],
        [13.014, 80.214],
        [13.003, 80.212],
      ],
    },
    {
      id: "zone-d",
      name: "Sector D - Highland Staging Command",
      code: "Zone D",
      riskLevel: "LOW",
      waterDepthMeters: 0.0,
      populationEstimate: 5000,
      evacuationProgressPercentage: 100,
      status: "SAFE_BUFFER",
      center: { latitude: 12.9984, longitude: 80.1989 },
      polygonCoordinates: [
        [12.992, 80.191],
        [13.002, 80.193],
        [13.004, 80.205],
        [12.994, 80.203],
      ],
    },
  ];

  // 3. HOSPITALS (H1 80%, H2 42%, H3 95%)
  const hospitals: Hospital[] = [
    {
      id: "hosp-h1",
      code: "H1",
      name: "Hospital H1 (Apex Central Trauma)",
      type: "LEVEL_1_TRAUMA",
      location: {
        latitude: 13.0189,
        longitude: 80.2088,
        address: "Guindy Main Corridor",
        name: "Hospital H1 Complex",
        elevationMeters: 14.5,
        zoneId: "zone-c",
      },
      totalBeds: 500,
      availableBeds: 100, // 400 occupied = 80% usage
      capacityUsagePercentage: 80, // exact 80%
      icuTotal: 60,
      icuAvailable: 12,
      powerBackupStatus: "OPERATIONAL",
      floodRisk: "MINIMAL",
      contactRadio: "VHF-CH 16 / TAC-MED-1",
    },
    {
      id: "hosp-h2",
      code: "H2",
      name: "Hospital H2 (District Medical Pavilion)",
      type: "DISTRICT_HOSPITAL",
      location: {
        latitude: 13.0234,
        longitude: 80.2221,
        address: "Anna Salai Junction Crossway",
        name: "Hospital H2 Center",
        elevationMeters: 7.1,
        zoneId: "zone-b",
      },
      totalBeds: 300,
      availableBeds: 174, // 126 occupied = 42% usage
      capacityUsagePercentage: 42, // exact 42%
      icuTotal: 30,
      icuAvailable: 17,
      powerBackupStatus: "OPERATIONAL",
      floodRisk: "MODERATE",
      contactRadio: "VHF-CH 18 / TAC-MED-2",
    },
    {
      id: "hosp-h3",
      code: "H3",
      name: "Hospital H3 (Riverfront Community Clinic)",
      type: "COMMUNITY_CLINIC",
      location: {
        latitude: 13.0142,
        longitude: 80.2335,
        address: "Zone A Embankment Perimeter",
        name: "Hospital H3 Clinic",
        elevationMeters: 5.3,
        zoneId: "zone-a",
      },
      totalBeds: 100,
      availableBeds: 5, // 95 occupied = 95% usage
      capacityUsagePercentage: 95, // exact 95%
      icuTotal: 8,
      icuAvailable: 0,
      powerBackupStatus: "AUXILIARY_GENERATOR",
      floodRisk: "FLOOD_SURROUNDED",
      contactRadio: "VHF-CH 09 / DIRECT-EMERGENCY",
    },
  ];

  // 4. SHELTERS (Shelter B: 700, Shelter C: 1500)
  const shelters: Shelter[] = [
    {
      id: "shelter-b",
      code: "Shelter B",
      name: "Shelter B (Tech Campus Relief Hub)",
      type: "CIVIC_STAGING_CENTER",
      location: {
        latitude: 13.0112,
        longitude: 80.2033,
        address: "Sardar Patel Road, Guindy",
        name: "Shelter B Quadrangle",
        elevationMeters: 16.0,
        zoneId: "zone-c",
      },
      totalCapacity: 700, // exact 700
      currentOccupancy: 480,
      waterSupplyDays: 5,
      foodRationsDays: 4,
      medicalStationPresent: true,
      status: "OPEN",
    },
    {
      id: "shelter-c",
      code: "Shelter C",
      name: "Shelter C (Alandur Indoor Sports Complex)",
      type: "INDOOR_STADIUM",
      location: {
        latitude: 12.9972,
        longitude: 80.1975,
        address: "Grand Southern Trunk Rd, Alandur",
        name: "Shelter C Staging Stadium",
        elevationMeters: 18.2,
        zoneId: "zone-d",
      },
      totalCapacity: 1500, // exact 1500
      currentOccupancy: 820,
      waterSupplyDays: 7,
      foodRationsDays: 6,
      medicalStationPresent: true,
      status: "OPEN",
    },
  ];

  // 5. RESOURCES: Exactly 8 Ambulances, 4 Rescue Teams, 3 Drones
  const ambulances: Resource[] = [
    {
      id: "amb-01",
      callsign: "MEDIC-01",
      name: "ALS Mobile ICU 108-1",
      type: "AMBULANCE",
      status: "ON_MISSION",
      capacityPersons: 2,
      fuelOrBatteryLevel: 85,
      currentLocation: {
        latitude: 13.0165,
        longitude: 80.2185,
        address: "Saidapet Emergency Triage Point",
        elevationMeters: 8.5,
      },
      assignedZoneId: "zone-b",
      etaMinutes: 4,
      personnelCount: 3,
      commander: "Dr. A. Ray",
      equipmentInventory: ["Defibrillator", "Portable Ventilator", "Oxygen Cylinders"],
    },
    {
      id: "amb-02",
      callsign: "MEDIC-02",
      name: "All-Terrain Paramedic 108-2",
      type: "AMBULANCE",
      status: "AVAILABLE",
      capacityPersons: 4,
      fuelOrBatteryLevel: 94,
      currentLocation: {
        latitude: 13.0185,
        longitude: 80.2095,
        address: "Hospital H1 Staging Bay",
        elevationMeters: 14.8,
      },
      assignedZoneId: "zone-c",
      etaMinutes: 0,
      personnelCount: 3,
      commander: "Paramedic Lead V. Murugan",
      equipmentInventory: ["Spine Boards", "Thermal Hypothermia Pods"],
    },
    {
      id: "amb-03",
      callsign: "MEDIC-03",
      name: "Amphibious Patient Transit Unit 3",
      type: "AMBULANCE",
      status: "EN_ROUTE",
      capacityPersons: 3,
      fuelOrBatteryLevel: 72,
      currentLocation: {
        latitude: 13.0125,
        longitude: 80.225,
        address: "En route to Zone A Flood Boundary",
        elevationMeters: 7.0,
      },
      assignedZoneId: "zone-a",
      etaMinutes: 6,
      personnelCount: 4,
      commander: "EMT Specialist P. Sundaram",
      equipmentInventory: ["Floating Stretchers", "Suction Unit"],
    },
    {
      id: "amb-04",
      callsign: "MEDIC-04",
      name: "Rapid Response Ambulance 4",
      type: "AMBULANCE",
      status: "AVAILABLE",
      capacityPersons: 2,
      fuelOrBatteryLevel: 90,
      currentLocation: {
        latitude: 12.9988,
        longitude: 80.1985,
        address: "Shelter C Staging Depot",
        elevationMeters: 18.0,
      },
      assignedZoneId: "zone-d",
      etaMinutes: 0,
      personnelCount: 2,
      commander: "Paramedic S. Joshi",
      equipmentInventory: ["Trauma Kit", "Splints"],
    },
    {
      id: "amb-05",
      callsign: "MEDIC-05",
      name: "Mobile Life Support Unit 5",
      type: "AMBULANCE",
      status: "AVAILABLE",
      capacityPersons: 3,
      fuelOrBatteryLevel: 88,
      currentLocation: {
        latitude: 13.0112,
        longitude: 80.2033,
        address: "Shelter B Base Camp",
        elevationMeters: 16.0,
      },
      assignedZoneId: "zone-c",
      etaMinutes: 0,
      personnelCount: 3,
      commander: "Dr. K. George",
      equipmentInventory: ["Cardiac Monitor", "First Aid Trays"],
    },
    {
      id: "amb-06",
      callsign: "MEDIC-06",
      name: "High-Clearance Ambulance 6",
      type: "AMBULANCE",
      status: "ON_MISSION",
      capacityPersons: 4,
      fuelOrBatteryLevel: 68,
      currentLocation: {
        latitude: 13.015,
        longitude: 80.228,
        address: "Zone A Evacuation Axis",
        elevationMeters: 6.2,
      },
      assignedZoneId: "zone-a",
      etaMinutes: 3,
      personnelCount: 3,
      commander: "EMT R. Sharma",
      equipmentInventory: ["Burn Dressings", "Pediatric Pack"],
    },
    {
      id: "amb-07",
      callsign: "MEDIC-07",
      name: "Emergency Medic Transport 7",
      type: "AMBULANCE",
      status: "AVAILABLE",
      capacityPersons: 2,
      fuelOrBatteryLevel: 98,
      currentLocation: {
        latitude: 13.0075,
        longitude: 80.2065,
        address: "Guindy Highland Route 4 Depot",
        elevationMeters: 17.5,
      },
      assignedZoneId: "zone-c",
      etaMinutes: 0,
      personnelCount: 2,
      commander: "Paramedic T. Das",
      equipmentInventory: ["Emergency Blankets", "Splints"],
    },
    {
      id: "amb-08",
      callsign: "MEDIC-08",
      name: "District Medical Transit 8",
      type: "AMBULANCE",
      status: "AVAILABLE",
      capacityPersons: 3,
      fuelOrBatteryLevel: 82,
      currentLocation: {
        latitude: 13.0234,
        longitude: 80.2221,
        address: "Hospital H2 Outpost Bay",
        elevationMeters: 7.1,
      },
      assignedZoneId: "zone-b",
      etaMinutes: 0,
      personnelCount: 3,
      commander: "Lead EMT M. Khan",
      equipmentInventory: ["Oxygen Packs", "Stretcher Pods"],
    },
  ];

  const rescueTeams: Resource[] = [
    {
      id: "team-01",
      callsign: "RESCUE-01",
      name: "NDRF 4th Battalion Swiftwater Squad",
      type: "SWIFTWATER_TEAM",
      status: "ON_MISSION",
      capacityPersons: 40,
      fuelOrBatteryLevel: 92,
      currentLocation: {
        latitude: 13.0138,
        longitude: 80.2319,
        address: "Zone A Flooded Lowland Cluster",
        elevationMeters: 4.8,
      },
      assignedZoneId: "zone-a",
      etaMinutes: 0,
      personnelCount: 16,
      commander: "Maj. S. Rathore",
      equipmentInventory: ["Zodiac Inflatable Boats (x4)", "PFDs (x50)", "Thermal Monoculars"],
    },
    {
      id: "team-02",
      callsign: "RESCUE-02",
      name: "SDRF Motorized Boat Unit Bravo",
      type: "RESCUE_BOAT",
      status: "EN_ROUTE",
      capacityPersons: 24,
      fuelOrBatteryLevel: 89,
      currentLocation: {
        latitude: 13.0195,
        longitude: 80.2215,
        address: "Saidapet Bridge Ramp Staging Point",
        elevationMeters: 7.5,
      },
      assignedZoneId: "zone-b",
      etaMinutes: 5,
      personnelCount: 10,
      commander: "Inspector K. Selvam",
      equipmentInventory: ["Rigid Rescue Boats (x2)", "40HP Motors", "Stretchers"],
    },
    {
      id: "team-03",
      callsign: "RESCUE-03",
      name: "Civil Defence 4x4 Evacuation Taskforce",
      type: "HIGH_CLEARANCE_TRUCK",
      status: "AVAILABLE",
      capacityPersons: 60,
      fuelOrBatteryLevel: 80,
      currentLocation: {
        latitude: 12.9988,
        longitude: 80.1985,
        address: "Shelter C Staging Ridge",
        elevationMeters: 18.0,
      },
      assignedZoneId: "zone-d",
      etaMinutes: 0,
      personnelCount: 22,
      commander: "Capt. Deepa Nair",
      equipmentInventory: ["Transport Trucks (x3)", "5kVA Generators", "Megaphones"],
    },
    {
      id: "team-04",
      callsign: "RESCUE-04",
      name: "Coast Guard Amphibious Extraction Unit",
      type: "SWIFTWATER_TEAM",
      status: "AVAILABLE",
      capacityPersons: 30,
      fuelOrBatteryLevel: 95,
      currentLocation: {
        latitude: 13.0075,
        longitude: 80.2065,
        address: "Guindy Technical Staging Center",
        elevationMeters: 16.5,
      },
      assignedZoneId: "zone-c",
      etaMinutes: 0,
      personnelCount: 14,
      commander: "Lt. Cmdr. V. Verma",
      equipmentInventory: ["Amphibious Rigid Inflatables (x2)", "Life Rafts", "High-Line Rigging"],
    },
  ];

  const drones: Drone[] = [
    {
      id: "drone-01",
      callsign: "UAV-01",
      model: "AeroShield Sentinel X-4",
      role: "THERMAL_SURVEILLANCE",
      flightStatus: "AIRBORNE_PATROL",
      batteryPercentage: 82,
      altitudeMeters: 85,
      groundSpeedKmH: 36,
      payloadCapacityKg: 5,
      maxRangeKm: 18,
      telemetryLinkStrength: 98,
      currentLocation: {
        latitude: 13.0145,
        longitude: 80.2325,
        address: "Zone A Embankment Airspace",
        elevationMeters: 90,
      },
      targetWaypoints: [
        { latitude: 13.0125, longitude: 80.231 },
        { latitude: 13.0155, longitude: 80.235 },
      ],
      assignedZoneId: "zone-a",
      estimatedFlightTimeRemainingMin: 32,
    },
    {
      id: "drone-02",
      callsign: "UAV-02",
      model: "SkyLift Heavy Octocopter",
      role: "LIFE_JACKET_DROP",
      flightStatus: "HOVERING_INSPECTION",
      batteryPercentage: 66,
      altitudeMeters: 45,
      groundSpeedKmH: 0,
      payloadCapacityKg: 20,
      payloadItemDescription: "4x Self-Inflating Life Vests & Beacon Pod",
      maxRangeKm: 12,
      telemetryLinkStrength: 94,
      currentLocation: {
        latitude: 13.0118,
        longitude: 80.2341,
        address: "Overhead Zone A Terrace Cluster",
        elevationMeters: 51,
      },
      targetWaypoints: [
        { latitude: 13.0118, longitude: 80.2341 },
        { latitude: 12.9984, longitude: 80.1989 },
      ],
      assignedZoneId: "zone-a",
      estimatedFlightTimeRemainingMin: 22,
    },
    {
      id: "drone-03",
      callsign: "UAV-03",
      model: "Zipline Vector Hexacopter",
      role: "MEDICAL_PAYLOAD",
      flightStatus: "STANDBY_PAD",
      batteryPercentage: 100,
      altitudeMeters: 0,
      groundSpeedKmH: 0,
      payloadCapacityKg: 8,
      payloadItemDescription: "Trauma Hemostatic Packs & Insulin Kits",
      maxRangeKm: 25,
      telemetryLinkStrength: 100,
      currentLocation: {
        latitude: 12.9984,
        longitude: 80.1989,
        address: "Shelter C Staging Helipad 1",
        elevationMeters: 18,
      },
      targetWaypoints: [],
      assignedZoneId: "zone-d",
      estimatedFlightTimeRemainingMin: 45,
    },
  ];

  // 6. ROADS: Blocked roads R1, R3; Clear roads R2, R4
  const roads: RoadSegment[] = [
    {
      id: "road-r1",
      code: "R1",
      name: "Road R1 (Maraimalai Adigalar Causeway)",
      routeCode: "R1-ARTERIAL",
      status: "SUBMERGED",
      isBlocked: true,
      waterDepthCm: 240, // 2.4 meters
      clearanceVehicleTypes: ["RESCUE_BOAT"],
      detourRouteName: "Route R4 Highland Pass",
      startPoint: { latitude: 13.0195, longitude: 80.2238 },
      endPoint: { latitude: 13.0238, longitude: 80.2225 },
    },
    {
      id: "road-r2",
      code: "R2",
      name: "Road R2 (Kotturpuram High Bypass)",
      routeCode: "R2-CONNECT",
      status: "CLEAR",
      isBlocked: false,
      waterDepthCm: 0,
      clearanceVehicleTypes: ["AMBULANCE", "HIGH_CLEARANCE_TRUCK"],
      startPoint: { latitude: 13.012, longitude: 80.2305 },
      endPoint: { latitude: 13.0175, longitude: 80.2382 },
    },
    {
      id: "road-r3",
      code: "R3",
      name: "Road R3 (Anna Salai Riverway Corridor)",
      routeCode: "R3-TRANSIT",
      status: "IMPASSABLE",
      isBlocked: true,
      waterDepthCm: 180,
      clearanceVehicleTypes: ["RESCUE_BOAT"],
      detourRouteName: "Route R4 Highland Pass",
      startPoint: { latitude: 13.0245, longitude: 80.218 },
      endPoint: { latitude: 13.012, longitude: 80.209 },
    },
    {
      id: "road-r4",
      code: "R4",
      name: "Road R4 (Guindy Highland Relief Arterial)",
      routeCode: "R4-ELEVATED",
      status: "CLEAR",
      isBlocked: false,
      waterDepthCm: 0,
      clearanceVehicleTypes: ["AMBULANCE", "HIGH_CLEARANCE_TRUCK"],
      startPoint: { latitude: 13.0075, longitude: 80.2065 },
      endPoint: { latitude: 12.998, longitude: 80.1985 },
    },
  ];

  // 7. TIMELINE EVENT
  const timelineEvent: TimelineEvent = {
    id: `evt-flood-${Date.now()}`,
    incidentId: incidentId,
    timestamp: deterministicTimestamp,
    title: "Flood Incident Simulated — Zone A Critical",
    description:
      "Deterministic flood scenario generated: Water level at 2.4m in Zone A. Affected population: 1,240. Roads R1 & R3 blocked. Hospital H3 at 95% capacity. 8 ambulances, 4 rescue teams, and 3 drones tasked.",
    category: "DETECTION",
    severity: "CRITICAL",
    authorOrSystem: "RESQNET Simulation Engine",
  };

  return {
    incident,
    zones,
    hospitals,
    shelters,
    roads,
    ambulances,
    rescueTeams,
    drones,
    timelineEvent,
    simulationStatusText: "FLOOD INCIDENT SIMULATED",
  };
}
