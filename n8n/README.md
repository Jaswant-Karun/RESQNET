# RESQNET × n8n Workflow Orchestration Layer

## 1. Architectural Philosophy

```text
+------------------------------------------------------------------------+
|                              RESQNET                                   |
|                Decides WHAT should happen (Application Layer)          |
|                                                                        |
|  - Real-time Incident State & Geo-spatial Map                          |
|  - Gemini AI & Deterministic Response Plan Synthesis                  |
|  - Fleet Inventory (Ambulances, Rescue Teams, UAVs)                    |
|  - Commander Clearance & Authorization Safeguards                      |
+-----------------------------------+------------------------------------+
                                    |
                                    | POST /api/automation/trigger
                                    | (JSON payload with simulationMode: true)
                                    v
+------------------------------------------------------------------------+
|                                n8n                                     |
|             Coordinates HOW workflows execute (Orchestrator)           |
|                                                                        |
|  - Multi-agency Workflow Orchestration & Branching                    |
|  - Automated Validation, Severity Routing & Logic Gates               |
|  - Multi-Service Dispatch Sequencing (Ambulance, Rescue, Drone)        |
|  - Human Approval Checkpoints & Notifications                         |
|  - Prototype Mock Endpoint Callbacks & Audit Logging                  |
+-----------------------------------+------------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                       |                       |
            v                       v                       v
     [Mock 108 EMS CAD]     [Mock SDRF Boats]       [Mock Public Alert]
```

> **IMPORTANT HACKATHON DISCLAIMER**:  
> For this prototype, external real emergency 911/108 services, public sirens, and government emergency alert systems (EAS/CAP) are **NOT** connected to live dispatch channels. All emergency service triggers dispatch to mock endpoints (`/api/automation/mock-dispatch`) or run via simulated state transitions.

---

## 2. Included n8n Workflows

All workflow definitions are ready to import directly into your n8n canvas:

| File | Workflow Name | Description |
| --- | --- | --- |
| `workflow-1-incident-intake.json` | **WORKFLOW 1: Incident Intake** | `Webhook` → `Validate Incident` → `Create/Update Incident` → `Analyze Severity` → `Branch` |
| `workflow-2-critical-response.json` | **WORKFLOW 2: Critical Response** | `Incident` → `Check Severity` → `If CRITICAL` → `Request Human Approval` → `If Approved` → `Allocate Resources` → `Trigger Ambulance Workflow` → `Trigger Rescue Team Workflow` → `Trigger Drone Workflow` → `Update RESQNET` |
| `workflow-3-drone-deployment.json` | **WORKFLOW 3: Drone Deployment** | `Drone Request` → `Check Available Drones` → `Select Available Drone` → `Create Mission` → `Update Mission Status` → `Return Result` |
| `workflow-4-emergency-alert.json` | **WORKFLOW 4: Emergency Alert** | `Critical Incident` → `Generate Alert` → `Human Approval` → `Publish/Simulate Alert` → `Log Alert` |
| `workflow-5-live-risk-monitor.json` | **Live Risk Monitor** | `Schedule Trigger` → `Fetch live risk data` → `Normalize data` → `Calculate/check risk` → `HIGH/CRITICAL?` → persist, notify, email, approval, and activity logging |
| `workflow-6-email-alert.json` | **Email Alert** | Validates HIGH/CRITICAL alerts, delegates delivery to the server-side RESQNET email API, and records the alert |
| `workflow-7-escalation-reassessment.json` | **Escalation Reassessment** | Compares state, identifies changed factors, invokes the RESQNET response engine, requests approval, and gates simulated execution |
| `workflow-8-activity-logger.json` | **Activity Logger** | Normalizes and persists workflow events through `/api/activity` |
| `workflow-master-orchestration.json` | **Legacy Master Workflow Orchestrator** | Existing combined prototype workflow retained for reference; use workflows 1-8 for the final architecture. |

### Workflow 6: Email Alert Flow & Safeguard Protocol

```text
Webhook
   ↓
Validate alert
   ↓
Send email via RESQNET
   ↓
Create alert log in RESQNET
   ↓
Return status
```

**Payload Schema:**

```json
{
  "riskForecast": {
    "forecastId": "fc-001",
    "hazardType": "FLOOD",
    "forecastWindow": "Next 24 hours",
    "contributingFactors": ["Severe precipitation", "River breach"]
  },
  "area": {
    "id": "zone-a",
    "name": "Zone A (Saidapet)",
    "affectedPopulation": 1240
  },
  "severity": "CRITICAL",
  "riskScore": 85,
  "commander": {
    "name": "Cmdr Jaswant Karun",
    "email": "jksam37@gmail.com",
    "role": "INCIDENT_COMMANDER"
  },
  "timestamp": "2026-10-06T13:30:00Z",
  "simulationMode": false
}
```

> **CRITICAL ALERT SAFEGUARD PROTOCOL**:  
> For **CRITICAL** alerts, the workflow mandates commander review before simulated emergency execution.  
> The email notifies the commander with complete situational context, but emergency execution strictly requires human approval. No automated irreversible execution occurs without human sign-off.

---

## 3. Configuration

The Live Risk Monitor and RESQNET risk engine use `N8N_ALERT_WEBHOOK_URL` to invoke
Workflow 6. RESQNET sends `N8N_WEBHOOK_SECRET` in the
`X-Resqnet-Webhook-Secret` header when invoking n8n. Configure the n8n webhook
authentication or an ingress policy to require that value. Workflow 6 uses
`N8N_ALERT_SHARED_SECRET` when it calls the protected RESQNET email endpoint.
Keep both values server-side.

In `.env.local` or `.env`:

```bash
# Example for local n8n instance:
N8N_ALERT_WEBHOOK_URL=http://localhost:5678/webhook/resqnet-risk-alert
N8N_ALERT_SHARED_SECRET=replace_with_a_long_random_secret

# Example for cloud-hosted n8n:
# N8N_ALERT_WEBHOOK_URL=https://n8n.your-domain.com/webhook/resqnet-risk-alert
```

### Clean Abstraction & Simulation Mode

- If `N8N_WEBHOOK_URL` is **unset, blank, or unreachable**, RESQNET does **not break**.
- The application automatically engages **high-fidelity local simulation mode**, displaying:

  ```text
  Automation: SIMULATION MODE
  ```

- All state transitions, branching rules, mock dispatch notices, and commander approvals continue to function smoothly.

---

## 4. API Endpoints

### `POST /api/automation/trigger`

Dispatches structured incident, response plan, and resource data to n8n.

**Request Payload:**

```json
{
  "incident": {
    "id": "inc-flood-01",
    "code": "FL-801-ADYAR",
    "severity": "CRITICAL",
    "title": "Adyar River Basin Severe Inundation",
    "primaryLocation": { "name": "Zone A (Saidapet Lowlands)" },
    "metrics": { "waterLevelMeters": 3.4 }
  },
  "responsePlan": {
    "id": "plan-flood-01",
    "humanApproved": false,
    "resourceAllocation": { "ambulances": 2, "rescueTeams": 2, "drones": 1 }
  },
  "resources": {
    "ambulances": [],
    "rescueTeams": [],
    "drones": []
  },
  "simulationMode": true,
  "action": "TRIGGER_FULL_ORCHESTRATION"
}
```

**Response Payload:**

```json
{
  "success": true,
  "mode": "SIMULATION",
  "workflowStatus": {
    "orchestrator": "RUNNING",
    "incidentIntake": "COMPLETED",
    "criticalResponse": "WAITING FOR APPROVAL",
    "droneWorkflow": "READY",
    "emergencyAlert": "PENDING APPROVAL",
    "lastTriggeredAt": "2026-10-04T07:15:00.000Z"
  }
}
```

---

## 5. How to Run n8n Locally (Quick Start)

If you wish to test with a live n8n instance:

```bash
# Option A: With Docker
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n

# Option B: With npx / npm
npx n8n
```

1. Open your browser to `http://localhost:5678`.
2. Click **Add workflow** -> **Import from File...**
3. Select `workflow-master-orchestration.json` (or any of workflows 1-4).
4. Click **Activate workflow**.
5. Ensure `N8N_WEBHOOK_URL=http://localhost:5678/webhook/resqnet-orchestrator` is set in `.env.local`.
6. Open RESQNET — the dashboard indicator will turn into **`n8n: RUNNING`**.
