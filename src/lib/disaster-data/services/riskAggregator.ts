import {
  LiveDisasterIntelligencePayload,
  AreaRiskAssessment,
  ProviderStatus,
} from "../types";
import {
  fetchWeatherForecasts,
  MONITORED_LOCATIONS,
} from "../providers/weatherProvider";
import { fetchGdacsAlerts } from "../providers/gdacsProvider";
import { fetchFirmsFireDetections } from "../providers/firmsProvider";
import { calculateAreaRisk } from "./riskEngine";

// Cache in-memory for 30 seconds to prevent hammering external APIs on multiple client requests
let cachedPayload: LiveDisasterIntelligencePayload | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 30000;

export interface AggregatorOptions {
  forceRefresh?: boolean;
  simulationStage?: "NORMAL" | "FLOOD_ACTIVE" | "ESCALATED";
  activeIncident?: {
    location?: string;
    waterLevelMeters?: number;
    affectedPopulation?: number;
    blockedRoads?: string[];
  };
}

/**
 * Aggregates all external disaster intelligence providers and computes
 * deterministic RESQNET risk assessments for all monitored sectors.
 */
export async function getLiveDisasterIntelligence(
  options?: AggregatorOptions
): Promise<LiveDisasterIntelligencePayload> {
  const now = Date.now();
  if (
    !options?.forceRefresh &&
    cachedPayload &&
    now - lastFetchTime < CACHE_TTL_MS
  ) {
    return cachedPayload;
  }

  // 1. Fetch from all 3 isolated providers in parallel
  const [weatherRes, gdacsRes, firmsRes] = await Promise.allSettled([
    fetchWeatherForecasts(),
    fetchGdacsAlerts(),
    fetchFirmsFireDetections(),
  ]);

  const weatherData =
    weatherRes.status === "fulfilled" ? weatherRes.value.data : [];
  const weatherStatus: ProviderStatus =
    weatherRes.status === "fulfilled"
      ? weatherRes.value.status
      : {
          name: "Open-Meteo Weather Telemetry",
          sourceId: "OPEN_METEO",
          status: "UNAVAILABLE",
          lastUpdated: new Date().toISOString(),
          itemsCount: 0,
          message: "Provider query failed.",
        };

  const gdacsData =
    gdacsRes.status === "fulfilled" ? gdacsRes.value.data : [];
  const gdacsStatus: ProviderStatus =
    gdacsRes.status === "fulfilled"
      ? gdacsRes.value.status
      : {
          name: "GDACS Disaster Alert Network",
          sourceId: "GDACS",
          status: "UNAVAILABLE",
          lastUpdated: new Date().toISOString(),
          itemsCount: 0,
          message: "Provider query failed.",
        };

  const firmsData =
    firmsRes.status === "fulfilled" ? firmsRes.value.data : [];
  const firmsStatus: ProviderStatus =
    firmsRes.status === "fulfilled"
      ? firmsRes.value.status
      : {
          name: "NASA FIRMS Satellite Thermal Sensor",
          sourceId: "NASA_FIRMS",
          status: "UNAVAILABLE",
          lastUpdated: new Date().toISOString(),
          itemsCount: 0,
          message: "Provider query failed.",
        };

  // 2. Compute Deterministic Risk Assessments across monitored sectors
  const assessments: AreaRiskAssessment[] = MONITORED_LOCATIONS.map((loc) => {
    const weather = weatherData.find((w) => w.areaId === loc.id);

    return calculateAreaRisk({
      location: loc,
      weather,
      nearbyAlerts: gdacsData,
      activeIncident: options?.activeIncident || {
        location: "Zone A - Kotturpuram Riverfront Basin",
        waterLevelMeters:
          options?.simulationStage === "ESCALATED" ? 3.1 : 2.4,
        affectedPopulation:
          options?.simulationStage === "ESCALATED" ? 2180 : 1240,
        blockedRoads: ["Road R1 - Causeway", "Road R3 - Canal Link"],
      },
      simulationStage: options?.simulationStage,
    });
  });

  // Sort by highest risk score first
  assessments.sort((a, b) => b.riskScore - a.riskScore);

  const highestRiskArea = assessments[0];

  const payload: LiveDisasterIntelligencePayload = {
    timestamp: new Date().toISOString(),
    providerStatuses: [weatherStatus, gdacsStatus, firmsStatus],
    weatherForecasts: weatherData,
    gdacsAlerts: gdacsData,
    fireDetections: firmsData,
    riskAssessments: assessments,
    highestRiskArea,
    disclaimer:
      "RESQNET does not claim to perfectly predict disasters. Data is classified strictly into Observed/Reported Events, Forecast Conditions, Deterministic RESQNET Risk Assessments, and Simulated Events. Risk assessments are operational decision aids and not official governmental disaster warnings.",
  };

  cachedPayload = payload;
  lastFetchTime = now;

  return payload;
}

/**
 * Gemini Natural-Language Explanation Helper
 * 
 * CRITICAL RULE:
 * Gemini explains the deterministic score computed by the risk engine.
 * Gemini is strictly PROHIBITED from inventing or altering the numerical score.
 */
export async function explainRiskWithGemini(
  assessment: AreaRiskAssessment
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  const defaultExplanation = `${assessment.areaName} has a calculated RESQNET Risk Score of ${assessment.riskScore}/100 (${assessment.riskLevel}). Contributing factors: ${assessment.contributingFactors.map((f) => `${f.name} (+${f.weight} pts: ${f.description})`).join("; ")}. This score reflects verified hydrological telemetry and meteorological forecast models.`;

  if (!apiKey || apiKey.trim() === "" || apiKey === "test_mock_key") {
    return defaultExplanation;
  }

  const prompt = `You are RESQ AI Emergency Operations Risk Analyst.
Explain the following calculated risk score to Cmdr Jaswant Karun.

CRITICAL INSTRUCTIONS:
- The risk score is ALREADY CALCULATED deterministically as ${assessment.riskScore}/100 (${assessment.riskLevel}).
- DO NOT INVENT A NEW SCORE OR ALTER THE GIVEN NUMBER (${assessment.riskScore}).
- Explain WHY this score was reached using the specific contributing factors provided below.
- Keep the tone tactical, authoritative, and concise (2-3 sentences).
- End with a disclaimer that this is a RESQNET risk assessment and not an official government warning.

AREA ASSESSMENT DATA:
- Area: ${assessment.areaName}
- RESQNET Risk Score: ${assessment.riskScore} / 100 (${assessment.riskLevel})
- Elevation: ${assessment.elevationMeters}m MSL
- Contributing Factors:
${assessment.contributingFactors.map((f) => `  * ${f.name} (Weight: +${f.weight} pts) - ${f.description} [Observed: ${f.observedValue || "N/A"}]`).join("\n")}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);

    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      }),
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && typeof text === "string") {
        return text.trim();
      }
    }
  } catch (err) {
    console.warn(
      "[Gemini Risk Explanation] Fallback engaged:",
      err instanceof Error ? err.message : err
    );
  }

  return defaultExplanation;
}
