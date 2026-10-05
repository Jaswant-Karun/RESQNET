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

    // 1. LAYER: RESQNET RISK ASSESSMENTS (Circles with Risk-Level colors)
    if (activeLayers.riskZones) {
      assessments.forEach((area) => {
        let color = "#10b981"; // Low (emerald)
        let fillColor = "#10b981";
        if (area.riskLevel === "CRITICAL") {
          color = "#ef4444";
          fillColor = "#dc2626";
        } else if (area.riskLevel === "HIGH") {
          color = "#f97316";
          fillColor = "#ea580c";
        } else if (area.riskLevel === "MODERATE") {
          color = "#eab308";
          fillColor = "#ca8a04";
        }

        const circle = L.circle([area.latitude, area.longitude], {
          radius: area.riskLevel === "CRITICAL" ? 1100 : area.riskLevel === "HIGH" ? 850 : 650,
          color,
          fillColor,
          fillOpacity: 0.25,
          weight: 2,
          dashArray: area.riskLevel === "CRITICAL" ? "4, 4" : undefined,
        });

        const factorsHtml = area.contributingFactors
          .slice(0, 3)
          .map((f) => `<li style="margin-top:2px;">• <strong>${f.name}</strong>: ${f.description}</li>`)
          .join("");

        const popupContent = `
          <div style="font-family: ui-monospace, SFMono-Regular, monospace; min-width: 240px; color: #f8fafc; font-size: 11px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
              <span style="background: #312e81; color: #a5b4fc; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9px;">[RESQNET RISK ASSESSMENT]</span>
              <span style="color: ${color}; font-weight: bold;">${area.riskLevel} (${area.riskScore}/100)</span>
            </div>
            <div style="font-size: 12px; font-weight: bold; color: #fff; margin-bottom: 4px;">${area.areaName}</div>
            <div style="color: #94a3b8; margin-bottom: 6px; font-size: 10px;">Elevation: ${area.elevationMeters ?? "N/A"}m MSL | Lat: ${area.latitude.toFixed(4)}, Lon: ${area.longitude.toFixed(4)}</div>
            <div style="background: #0f172a; padding: 6px; border-radius: 4px; border: 1px solid #1e293b; margin-bottom: 6px;">
              <div style="color: #cbd5e1; font-weight: bold; margin-bottom: 2px; font-size: 10px;">Primary Contributing Factors:</div>
              <ul style="margin: 0; padding-left: 4px; list-style: none; color: #94a3b8; font-size: 10px;">${factorsHtml}</ul>
            </div>
            <div style="color: #64748b; font-size: 9px; font-style: italic;">
              * Deterministic assessment for coordination. Not an official government warning.
            </div>
          </div>
        `;

        circle.bindPopup(popupContent, { className: "tactical-popup" });
        circle.on("click", () => onSelectArea?.(area));
        layerGroup.addLayer(circle);

        // Marker pill in center
        const badgeIcon = L.divIcon({
          className: "custom-risk-badge",
          html: `
            <div style="background: #090e1d; border: 1.5px solid ${color}; color: ${color}; padding: 2px 6px; border-radius: 6px; font-family: monospace; font-size: 10px; font-weight: bold; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 4px;">
              <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${color};"></span>
              <span>${area.areaName.split(" - ")[0]}: ${area.riskScore}</span>
            </div>
          `,
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });

        const badgeMarker = L.marker([area.latitude, area.longitude], { icon: badgeIcon });
        badgeMarker.bindPopup(popupContent, { className: "tactical-popup" });
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
