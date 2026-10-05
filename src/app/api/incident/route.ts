import { NextResponse } from "next/server";
import { getIncidents } from "@/lib/server/crudService";
import {
  MOCK_ALERTS,
  MOCK_FLOOD_INCIDENT,
  MOCK_RESPONSE_PLAN,
  MOCK_TIMELINE_EVENTS,
  MOCK_ZONES,
} from "@/data";

export async function GET() {
  try {
    const incidentResult = await getIncidents();
    const primaryIncident = incidentResult.data[0] || MOCK_FLOOD_INCIDENT;

    return NextResponse.json({
      success: true,
      incident: primaryIncident,
      rawIncident: MOCK_FLOOD_INCIDENT,
      zones: MOCK_ZONES,
      plan: MOCK_RESPONSE_PLAN,
      alerts: MOCK_ALERTS,
      timeline: MOCK_TIMELINE_EVENTS,
      source: incidentResult.source,
      fallback: incidentResult.fallback,
    });
  } catch {
    return NextResponse.json({
      success: true,
      incident: MOCK_FLOOD_INCIDENT,
      zones: MOCK_ZONES,
      plan: MOCK_RESPONSE_PLAN,
      alerts: MOCK_ALERTS,
      timeline: MOCK_TIMELINE_EVENTS,
      source: "local_simulation",
      fallback: true,
    });
  }
}
