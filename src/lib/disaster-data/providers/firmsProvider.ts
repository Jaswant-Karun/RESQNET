import { FirmsFireDetection, ProviderStatus } from "../types";

/**
 * Fetches Active Thermal / Fire Intelligence from NASA FIRMS
 * (Fire Information for Resource Management System)
 * 
 * Uses NASA FIRMS MAP_KEY when configured.
 * If credentials are not set or feed is offline, sets status: UNAVAILABLE
 * and returns empty array without fabricating live fire detections.
 */
export async function fetchFirmsFireDetections(): Promise<{
  data: FirmsFireDetection[];
  status: ProviderStatus;
}> {
  const startTime = Date.now();
  const apiKey =
    process.env.FIRMS_MAP_KEY ||
    process.env.NASA_FIRMS_API_KEY ||
    process.env.FIRMS_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return {
      data: [],
      status: {
        name: "NASA FIRMS Satellite Thermal Sensor",
        sourceId: "NASA_FIRMS",
        status: "UNAVAILABLE",
        lastUpdated: new Date().toISOString(),
        itemsCount: 0,
        message:
          "NASA FIRMS MAP_KEY credential not configured in environment. Satellite thermal anomaly feed is offline.",
      },
    };
  }

  try {
    // NASA FIRMS VIIRS / MODIS active fire endpoint
    // Bounding box for South India: minLon 77, minLat 10, maxLon 82, maxLat 15
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/77,10,82,15/1`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`NASA FIRMS returned HTTP ${res.status}`);
    }

    const csvText = await res.text();
    const lines = csvText.trim().split("\n");

    const detections: FirmsFireDetection[] = [];

    // Skip header line
    for (let i = 1; i < Math.min(lines.length, 25); i++) {
      const line = lines[i]?.trim();
      if (!line) continue;
      const parts = line.split(",");
      if (parts.length >= 5) {
        const lat = parseFloat(parts[0] || "0");
        const lon = parseFloat(parts[1] || "0");
        const brightness = parseFloat(parts[2] || "0");
        const scanDate = parts[5] || new Date().toISOString().substring(0, 10);
        const scanTime = parts[6] || "1200";
        const confidence = parts[8] || "nominal";
        const satellite = parts[7] || "SNPP/VIIRS";

        if (!isNaN(lat) && !isNaN(lon)) {
          detections.push({
            source: "NASA_FIRMS",
            latitude: lat,
            longitude: lon,
            confidence,
            detectedAt: `${scanDate}T${scanTime.padStart(4, "0").substring(0, 2)}:${scanTime.padStart(4, "0").substring(2, 4)}:00Z`,
            satellite,
            hazardType: "FIRE",
            brightness,
            classification: "OBSERVED_REPORTED",
          });
        }
      }
    }

    const latencyMs = Date.now() - startTime;

    return {
      data: detections,
      status: {
        name: "NASA FIRMS Satellite Thermal Sensor",
        sourceId: "NASA_FIRMS",
        status: "CONNECTED",
        lastUpdated: new Date().toISOString(),
        latencyMs,
        itemsCount: detections.length,
        message: `Live NASA FIRMS satellite thermal sensor feed connected (${detections.length} active thermal hotspots detected).`,
      },
    };
  } catch (err: unknown) {
    console.warn(
      "[NASA FIRMS Provider] External API unreachable:",
      err instanceof Error ? err.message : err
    );

    return {
      data: [],
      status: {
        name: "NASA FIRMS Satellite Thermal Sensor",
        sourceId: "NASA_FIRMS",
        status: "UNAVAILABLE",
        lastUpdated: new Date().toISOString(),
        itemsCount: 0,
        message: "NASA FIRMS server unreachable or network timed out. No thermal data available.",
      },
    };
  }
}
