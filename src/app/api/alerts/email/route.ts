import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/server/auth";
import { sendEmergencyEmailAlert, EmailAlertOptions } from "@/lib/server/emailAlertService";
import { getDatabase, isMongoActive, COLLECTIONS } from "@/lib/mongodb";
import { AlertDocument } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const resendConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.length > 5);
    const smtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
    const activeProvider = smtpConfigured ? "SMTP (Gmail/Custom)" : resendConfigured ? "Resend" : "Simulation";

    return NextResponse.json({
      success: true,
      provider: activeProvider,
      configured: resendConfigured || smtpConfigured,
      smtpConfigured,
      resendConfigured,
      alertFromEmail: alertFrom,
      commanderAlertEmail: alertRecipient,
      cooldownMinutes: cooldownMin,
      recentAlerts,
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

    // Safety guardrail: Only authenticated COMMANDER can use test alert button
    if (body.isTest) {
      if (!session || session.role !== "COMMANDER") {
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required. Only authenticated COMMANDER can use SEND TEST ALERT.",
          },
          { status: 403 }
        );
      }
    }

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
      commanderName: session?.name || body.commanderName || "Cmdr Jaswant Karun",
      commanderEmail:
        body.commanderEmail?.trim() ||
        process.env.COMMANDER_ALERT_EMAIL ||
        session?.email ||
        "jksam37@gmail.com",
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
