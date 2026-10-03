import { Incident } from "@/types";

export const MOCK_FLOOD_INCIDENT: Incident = {
  id: "inc-flood-2026-08a",
  code: "FL-902-CRIT",
  title: "Adyar Basin Urban Flash Inundation & Embankment Breach",
  disasterType: "FLOOD",
  severity: "CRITICAL",
  status: "ACTIVE",
  primaryLocation: {
    latitude: 13.0067,
    longitude: 80.2206,
    address: "Kotturpuram - Saidapet Embankment Corridor",
    name: "Adyar River Embankment Point K-4",
    elevationMeters: 6.2,
    zoneId: "zone-red-alpha",
  },
  detectedAt: "2026-10-03T18:42:00Z",
  lastUpdatedAt: "2026-10-03T19:25:00Z",
  metrics: {
    waterLevelMeters: 4.85,
    waterLevelTrend: "RISING_RAPID",
    rainfallRateMmPerHour: 68.4,
    dischargeCusecs: 42500,
    riverBasinName: "Adyar River Lower Basin",
    affectedPopulationEstimated: 34200,
    confirmedEvacuated: 12450,
    reportedStranded: 1820,
    criticalInfrastructureAtRisk: 8,
    activeHazardsCount: 14,
  },
  commandChief: "Col. Raghav Menon (State Disaster Management Authority)",
  operationalSummary:
    "Severe cloudburst compounded by upstream reservoir discharge has exceeded retention capacity at Sector 4. Sluice Gate 7 breached at 18:40 IST. Water inundation is rapidly advancing across Kotturpuram, Saidapet, and Jafferkhanpet. High current prevents standard vehicular access. Swift-water boat units and aerial reconnaissance mobilized.",
  primaryThreats: [
    "Substation #3 flooding risks total electrical blackout across 3 sectors",
    "Rapid water velocity (> 3.8 m/s) on arterial Bridge Road",
    "Civilian hospital baseline ward experiencing ground floor inundation",
    "Elderly care center in Zone Alpha isolated without road connectivity",
  ],
};
