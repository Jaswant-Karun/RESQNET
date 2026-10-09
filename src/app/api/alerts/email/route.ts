import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/server/auth";
import { sendEmergencyEmailAlert, EmailAlertOptions } from "@/lib/server/emailAlertService";
import { getDatabase, isMongoActive } from "@/lib/mongodb";
import { AlertDocument } from "@/types";

let activeTargetEmailMemory: string | null = null;

async function getActiveCommanderEmail(): Promise<string> {
  if (activeTargetEmailMemory && activeTargetEmailMemory.includes("@")) {
    return activeTargetEmailMemory;
  }
  if (isMongoActive()) {
    try {
      const db = await getDatabase();
      const setting = await db.collection("settings").findOne({ key: "COMMANDER_TARGET_EMAIL" });
      if (setting && typeof setting.value === "string" && setting.value.includes("@")) {
        activeTargetEmailMemory = setting.value.trim();
        return activeTargetEmailMemory;
      }
    } catch (e) {
      console.warn("[API /api/alerts/email] Failed to read target email from DB settings:", e);
    }
  }
  return process.env.COMMANDER_ALERT_EMAIL?.trim() || "";
}

async function setActiveCommanderEmail(email: string): Promise<void> {
  const sanitized = email.trim();
  activeTargetEmailMemory = sanitized;
  if (isMongoActive()) {
    try {
      const db = await getDatabase();
      await db.collection("settings").updateOne(
        { key: "COMMANDER_TARGET_EMAIL" },
        { $set: { key: "COMMANDER_TARGET_EMAIL", value: sanitized, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
    } catch (e) {
      console.warn("[API /api/alerts/email] Failed to save target email to DB settings:", e);
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session || session.role !== "COMMANDER") {
      return NextResponse.json({ success: false, error: "Commander authentication required." }, { status: 401 });
    }

    const isConfigured = Boolean(
      process.env.RESEND_API_KEY?.trim() &&
        process.env.ALERT_FROM_EMAIL?.trim() &&
        (await getActiveCommanderEmail())
    );
    const alertRecipient = await getActiveCommanderEmail();
    const cooldownMin = Number.parseInt(process.env.ALERT_COOLDOWN_MINUTES || "10", 10);

    // Fetch recent email alerts from MongoDB if active
    let recentAlerts: AlertDocument[] = [];
    if (isMongoActive()) {
      try {
        const db = await getDatabase();
        recentAlerts = await db
          .collection<AlertDocument>("alerts")
          .find({ channel: "EMAIL" })
          .sort({ sentAt: -1 })
          .limit(10)
          .toArray();
      } catch (err) {
        console.warn("[API /api/alerts/email] MongoDB query warning:", err);
      }
    }

    return NextResponse.json({
      success: true,
      provider: "Resend",
      configured: isConfigured,
      resendConfigured: isConfigured,
      alertFromEmail: process.env.ALERT_FROM_EMAIL || "",
      commanderAlertEmail: alertRecipient,
      cooldownMinutes: cooldownMin,
      recentAlerts,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== "COMMANDER") {
      return NextResponse.json(
        { success: false, error: "Only authenticated COMMANDER can update the alert target email." },
        { status: 403 }
      );
    }

    const targetEmail = (body.targetEmail || body.commanderEmail || "").trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid target recipient email address is required." },
        { status: 400 }
      );
    }

    await setActiveCommanderEmail(targetEmail);

    return NextResponse.json({
      success: true,
      commanderAlertEmail: targetEmail,
      message: `Active alert target recipient updated to ${targetEmail}. All future alerts will be routed here.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== "COMMANDER") {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Only authenticated COMMANDER can send email alerts.",
        },
        { status: 401 }
      );
    }

    const activeRecipient = await getActiveCommanderEmail();

    const options: EmailAlertOptions = {
      area: body.area || "Zone A",
      hazard: body.hazard || "Flood",
      riskScore: typeof body.riskScore === "number" ? body.riskScore : 82,
      riskLevel: body.riskLevel || (body.riskScore >= 75 ? "CRITICAL" : "HIGH"),
      forecastWindow: body.forecastWindow || "Next 24 hours",
      contributingFactors: Array.isArray(body.contributingFactors)
        ? body.contributingFactors
        : [
            "Heavy rainfall",
            "High precipitation probability",
            "Population exposure",
            "Existing flood conditions",
          ],
      recommendedAction:
        body.recommendedAction || "Review evacuation response plan.",
      incidentId: body.incidentId || "FL-902",
      commanderName: session.name,
      commanderEmail: activeRecipient || session.email,
      isTest: Boolean(body.isTest),
    };

    const result = await sendEmergencyEmailAlert(options);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
