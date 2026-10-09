import { MongoClient, Db, Collection, MongoClientOptions } from "mongodb";
import {
  IncidentDocument,
  ResourceDocument,
  ResponsePlanDocument,
  AlertDocument,
  RiskForecastDocument,
  ActivityLogDocument,
  UserDocument,
  DroneMissionDocument,
} from "@/types";

/**
 * MongoDB Configuration & Cached Connection Client
 * Database: resqnet
 * Collections:
 * - users
 * - incidents
 * - resources
 * - responsePlans
 * - alerts
 * - riskForecasts
 * - activityLogs
 * - droneMissions
 */

export const DATABASE_NAME = "resqnet";

export const COLLECTIONS = {
  USERS: "users",
  INCIDENTS: "incidents",
  RESOURCES: "resources",
  RESPONSE_PLANS: "responsePlans",
  ALERTS: "alerts",
  RISK_FORECASTS: "riskForecasts",
  ACTIVITY_LOGS: "activityLogs",
  DRONE_MISSIONS: "droneMissions",
  HOSPITALS: "hospitals",
  SHELTERS: "shelters",
  ROADS: "roads",
  ZONES: "zones",
} as const;

const uri = process.env.MONGODB_URI || "";

const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 4000,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;
let indexesPromise: Promise<void> | null = null;

declare global {
  // Global declaration to maintain cached client across hot reloads in Next.js development
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Validates if MONGODB_URI is provided in environment variables
 */
export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);
}

/**
 * Checks if DATABASE_MODE is set to 'mongodb'
 */
export function getDatabaseMode(): "local" | "mongodb" {
  const mode = (process.env.DATABASE_MODE || "local").trim().toLowerCase();
  return mode === "mongodb" ? "mongodb" : "local";
}

/**
 * Returns true only if DATABASE_MODE is mongodb AND URI is configured
 */
export function isMongoActive(): boolean {
  return getDatabaseMode() === "mongodb" && isMongoConfigured();
}

/**
 * Reusable/cached MongoClient connection suitable for Next.js development and production.
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (!isMongoConfigured()) {
    throw new Error("MONGODB_URI is not configured in environment variables");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

/**
 * Connects and returns the 'resqnet' database instance.
 */
export async function getDatabase(dbName = DATABASE_NAME): Promise<Db> {
  const clientInstance = await getMongoClient();
  const db = clientInstance.db(dbName);

  if (!indexesPromise) {
    indexesPromise = ensureIndexes(db).catch((error: unknown) => {
      indexesPromise = null;
      console.error(
        "[MongoDB] Failed to create indexes:",
        error instanceof Error ? error.message : "unknown error"
      );
      throw error;
    });
  }

  await indexesPromise;
  return db;
}

async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection(COLLECTIONS.USERS).createIndex({ email: 1 }, { unique: true, sparse: true }),
    db.collection(COLLECTIONS.INCIDENTS).createIndex({ status: 1, updatedAt: -1 }),
    db.collection(COLLECTIONS.ALERTS).createIndex({ incidentId: 1, createdAt: -1 }),
    db.collection(COLLECTIONS.ALERTS).createIndex({ severity: 1, area: 1, createdAt: -1 }),
    db.collection(COLLECTIONS.RISK_FORECASTS).createIndex({ areaId: 1, timestamp: -1 }),
    db.collection(COLLECTIONS.ACTIVITY_LOGS).createIndex({ incidentId: 1, timestamp: -1 }),
  ]);
}

/**
 * Helper to test MongoDB Atlas connectivity
 */
export async function checkMongoConnection(): Promise<{
  connected: boolean;
  database: string;
  error?: string;
  latencyMs?: number;
}> {
  if (!isMongoConfigured()) {
    return {
      connected: false,
      database: DATABASE_NAME,
      error: "MONGODB_URI is not set",
    };
  }

  const start = Date.now();
  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });
    return {
      connected: true,
      database: DATABASE_NAME,
      latencyMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      database: DATABASE_NAME,
      error: errorMessage,
      latencyMs: Date.now() - start,
    };
  }
}

/**
 * Type-safe collection getters
 */
export async function getIncidentsCollection(): Promise<Collection<IncidentDocument>> {
  const db = await getDatabase();
  return db.collection<IncidentDocument>(COLLECTIONS.INCIDENTS);
}

export async function getResourcesCollection(): Promise<Collection<ResourceDocument>> {
  const db = await getDatabase();
  return db.collection<ResourceDocument>(COLLECTIONS.RESOURCES);
}

export async function getResponsePlansCollection(): Promise<Collection<ResponsePlanDocument>> {
  const db = await getDatabase();
  return db.collection<ResponsePlanDocument>(COLLECTIONS.RESPONSE_PLANS);
}

export async function getAlertsCollection(): Promise<Collection<AlertDocument>> {
  const db = await getDatabase();
  return db.collection<AlertDocument>(COLLECTIONS.ALERTS);
}

export async function getRiskForecastsCollection(): Promise<Collection<RiskForecastDocument>> {
  const db = await getDatabase();
  return db.collection<RiskForecastDocument>(COLLECTIONS.RISK_FORECASTS);
}

export async function getActivityLogsCollection(): Promise<Collection<ActivityLogDocument>> {
  const db = await getDatabase();
  return db.collection<ActivityLogDocument>(COLLECTIONS.ACTIVITY_LOGS);
}

export async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const db = await getDatabase();
  return db.collection<UserDocument>(COLLECTIONS.USERS);
}

export async function getDroneMissionsCollection(): Promise<Collection<DroneMissionDocument>> {
  const db = await getDatabase();
  return db.collection<DroneMissionDocument>(COLLECTIONS.DRONE_MISSIONS);
}
