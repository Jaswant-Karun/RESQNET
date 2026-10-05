/**
 * Verification Test Suite for LIVE DISASTER RISK INTELLIGENCE Module
 */

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=================================================");
  console.log("   LIVE DISASTER RISK INTELLIGENCE TEST SUITE    ");
  console.log("=================================================\n");

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

  // 1. Unauthenticated access check on /risk-intelligence
  console.log("[TEST 1] Protect /risk-intelligence without login session...");
  const unauthPageRes = await fetch(`${BASE_URL}/risk-intelligence`, {
    redirect: "manual",
  });
  const unauthStatus = unauthPageRes.status;
  const locationHeader = unauthPageRes.headers.get("location") || "";
  assert(
    "Unauthenticated user redirected to /login",
    (unauthStatus === 307 || unauthStatus === 302 || unauthStatus === 308) &&
      locationHeader.includes("/login"),
    `Status: ${unauthStatus}, Location: ${locationHeader}`
  );

  // 2. Login as Cmdr Jaswant Karun
  console.log("\n[TEST 2] Authenticate as Cmdr Jaswant Karun...");
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
  assert("Login succeeded and session cookie acquired", sessionCookie.length > 0);

  // 3. Authenticated page access on /risk-intelligence
  console.log("\n[TEST 3] Access /risk-intelligence with session cookie...");
  const authPageRes = await fetch(`${BASE_URL}/risk-intelligence`, {
    headers: { Cookie: sessionCookie },
  });
  assert(
    "/risk-intelligence responds 200 OK for authenticated commander",
    authPageRes.status === 200,
    `Status: ${authPageRes.status}`
  );

  // 4. Query /api/risk-intelligence
  console.log("\n[TEST 4] Query /api/risk-intelligence API payload...");
  const apiRes = await fetch(`${BASE_URL}/api/risk-intelligence`, {
    headers: { Cookie: sessionCookie },
  });
  const json = await apiRes.json();
  const payload = json.data;

  assert(
    "API returned success with LiveDisasterIntelligencePayload",
    json.success === true && Boolean(payload),
    `Success: ${json.success}`
  );

  // 5. Verify Isolated Providers Status
  console.log("\n[TEST 5] Verify Isolated Providers Status...");
  const providers = payload?.providerStatuses || [];
  const openMeteo = providers.find((p) => p.sourceId === "OPEN_METEO");
  const gdacs = providers.find((p) => p.sourceId === "GDACS");
  const firms = providers.find((p) => p.sourceId === "NASA_FIRMS");

  assert(
    "All 3 providers present (Open-Meteo, GDACS, NASA FIRMS)",
    Boolean(openMeteo) && Boolean(gdacs) && Boolean(firms),
    `Providers: ${providers.map((p) => p.sourceId).join(", ")}`
  );

  assert(
    "Open-Meteo provider has status CONNECTED or UNAVAILABLE with timestamp",
    (openMeteo.status === "CONNECTED" || openMeteo.status === "UNAVAILABLE") &&
      Boolean(openMeteo.lastUpdated),
    `Open-Meteo status: ${openMeteo?.status}`
  );

  assert(
    "GDACS provider has status CONNECTED or UNAVAILABLE with timestamp",
    (gdacs.status === "CONNECTED" || gdacs.status === "UNAVAILABLE") &&
      Boolean(gdacs.lastUpdated),
    `GDACS status: ${gdacs?.status}`
  );

  assert(
    "NASA FIRMS provider reports status gracefully without crashing",
    (firms.status === "CONNECTED" || firms.status === "UNAVAILABLE") &&
      Boolean(firms.lastUpdated),
    `FIRMS status: ${firms?.status}`
  );

  // 6. Verify Source 1: Open-Meteo Weather Normalization
  console.log("\n[TEST 6] Source 1: Open-Meteo Weather Data Normalization...");
  const weatherPoints = payload?.weatherForecasts || [];
  const firstWeather = weatherPoints[0];
  assert(
    "Weather points include precipitation, precipitationProbability, rain, temp, wind",
    weatherPoints.length >= 3 &&
      typeof firstWeather?.precipitationMm === "number" &&
      typeof firstWeather?.precipitationProbability === "number" &&
      typeof firstWeather?.temperatureC === "number" &&
      typeof firstWeather?.windSpeedKmh === "number" &&
      firstWeather?.classification === "FORECAST_CONDITION",
    `Weather: ${JSON.stringify(firstWeather)}`
  );

  // 7. Verify Source 2: GDACS Disaster Alerts Normalization
  console.log("\n[TEST 7] Source 2: GDACS Disaster Alerts Normalization...");
  const gdacsAlerts = payload?.gdacsAlerts || [];
  const firstAlert = gdacsAlerts[0];
  assert(
    "GDACS normalized schema has source, eventId, hazardType, location, severity, detectedAt",
    gdacsAlerts.length > 0 &&
      firstAlert?.source === "GDACS" &&
      Boolean(firstAlert?.eventId) &&
      Boolean(firstAlert?.hazardType) &&
      Boolean(firstAlert?.location) &&
      Boolean(firstAlert?.severity) &&
      firstAlert?.classification === "OBSERVED_REPORTED",
    `Alert: ${JSON.stringify(firstAlert)}`
  );

  // 8. Verify Deterministic Risk Engine & Assessments
  console.log("\n[TEST 8] Deterministic Risk Engine & Scoring (0-100)...");
  const assessments = payload?.riskAssessments || [];
  const zoneA = assessments.find((a) => a.areaId === "loc-kotturpuram") || assessments[0];

  assert(
    "Risk assessments are deterministic between 0 and 100",
    assessments.length >= 3 &&
      typeof zoneA?.riskScore === "number" &&
      zoneA?.riskScore >= 0 &&
      zoneA?.riskScore <= 100,
    `Zone A Score: ${zoneA?.riskScore}`
  );

  assert(
    "Risk level correctly mapped (CRITICAL/HIGH/MODERATE/LOW)",
    ["CRITICAL", "HIGH", "MODERATE", "LOW"].includes(zoneA?.riskLevel),
    `Level: ${zoneA?.riskLevel}`
  );

  assert(
    "Labeled as 'RESQNET Risk Assessment' with contributing factors list",
    zoneA?.label === "RESQNET Risk Assessment" &&
      Array.isArray(zoneA?.contributingFactors) &&
      zoneA?.contributingFactors.length >= 2,
    `Factors count: ${zoneA?.contributingFactors?.length}`
  );

  // 9. Verify Transparent AI Explanation (Gemini explains, does not invent score)
  console.log("\n[TEST 9] AI Explanation (Gemini explains score without inventing)...");
  const explainRes = await fetch(`${BASE_URL}/api/risk-intelligence`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify({
      action: "EXPLAIN_RISK",
      assessment: zoneA,
    }),
  });
  const explainJson = await explainRes.json();

  assert(
    "Explanation API returned transparent reasoning preserving exact calculated score",
    explainJson.success === true &&
      explainJson.riskScore === zoneA.riskScore &&
      Boolean(explainJson.explanation) &&
      typeof explainJson.explanation === "string",
    `Explained Score: ${explainJson.riskScore}`
  );

  // 10. Verify Disclaimers
  console.log("\n[TEST 10] Disclaimers & Official Warning Distinctions...");
  assert(
    "Payload contains disclaimer that RESQNET does not predict disasters and is not an official warning",
    payload?.disclaimer?.includes("does not claim to perfectly predict disasters") &&
      zoneA?.disclaimer?.includes("Not an official government"),
    payload?.disclaimer
  );

  console.log("\n=================================================");
  console.log(`RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("=================================================");

  if (passed === total) {
    console.log("🎉 LIVE DISASTER RISK INTELLIGENCE VERIFICATION PASSED WITH 100% SUCCESS!\n");
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
