import { getDatabase, isMongoActive, COLLECTIONS } from "@/lib/mongodb";
import { AlertDocument } from "@/types";
import { Resend } from "resend";

export type RiskAlertLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export interface EmailAlertOptions {
  area: string;
  hazard?: string;
  riskScore: number;
  riskLevel: RiskAlertLevel;
  forecastWindow?: string;
  contributingFactors?: string[];
  recommendedAction?: string;
  incidentId?: string;
  commanderName?: string;
  commanderEmail?: string;
  isTest?: boolean;
}

export interface EmailAlertResult {
  success: boolean;
  status: "SENT" | "SKIPPED" | "DEDUPLICATED" | "FAILED";
  alertId?: string;
  messageId?: string;
  recipient?: string;
  deduplicated?: boolean;
  n8nTriggered?: boolean;
  message: string;
  error?: string;
  alertDoc?: AlertDocument;
}

interface DeduplicationRecord {
  timestamp: number;
}

const alertDeduplicationCache = new Map<string, DeduplicationRecord>();

function getRequiredEnv(name: string): string {
  return process.env[name]?.trim() || "";
}

function getCooldownMinutes(): number {
  const configured = Number.parseInt(process.env.ALERT_COOLDOWN_MINUTES || "10", 10);
  return Number.isFinite(configured) && configured > 0 ? configured : 10;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] || character
  );
}

function buildEmailContent(options: Required<
  Pick<
    EmailAlertOptions,
    | "area"
    | "hazard"
    | "riskScore"
    | "riskLevel"
    | "forecastWindow"
    | "contributingFactors"
    | "recommendedAction"
    | "commanderName"
  >
>): { subject: string; text: string; html: string } {
  const {
    area,
    hazard,
    riskScore,
    riskLevel,
    forecastWindow,
    contributingFactors,
    recommendedAction,
    commanderName,
  } = options;
  const subject = `[RESQNET ${riskLevel} ALERT] ${hazard} Risk Detected — ${area}`;
  const appUrl = process.env.APP_URL?.trim();
  const dashboardUrl = appUrl ? `${appUrl.replace(/\/$/, "")}/dashboard` : "/dashboard";
  const factorsText = contributingFactors.map((factor) => `- ${factor}`).join("\n");
  const text = `RESQNET EMERGENCY ALERT

Commander:
${commanderName}

Hazard:
${hazard}

Area:
${area}

Risk:
${riskLevel}

Risk Score:
${riskScore}/100

Forecast:
${forecastWindow}

Contributing Factors:
${factorsText}

Recommended Action:
${recommendedAction}

Dashboard:
[Open RESQNET] (${dashboardUrl})

Important:
This is an AI-assisted risk assessment and not an official emergency warning.`;

  const factorsHtml = contributingFactors
    .map((factor) => `<li>${escapeHtml(factor)}</li>`)
    .join("");
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#172033">
      <h1>RESQNET EMERGENCY ALERT</h1>
      <p><strong>${escapeHtml(riskLevel)} — ${escapeHtml(hazard)} Risk Detected</strong></p>
      <table>
        <tr><td><strong>Commander:</strong></td><td>${escapeHtml(commanderName)}</td></tr>
        <tr><td><strong>Area:</strong></td><td>${escapeHtml(area)}</td></tr>
        <tr><td><strong>Risk:</strong></td><td>${escapeHtml(riskLevel)} (${riskScore}/100)</td></tr>
        <tr><td><strong>Forecast:</strong></td><td>${escapeHtml(forecastWindow)}</td></tr>
      </table>
      <h3>Contributing Factors</h3>
      <ul>${factorsHtml}</ul>
      <h3>Recommended Action</h3>
      <p>${escapeHtml(recommendedAction)}</p>
      <p><a href="${escapeHtml(dashboardUrl)}">Open RESQNET</a></p>
      <hr />
      <small>This is an AI-assisted risk assessment and not an official emergency warning.</small>
    </div>`;

  return { subject, text, html };
}

async function updateAlertStatus(
  alertId: string,
  status: "SENT" | "FAILED",
  fields: Pick<AlertDocument, "messageId" | "errorMessage" | "provider">
): Promise<void> {
  if (!isMongoActive()) return;
  const db = await getDatabase();
  await db.collection<AlertDocument>(COLLECTIONS.ALERTS).updateOne(
    { alertId },
    {
      $set: {
        status,
        ...fields,
        updatedAt: new Date().toISOString(),
      },
    }
  );
}

async function notifyN8n(options: {
  alertId: string;
  area: string;
  hazard: string;
  riskScore: number;
  recipient: string;
  messageId?: string;
}): Promise<boolean> {
  const webhookUrl =
    process.env.N8N_ALERT_WEBHOOK_URL?.trim() || process.env.N8N_WEBHOOK_URL?.trim();
  if (!webhookUrl) return false;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "CRITICAL_RISK_EMAIL_ALERT_SENT",
        ...options,
        riskLevel: "CRITICAL",
        requiresCommanderAction: true,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });
    return response.ok;
  } catch (error) {
    console.warn("[EmailAlertService] n8n notification failed:", error);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Sends HIGH and CRITICAL alerts through Resend.
 * The Resend API key is only read on the server and is never returned to clients.
 */
export async function sendEmergencyEmailAlert(
  options: EmailAlertOptions
): Promise<EmailAlertResult> {
  const riskLevel = options.riskLevel;
  if (riskLevel === "LOW" || riskLevel === "MODERATE") {
    return {
      success: true,
      status: "SKIPPED",
      message:
        riskLevel === "LOW"
          ? "LOW risk level detected: No email alert required."
          : "MODERATE risk level detected: Dashboard notification only.",
    };
  }

  const area = options.area.trim();
  const hazard = options.hazard?.trim() || "Flood";
  const recipient = options.commanderEmail?.trim() || getRequiredEnv("COMMANDER_ALERT_EMAIL");
  const commanderName = options.commanderName?.trim() || "Cmdr Jaswant Karun";
  const cooldownMinutes = getCooldownMinutes();
  const cooldownMs = cooldownMinutes * 60 * 1000;
  const now = Date.now();
  const cacheKey = `${area.toUpperCase()}_${riskLevel}`;

  if (!options.isTest) {
    const cached = alertDeduplicationCache.get(cacheKey);
    if (cached && now - cached.timestamp < cooldownMs) {
      return {
        success: true,
        status: "DEDUPLICATED",
        deduplicated: true,
        recipient,
        message: `Duplicate ${riskLevel} alert for ${area} suppressed during the ${cooldownMinutes}-minute cooldown.`,
      };
    }

    if (isMongoActive()) {
      try {
        const db = await getDatabase();
        const existing = await db.collection<AlertDocument>(COLLECTIONS.ALERTS).findOne({
          area,
          riskLevel,
          channel: "EMAIL",
          status: { $in: ["PENDING", "SENT"] },
          sentAt: { $gte: new Date(now - cooldownMs).toISOString() },
        });
        if (existing) {
          alertDeduplicationCache.set(cacheKey, {
            timestamp: new Date(existing.sentAt).getTime(),
          });
          return {
            success: true,
            status: "DEDUPLICATED",
            deduplicated: true,
            recipient,
            message: `Duplicate ${riskLevel} alert for ${area} suppressed from recent alert history.`,
          };
        }
      } catch (error) {
        console.warn("[EmailAlertService] MongoDB deduplication check failed:", error);
      }
    }
  }

  const alertId = `alt-email-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const content = buildEmailContent({
    area,
    hazard,
    riskScore: options.riskScore,
    riskLevel,
    forecastWindow: options.forecastWindow || "Next 24 hours",
    contributingFactors: options.contributingFactors || [
      "Heavy rainfall",
      "High precipitation probability",
      "Population exposure",
      "Existing flood conditions",
    ],
    recommendedAction: options.recommendedAction || "Review evacuation response plan.",
    commanderName,
  });
  const alertDoc: AlertDocument = {
    alertId,
    incidentId: options.incidentId || "FL-902",
    type: options.isTest ? "COMMANDER_TEST_ALERT" : "EMERGENCY_RISK_ALERT",
    severity: riskLevel,
    recipient,
    channel: "EMAIL",
    status: "PENDING",
    sentAt: new Date(now).toISOString(),
    subject: content.subject,
    content: content.text,
    area,
    riskScore: options.riskScore,
    riskLevel,
    hazard,
    provider: "RESEND",
  };

  if (isMongoActive()) {
    try {
      const db = await getDatabase();
      await db.collection<AlertDocument>(COLLECTIONS.ALERTS).insertOne(alertDoc);
    } catch (error) {
      console.error("[EmailAlertService] Failed to record PENDING email attempt:", error);
    }
  }

  const apiKey = getRequiredEnv("RESEND_API_KEY");
  const from = getRequiredEnv("ALERT_FROM_EMAIL");
  let messageId: string | undefined;
  let errorMessage: string | undefined;

  if (!apiKey || !from || !recipient) {
    errorMessage =
      "RESEND_API_KEY, ALERT_FROM_EMAIL, and COMMANDER_ALERT_EMAIL must be configured.";
  } else {
    try {
      const resend = new Resend(apiKey);
      const result = await resend.emails.send({
        from,
        to: [recipient],
        subject: content.subject,
        text: content.text,
        html: content.html,
      });
      if (result.error) {
        errorMessage = result.error.message;
      } else {
        messageId = result.data?.id;
      }
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
    }
  }

  const dispatchSuccess = Boolean(messageId);
  const finalStatus = dispatchSuccess ? "SENT" : "FAILED";
  alertDoc.status = finalStatus;
  alertDoc.messageId = messageId;
  alertDoc.errorMessage = errorMessage;

  try {
    await updateAlertStatus(alertId, finalStatus, {
      messageId,
      errorMessage,
      provider: "RESEND",
    });
  } catch (error) {
    console.error("[EmailAlertService] Failed to update email attempt status:", error);
  }

  if (dispatchSuccess && !options.isTest) {
    alertDeduplicationCache.set(cacheKey, { timestamp: now });
  }

  const n8nTriggered =
    riskLevel === "CRITICAL" && dispatchSuccess
      ? await notifyN8n({
          alertId,
          area,
          hazard,
          riskScore: options.riskScore,
          recipient,
          messageId,
        })
      : false;

  return dispatchSuccess
    ? {
        success: true,
        status: "SENT",
        alertId,
        messageId,
        recipient,
        n8nTriggered,
        message: `Emergency alert email sent to ${recipient} via Resend.`,
        alertDoc,
      }
    : {
        success: false,
        status: "FAILED",
        alertId,
        recipient,
        message: "Emergency alert email failed to send.",
        error: errorMessage,
        alertDoc,
      };
}
