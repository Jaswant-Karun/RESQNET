import { NextResponse } from "next/server";
import {
  MOCK_AMBULANCES,
  MOCK_DRONES,
  MOCK_HOSPITALS,
  MOCK_RESCUE_TEAMS,
  MOCK_ROADS,
  MOCK_SHELTERS,
} from "@/data";

export async function GET() {
  return NextResponse.json({
    success: true,
    resources: {
      ambulances: MOCK_AMBULANCES,
      rescueTeams: MOCK_RESCUE_TEAMS,
      drones: MOCK_DRONES,
    },
    infrastructure: {
      hospitals: MOCK_HOSPITALS,
      shelters: MOCK_SHELTERS,
      roads: MOCK_ROADS,
    },
  });
}
