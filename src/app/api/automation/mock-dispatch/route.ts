import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetService = body.service || "EMERGENCY_DISPATCH_CAD";
    const timestamp = new Date().toISOString();

    return NextResponse.json({
      success: true,
      simulated: true,
      service: targetService,
      status: "DISPATCH_ORDER_LOGGED",
      timestamp,
      referenceId: `SIM-DISPATCH-${Date.now().toString(36).toUpperCase()}`,
      disclaimer:
        "PROTOTYPE TEST ENVIRONMENT: External real emergency systems are NOT connected. This is an authorized simulation test stub.",
      receivedPayload: body,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Mock dispatch failed", details: err?.message },
      { status: 500 }
    );
  }
}
