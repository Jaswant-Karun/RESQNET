import { NextRequest, NextResponse } from "next/server";
import { createResource, getResources } from "@/lib/server/crudService";
import {
  MOCK_AMBULANCES,
  MOCK_DRONES,
  MOCK_HOSPITALS,
  MOCK_RESCUE_TEAMS,
  MOCK_ROADS,
  MOCK_SHELTERS,
} from "@/data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || undefined;
    const result = await getResources(type);

    return NextResponse.json({
      success: true,
      data: result.data,
      source: result.source,
      fallback: result.fallback,
      // Retain legacy structure for backward compatibility
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createResource(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
