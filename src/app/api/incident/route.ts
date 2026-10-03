import { NextResponse } from "next/server";
import {
  MOCK_ALERTS,
  MOCK_FLOOD_INCIDENT,
  MOCK_RESPONSE_PLAN,
  MOCK_TIMELINE_EVENTS,
  MOCK_ZONES,
} from "@/data";

export async function GET() {
  return NextResponse.json({
    success: true,
    incident: MOCK_FLOOD_INCIDENT,
    zones: MOCK_ZONES,
    plan: MOCK_RESPONSE_PLAN,
    alerts: MOCK_ALERTS,
    timeline: MOCK_TIMELINE_EVENTS,
  });
}
