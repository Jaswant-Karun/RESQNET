"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import {
  AreaRiskAssessment,
  GdacsAlertEvent,
  FirmsFireDetection,
  WeatherDataPoint,
} from "@/lib/disaster-data/types";

interface LiveDisasterRiskMapLeafletProps {
  assessments: AreaRiskAssessment[];
  gdacsAlerts: GdacsAlertEvent[];
  fireDetections: FirmsFireDetection[];
  weatherForecasts: WeatherDataPoint[];
  activeLayers: {
    riskZones: boolean;
    weatherPrecipitation: boolean;
    gdacsAlerts: boolean;
    firmsHotspots: boolean;
    simulatedFlood: boolean;
  };
  onSelectArea?: (area: AreaRiskAssessment) => void;
}

export function LiveDisasterRiskMapLeaflet({
  assessments,
  gdacsAlerts,
  fireDetections,
  weatherForecasts,
  activeLayers,
  onSelectArea,
}: LiveDisasterRiskMapLeafletProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered around Chennai / Adyar River Emergency Basin
    const map = L.map(mapContainerRef.current, {
      center: [13.0125, 80.2285],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark-themed tactical tiles from CartoDB Dark Matter
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
      }
    ).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Layers when data or activeLayers change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. LAYER: RISK FORECAST AREAS (Circular / Polygon Zones)
    if (activeLayers.riskZones) {
      assessments.forEach((area) => {
        const riskLevel = area.riskLevel;
        // LOW: green, MODERATE: yellow, HIGH: orange, CRITICAL: red
        let color = "#10b981"; // Low (emerald)
        let fillColor = "#10b981";
        if (riskLevel === "CRITICAL") {
          color = "#ef4444";
          fillColor = "#dc2626";
        } else if (riskLevel === "HIGH") {
          color = "#f97316";
          fillColor = "#ea580c";
        } else if (riskLevel === "MODERATE") {
          color = "#eab308";
          fillColor = "#ca8a04";
        }

        const isCritical = riskLevel === "CRITICAL";
        const shortArea =
          area.shortName ||
          (area.areaName.includes(" - ") ? area.areaName.split(" - ")[0] : area.areaName);
        const hazard = area.hazard || "Flood";
        const forecastWindow = area.forecastWindow || "Next 24 hours";

        const factorList =
          area.contributingFactors && area.contributingFactors.length > 0
            ? area.contributingFactors
                .slice(0, 4)
                .map((f) => `<li style="margin-bottom: 2px;">- ${f.name}</li>`)
                .join("")
            : `<li>- Heavy rainfall forecast</li><li>- High precipitation probability</li><li>- Existing incident</li><li>- Population exposure</li>`;

        const updatedTime = new Date(area.timestamp).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

        const popupContent = `
          <div style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; min-width: 250px; max-width: 290px; color: #f8fafc; padding: 12px; background: #070d19; border: 1.5px solid ${color}; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.85); line-height: 1.4;">
            <!-- Label Header -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 6px; margin-bottom: 8px;">
              <span style="background: rgba(99, 102, 241, 0.2); border: 1px solid #6366f1; color: #a5b4fc; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9px; letter-spacing: 0.5px;">
                FORECAST / RISK ASSESSMENT
              </span>
              <span style="font-size: 10px; font-weight: 800; color: ${color}; border: 1px solid ${color}; background: rgba(0,0,0,0.5); padding: 1px 6px; border-radius: 4px;">
                ${riskLevel}
              </span>
            </div>

            <!-- Area -->
            <div style="margin-bottom: 6px;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Area:</div>
              <div style="font-size: 13px; font-weight: bold; color: #ffffff;">${shortArea}</div>
            </div>

            <!-- Hazard -->
            <div style="margin-bottom: 6px;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Hazard:</div>
              <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">${hazard}</div>
            </div>

            <!-- Risk Score & Risk Level -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px; background: #0b1329; padding: 6px 8px; border-radius: 6px; border: 1px solid #1e293b;">
              <div>
                <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Risk Score:</div>
                <div style="font-size: 13px; font-weight: 800; color: ${color};">${area.riskScore}/100</div>
              </div>
              <div>
                <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Risk Level:</div>
                <div style="font-size: 12px; font-weight: bold; color: ${color};">${riskLevel}</div>
              </div>
            </div>

            <!-- Forecast Window -->
            <div style="margin-bottom: 6px; background: #0b1329; padding: 6px 8px; border-radius: 6px; border: 1px solid #1e293b;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Forecast Window:</div>
              <div style="font-size: 11px; font-weight: bold; color: #cbd5e1;">${forecastWindow}</div>
            </div>

            <!-- Main Factors -->
            <div style="margin-bottom: 6px; background: #0f172a; padding: 6px 8px; border-radius: 6px; border: 1px solid #1e293b;">
              <div style="font-size: 9px; color: #cbd5e1; font-weight: bold; margin-bottom: 3px; text-transform: uppercase;">Main Factors:</div>
              <ul style="margin: 0; padding-left: 0; list-style: none; color: #94a3b8; font-size: 10px;">
                ${factorList}
              </ul>
            </div>

            <!-- Data Sources -->
            <div style="margin-bottom: 6px; font-size: 10px; color: #94a3b8;">
              <div style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 600;">Data Sources:</div>
              <div style="color: #cbd5e1; font-weight: 500;">Open-Meteo<br/>RESQNET Risk Engine</div>
            </div>

            <!-- Last Updated -->
            <div style="margin-bottom: 8px; font-size: 10px; color: #94a3b8;">
              <div style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 600;">Last Updated:</div>
              <div style="color: #cbd5e1; font-family: monospace;">${updatedTime}</div>
            </div>

            <!-- Mandatory Warning -->
            <div style="border-top: 1px solid #1e293b; padding-top: 6px; font-size: 9px; color: #f59e0b; font-weight: bold; text-align: center; letter-spacing: 0.3px;">
              ⚠️ NOT AN OFFICIAL EMERGENCY WARNING
            </div>
          </div>
        `;

        // Render circular or polygon risk zones
        if (area.polygonCoordinates && area.polygonCoordinates.length > 0) {
          const polygon = L.polygon(area.polygonCoordinates as L.LatLngTuple[], {
            color,
            fillColor,
            fillOpacity: isCritical ? 0.32 : 0.22,
            weight: isCritical ? 3.5 : 2,
            dashArray: isCritical ? "5, 5" : undefined,
          });
          polygon.bindPopup(popupContent, { className: "tactical-risk-popup", maxWidth: 320 });
          polygon.on("click", () => onSelectArea?.(area));
          layerGroup.addLayer(polygon);
        } else {
          const circle = L.circle([area.latitude, area.longitude], {
            radius: isCritical ? 1100 : riskLevel === "HIGH" ? 850 : 650,
            color,
            fillColor,
            fillOpacity: isCritical ? 0.32 : 0.22,
            weight: isCritical ? 3.5 : 2,
            dashArray: isCritical ? "5, 5" : undefined,
          });
          circle.bindPopup(popupContent, { className: "tactical-risk-popup", maxWidth: 320 });
          circle.on("click", () => onSelectArea?.(area));
          layerGroup.addLayer(circle);
        }

        // Marker pill in center
        const badgeIcon = L.divIcon({
          className: "custom-risk-badge",
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
              ${
                isCritical
                  ? `<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto; width: 34px; height: 34px; border-radius: 9999px; background: ${color}; opacity: 0.55; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                  : ""
              }
              <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 9999px; background: #070d19; border: 2px solid ${color}; box-shadow: 0 0 12px ${color}; color: ${color}; font-weight: 800; font-family: monospace; font-size: 11px; z-index: 10;">
                ${area.riskScore}
              </div>
              <div style="margin-top: 3px; background: rgba(7, 13, 25, 0.95); border: 1.5px solid ${color}; color: ${color}; padding: 1px 6px; border-radius: 4px; font-size: 9px; font-family: monospace; font-weight: 800; white-space: nowrap; box-shadow: 0 3px 8px rgba(0,0,0,0.85); z-index: 11; display: flex; align-items: center; gap: 4px;">
                <span style="font-size: 8px; background: ${color}; color: #000; padding: 0 3px; border-radius: 2px; font-weight: 900;">FORECAST</span>
                <span>${shortArea} [${riskLevel}]</span>
              </div>
            </div>
          `,
          iconSize: [30, 46],
          iconAnchor: [15, 23],
        });

        const badgeMarker = L.marker([area.latitude, area.longitude], { icon: badgeIcon });
        badgeMarker.bindPopup(popupContent, { className: "tactical-risk-popup", maxWidth: 320 });
        badgeMarker.on("click", () => onSelectArea?.(area));
        layerGroup.addLayer(badgeMarker);
      });
    }

    // 2. LAYER: WEATHER PRECIPITATION FORECAST (Open-Meteo markers)
    if (activeLayers.weatherPrecipitation) {
      weatherForecasts.forEach((wf) => {
        const isRainingHeavy = wf.precipitationMm >= 25;
        const iconColor = isRainingHeavy ? "#60a5fa" : "#38bdf8";

        const weatherIcon = L.divIcon({
          className: "custom-weather-icon",
          html: `
            <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid #38bdf8; color: #bae6fd; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 9px; display: flex; align-items: center; gap: 3px; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
              <span>🌧️</span>
              <span>${wf.precipitationMm.toFixed(1)}mm (${wf.precipitationProbability}%)</span>
            </div>
          `,
          iconSize: [85, 20],
          iconAnchor: [42, 10],
        });

        const marker = L.marker([wf.latitude + 0.003, wf.longitude], { icon: weatherIcon });
        marker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #f8fafc;">
            <div style="color: #38bdf8; font-weight: bold; font-size: 9px; margin-bottom: 2px;">[FORECAST CONDITION] • OPEN-METEO</div>
            <div style="font-weight: bold; font-size: 11px; color: #fff;">${wf.areaName}</div>
            <div style="color: #94a3b8; font-size: 10px; margin-top: 4px;">
              • Expected Rain: <strong>${wf.precipitationMm.toFixed(1)} mm</strong><br/>
              • Probability: <strong>${wf.precipitationProbability}%</strong><br/>
              • Conditions: <strong>${wf.weatherDescription}</strong><br/>
              • Wind Speed: <strong>${wf.windSpeedKmh} km/h</strong><br/>
              • Temperature: <strong>${wf.temperatureC}°C</strong>
            </div>
          </div>
        `);
        layerGroup.addLayer(marker);
      });
    }

    // 3. LAYER: GDACS GLOBAL & REGIONAL ALERTS
    if (activeLayers.gdacsAlerts) {
      gdacsAlerts.forEach((alert) => {
        const gdacsIcon = L.divIcon({
          className: "custom-gdacs-icon",
          html: `
            <div style="background: #7f1d1d; border: 1.5px solid #ef4444; color: #fecaca; padding: 2px 6px; border-radius: 12px; font-family: monospace; font-size: 9px; font-weight: bold; display: flex; align-items: center; gap: 3px; box-shadow: 0 0 10px rgba(239, 68, 68, 0.7);">
              <span style="font-size: 11px;">⚠️</span>
              <span>GDACS: ${alert.hazardType}</span>
            </div>
          `,
          iconSize: [110, 22],
          iconAnchor: [55, 11],
        });

        const marker = L.marker([alert.latitude, alert.longitude], { icon: gdacsIcon });
        marker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #f8fafc;">
            <div style="color: #f87171; font-weight: bold; font-size: 9px; margin-bottom: 2px;">[OBSERVED / REPORTED EVENT] • GDACS</div>
            <div style="font-weight: bold; font-size: 12px; color: #fff;">${alert.location}</div>
            <div style="color: #94a3b8; font-size: 10px; margin-top: 4px;">
              • Hazard: <strong>${alert.hazardType}</strong> (Alert: ${alert.severity})<br/>
              • Event ID: <strong>${alert.eventId}</strong><br/>
              • Detected At: <strong>${alert.detectedAt}</strong><br/>
              • Source: <a href="${alert.sourceUrl}" target="_blank" style="color: #60a5fa; text-decoration: underline;">GDACS Official Report</a>
            </div>
          </div>
        `);
        layerGroup.addLayer(marker);
      });
    }

    // 4. LAYER: NASA FIRMS FIRE HOTSPOTS
    if (activeLayers.firmsHotspots && fireDetections.length > 0) {
      fireDetections.forEach((fire) => {
        const fireIcon = L.divIcon({
          className: "custom-firms-icon",
          html: `
            <div style="background: #451a03; border: 1.5px solid #f97316; color: #fed7aa; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 9px; display: flex; align-items: center; gap: 3px;">
              <span>🔥</span>
              <span>THERMAL: ${fire.confidence}</span>
            </div>
          `,
          iconSize: [95, 20],
          iconAnchor: [47, 10],
        });

        const marker = L.marker([fire.latitude, fire.longitude], { icon: fireIcon });
        marker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #f8fafc;">
            <div style="color: #fb923c; font-weight: bold; font-size: 9px; margin-bottom: 2px;">[OBSERVED / REPORTED EVENT] • NASA FIRMS</div>
            <div style="font-weight: bold; font-size: 11px; color: #fff;">Thermal Satellite Anomaly</div>
            <div style="color: #94a3b8; font-size: 10px; margin-top: 4px;">
              • Satellite: <strong>${fire.satellite}</strong><br/>
              • Confidence: <strong>${fire.confidence}</strong><br/>
              • Detected: <strong>${fire.detectedAt}</strong>
            </div>
          </div>
        `);
        layerGroup.addLayer(marker);
      });
    }

    // 5. LAYER: SIMULATED FLOOD INUNDATION CORRIDOR
    if (activeLayers.simulatedFlood) {
      const floodContour = L.polygon(
        [
          [13.0185, 80.2295],
          [13.0155, 80.2365],
          [13.0115, 80.2395],
          [13.0085, 80.2315],
          [13.0125, 80.2225],
        ],
        {
          color: "#3b82f6",
          fillColor: "#1d4ed8",
          fillOpacity: 0.3,
          weight: 2,
          dashArray: "6, 6",
        }
      );
      floodContour.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; color: #f8fafc;">
          <div style="color: #93c5fd; font-weight: bold; font-size: 9px; margin-bottom: 2px;">[SIMULATED EVENT] • HYDROLOGIC MODEL</div>
          <div style="font-weight: bold; font-size: 11px; color: #fff;">Adyar River Inundation Contour</div>
          <div style="color: #cbd5e1; font-size: 10px; margin-top: 4px;">
            Active controlled simulation scenario showing peak flood contour across Sector 7A flood plain.
          </div>
        </div>
      `);
      layerGroup.addLayer(floodContour);
    }
  }, [assessments, gdacsAlerts, fireDetections, weatherForecasts, activeLayers, onSelectArea]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[480px] rounded-b-xl" />;
}
