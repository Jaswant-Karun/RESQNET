/**
 * RESQNET Database Seed System
 * 
 * Safely seeds demo data into MongoDB Atlas / local MongoDB:
 * - 1 commander (password securely hashed from DEMO_COMMANDER_PASSWORD)
 * - 3 hospitals
 * - 2 shelters
 * - 8 ambulances
 * - 4 rescue teams
 * - 3 drones
 * - sample roads
 * - sample flood zones
 * - sample incident
 * - sample response plan
 * 
 * Completely idempotent: uses deterministic IDs and upsert operations.
 * Safe to run repeatedly without creating duplicates.
 */

import { MongoClient } from "mongodb";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// --- Environment Loading (loads .env.local, then .env) ---
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join(projectRoot, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
          if (!process.env[key] && val) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const rawUri = process.env.MONGODB_URI?.trim();
const uri = rawUri || "mongodb://127.0.0.1:27017/resqnet";
const DB_NAME = "resqnet";

// --- Password Hashing with PBKDF2 ---
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 100000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
  return {
    salt,
    hash,
    algorithm: "pbkdf2-sha512",
    iterations,
  };
}

async function runSeed() {
  console.log("=================================================");
  console.log("       RESQNET DATABASE SEED SYSTEM               ");
  console.log("=================================================");
  console.log(`Connecting to MongoDB...`);
  console.log(`Database: ${DB_NAME}`);
  console.log(`URI: ${uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")}`);

  // Validate Commander Password
  const commanderPassword = process.env.DEMO_COMMANDER_PASSWORD?.trim();
  if (!commanderPassword) {
    console.error("\n[SEED ERROR] DEMO_COMMANDER_PASSWORD environment variable is missing!");
    console.error("Please set DEMO_COMMANDER_PASSWORD in your .env.local file or command line.");
    console.error("Example: DEMO_COMMANDER_PASSWORD=ResqNet2026!Commander npm run seed\n");
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await client.connect();
    console.log("Connected successfully to MongoDB server.");
    const db = client.db(DB_NAME);

    // 1. Seed Commander Account (1 commander with hashed password)
    console.log("\n[1/10] Seeding Commander User Account...");
    const hashedPasswordData = hashPassword(commanderPassword);
    const commanderUser = {
      userId: "usr-cmd-raghav-01",
      name: "Col. Raghav Menon",
      email: "raghav.menon@resqnet.gov.in",
      role: "COMMANDER",
      department: "State Disaster Management Authority (SDMA)",
      status: "ACTIVE",
      passwordHash: hashedPasswordData.hash,
      passwordSalt: hashedPasswordData.salt,
      hashAlgorithm: hashedPasswordData.algorithm,
      iterations: hashedPasswordData.iterations,
      createdAt: "2026-10-01T08:00:00.000Z",
      updatedAt: new Date().toISOString(),
    };

    await db.collection("users").updateOne(
      { userId: commanderUser.userId },
      { $set: commanderUser },
      { upsert: true }
    );
    console.log(`  -> Commander seeded: ${commanderUser.name} (${commanderUser.email}) [PASSWORD HASHED]`);

    // 2. Seed 3 Hospitals
    console.log("\n[2/10] Seeding 3 Hospitals...");
    const hospitals = [
      {
        hospitalId: "hosp-metro-trauma",
        name: "Apex Central Trauma & Emergency Institute",
        type: "LEVEL_1_TRAUMA",
        location: "Guindy Main Road, Sector 7C",
        coordinates: { latitude: 13.0189, longitude: 80.2088 },
        totalBeds: 450,
        availableBeds: 42,
        icuTotal: 65,
        icuAvailable: 6,
        status: "OPERATIONAL",
        contactRadio: "VHF-CH 16 / TAC-MED-1",
        updatedAt: new Date().toISOString(),
      },
      {
        hospitalId: "hosp-district-general",
        name: "Government General District Hospital Saidapet",
        type: "DISTRICT_HOSPITAL",
        location: "Anna Salai Crossway, Saidapet",
        coordinates: { latitude: 13.0234, longitude: 80.2221 },
        totalBeds: 280,
        availableBeds: 12,
        icuTotal: 30,
        icuAvailable: 1,
        status: "OPERATIONAL",
        contactRadio: "VHF-CH 18 / TAC-MED-2",
        updatedAt: new Date().toISOString(),
      },
      {
        hospitalId: "hosp-riverfront-clinic",
        name: "Kotturpuram Community Triage Center",
        type: "COMMUNITY_CLINIC",
        location: "River View Road, Kotturpuram",
        coordinates: { latitude: 13.0142, longitude: 80.2335 },
        totalBeds: 60,
        availableBeds: 0,
        icuTotal: 4,
        icuAvailable: 0,
        status: "FAILING",
        contactRadio: "VHF-CH 14 / TAC-LOCAL",
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const h of hospitals) {
      await db.collection("hospitals").updateOne(
        { hospitalId: h.hospitalId },
        { $set: h },
        { upsert: true }
      );
    }
    console.log(`  -> 3 Hospitals seeded successfully.`);

    // 3. Seed 2 Shelters
    console.log("\n[3/10] Seeding 2 Shelters...");
    const shelters = [
      {
        shelterId: "shelter-alandur-sports",
        name: "Alandur Indoor Stadium Disaster Relief Hub",
        location: "Alandur Sports Complex Road",
        coordinates: { latitude: 13.0045, longitude: 80.2012 },
        capacityPersons: 1200,
        currentOccupancy: 410,
        availableCapacity: 790,
        status: "OPEN",
        contactRadio: "VHF-CH 22 / TAC-SHELTER-A",
        updatedAt: new Date().toISOString(),
      },
      {
        shelterId: "shelter-guindy-tech-campus",
        name: "Guindy Engineering Campus Emergency Shelter",
        location: "Sardar Patel Road, Guindy",
        coordinates: { latitude: 13.0105, longitude: 80.2355 },
        capacityPersons: 850,
        currentOccupancy: 680,
        availableCapacity: 170,
        status: "OPEN",
        contactRadio: "VHF-CH 23 / TAC-SHELTER-B",
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const s of shelters) {
      await db.collection("shelters").updateOne(
        { shelterId: s.shelterId },
        { $set: s },
        { upsert: true }
      );
    }
    console.log(`  -> 2 Shelters seeded successfully.`);

    // 4. Seed 8 Ambulances
    console.log("\n[4/10] Seeding 8 Ambulances...");
    const ambulances = [
      {
        resourceId: "amb-icu-108-01",
        type: "AMBULANCE",
        name: "ICU Mobile Unit 108-Alpha",
        status: "AVAILABLE",
        latitude: 13.0189,
        longitude: 80.2088,
        availability: true,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: "amb-rapid-108-02",
        type: "AMBULANCE",
        name: "Rapid Response Paramedic 108-Bravo",
        status: "AVAILABLE",
        latitude: 13.0234,
        longitude: 80.2221,
        availability: true,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: "amb-icu-108-03",
        type: "AMBULANCE",
        name: "Mobile Critical Care 108-Charlie",
        status: "AVAILABLE",
        latitude: 13.0105,
        longitude: 80.205,
        availability: true,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: "amb-rapid-108-04",
        type: "AMBULANCE",
        name: "Trauma Support Unit 108-Delta",
        status: "AVAILABLE",
        latitude: 13.016,
        longitude: 80.218,
        availability: true,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: "amb-icu-108-05",
        type: "AMBULANCE",
        name: "Neonatal/Pediatric ICU 108-Echo",
        status: "AVAILABLE",
        latitude: 13.008,
        longitude: 80.214,
        availability: true,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: "amb-rapid-108-06",
        type: "AMBULANCE",
        name: "Heavy Ambulance Unit 108-Foxtrot",
        status: "AVAILABLE",
        latitude: 13.021,
        longitude: 80.229,
        availability: true,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: "amb-paramedic-07",
        type: "AMBULANCE",
        name: "Paramedic Scout 108-Golf",
        status: "AVAILABLE",
        latitude: 13.013,
        longitude: 80.225,
        availability: true,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: "amb-paramedic-08",
        type: "AMBULANCE",
        name: "Mass Casualty Transit 108-Hotel",
        status: "AVAILABLE",
        latitude: 13.019,
        longitude: 80.212,
        availability: true,
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const amb of ambulances) {
      await db.collection("resources").updateOne(
        { resourceId: amb.resourceId },
        { $set: amb },
        { upsert: true }
      );
    }
    console.log(`  -> 8 Ambulances seeded in 'resources' collection.`);

    // 5. Seed 4 Rescue Teams
    console.log("\n[5/10] Seeding 4 Rescue Teams...");
    const rescueTeams = [
      {
        resourceId: "res-team-ndrf-01",
        type: "RESCUE_TEAM",
        name: "NDRF 4th Battalion Swiftwater Boat Team",
        status: "AVAILABLE",
        latitude: 13.0067,
        longitude: 80.2206,
        availability: true,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: "res-team-sdrf-02",
        type: "RESCUE_TEAM",
        name: "SDRF Rapid Flood Evacuation Unit",
        status: "AVAILABLE",
        latitude: 13.0125,
        longitude: 80.2312,
        availability: true,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: "res-team-civilian-03",
        type: "RESCUE_TEAM",
        name: "Civil Defense Auxiliary Rescue Squad",
        status: "AVAILABLE",
        latitude: 13.0195,
        longitude: 80.215,
        availability: true,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: "res-team-fire-04",
        type: "RESCUE_TEAM",
        name: "State Fire & Rescue High-Clearance Taskforce",
        status: "AVAILABLE",
        latitude: 13.025,
        longitude: 80.224,
        availability: true,
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const team of rescueTeams) {
      await db.collection("resources").updateOne(
        { resourceId: team.resourceId },
        { $set: team },
        { upsert: true }
      );
    }
    console.log(`  -> 4 Rescue Teams seeded in 'resources' collection.`);

    // 6. Seed 3 Drones
    console.log("\n[6/10] Seeding 3 Drones...");
    const drones = [
      {
        resourceId: "uav-aero-scout-01",
        type: "DRONE",
        name: "AERO-SCOUT-1 (MAPPING_LIDAR)",
        status: "AVAILABLE",
        latitude: 13.0067,
        longitude: 80.2206,
        availability: true,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: "uav-lifeline-heavy-02",
        type: "DRONE",
        name: "LIFELINE-HEAVY-02 (LIFE_JACKET_DROP)",
        status: "AVAILABLE",
        latitude: 13.0118,
        longitude: 80.2341,
        availability: true,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: "uav-med-courier-03",
        type: "DRONE",
        name: "MED-COURIER-03 (MEDICAL_PAYLOAD)",
        status: "AVAILABLE",
        latitude: 13.0189,
        longitude: 80.2088,
        availability: true,
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const d of drones) {
      await db.collection("resources").updateOne(
        { resourceId: d.resourceId },
        { $set: d },
        { upsert: true }
      );
    }
    console.log(`  -> 3 Drones seeded in 'resources' collection.`);

    // 7. Seed Sample Roads
    console.log("\n[7/10] Seeding Sample Roads...");
    const roads = [
      {
        roadId: "road-annasalai-corridor",
        name: "Anna Salai Arterial Highway",
        status: "RESTRICTED",
        waterDepthMeters: 0.45,
        passableForHeavyVehicles: true,
        lengthKm: 3.2,
        updatedAt: new Date().toISOString(),
      },
      {
        roadId: "road-kotturpuram-causeway",
        name: "Kotturpuram Lowland Causeway",
        status: "IMPASSABLE",
        waterDepthMeters: 1.85,
        passableForHeavyVehicles: false,
        lengthKm: 1.4,
        updatedAt: new Date().toISOString(),
      },
      {
        roadId: "road-guindy-highpass",
        name: "Guindy Highland Bypass Route R2",
        status: "OPEN",
        waterDepthMeters: 0.05,
        passableForHeavyVehicles: true,
        lengthKm: 4.8,
        updatedAt: new Date().toISOString(),
      },
      {
        roadId: "road-riverview-link",
        name: "Adyar Canal Link Road R1",
        status: "SUBMERGED",
        waterDepthMeters: 2.1,
        passableForHeavyVehicles: false,
        lengthKm: 0.9,
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const rd of roads) {
      await db.collection("roads").updateOne(
        { roadId: rd.roadId },
        { $set: rd },
        { upsert: true }
      );
    }
    console.log(`  -> ${roads.length} Roads seeded in 'roads' collection.`);

    // 8. Seed Sample Flood Zones
    console.log("\n[8/10] Seeding Sample Flood Zones...");
    const zones = [
      {
        zoneId: "zone-red-alpha",
        name: "Zone A - Kotturpuram Lowland Basin",
        severity: "CRITICAL",
        waterLevelMeters: 4.85,
        populationEstimate: 14500,
        evacuationStatus: "MANDATORY_EVACUATION",
        coordinates: { latitude: 13.0118, longitude: 80.2341 },
        updatedAt: new Date().toISOString(),
      },
      {
        zoneId: "zone-orange-bravo",
        name: "Zone B - Saidapet Causeway",
        severity: "WARNING",
        waterLevelMeters: 2.6,
        populationEstimate: 12200,
        evacuationStatus: "PREPARE_EVACUATION",
        coordinates: { latitude: 13.0234, longitude: 80.2221 },
        updatedAt: new Date().toISOString(),
      },
      {
        zoneId: "zone-yellow-charlie",
        name: "Zone C - Guindy Highland Sector",
        severity: "WATCH",
        waterLevelMeters: 0.9,
        populationEstimate: 7500,
        evacuationStatus: "MONITORING",
        coordinates: { latitude: 13.0067, longitude: 80.2088 },
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const z of zones) {
      await db.collection("zones").updateOne(
        { zoneId: z.zoneId },
        { $set: z },
        { upsert: true }
      );
    }
    console.log(`  -> ${zones.length} Flood Zones seeded in 'zones' collection.`);

    // 9. Seed Sample Incident
    console.log("\n[9/10] Seeding Sample Incident...");
    const sampleIncident = {
      incidentId: "inc-flood-2026-08a",
      type: "FLOOD",
      location: "Kotturpuram - Saidapet Embankment Corridor",
      coordinates: { latitude: 13.0067, longitude: 80.2206 },
      severity: "CRITICAL",
      status: "ACTIVE",
      waterLevel: 4.85,
      affectedPopulation: 34200,
      blockedRoads: ["road-kotturpuram-causeway", "road-riverview-link"],
      createdAt: "2026-10-03T18:42:00Z",
      updatedAt: new Date().toISOString(),
      source: "EOC_HYDRO_TELEMETRY",
      simulationMode: false,
    };

    await db.collection("incidents").updateOne(
      { incidentId: sampleIncident.incidentId },
      { $set: sampleIncident },
      { upsert: true }
    );
    console.log(`  -> Incident seeded: ${sampleIncident.incidentId} (${sampleIncident.location})`);

    // 10. Seed Sample Response Plan
    console.log("\n[10/10] Seeding Sample Response Plan...");
    const samplePlan = {
      incidentId: "inc-flood-2026-08a",
      riskLevel: "CRITICAL",
      priorityZones: ["Zone A - Kotturpuram Lowland", "Zone B - Saidapet Causeway"],
      immediateActions: [
        "Deploy 4x NDRF Swiftwater Zodiac boats to Kotturpuram terrace clusters",
        "Dispatch UAV LIFELINE-HEAVY-02 with floatation pods to roof-stranded citizens",
        "Seal Maraimalai Bridge causeway access and route traffic via Route R2",
        "Surge Apex Central Trauma ICU coordinator for incoming casualties",
      ],
      resourceAllocation: {
        ambulances: 2,
        rescueTeams: 2,
        drones: 1,
      },
      evacuationRoute: "Route R2 - Guindy Highland Bypass",
      shelter: "Alandur Indoor Stadium Disaster Relief Hub",
      explanation:
        "Embankment breach at Kotturpuram requires urgent boat extraction. High current impassable for standard vehicles on Causeway R1. Rapid transit corridor active via elevated Route R2 to Alandur Stadium.",
      approvalRequired: true,
      createdAt: "2026-10-03T18:50:00Z",
    };

    await db.collection("responsePlans").updateOne(
      { incidentId: samplePlan.incidentId },
      { $set: samplePlan },
      { upsert: true }
    );
    console.log(`  -> Response Plan seeded for Incident: ${samplePlan.incidentId}`);

    // --- VERIFICATION STEP ---
    console.log("\n=================================================");
    console.log("       VERIFYING MONGODB DATABASE CONTENTS       ");
    console.log("=================================================");

    const collectionsToCheck = [
      { name: "users", min: 1, label: "Users (1 Commander)" },
      { name: "hospitals", min: 3, label: "Hospitals" },
      { name: "shelters", min: 2, label: "Shelters" },
      { name: "resources", min: 15, label: "Resources (8 Amb, 4 Teams, 3 Drones)" },
      { name: "roads", min: 4, label: "Roads" },
      { name: "zones", min: 3, label: "Flood Zones" },
      { name: "incidents", min: 1, label: "Incidents" },
      { name: "responsePlans", min: 1, label: "Response Plans" },
    ];

    let allPassed = true;

    for (const col of collectionsToCheck) {
      const count = await db.collection(col.name).countDocuments();
      const status = count >= col.min ? "✓ PASS" : "✗ FAIL";
      if (count < col.min) allPassed = false;
      console.log(`  ${status} | Collection '${col.name}': ${count} documents (Expected >= ${col.min}) [${col.label}]`);
    }

    // Verify commander document password field is hashed and not in plain text
    const savedCommander = await db.collection("users").findOne({ role: "COMMANDER" });
    if (savedCommander && savedCommander.passwordHash && !savedCommander.password) {
      console.log(`  ✓ PASS | Commander password is safely hashed (${savedCommander.hashAlgorithm}, length: ${savedCommander.passwordHash.length})`);
    } else {
      console.error(`  ✗ FAIL | Commander password verification failed!`);
      allPassed = false;
    }

    console.log("=================================================");
    if (allPassed) {
      console.log("🎉 RESQNET DATABASE SEED VERIFICATION COMPLETE: ALL DATA VERIFIED!");
    } else {
      console.error("⚠️ RESQNET DATABASE SEED VERIFICATION ENCOUNTERED ISSUES!");
    }
    console.log("=================================================\n");

  } catch (err) {
    console.error("\n[SEED ERROR]:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

runSeed();
