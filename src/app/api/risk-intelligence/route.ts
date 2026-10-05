import { NextRequest, NextResponse } from "next/server";
import {
  getLiveDisasterIntelligence,
  explainRiskWithGemini,
} from "@/lib/disaster-data/services/riskAggregator";
import { AreaRiskAssessment } from "@/lib/disaster-data/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get("refresh") === "true";
    const simulationStage =
      (searchParams.get("stage") as "NORMAL" | "FLOOD_ACTIVE" | "ESCALATED") ||
      "FLOOD_ACTIVE";

    const payload = await getLiveDisasterIntelligence({
      forceRefresh,
      simulationStage,
    });

    return NextResponse.json({
      success: true,
      data: payload,
    });
  } catch (error) {
    console.error("[API Risk-Intelligence GET Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to assemble live disaster risk intelligence payload.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, assessment } = body as {
      action: "EXPLAIN_RISK";
      assessment: AreaRiskAssessment;
    };

    if (action === "EXPLAIN_RISK" && assessment) {
      const explanation = await explainRiskWithGemini(assessment);
      return NextResponse.json({
        success: true,
        explanation,
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        areaName: assessment.areaName,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or parameters." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API Risk-Intelligence POST Error]", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate risk explanation." },
      { status: 500 }
    );
  }
}
