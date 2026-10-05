/**
 * Verification Test Suite for RESQ AI Situation-Aware Emergency Operations Copilot
 */

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=================================================");
  console.log("       RESQ AI EMERGENCY COPILOT TEST SUITE       ");
  console.log("=================================================");

  // 1. Authenticate as Cmdr Jaswant Karun to obtain session cookie
  console.log("Authenticating as Cmdr Jaswant Karun...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "jaswant@resqnet.gov.in",
      password: "ResqNet2026!Commander",
    }),
  });

  const rawCookieHeader = loginRes.headers.get("set-cookie") || "";
  const sessionCookie = rawCookieHeader.split(";")[0] || "";
  console.log("Authenticated. Cookie:", sessionCookie.substring(0, 30) + "...\n");

  const sampleIncident = {
    id: "inc-flood-2026-08a",
    title: "Kotturpuram - Saidapet Embankment Corridor Breach",
    disasterType: "FLOOD",
    severity: "CRITICAL",
    status: "ACTIVE",
    zoneName: "Zone A - Riverfront Basin",
    metrics: {
      waterLevelMeters: 2.4,
      waterLevelTrend: "RISING",
      affectedPopulationEstimated: 1240,
    },
    blockedRoads: ["Road R1 - Causeway", "Road R3 - Canal Link"],
  };

  const sampleContext = {
    plan: {
      evacuationRoute: "Route R2 (Guindy-Velachery Highland Link)",
      targetShelter: "Shelter B (Capacity: 700)",
      approvalRequired: true,
      humanApproved: false,
      immediateActions: [
        "Evacuate Sector 7A flood plain via Route R2 to Shelter B",
        "Deploy 2x Swiftwater Zodiac boat squads",
        "Launch UAV Sentinel for corridor aerial reconnaissance",
      ],
    },
    resourceAllocation: {
      assigned: { ambulances: 2, rescueTeams: 2, drones: 1 },
      available: { ambulances: 6, rescueTeams: 4, drones: 2 },
    },
    simulationStage: "BASELINE",
    isActionApproved: false,
  };

  async function queryAi(question, simulateError = true) {
    const res = await fetch(`${BASE_URL}/api/ask-ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        question,
        incident: sampleIncident,
        context: sampleContext,
        simulateError,
      }),
    });
    return await res.json();
  }

  let passed = 0;
  let total = 0;

  function assert(testName, condition, detail = "") {
    total++;
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} - ${detail}`);
    }
  }

  // TEST 1: Special Command /status
  console.log("[TEST 1] Special Command /status...");
  const statusRes = await queryAi("/status");
  assert(
    "Returns formatted status report with Data used block",
    statusRes.answer?.includes("[COMMAND CENTER STATUS REPORT]") &&
      statusRes.answer?.includes("System: ONLINE") &&
      statusRes.answer?.includes("Data used:"),
    statusRes.answer
  );

  // TEST 2: Special Command /risk
  console.log("\n[TEST 2] Special Command /risk...");
  const riskRes = await queryAi("/risk");
  assert(
    "Returns live disaster risk assessment",
    riskRes.answer?.includes("[LIVE DISASTER RISK ASSESSMENT]") &&
      riskRes.answer?.includes("Highest-Risk Area:") &&
      riskRes.answer?.includes("Contributing Factors:"),
    riskRes.answer
  );

  // TEST 3: Special Command /resources
  console.log("\n[TEST 3] Special Command /resources...");
  const resRes = await queryAi("/resources");
  assert(
    "Returns fleet inventory breakdown",
    resRes.answer?.includes("[COMMAND CENTER FLEET INVENTORY]") &&
      resRes.answer?.includes("AMBULANCES") &&
      resRes.answer?.includes("RESCUE TEAMS") &&
      resRes.answer?.includes("DRONES"),
    resRes.answer
  );

  // TEST 4: Special Command /plan & Structured Response Plan
  console.log("\n[TEST 4] Special Command /plan (Structured Plan)...");
  const planRes = await queryAi("/plan");
  assert(
    "Structured plan has RISK, PRIORITY AREA, IMMEDIATE ACTIONS, RESOURCES, EVACUATION ROUTE, APPROVAL REQUIRED",
    planRes.answer?.includes("=== TACTICAL RESPONSE PLAN ===") &&
      planRes.answer?.includes("RISK:") &&
      planRes.answer?.includes("PRIORITY AREA:") &&
      planRes.answer?.includes("IMMEDIATE ACTIONS:") &&
      planRes.answer?.includes("RESOURCES:") &&
      planRes.answer?.includes("EVACUATION ROUTE:") &&
      planRes.answer?.includes("APPROVAL REQUIRED:"),
    planRes.answer
  );

  // TEST 5: Natural Language "Give me a response plan."
  console.log("\n[TEST 5] Natural Language: 'Give me a response plan.'...");
  const nlPlanRes = await queryAi("Give me a response plan.");
  assert(
    "NL request generates structured response plan",
    nlPlanRes.answer?.includes("RISK:") &&
      nlPlanRes.answer?.includes("PRIORITY AREA:") &&
      nlPlanRes.answer?.includes("EVACUATION ROUTE:") &&
      nlPlanRes.answer?.includes("APPROVAL REQUIRED:"),
    nlPlanRes.answer
  );

  // TEST 6: Suggested Question: "What is the highest-risk area right now?"
  console.log("\n[TEST 6] 'What is the highest-risk area right now?'...");
  const qHighestRisk = await queryAi("What is the highest-risk area right now?");
  assert(
    "Identifies highest-risk area and risk score",
    qHighestRisk.answer?.includes("highest-risk area right now is") &&
      qHighestRisk.answer?.includes("Data used:"),
    qHighestRisk.answer
  );

  // TEST 7: Suggested Question: "Why is Zone A critical?"
  console.log("\n[TEST 7] 'Why is Zone A critical?'...");
  const qZoneA = await queryAi("Why is Zone A critical?");
  assert(
    "Explains water level breach, affected citizens, and blocked roads",
    qZoneA.answer?.includes("Zone A is critical because floodwater has reached") &&
      qZoneA.answer?.includes("Data used:"),
    qZoneA.answer
  );

  // TEST 8: Suggested Question: "What changed in the last 10 minutes?"
  console.log("\n[TEST 8] 'What changed in the last 10 minutes?'...");
  const q10Min = await queryAi("What changed in the last 10 minutes?");
  assert(
    "Summarizes telemetry changes and recent activity",
    q10Min.answer?.includes("In the last 10 minutes:") &&
      q10Min.answer?.includes("Data used:"),
    q10Min.answer
  );

  // TEST 9: Suggested Question: "Which resources are available?" vs "deployed"
  console.log("\n[TEST 9] Resources Available vs Deployed...");
  const qAvail = await queryAi("Which resources are available?");
  const qDep = await queryAi("Which resources are currently deployed?");
  assert(
    "Accurately reports available and deployed fleet breakdown",
    qAvail.answer?.includes("available in reserve") &&
      qDep.answer?.includes("units are deployed in the field"),
    `Available: ${qAvail.answer} | Deployed: ${qDep.answer}`
  );

  // TEST 10: Suggested Question: "What actions are waiting for my approval?"
  console.log("\n[TEST 10] 'What actions are waiting for my approval?'...");
  const qApproval = await queryAi("What actions are waiting for my approval?");
  assert(
    "Cites Cmdr Jaswant Karun approval status",
    qApproval.answer?.includes("Cmdr Jaswant Karun") &&
      qApproval.answer?.includes("Data used:"),
    qApproval.answer
  );

  // TEST 11: Unknown question test - Explicitly says information unavailable
  console.log("\n[TEST 11] Unavailable Information Handling...");
  const qUnknown = await queryAi("What is the secret nuclear code for Sector 9?");
  assert(
    "States information is currently unavailable without hallucinating",
    qUnknown.answer?.includes("Information outside this live telemetry and database state is currently unavailable") ||
      qUnknown.answer?.includes("unavailable"),
    qUnknown.answer
  );

  // TEST 12: Sources / Data used section verification
  console.log("\n[TEST 12] Sources / Data used verification...");
  assert(
    "Answers include Sources / Data used block with timestamp",
    qApproval.answer?.includes("Data used:") &&
      qApproval.answer?.includes("Timestamp:"),
    qApproval.answer
  );

  console.log("\n=================================================");
  console.log(`RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("=================================================");

  if (passed === total) {
    console.log("🎉 RESQ AI COPILOT VERIFICATION PASSED WITH 100% SUCCESS!\n");
    process.exit(0);
  } else {
    console.error("⚠️ SOME TESTS FAILED.\n");
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
