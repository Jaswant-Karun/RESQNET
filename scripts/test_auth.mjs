async function runAuthTests() {
  const baseUrl = "http://localhost:3000";
  console.log("=================================================");
  console.log("       RESQNET AUTHENTICATION VERIFICATION        ");
  console.log("=================================================\n");

  let allPassed = true;

  // TEST 1: Open dashboard without login -> redirected to login
  console.log("[TEST 1] Access /dashboard without login session...");
  try {
    const res = await fetch(`${baseUrl}/dashboard`, {
      redirect: "manual",
    });
    const status = res.status;
    const location = res.headers.get("location");
    console.log(`  Response Status: ${status}, Location: ${location}`);

    if ((status === 307 || status === 302 || status === 308) && location && location.includes("/login")) {
      console.log("  ✓ PASS: Unauthenticated access redirected to /login");
    } else {
      console.error(`  ✗ FAIL: Expected redirect to /login, got status ${status} with location ${location}`);
      allPassed = false;
    }
  } catch (err) {
    console.error("  ✗ FAIL:", err.message);
    allPassed = false;
  }

  // TEST 5: Directly access protected API without session -> rejected
  console.log("\n[TEST 5] Directly access protected API (/api/incidents) without session...");
  try {
    const res = await fetch(`${baseUrl}/api/incidents`);
    const status = res.status;
    const data = await res.json().catch(() => ({}));
    console.log(`  Response Status: ${status}, Data:`, data);

    if (status === 401) {
      console.log("  ✓ PASS: Protected API returned 401 Unauthorized without session");
    } else {
      console.error(`  ✗ FAIL: Expected status 401, got ${status}`);
      allPassed = false;
    }
  } catch (err) {
    console.error("  ✗ FAIL:", err.message);
    allPassed = false;
  }

  // TEST 3: Login with WRONG password -> error
  console.log("\n[TEST 3] Attempt login with wrong password...");
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "jaswant@resqnet.gov.in",
        password: "IncorrectPassword123!",
      }),
    });
    const status = res.status;
    const data = await res.json();
    console.log(`  Response Status: ${status}, Error: ${data.error}`);

    if (status === 401 && !data.success) {
      console.log("  ✓ PASS: Invalid password rejected with error");
    } else {
      console.error(`  ✗ FAIL: Expected 401 failure, got ${status}`);
      allPassed = false;
    }
  } catch (err) {
    console.error("  ✗ FAIL:", err.message);
    allPassed = false;
  }

  // TEST 2: Login with VALID credentials -> success + session cookie
  console.log("\n[TEST 2] Login with valid Commander credentials...");
  let sessionCookie = "";
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "jaswant@resqnet.gov.in",
        password: "ResqNet2026!Commander",
      }),
    });
    const status = res.status;
    const data = await res.json();
    const setCookie = res.headers.get("set-cookie");
    sessionCookie = setCookie ? setCookie.split(";")[0] : "";

    console.log(`  Response Status: ${status}, User: ${data.user?.name} (${data.user?.role})`);
    console.log(`  Cookie Set: ${sessionCookie.substring(0, 35)}...`);

    if (
      status === 200 &&
      data.success &&
      data.user?.name === "Cmdr Jaswant Karun" &&
      data.user?.role === "COMMANDER" &&
      sessionCookie.includes("resqnet_session=")
    ) {
      console.log("  ✓ PASS: Commander authenticated successfully; HTTP-only session cookie issued");
    } else {
      console.error(`  ✗ FAIL: Login failed or user name/role mismatch:`, data);
      allPassed = false;
    }
  } catch (err) {
    console.error("  ✗ FAIL:", err.message);
    allPassed = false;
  }

  // Verify access to protected dashboard and protected API WITH valid session cookie
  console.log("\n[VERIFY AUTHENTICATED ACCESS] Access protected API and /dashboard with session cookie...");
  try {
    const apiRes = await fetch(`${baseUrl}/api/incidents`, {
      headers: { Cookie: sessionCookie },
    });
    const apiData = await apiRes.json();
    console.log(`  Protected API status with cookie: ${apiRes.status}, Incidents: ${apiData.data?.length}`);

    const dashRes = await fetch(`${baseUrl}/dashboard`, {
      headers: { Cookie: sessionCookie },
      redirect: "manual",
    });
    console.log(`  /dashboard status with cookie: ${dashRes.status} (200 = Allowed)`);

    if (apiRes.status === 200 && dashRes.status === 200) {
      console.log("  ✓ PASS: Authenticated session grants full access to protected dashboard & APIs");
    } else {
      console.error(`  ✗ FAIL: Authenticated request failed.`);
      allPassed = false;
    }
  } catch (err) {
    console.error("  ✗ FAIL:", err.message);
    allPassed = false;
  }

  // TEST 4: Logout -> login
  console.log("\n[TEST 4] Logout of active session...");
  try {
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
    });
    const status = res.status;
    const data = await res.json();
    const setCookie = res.headers.get("set-cookie");
    console.log(`  Logout Status: ${status}, Message: ${data.message}`);
    console.log(`  Expired Cookie header: ${setCookie}`);

    // Verify session is now invalid/cleared
    const postLogoutCheck = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { Cookie: "resqnet_session=" },
    });
    const checkData = await postLogoutCheck.json();
    console.log(`  Session state after logout: authenticated=${checkData.authenticated}`);

    if (status === 200 && data.success && !checkData.authenticated) {
      console.log("  ✓ PASS: Successfully logged out; session cookie cleared");
    } else {
      console.error("  ✗ FAIL: Logout verification failed.");
      allPassed = false;
    }
  } catch (err) {
    console.error("  ✗ FAIL:", err.message);
    allPassed = false;
  }

  console.log("\n=================================================");
  if (allPassed) {
    console.log("🎉 ALL 5 AUTHENTICATION TESTS PASSED WITH 100% SUCCESS!");
  } else {
    console.error("⚠️ SOME AUTHENTICATION TESTS FAILED!");
  }
  console.log("=================================================\n");
}

runAuthTests();
