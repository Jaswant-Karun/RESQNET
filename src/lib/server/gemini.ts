import { Incident, RiskLevel } from "@/types";

export interface GeminiResponseSchema {
  risk_level: RiskLevel;
  priority_zones: string[];
  immediate_actions: string[];
  resource_allocation: {
    ambulances: number;
    rescue_teams: number;
    drones: number;
  };
  evacuation_route: string;
  public_alert: string;
  explanation: string;
}

export type GeminiResult =
  | { ok: true; data: GeminiResponseSchema }
  | { ok: false; error: "NO_API_KEY" | "TIMEOUT" | "RATE_LIMIT" | "PARSE_ERROR" | "NETWORK_ERROR" };

/**
 * Server-only helper to analyze disaster incident via Gemini REST API.
 * Never calls Gemini on the client or leaks the API key.
 */
export async function analyzeIncidentWithGemini(
  incident: Incident,
  options?: { timeoutMs?: number; model?: string }
): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return { ok: false, error: "NO_API_KEY" };
  }

  const timeoutMs = options?.timeoutMs || 8000;
  const model = options?.model || "gemini-2.5-flash";

  const prompt = `You are RESQNET Emergency Operations Center Intelligence Engine.
Analyze the following active disaster incident data and produce an emergency response recommendation plan.

ACTIVE INCIDENT DATA:
- Type: ${incident.disasterType}
- Location / Zone: ${incident.zoneName || "Zone A"}
- Current Water Level: ${incident.metrics.waterLevelMeters} meters (Trend: ${incident.metrics.waterLevelTrend})
- Affected Population: ${incident.metrics.affectedPopulationEstimated.toLocaleString()}
- Blocked Roads: ${incident.blockedRoads?.join(", ") || "None"}
- Primary Threats: ${incident.primaryThreats?.join("; ") || "Inundation"}
- Available Resources: 8 Ambulances, 4 Swiftwater Teams, 3 Drones
- Hospitals: H1 (80% used), H2 (42% used), H3 (95% used)
- Shelters: Shelter B (Capacity: 700), Shelter C (Capacity: 1500)

INSTRUCTIONS:
You must return ONLY a single, strictly valid JSON object.
Do NOT include markdown formatting, backticks, or code fences (no \`\`\`json).
Do NOT include preamble or postscript.

JSON SCHEMA REQUIREMENT:
{
  "risk_level": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
  "priority_zones": ["string"],
  "immediate_actions": ["string"],
  "resource_allocation": {
    "ambulances": number,
    "rescue_teams": number,
    "drones": number
  },
  "evacuation_route": "string",
  "public_alert": "string",
  "explanation": "string"
}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    clearTimeout(timer);

    if (response.status === 429) {
      return { ok: false, error: "RATE_LIMIT" };
    }

    if (!response.ok) {
      return { ok: false, error: "NETWORK_ERROR" };
    }

    const payload = await response.json();
    const candidateText =
      payload?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText || typeof candidateText !== "string") {
      return { ok: false, error: "PARSE_ERROR" };
    }

    // Clean any accidental markdown backticks
    const cleanedText = candidateText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    // Validate Schema
    if (!validateGeminiResponse(parsed)) {
      return { ok: false, error: "PARSE_ERROR" };
    }

    return { ok: true, data: parsed };
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "TIMEOUT" };
    }
    return { ok: false, error: "NETWORK_ERROR" };
  }
}

/**
 * Validates the parsed object against the required schema
 */
export function validateGeminiResponse(
  val: any
): val is GeminiResponseSchema {
  if (!val || typeof val !== "object") return false;

  const validRiskLevels = ["CRITICAL", "HIGH", "MODERATE", "LOW"];
  if (!validRiskLevels.includes(val.risk_level)) return false;

  if (!Array.isArray(val.priority_zones) || val.priority_zones.length === 0)
    return false;

  if (!Array.isArray(val.immediate_actions) || val.immediate_actions.length === 0)
    return false;

  if (
    !val.resource_allocation ||
    typeof val.resource_allocation.ambulances !== "number" ||
    typeof val.resource_allocation.rescue_teams !== "number" ||
    typeof val.resource_allocation.drones !== "number"
  ) {
    return false;
  }

  if (typeof val.evacuation_route !== "string" || !val.evacuation_route.trim())
    return false;

  if (typeof val.public_alert !== "string" || !val.public_alert.trim())
    return false;

  if (typeof val.explanation !== "string" || !val.explanation.trim())
    return false;

  return true;
}

/**
 * Server-only helper to answer natural-language disaster questions with Gemini.
 */
export async function askGeminiQuestion(
  question: string,
  incident: Incident,
  options?: { timeoutMs?: number }
): Promise<{ ok: boolean; answer: string; source: "GEMINI_AI" | "FALLBACK" }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return {
      ok: false,
      answer:
        `[Fallback Emergency Protocol] Current disaster status: ${incident.disasterType} in ${incident.zoneName || "Zone A"}. Water depth is ${incident.metrics.waterLevelMeters}m with roads ${incident.blockedRoads?.join(", ") || "R1, R3"} impassable. Safe evacuation is designated via Route R2 to Shelter B.`,
      source: "FALLBACK",
    };
  }

  const timeoutMs = options?.timeoutMs || 8000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const prompt = `You are RESQNET Emergency Response Tactical Assistant.
Answer the following operator question accurately based on this live incident data:
- Incident: ${incident.title} (${incident.disasterType}, Severity: ${incident.severity})
- Location: ${incident.zoneName || "Zone A"}
- Water Level: ${incident.metrics.waterLevelMeters} meters
- Affected Population: ${incident.metrics.affectedPopulationEstimated}
- Blocked Roads: ${incident.blockedRoads?.join(", ") || "R1, R3"}
- Safe Evacuation Route: Route R2 to Shelter B
- Hospitals: H1 (80% used), H2 (42% used), H3 (95% used)

Question: ${question}

Provide a concise, direct, tactical answer (max 3 sentences) suitable for an emergency operations commander.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }

    const payload = await res.json();
    const answer = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      throw new Error("No answer content");
    }

    return { ok: true, answer: answer.trim(), source: "GEMINI_AI" };
  } catch {
    clearTimeout(timer);
    return {
      ok: false,
      answer:
        `[Emergency Knowledge Base Fallback] Active zone: ${incident.zoneName || "Zone A"} at ${incident.metrics.waterLevelMeters}m flood depth. Roads ${incident.blockedRoads?.join(", ") || "R1, R3"} blocked. All convoys must proceed via Route R2 to Shelter B.`,
      source: "FALLBACK",
    };
  }
}
