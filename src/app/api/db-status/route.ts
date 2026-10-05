import { NextResponse } from "next/server";
import {
  checkMongoConnection,
  getDatabaseMode,
  isMongoActive,
  isMongoConfigured,
} from "@/lib/mongodb";

export async function GET() {
  const mode = getDatabaseMode();
  const configured = isMongoConfigured();

  if (mode === "mongodb" && configured) {
    const health = await checkMongoConnection();
    return NextResponse.json({
      success: true,
      mode: "mongodb",
      configured: true,
      connected: health.connected,
      latencyMs: health.latencyMs,
      error: health.error,
      fallbackToSimulation: !health.connected,
    });
  }

  return NextResponse.json({
    success: true,
    mode: mode,
    configured: configured,
    connected: false,
    fallbackToSimulation: true,
    message:
      mode === "local"
        ? "Running in deterministic local simulation mode"
        : "MongoDB URI not configured; running in simulation fallback mode",
  });
}
