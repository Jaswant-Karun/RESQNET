import { NextRequest, NextResponse } from "next/server";
import {
  createResponsePlan,
  getResponsePlans,
} from "@/lib/server/crudService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const incidentId = searchParams.get("incidentId") || undefined;
    const result = await getResponsePlans(incidentId);
    return NextResponse.json(result);
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
    const result = await createResponsePlan(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
