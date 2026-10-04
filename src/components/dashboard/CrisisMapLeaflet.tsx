import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { AlertTriangle, WifiOff } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

interface CrisisMapLeafletProps {
  layers: {
    floodHeatmap: boolean;
    drones: boolean;
    rescueUnits: boolean;
    infrastructure: boolean;
    roads: boolean;
  };
  activeViewMode: "TERRAIN" | "THERMAL_IR" | "ELEVATION";
}

export function CrisisMapLeaflet({ layers, activeViewMode }: CrisisMapLeafletProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [detectedTileError, setDetectedTileError] = useState(false);

  const {
    incident,
    zones,
    hospitals,
    shelters,
    roads,
    ambulances,
    rescueTeams,
    drones,
    plan,
    isActionApproved,
    simulationStage,
    setSelectedZone,
    simulateTileError,
  } = useDashboard();

  const isTileUnavailable = detectedTileError || simulateTileError;

  // 1. Initialize Map instance once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center map around Zone A & River Basin
    const initialMap = L.map(mapContainerRef.current, {
      center: [13.0135, 80.2215],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // OpenStreetMap standard tile layer with resilient error detection
    const tileUrl = simulateTileError
      ? "https://invalid-offline-tile-domain.resqnet.internal/{z}/{x}/{y}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    });

    tileLayer.on("tileerror", () => {
      setDetectedTileError(true);
    });

    tileLayer.addTo(initialMap);

    // Zoom control at top right
    L.control.zoom({ position: "topright" }).addTo(initialMap);

    // Layer group for dynamic operational markers
    const layerGroup = L.layerGroup().addTo(initialMap);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = initialMap;

    return () => {
      initialMap.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, [simulateTileError]);

  // 2. Render and update map layers whenever data or simulationStage changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const lg = layerGroupRef.current;
    if (!map || !lg) return;

    lg.clearLayers();

    // Helper to create tactical SVG DivIcons
    const createMarkerIcon = (
      bgColor: string,
      borderColor: string,
      textColor: string,
      symbol: string,
      label: string,
      pulse: boolean = false
    ) => {
      return L.divIcon({
        className: "custom-tactical-pin",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
            ${
              pulse
                ? `<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto; width: 34px; height: 34px; border-radius: 9999px; background: ${borderColor}; opacity: 0.45; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                : ""
            }
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 9999px; background: ${bgColor}; border: 2px solid ${borderColor}; box-shadow: 0 0 12px ${borderColor}; color: ${textColor}; font-weight: bold; font-family: monospace; font-size: 11px; z-index: 10;">
              ${symbol}
            </div>
            <div style="margin-top: 3px; background: rgba(8, 13, 26, 0.95); border: 1px solid ${borderColor}; color: ${textColor}; padding: 1px 5px; border-radius: 4px; font-size: 9px; font-family: monospace; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,0.8); z-index: 11;">
              ${label}
            </div>
          </div>
        `,
        iconSize: [30, 46],
        iconAnchor: [15, 23],
      });
    };

    // 1 & 2. FLOOD AFFECTED ZONES (Zone A & Zone B)
    if (layers.floodHeatmap) {
      zones.forEach((zone) => {
        const isCritical = zone.riskLevel === "CRITICAL";
        const isHigh = zone.riskLevel === "HIGH";

        const polyColor = isCritical
          ? "#ef4444"
          : isHigh
          ? "#f97316"
          : zone.riskLevel === "MODERATE"
          ? "#3b82f6"
          : "#10b981";

        // Draw tactical polygon boundaries
        const polygon = L.polygon(zone.polygonCoordinates as L.LatLngTuple[], {
          color: polyColor,
          weight: isCritical ? 3 : 2,
          dashArray: isCritical ? "5, 5" : undefined,
          fillColor: polyColor,
          fillOpacity: isCritical ? 0.35 : 0.22,
        }).addTo(lg);

        polygon.on("click", () => {
          setSelectedZone(zone);
        });

        // Add Center Pin with label
        const isZoneA = zone.code.toLowerCase().includes("a");
        const isZoneB = zone.code.toLowerCase().includes("b");

        let zoneLabel = zone.code;
        if (isZoneA) zoneLabel = "ZONE A [CRITICAL]";
        if (isZoneB) zoneLabel = simulationStage === "ESCALATED" ? "ZONE B [CRITICAL]" : "ZONE B [HIGH RISK]";

        const markerColor = isCritical ? "#ef4444" : isHigh ? "#f97316" : "#3b82f6";

        const zoneMarker = L.marker([zone.center.latitude, zone.center.longitude], {
          icon: createMarkerIcon(
            "#0b1120",
            markerColor,
            markerColor,
            isZoneA ? "A" : isZoneB ? "B" : zone.code.slice(-1),
            zoneLabel,
            isCritical
          ),
        }).addTo(lg);

        zoneMarker.bindPopup(`
          <div style="padding: 12px; font-family: sans-serif; min-width: 210px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-family: monospace; font-weight: bold; color: ${polyColor}; font-size: 11px;">${zone.code}</span>
              <span style="font-size: 10px; background: ${isCritical ? '#450a0a' : '#431407'}; color: ${polyColor}; padding: 1px 6px; border-radius: 4px; font-weight: bold;">${zone.riskLevel}</span>
            </div>
            <div style="font-weight: bold; color: #f8fafc; font-size: 12px; margin-bottom: 4px;">${zone.name}</div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">Water Depth: <strong style="color: ${polyColor};">${zone.waterDepthMeters} meters</strong></div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">Affected Population: <strong>${zone.populationEstimate.toLocaleString()}</strong></div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 6px;">Evac Progress: <strong style="color: #10b981;">${zone.evacuationProgressPercentage}%</strong></div>
            <div style="font-size: 10px; background: #0f172a; padding: 4px 6px; border-radius: 4px; border: 1px solid #1e293b; color: #94a3b8;">
              Status: <span style="color: #f8fafc; font-weight: bold;">${zone.status}</span>
            </div>
          </div>
        `);
      });
    }

    // 3, 4, 5. HOSPITALS (H1 80%, H2 42%, H3 95%) - BLUE
    if (layers.infrastructure) {
      hospitals.forEach((hosp, idx) => {
        const hTag = hosp.code || `H${idx + 1}`;
        const usage = hosp.capacityUsagePercentage ?? Math.round(((hosp.totalBeds - hosp.availableBeds) / hosp.totalBeds) * 100);

        const marker = L.marker([hosp.location.latitude, hosp.location.longitude], {
          icon: createMarkerIcon(
            "#0b1120",
            "#3b82f6",
            "#60a5fa",
            hTag,
            `Hospital ${hTag} (${usage}%)`
          ),
        }).addTo(lg);

        marker.bindPopup(`
          <div style="padding: 12px; font-family: sans-serif; min-width: 220px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-family: monospace; font-weight: bold; color: #60a5fa; font-size: 11px;">[${hTag}] HOSPITAL</span>
              <span style="font-size: 10px; background: #172554; color: #93c5fd; padding: 1px 6px; border-radius: 4px; font-weight: bold;">Usage: ${usage}%</span>
            </div>
            <div style="font-weight: bold; color: #f8fafc; font-size: 12px; margin-bottom: 6px;">${hosp.name}</div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">Capacity Usage: <strong style="color: ${usage > 85 ? '#ef4444' : '#60a5fa'}; font-size: 12px;">${usage}%</strong></div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">Available Beds: <strong style="color: #10b981;">${hosp.availableBeds} / ${hosp.totalBeds}</strong></div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">ICU Free: <strong style="color: #38bdf8;">${hosp.icuAvailable} / ${hosp.icuTotal}</strong></div>
            <div style="font-family: monospace; font-size: 10px; color: #94a3b8; margin-top: 4px;">Radio: ${hosp.contactRadio}</div>
          </div>
        `);
      });

      // 6 & 7. SHELTERS (Shelter B: 700, Shelter C: 1500) - GREEN
      shelters.forEach((shelter) => {
        const shelterTag = shelter.code || (shelter.id.includes("b") ? "Shelter B" : "Shelter C");

        const marker = L.marker([shelter.location.latitude, shelter.location.longitude], {
          icon: createMarkerIcon(
            "#0b1120",
            "#10b981",
            "#34d399",
            "⌂",
            `${shelterTag} (${shelter.totalCapacity})`
          ),
        }).addTo(lg);

        marker.bindPopup(`
          <div style="padding: 12px; font-family: sans-serif; min-width: 220px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-family: monospace; font-weight: bold; color: #34d399; font-size: 11px;">[${shelterTag}]</span>
              <span style="font-size: 10px; background: #064e3b; color: #a7f3d0; padding: 1px 6px; border-radius: 4px; font-weight: bold;">Cap: ${shelter.totalCapacity}</span>
            </div>
            <div style="font-weight: bold; color: #f8fafc; font-size: 12px; margin-bottom: 6px;">${shelter.name}</div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">Designated Capacity: <strong style="color: #10b981; font-size: 12px;">${shelter.totalCapacity}</strong></div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">Current Occupancy: <strong>${shelter.currentOccupancy}</strong></div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">Water Supply: <strong style="color: #38bdf8;">${shelter.waterSupplyDays} Days</strong></div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 4px;">Rations: <strong style="color: #fbbf24;">${shelter.foodRationsDays} Days</strong></div>
            <div style="font-size: 10px; color: #94a3b8;">Status: <strong style="color: #f8fafc;">${shelter.status}</strong></div>
          </div>
        `);
      });
    }

    // 8. AMBULANCES (8 AMBULANCES) - WHITE/BLUE
    if (layers.rescueUnits) {
      ambulances.forEach((amb) => {
        const marker = L.marker([amb.currentLocation.latitude, amb.currentLocation.longitude], {
          icon: createMarkerIcon(
            "#1e293b",
            "#38bdf8",
            "#ffffff",
            "🚑",
            amb.callsign
          ),
        }).addTo(lg);

        marker.bindPopup(`
          <div style="padding: 10px; font-family: monospace; font-size: 11px;">
            <div style="font-weight: bold; color: #38bdf8; margin-bottom: 4px;">${amb.callsign} (${amb.name})</div>
            <div style="color: #cbd5e1;">Status: <strong style="color: ${amb.status === 'ON_MISSION' ? '#ef4444' : '#10b981'};">${amb.status}</strong></div>
            <div style="color: #cbd5e1;">Lead: ${amb.commander}</div>
            <div style="color: #cbd5e1;">Battery/Fuel: ${amb.fuelOrBatteryLevel}%</div>
            <div style="color: #f59e0b; margin-top: 4px;">ETA: ${amb.etaMinutes ? amb.etaMinutes + ' mins' : 'On Site'}</div>
          </div>
        `);
      });

      // 9. RESCUE TEAMS (4 RESCUE TEAMS) - PURPLE
      rescueTeams.forEach((team) => {
        const marker = L.marker([team.currentLocation.latitude, team.currentLocation.longitude], {
          icon: createMarkerIcon(
            "#0b1120",
            "#a855f7",
            "#c084fc",
            "⚓",
            team.callsign,
            team.status === "ON_MISSION"
          ),
        }).addTo(lg);

        marker.bindPopup(`
          <div style="padding: 10px; font-family: monospace; font-size: 11px;">
            <div style="font-weight: bold; color: #c084fc; margin-bottom: 4px;">${team.callsign} (${team.name})</div>
            <div style="color: #cbd5e1;">Status: <strong style="color: ${team.status === 'ON_MISSION' ? '#ef4444' : '#10b981'};">${team.status}</strong></div>
            <div style="color: #cbd5e1;">Commander: ${team.commander}</div>
            <div style="color: #cbd5e1;">Personnel: ${team.personnelCount} Rescuers</div>
            <div style="color: #cbd5e1;">Capacity: ${team.capacityPersons} Citizens</div>
          </div>
        `);
      });
    }

    // 10. DRONES (3 DRONES) - CYAN
    if (layers.drones) {
      drones.forEach((drone) => {
        const isAirborne = drone.flightStatus !== "STANDBY_PAD";

        const marker = L.marker([drone.currentLocation.latitude, drone.currentLocation.longitude], {
          icon: createMarkerIcon(
            "#082f49",
            "#06b6d4",
            "#22d3ee",
            "✛",
            drone.callsign,
            isAirborne
          ),
        }).addTo(lg);

        marker.bindPopup(`
          <div style="padding: 10px; font-family: monospace; font-size: 11px;">
            <div style="font-weight: bold; color: #22d3ee; margin-bottom: 4px;">${drone.callsign} [UAV]</div>
            <div style="color: #cbd5e1;">Model: ${drone.model}</div>
            <div style="color: #cbd5e1;">Role: ${drone.role.replace(/_/g, " ")}</div>
            <div style="color: #cbd5e1;">Flight Status: <strong style="color: #38bdf8;">${drone.flightStatus}</strong></div>
            <div style="color: #cbd5e1;">Altitude: ${drone.altitudeMeters}m @ ${drone.groundSpeedKmH} km/h</div>
            <div style="color: #10b981;">Battery: ${drone.batteryPercentage}% (~${drone.estimatedFlightTimeRemainingMin}m airtime)</div>
            ${drone.payloadItemDescription ? `<div style="color: #f59e0b; margin-top: 4px; font-size: 10px;">Payload: ${drone.payloadItemDescription}</div>` : ""}
          </div>
        `);

        // Draw flight vector path for airborne drones
        if (drone.targetWaypoints && drone.targetWaypoints.length > 0) {
          const startPt: L.LatLngTuple = [
            drone.currentLocation.latitude,
            drone.currentLocation.longitude,
          ];
          const waypoints: L.LatLngTuple[] = drone.targetWaypoints.map(
            (w) => [w.latitude, w.longitude] as L.LatLngTuple
          );
          const flightPath: L.LatLngTuple[] = [startPt, ...waypoints];

          L.polyline(flightPath, {
            color: "#06b6d4",
            dashArray: "3, 6",
            weight: 2,
            opacity: 0.8,
          }).addTo(lg);
        }
      });
    }

    // BLOCKED ROADS (R1, R3 BLOCKED; R2, R4 CLEAR)
    if (layers.roads) {
      roads.forEach((road) => {
        const isBlocked =
          road.isBlocked ??
          (road.status === "SUBMERGED" ||
            road.status === "IMPASSABLE" ||
            incident.blockedRoads?.includes(road.code || ""));

        const roadColor = isBlocked ? "#ef4444" : "#10b981";

        const poly = L.polyline(
          [
            [road.startPoint.latitude, road.startPoint.longitude],
            [road.endPoint.latitude, road.endPoint.longitude],
          ],
          {
            color: roadColor,
            weight: isBlocked ? 6 : 4,
            dashArray: isBlocked ? "6, 6" : undefined,
            opacity: 0.9,
          }
        ).addTo(lg);

        poly.bindPopup(`
          <div style="padding: 10px; font-family: monospace; font-size: 11px;">
            <div style="font-weight: bold; color: ${roadColor}; margin-bottom: 4px;">${road.name}</div>
            <div style="color: #cbd5e1;">Code: ${road.code || road.routeCode}</div>
            <div style="color: ${roadColor}; font-weight: bold; font-size: 12px;">
              ${isBlocked ? "⚠ ROAD BLOCKED / IMPASSABLE" : "✓ ROAD OPEN & CLEAR"}
            </div>
            <div style="color: #cbd5e1;">Water Depth: ${road.waterDepthCm} cm</div>
            ${road.detourRouteName ? `<div style="color: #f59e0b; margin-top: 4px; font-size: 10px;">Recommended Detour: ${road.detourRouteName}</div>` : ""}
          </div>
        `);
      });

      // ADAPTIVE EVACUATION CORRIDOR LOGIC (BASELINE: R2 -> SHELTER B, ESCALATED: R4 -> SHELTER C)
      const isEscalatedMode =
        plan.evacuationRoute === "R4" ||
        simulationStage === "ESCALATED" ||
        incident.blockedRoads?.includes("R2");

      const activeRouteCoords: L.LatLngTuple[] = isEscalatedMode
        ? [
            [13.0135, 80.2312], // Zone A Center
            [13.0075, 80.2065], // Road R4 Elevated Bypass
            [12.9972, 80.1975], // Shelter C (Alandur Indoor Sports Complex)
          ]
        : [
            [13.0135, 80.2312], // Zone A Center
            [13.0182, 80.2195], // Road R2 Highland Junction
            [13.0245, 80.2120], // Shelter B (Guindy Safe Haven)
          ];

      const activeRouteLabel = isEscalatedMode
        ? "ADAPTIVE CORRIDOR: Route R4 → Shelter C (Safe Elevated Bypass)"
        : "RECOMMENDED CORRIDOR: Route R2 → Shelter B (Dry Passage)";

      const targetShelterCoord: L.LatLngTuple = isEscalatedMode
        ? [12.9972, 80.1975] // Shelter C
        : [13.0245, 80.2120]; // Shelter B

      const targetShelterTitle = isEscalatedMode
        ? "EVACUATION TARGET: SHELTER C (CAP: 1,500)"
        : "EVACUATION TARGET: SHELTER B (CAP: 700)";

      // 1. Recommended Corridor dashed path
      L.polyline(activeRouteCoords, {
        color: isEscalatedMode ? "#10b981" : "#34d399",
        weight: 4,
        opacity: 0.85,
        dashArray: "8, 8",
      })
        .bindTooltip(activeRouteLabel, {
          direction: "center",
          className: "leaflet-tooltip-dark",
        })
        .addTo(lg);

      // 2. High-visibility indicator for Route R2 blockage when escalated
      if (isEscalatedMode) {
        const r2BlockedIcon = createMarkerIcon(
          "#450a0a",
          "#ef4444",
          "#fecaca",
          "⚠",
          "ROUTE R2 BLOCKED (SUBMERGED 1.85m)",
          true
        );
        const r2Marker = L.marker([13.0182, 80.2195], { icon: r2BlockedIcon }).addTo(lg);
        r2Marker.bindPopup(`
          <div style="padding: 10px; font-family: monospace; font-size: 11px;">
            <div style="font-weight: bold; color: #ef4444; margin-bottom: 4px;">⚠ ROUTE R2 SUBMERGED & BLOCKED</div>
            <div style="color: #cbd5e1;">Water Depth: 185 cm</div>
            <div style="color: #f87171; font-weight: bold;">Status: PREVIOUS ROUTE INVALIDATED</div>
            <div style="color: #34d399; margin-top: 4px;">Recalculated Detour: Route R4 Highland Bypass → Shelter C</div>
          </div>
        `);
      }

      // 3. WHEN OPERATOR APPROVES: RENDER HIGH-VISIBILITY AUTHORIZED CORRIDOR
      if (isActionApproved) {
        // Outer glow polyline
        L.polyline(activeRouteCoords, {
          color: "#10b981",
          weight: 9,
          opacity: 0.45,
        }).addTo(lg);

        // Core pulsating route
        L.polyline(activeRouteCoords, {
          color: "#34d399",
          weight: 5,
          opacity: 0.95,
          dashArray: "10, 10",
        })
          .bindTooltip(`OPERATOR AUTHORIZED: ${isEscalatedMode ? "Escalated Corridor (R4 → Shelter C)" : "Active Corridor (R2 → Shelter B)"}`, {
            permanent: true,
            direction: "top",
            className: "leaflet-tooltip-dark",
          })
          .addTo(lg);

        // Destination Marker at Target Shelter
        const destinationIcon = createMarkerIcon(
          "#064e3b",
          "#10b981",
          "#ecfdf5",
          "✓",
          targetShelterTitle,
          true
        );
        L.marker(targetShelterCoord, { icon: destinationIcon }).addTo(lg);
      }
    }
  }, [
    incident,
    zones,
    hospitals,
    shelters,
    roads,
    ambulances,
    rescueTeams,
    drones,
    plan,
    simulationStage,
    layers,
    isActionApproved,
    setSelectedZone,
  ]);

  return (
    <div className="w-full h-full relative z-0 min-h-[480px]">
      {/* Map Tile Unavailable System Status Banner */}
      {isTileUnavailable && (
        <div className="absolute top-3 left-3 right-3 sm:right-auto z-[500] flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950/95 border border-amber-500/80 text-amber-300 text-xs font-mono shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 animate-bounce" />
          <div>
            <div className="font-bold flex items-center gap-1.5">
              <span>External service unavailable — local emergency simulation continues.</span>
            </div>
            <div className="text-[10px] text-amber-400/80 font-normal">
              Map tiles offline • Tactical vector grid and evacuation telemetry active
            </div>
          </div>
        </div>
      )}

      {/* Leaflet Map Div with Fallback Tactical Coordinate Grid */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full ${
          isTileUnavailable ? "tactical-fallback-grid" : ""
        } ${activeViewMode === "THERMAL_IR" ? "contrast-125 saturate-150" : ""}`}
        style={{
          minHeight: "480px",
          backgroundColor: isTileUnavailable ? "#070c18" : "#080d1a",
          backgroundImage: isTileUnavailable
            ? "radial-gradient(#1e293b 1px, transparent 1px), linear-gradient(to right, rgba(30, 41, 59, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 41, 59, 0.4) 1px, transparent 1px)"
            : undefined,
          backgroundSize: isTileUnavailable ? "24px 24px, 48px 48px, 48px 48px" : undefined,
        }}
      />
    </div>
  );
}
