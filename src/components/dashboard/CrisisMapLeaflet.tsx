"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
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
    simulationStage,
    setSelectedZone,
  } = useDashboard();

  // 1. Initialize Map instance once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center map around Adyar River Basin (Chennai Metro Sector)
    const initialMap = L.map(mapContainerRef.current, {
      center: [13.0145, 80.2225],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // OpenStreetMap standard tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(initialMap);

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
  }, []);

  // 2. Render and update map layers whenever data, simulationStage, or filter layers change
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

        const polyFill = isCritical
          ? "rgba(239, 68, 68, 0.35)"
          : isHigh
          ? "rgba(249, 115, 22, 0.25)"
          : "rgba(59, 130, 246, 0.15)";

        // Draw tactical polygon boundaries
        const polygon = L.polygon(zone.polygonCoordinates, {
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
        const isZoneA = zone.code === "Z-ALPHA";
        const isZoneB = zone.code === "Z-BRAVO";

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
          <div style="padding: 12px; font-family: sans-serif; min-width: 200px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-family: monospace; font-weight: bold; color: ${polyColor}; font-size: 11px;">${zone.code}</span>
              <span style="font-size: 10px; background: ${isCritical ? '#450a0a' : '#431407'}; color: ${polyColor}; padding: 1px 6px; border-radius: 4px; font-weight: bold;">${zone.riskLevel}</span>
            </div>
            <div style="font-weight: bold; color: #f8fafc; font-size: 12px; margin-bottom: 4px;">${zone.name}</div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">Inundation Depth: <strong style="color: ${polyColor};">${zone.waterDepthMeters}m</strong></div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">Estimated Pop: <strong>${zone.populationEstimate.toLocaleString()}</strong></div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 6px;">Evac Progress: <strong style="color: #10b981;">${zone.evacuationProgressPercentage}%</strong></div>
            <div style="font-size: 10px; background: #0f172a; padding: 4px 6px; border-radius: 4px; border: 1px solid #1e293b; color: #94a3b8;">
              Status: <span style="color: #f8fafc; font-weight: bold;">${zone.status}</span>
            </div>
          </div>
        `);
      });
    }

    // 3, 4, 5. HOSPITALS (H1, H2, H3) - BLUE
    if (layers.infrastructure) {
      hospitals.forEach((hosp, idx) => {
        const hTag = `H${idx + 1}`;
        const marker = L.marker([hosp.location.latitude, hosp.location.longitude], {
          icon: createMarkerIcon(
            "#0b1120",
            "#3b82f6",
            "#60a5fa",
            hTag,
            `Hospital ${hTag}`
          ),
        }).addTo(lg);

        marker.bindPopup(`
          <div style="padding: 12px; font-family: sans-serif; min-width: 220px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-family: monospace; font-weight: bold; color: #60a5fa; font-size: 11px;">[${hTag}] MEDICAL FACILITY</span>
              <span style="font-size: 10px; background: #172554; color: #93c5fd; padding: 1px 6px; border-radius: 4px;">${hosp.type}</span>
            </div>
            <div style="font-weight: bold; color: #f8fafc; font-size: 12px; margin-bottom: 6px;">${hosp.name}</div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">Available Beds: <strong style="color: #10b981;">${hosp.availableBeds} / ${hosp.totalBeds}</strong></div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">ICU Units Free: <strong style="color: #38bdf8;">${hosp.icuAvailable} / ${hosp.icuTotal}</strong></div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 4px;">Elevation: <strong>${hosp.location.elevationMeters}m</strong></div>
            <div style="font-family: monospace; font-size: 10px; color: #94a3b8;">Radio: ${hosp.contactRadio}</div>
          </div>
        `);
      });

      // 6 & 7. SHELTERS (Shelter B, Shelter C) - GREEN
      shelters.forEach((shelter) => {
        let shelterTag = "Shelter";
        if (shelter.id.includes("guindy")) shelterTag = "Shelter B";
        else if (shelter.id.includes("alandur")) shelterTag = "Shelter C";
        else shelterTag = "Shelter A";

        const marker = L.marker([shelter.location.latitude, shelter.location.longitude], {
          icon: createMarkerIcon(
            "#0b1120",
            "#10b981",
            "#34d399",
            "⌂",
            shelterTag
          ),
        }).addTo(lg);

        marker.bindPopup(`
          <div style="padding: 12px; font-family: sans-serif; min-width: 220px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-family: monospace; font-weight: bold; color: #34d399; font-size: 11px;">[${shelterTag}] RELIEF CENTER</span>
              <span style="font-size: 10px; background: #064e3b; color: #a7f3d0; padding: 1px 6px; border-radius: 4px;">${shelter.status}</span>
            </div>
            <div style="font-weight: bold; color: #f8fafc; font-size: 12px; margin-bottom: 6px;">${shelter.name}</div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">Capacity: <strong>${shelter.currentOccupancy} / ${shelter.totalCapacity}</strong></div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 2px;">Water Supply: <strong style="color: #38bdf8;">${shelter.waterSupplyDays} Days</strong></div>
            <div style="font-family: monospace; font-size: 11px; color: #cbd5e1; margin-bottom: 4px;">Rations: <strong style="color: #fbbf24;">${shelter.foodRationsDays} Days</strong></div>
            <div style="font-size: 10px; color: #94a3b8;">Medical Station: <strong style="color: #f8fafc;">${shelter.medicalStationPresent ? "OPERATIONAL" : "STANDBY"}</strong></div>
          </div>
        `);
      });
    }

    // 8. AMBULANCES - WHITE/BLUE
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

      // 9. RESCUE TEAMS - PURPLE
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

    // 10. DRONES - CYAN
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

    // ROADS & BLOCKED HIGHWAYS
    if (layers.roads) {
      roads.forEach((road) => {
        // If simulation escalated, Anna Salai corridor also gets severely waterlogged/impassable
        const isEscalatedSubmerged =
          simulationStage === "ESCALATED" && road.id === "road-annasalai-corridor";

        const isBlocked =
          road.status === "SUBMERGED" ||
          road.status === "IMPASSABLE" ||
          isEscalatedSubmerged;

        const roadColor = isBlocked ? "#ef4444" : road.status === "WATERLOGGED" ? "#f97316" : "#10b981";

        const poly = L.polyline(
          [
            [road.startPoint.latitude, road.startPoint.longitude],
            [road.endPoint.latitude, road.endPoint.longitude],
          ],
          {
            color: roadColor,
            weight: isBlocked ? 5 : 4,
            dashArray: isBlocked ? "6, 6" : undefined,
            opacity: 0.9,
          }
        ).addTo(lg);

        poly.bindPopup(`
          <div style="padding: 10px; font-family: monospace; font-size: 11px;">
            <div style="font-weight: bold; color: ${roadColor}; margin-bottom: 4px;">${road.name}</div>
            <div style="color: #cbd5e1;">Code: ${road.routeCode}</div>
            <div style="color: ${roadColor}; font-weight: bold;">Status: ${isBlocked ? "ROAD BLOCKED / SUBMERGED" : road.status}</div>
            <div style="color: #cbd5e1;">Water Depth: ${isEscalatedSubmerged ? "110 cm" : road.waterDepthCm + " cm"}</div>
            ${road.detourRouteName ? `<div style="color: #f59e0b; margin-top: 4px; font-size: 10px;">Recommended Detour: ${road.detourRouteName}</div>` : ""}
          </div>
        `);
      });

      // EVACUATION ROUTE HIGHLIGHT
      plan.evacuationRoutes.forEach((route) => {
        // Safe route corridor from Sector 7A/7B to Alandur Shelter via Guindy Highland
        const routeCoords: [number, number][] = [
          [13.0135, 80.2312], // Kotturpuram
          [13.0185, 80.2095], // Guindy Apex
          [12.9972, 80.1975], // Alandur Stadium Shelter
        ];

        L.polyline(routeCoords, {
          color: "#34d399",
          weight: 4,
          opacity: 0.85,
          dashArray: "8, 8",
        }).addTo(lg);
      });
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
    setSelectedZone,
  ]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-full relative z-0 ${
        activeViewMode === "THERMAL_IR" ? "contrast-125 saturate-150" : ""
      }`}
      style={{ minHeight: "480px" }}
    />
  );
}
