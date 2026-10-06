import { NextRequest, NextResponse } from "next/server";
import { RiskAlertPayload } from "@/types";
import {
  executeRiskAlertWorkflow,
  getLastAlertTimestamp,
  getWorkflowIntegrationStatus,
} from "@/lib/server/n8nWorkflowEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const payload: RiskAlertPayload = {
      riskForecast: body.riskForecast || {
        forecastId: `fc-${Date.now()}`,
        hazardType: body.hazard || "FLOOD",
        forecastWindow: body.forecastWindow || "Next 24 hours",
        contributingFactors: body.contributingFactors || [
          "Heavy precipitation detected",
          "Water level embankment breach",
          "Population density exposure",
        ],
      },
      area: body.area || {
        id: "zone-a",
        name: body.areaName || "Zone A (Saidapet)",
        affectedPopulation: body.affectedPopulation || 1240,
      },
      severity: body.severity || (body.riskScore >= 75 ? "CRITICAL" : "HIGH"),
      riskScore:
        typeof body.riskScore === "number"
          ? body.riskScore
          : body.severity === "CRITICAL"
          ? 85
          : 68,
      commander: body.commander || {
        name: body.commanderName || "Cmdr Jaswant Karun",
        email: body.commanderEmail || "jksam37@gmail.com",
        role: "INCIDENT_COMMANDER",
      },
      timestamp: body.timestamp || new Date().toISOString(),
      simulationMode: body.simulationMode !== undefined ? body.simulationMode : false,
    };

    const result = await executeRiskAlertWorkflow(payload, {
      simulateUnavailable: body.simulateUnavailable,
    });

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[/api/automation/risk-alert POST Error]", message);
    return NextResponse.json(
      {
        success: false,
        error: message,
        safeguards: {
          requiresCommanderReview: true,
          emergencyExecutionStatus: "AWAITING_COMMANDER_APPROVAL",
        },
        integrationStatus: getWorkflowIntegrationStatus(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const status = getWorkflowIntegrationStatus();

  return NextResponse.json({
    success: true,
    workflow: "RESQNET Risk Alert",
    riskMonitor: status.riskMonitor,
    n8n: status.n8n,
    email: status.email,
    lastAlert: status.lastAlert || getLastAlertTimestamp(),
    safeguards: {
      criticalAlertsRequireReview: true,
      humanApprovalMandatory: true,
      policy:
        "For CRITICAL alerts: Require commander review before simulated emergency execution. The email may notify the commander, but emergency execution still requires human approval.",
    },
    schema: {
      riskForecast: "object",
      area: "object",
      severity: "CRITICAL | HIGH | MODERATE | LOW",
      riskScore: "number (0-100)",
      commander: "object",
      timestamp: "ISO8601 string",
      simulationMode: "boolean",
    },
  });
}
