import { getDatabase, isMongoActive, COLLECTIONS } from "@/lib/mongodb";
import { AlertDocument } from "@/types";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

/**
 * Dynamically read environment variables from .env.local if present,
 * ensuring immediate updates without requiring a dev server restart.
 */
function getDynamicEnv(key: string, defaultValue = ""): string {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const regex = new RegExp(`^${key}\\s*=\\s*(.+)$`, "m");
      const match = content.match(regex);
      if (match && match[1]) {
        return match[1].trim().replace(/^['"]|['"]$/g, "");
      }
    }
  } catch {}
  return process.env[key] || defaultValue;
}

async function sendViaNodemailer(
  recipient: string,
  subject: string,
  text: string,
  html: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const host = getDynamicEnv("SMTP_HOST", "smtp.gmail.com");
  const port = parseInt(getDynamicEnv("SMTP_PORT", "465"), 10);
  const secure = getDynamicEnv("SMTP_SECURE", "true") !== "false";
  const user = getDynamicEnv("SMTP_USER");
  const pass = getDynamicEnv("SMTP_PASS");

  if (!user || !pass) {
    return { success: false, error: "SMTP credentials (SMTP_USER / SMTP_PASS) not configured." };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const from = getDynamicEnv("ALERT_FROM_EMAIL", `RESQNET Emergency Command <${user}>`);
  const info = await transporter.sendMail({
    from,
    to: recipient,
    subject,
    text,
    html,
  });

  return { success: true, messageId: info.messageId };
}

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

// In-memory cache for fast deduplication (resilient when DB is offline or local)
interface DeduplicationRecord {
  timestamp: number;
  riskLevel: RiskAlertLevel;
}
const alertDeduplicationCache = new Map<string, DeduplicationRecord>();

/**
 * RESQNET Emergency Email Alert Service
 * 
 * Rules:
 * - LOW: No email
 * - MODERATE: Dashboard notification only (no email)
 * - HIGH: Commander email notification
 * - CRITICAL: Commander email notification + n8n automation notification
 */
export async function sendEmergencyEmailAlert(
  options: EmailAlertOptions
): Promise<EmailAlertResult> {
  const {
    area,
    hazard = "Flood",
    riskScore,
    riskLevel,
    forecastWindow = "Next 24 hours",
    contributingFactors = [
      "Heavy rainfall",
      "High precipitation probability",
      "Population exposure",
      "Existing flood conditions",
    ],
    recommendedAction = "Review evacuation response plan.",
    incidentId = "FL-902",
    commanderName = "Cmdr Jaswant Karun",
    commanderEmail = process.env.COMMANDER_ALERT_EMAIL || "jaswant@resqnet.gov.in",
    isTest = false,
  } = options;

  // 1. Evaluate Alert Level
  if (riskLevel === "LOW") {
    return {
      success: true,
      status: "SKIPPED",
      message: "LOW risk level detected: No email alert required by protocol.",
    };
  }

  if (riskLevel === "MODERATE") {
    return {
      success: true,
      status: "SKIPPED",
      message: "MODERATE risk level detected: Dashboard notification only. No email alert required.",
    };
  }

  // Cooldown window in milliseconds (default: 10 minutes)
  const cooldownMinutes = parseInt(process.env.ALERT_COOLDOWN_MINUTES || "10", 10);
  const cooldownMs = cooldownMinutes * 60 * 1000;
  const now = Date.now();
  const cacheKey = `${area.toUpperCase()}_${riskLevel}`;

  // 2. Alert Deduplication Check
  if (!isTest) {
    // Check in-memory cache
    const cached = alertDeduplicationCache.get(cacheKey);
    if (cached && now - cached.timestamp < cooldownMs) {
      const remainingSec = Math.ceil((cooldownMs - (now - cached.timestamp)) / 1000);
      return {
        success: true,
        status: "DEDUPLICATED",
        deduplicated: true,
        message: `Alert deduplicated. A ${riskLevel} alert for ${area} was already dispatched within the ${cooldownMinutes}-minute cooldown window (${remainingSec}s remaining).`,
      };
    }

    // Check MongoDB for recent alerts if active
    if (isMongoActive()) {
      try {
        const db = await getDatabase();
        const sinceIso = new Date(now - cooldownMs).toISOString();
        const existing = await db.collection<AlertDocument>(COLLECTIONS.ALERTS).findOne({
          area,
          riskLevel,
          channel: "EMAIL",
          status: "SENT",
          sentAt: { $gte: sinceIso },
        });

        if (existing) {
          alertDeduplicationCache.set(cacheKey, {
            timestamp: new Date(existing.sentAt).getTime(),
            riskLevel,
          });
          return {
            success: true,
            status: "DEDUPLICATED",
            deduplicated: true,
            message: `Alert deduplicated from database history. A recent ${riskLevel} alert was sent at ${existing.sentAt}.`,
          };
        }
      } catch (dbErr) {
        console.warn("[EmailAlertService] MongoDB deduplication check skipped:", dbErr);
      }
    }
  }

  // 3. Prepare Email Details
  const alertId = `alt-email-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const subject = `[RESQNET ${riskLevel} ALERT] ${hazard} Risk Detected — ${area}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardUrl = `${appUrl}/dashboard`;

  const factorsFormatted = contributingFactors
    .map((f) => `- ${f}`)
    .join("\n");

  const plainTextContent = `RESQNET EMERGENCY ALERT

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
${factorsFormatted}

Recommended Action:
${recommendedAction}

Dashboard:
[Open RESQNET] (${dashboardUrl})

Important:
This is an AI-assisted risk assessment and not an official emergency warning.
`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050811; color: #f1f5f9; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, ${riskLevel === "CRITICAL" ? "#7f1d1d" : "#7c2d12"}, #0b1120); padding: 24px; border-bottom: 2px solid ${riskLevel === "CRITICAL" ? "#ef4444" : "#f97316"}; }
    .badge { display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 800; border-radius: 6px; text-transform: uppercase; background-color: ${riskLevel === "CRITICAL" ? "#dc2626" : "#ea580c"}; color: #ffffff; letter-spacing: 0.05em; font-family: monospace; }
    .title { font-size: 20px; font-weight: 900; margin: 12px 0 4px 0; color: #ffffff; letter-spacing: 0.05em; text-transform: uppercase; }
    .subtitle { font-size: 12px; color: #94a3b8; font-family: monospace; margin: 0; }
    .content { padding: 24px; }
    .grid { display: table; width: 100%; margin: 16px 0; border-collapse: collapse; }
    .grid-row { display: table-row; }
    .grid-cell { display: table-cell; padding: 10px; border-bottom: 1px solid #1e293b; font-size: 13px; }
    .grid-label { color: #94a3b8; font-family: monospace; text-transform: uppercase; font-size: 11px; width: 35%; }
    .grid-val { color: #f8fafc; font-weight: 700; }
    .factors-box { background-color: #080d1a; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; margin: 16px 0; }
    .factors-title { font-size: 11px; font-family: monospace; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; font-weight: 700; }
    .factors-list { margin: 0; padding-left: 20px; font-size: 13px; color: #cbd5e1; }
    .factors-list li { margin-bottom: 4px; }
    .action-box { background: rgba(220, 38, 38, 0.1); border-left: 4px solid ${riskLevel === "CRITICAL" ? "#ef4444" : "#f97316"}; padding: 14px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #dc2626, #b91c1c); color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 800; font-size: 13px; font-family: monospace; letter-spacing: 0.05em; text-transform: uppercase; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4); }
    .disclaimer { border-top: 1px solid #1e293b; padding: 18px 24px; font-size: 11px; color: #64748b; line-height: 1.5; font-family: monospace; background-color: #070b14; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">${riskLevel} ALERT • ${riskScore}/100</div>
      <div class="title">RESQNET EMERGENCY ALERT</div>
      <div class="subtitle">EOC Central Command — Priority Dispatch to Commander</div>
    </div>
    <div class="content">
      <table class="grid">
        <tr class="grid-row">
          <td class="grid-cell grid-label">Commander</td>
          <td class="grid-cell grid-val">${commanderName}</td>
        </tr>
        <tr class="grid-row">
          <td class="grid-cell grid-label">Hazard</td>
          <td class="grid-cell grid-val">${hazard}</td>
        </tr>
        <tr class="grid-row">
          <td class="grid-cell grid-label">Area</td>
          <td class="grid-cell grid-val">${area}</td>
        </tr>
        <tr class="grid-row">
          <td class="grid-cell grid-label">Risk Level</td>
          <td class="grid-cell grid-val" style="color: ${riskLevel === "CRITICAL" ? "#ef4444" : "#f97316"};">${riskLevel} (${riskScore}/100)</td>
        </tr>
        <tr class="grid-row">
          <td class="grid-cell grid-label">Forecast Window</td>
          <td class="grid-cell grid-val">${forecastWindow}</td>
        </tr>
      </table>

      <div class="factors-box">
        <div class="factors-title">Contributing Factors:</div>
        <ul class="factors-list">
          ${contributingFactors.map((f) => `<li>${f}</li>`).join("")}
        </ul>
      </div>

      <div class="action-box">
        <div style="font-size: 11px; font-family: monospace; color: #fca5a5; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Recommended Action:</div>
        <div style="font-size: 13px; font-weight: 700; color: #f8fafc;">${recommendedAction}</div>
      </div>

      <div class="btn-container">
        <a href="${dashboardUrl}" class="btn">Open RESQNET</a>
      </div>
    </div>
    <div class="disclaimer">
      <strong>Important:</strong> This is an AI-assisted risk assessment and not an official emergency warning. All operational deployments require human-in-the-loop commander clearance.
    </div>
  </div>
</body>
</html>
`;

  // 4. Initial Alert Document (Status: PENDING)
  const alertDoc: AlertDocument = {
    alertId,
    incidentId,
    type: isTest ? "COMMANDER_TEST_ALERT" : "EMERGENCY_RISK_ALERT",
    severity: riskLevel,
    recipient: commanderEmail,
    channel: "EMAIL",
    status: "PENDING",
    sentAt: new Date().toISOString(),
    subject,
    content: plainTextContent,
    area,
    riskScore,
    riskLevel,
    hazard,
    provider: "RESEND",
  };

  // Save PENDING attempt to MongoDB if available
  if (isMongoActive()) {
    try {
      const db = await getDatabase();
      await db.collection<AlertDocument>(COLLECTIONS.ALERTS).insertOne(alertDoc);
    } catch (dbErr) {
      console.warn("[EmailAlertService] MongoDB PENDING save warning:", dbErr);
    }
  }

  // 5. Dispatch via SMTP (Gmail/Custom) or Resend HTTP API
  const resendApiKey = process.env.RESEND_API_KEY;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.ALERT_FROM_EMAIL || "RESQNET Emergency Command <onboarding@resend.dev>";
  
  let messageId: string | undefined;
  let dispatchSuccess = false;
  let errorMessage: string | undefined;
  let activeProvider = "RESEND";

  // Provider Option A: Direct SMTP (Gmail/Any SMTP) - Sends to ANY email with NO domain verification needed
  if (smtpUser && smtpPass) {
    try {
      const smtpRes = await sendViaNodemailer(commanderEmail, subject, plainTextContent, htmlContent);
      if (smtpRes.success) {
        messageId = smtpRes.messageId;
        dispatchSuccess = true;
        activeProvider = "SMTP";
      } else {
        errorMessage = smtpRes.error;
      }
    } catch (smtpErr) {
      errorMessage = smtpErr instanceof Error ? smtpErr.message : String(smtpErr);
      console.warn("[EmailAlertService] SMTP dispatch failed, attempting Resend fallback:", errorMessage);
    }
  }

  // Provider Option B: Resend HTTP API
  if (!dispatchSuccess && resendApiKey) {
    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [commanderEmail],
          subject,
          text: plainTextContent,
          html: htmlContent,
        }),
      });

      const resendData = await resendRes.json();

      if (resendRes.ok) {
        messageId = resendData.id;
        dispatchSuccess = true;
        activeProvider = "RESEND";
      } else {
        errorMessage = resendData.message || resendData.error || `HTTP ${resendRes.status}`;
        console.error("[EmailAlertService] Resend API error:", errorMessage);

        // Friendly handling for Resend's free tier domain restriction
        if (errorMessage && errorMessage.includes("You can only send testing emails to your own email address")) {
          errorMessage = `Resend Domain Restriction: Free testing tier only permits delivering to your registered Resend account email. To deliver directly to '${commanderEmail}', either: 1) Verify your domain at resend.com/domains, or 2) Add Gmail SMTP (SMTP_USER & SMTP_PASS) in .env.local to send to any recipient without domain verification.`;
        }
      }
    } catch (fetchErr) {
      errorMessage = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      console.error("[EmailAlertService] Resend fetch failed:", errorMessage);
    }
  }

  // Provider Option C: Graceful simulation fallback when neither live provider is configured
  if (!dispatchSuccess && !resendApiKey && (!smtpUser || !smtpPass)) {
    messageId = `msg-sim-${Date.now().toString(36)}`;
    dispatchSuccess = true;
    activeProvider = "RESEND_SIMULATED";
    console.info(
      `[EmailAlertService] Live email credentials not configured. Dispatched simulated alert to ${commanderEmail}: "${subject}"`
    );
  }

  // 6. Update Status (SENT or FAILED) in MongoDB and Deduplication Cache
  const finalStatus = dispatchSuccess ? "SENT" : "FAILED";
  alertDoc.status = finalStatus;
  alertDoc.messageId = messageId;
  alertDoc.errorMessage = errorMessage;
  alertDoc.provider = activeProvider;

  if (isMongoActive()) {
    try {
      const db = await getDatabase();
      await db.collection<AlertDocument>(COLLECTIONS.ALERTS).updateOne(
        { alertId },
        {
          $set: {
            status: finalStatus,
            messageId,
            errorMessage,
            provider: alertDoc.provider,
            updatedAt: new Date().toISOString(),
          },
        }
      );
    } catch (dbErr) {
      console.warn("[EmailAlertService] MongoDB status update warning:", dbErr);
    }
  }

  if (dispatchSuccess && !isTest) {
    alertDeduplicationCache.set(cacheKey, {
      timestamp: now,
      riskLevel,
    });
  }

  // 7. Optional CRITICAL rule: Trigger n8n automation notification
  let n8nTriggered = false;
  if (riskLevel === "CRITICAL" && dispatchSuccess) {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      try {
        await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "CRITICAL_RISK_EMAIL_ALERT_SENT",
            alertId,
            area,
            hazard,
            riskScore,
            riskLevel,
            recipient: commanderEmail,
            messageId,
            requiresCommanderAction: true,
            timestamp: new Date().toISOString(),
          }),
        });
        n8nTriggered = true;
      } catch (n8nErr) {
        console.warn("[EmailAlertService] n8n trigger notification warning:", n8nErr);
      }
    }
  }

  if (dispatchSuccess) {
    return {
      success: true,
      status: "SENT",
      alertId,
      messageId,
      recipient: commanderEmail,
      n8nTriggered,
      message: resendApiKey
        ? `Emergency alert email delivered to ${commanderEmail} via Resend.`
        : `Emergency alert simulated to ${commanderEmail} (Configure RESEND_API_KEY for live delivery).`,
      alertDoc,
    };
  } else {
    return {
      success: false,
      status: "FAILED",
      alertId,
      recipient: commanderEmail,
      message: `Failed to dispatch email alert: ${errorMessage}`,
      error: errorMessage,
      alertDoc,
    };
  }
}
