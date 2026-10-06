"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Ambulance,
  Boxes,
  CheckCircle2,
  Flame,
  Navigation,
  RefreshCw,
  Sliders,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import { ResourceAllocation } from "@/types";

interface ResourceAllocationPanelProps {
  className?: string;
}

export function ResourceAllocationPanel({
  className,
}: ResourceAllocationPanelProps) {
  const {
    resourceAllocationState,
    updateResourceAllocation,
    resetResourceAllocation,
    simulationStage,
  } = useDashboard();

  const [showAdjuster, setShowAdjuster] = useState(false);
  const [customAmbulances, setCustomAmbulances] = useState(
    resourceAllocationState.requested.ambulances
  );
  const [customTeams, setCustomTeams] = useState(
    resourceAllocationState.requested.rescueTeams
  );
  const [customDrones, setCustomDrones] = useState(
    resourceAllocationState.requested.drones
  );

  const { items, summary, hasWarning, warnings, available } =
    resourceAllocationState;

  const handleApplyCustom = (req?: ResourceAllocation) => {
    const target = req || {
      ambulances: customAmbulances,
      rescueTeams: customTeams,
      drones: customDrones,
    };
    updateResourceAllocation(target);
    setCustomAmbulances(target.ambulances);
    setCustomTeams(target.rescueTeams);
    setCustomDrones(target.drones);
  };

  const handleEscalationPreset = () => {
    // Escalation high demand: 6 Ambulances, 3 Teams, 2 Drones
    handleApplyCustom({
      ambulances: 6,
      rescueTeams: 3,
      drones: 2,
    });
  };

  const handleExceedAvailabilityTest = () => {
    // Intentionally request more than available: 10 Ambulances (avail: 8), 6 Teams (avail: 4), 5 Drones (avail: 3)
    handleApplyCustom({
      ambulances: 10,
      rescueTeams: 6,
      drones: 5,
    });
  };

  const handleResetInitial = () => {
    resetResourceAllocation();
    setCustomAmbulances(2);
    setCustomTeams(2);
    setCustomDrones(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "READY":
        return (
          <Badge
            variant="success"
            pulse
            className="text-[10px] font-mono tracking-wider font-bold px-2 py-0.5"
          >
            READY
          </Badge>
        );
      case "DEPLOYING":
        return (
          <Badge
            variant="warning"
            pulse
            className="text-[10px] font-mono tracking-wider font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 border-amber-500/50"
          >
            DEPLOYING
          </Badge>
        );
      case "MISSION CREATED":
        return (
          <Badge
            variant="info"
            pulse
            className="text-[10px] font-mono tracking-wider font-bold px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
          >
            MISSION CREATED
          </Badge>
        );
      case "DEPLETED":
        return (
          <Badge
            variant="critical"
            className="text-[10px] font-mono tracking-wider font-bold px-2 py-0.5"
          >
            DEPLETED
          </Badge>
        );
      case "STANDBY":
      default:
        return (
          <Badge
            variant="outline"
            className="text-[10px] font-mono tracking-wider px-2 py-0.5 text-slate-400 border-slate-700"
          >
            STANDBY
          </Badge>
        );
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "ambulances":
        return <Ambulance className="h-4 w-4 text-emerald-400" />;
      case "rescueTeams":
        return <Users className="h-4 w-4 text-indigo-400" />;
      case "drones":
        return <Navigation className="h-4 w-4 text-cyan-400" />;
      default:
        return <Truck className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <Card
      glow={hasWarning ? "orange" : "blue"}
      className={`border-slate-800 bg-[#070c18] shadow-2xl relative overflow-hidden transition-all duration-300 ${
        className || ""
      }`}
    >
      {/* Top Ambient Glow Bar */}
      <div
        className={`h-1 w-full ${
          hasWarning
            ? "bg-gradient-to-r from-amber-500 via-red-500 to-amber-500 animate-pulse"
            : "bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500"
        }`}
      />

      <CardHeader className="py-3 px-4 bg-slate-950/80 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-950/70 border border-blue-800/80 text-blue-400 shadow-inner">
              <Boxes className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs sm:text-sm font-mono tracking-wider text-slate-100 uppercase">
                  RESOURCE ALLOCATION & FLEET STATUS
                </CardTitle>
                <Badge
                  variant={simulationStage === "ESCALATED" ? "critical" : "info"}
                  className="text-[9px] font-mono"
                >
                  {simulationStage === "ESCALATED" ? "CRITICAL ESCALATION" : "SEVERITY ADAPTIVE"}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Dynamic asset dispatch engine based on incident severity & supply availability
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Assigned:{" "}
              <span className="text-emerald-400 font-bold">
                {summary.totalAssigned} / {summary.totalAvailable}
              </span>
            </div>
            <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Capacity:{" "}
              <span
                className={`font-bold ${
                  summary.utilizationPercentage > 80
                    ? "text-amber-400"
                    : "text-blue-400"
                }`}
              >
                {summary.utilizationPercentage}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* WARNING BANNER: Triggered when requested exceeds availability */}
        {hasWarning && (
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/70 text-amber-200 text-xs font-mono flex items-start gap-2.5 shadow-lg shadow-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
            <div className="space-y-1">
              <div className="font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <span>Resource Cap Exceeded — Safety Protocol Engaged</span>
              </div>
              <div className="text-[11px] text-amber-200/90 leading-relaxed">
                Requested resource quantity exceeds current field readiness. The system strictly
                prevents over-allocation and has safely clamped dispatch to maximum available assets.
              </div>
              <ul className="list-disc list-inside text-[10px] text-amber-300/80 space-y-0.5 pt-1">
                {warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* CORE ALLOCATION VIEW: Stacked Cards on Mobile (< sm), Table on Tablet & Desktop (>= sm) */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden">
          {/* Mobile Stacked Cards (< sm) */}
          <div className="sm:hidden divide-y divide-slate-800/80">
            {items.map((item) => {
              const utilization =
                item.available > 0
                  ? Math.round((item.assigned / item.available) * 100)
                  : 0;

              return (
                <div key={item.resourceType} className="p-3.5 space-y-2.5 bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800">
                        {getResourceIcon(item.resourceType)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 text-xs font-mono">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Requested: {item.requested}{" "}
                          {item.isCapped ? (
                            <span className="text-amber-400 font-semibold">(Capped)</span>
                          ) : (
                            <span>({utilization}%)</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-2 font-mono text-center">
                    <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                      <div className="text-[9px] text-slate-400 uppercase">Available</div>
                      <div className="text-xs font-bold text-slate-200 mt-0.5">{item.available}</div>
                    </div>
                    <div className="p-2 rounded bg-blue-950/80 border border-blue-700/60">
                      <div className="text-[9px] text-blue-300 uppercase">Assigned</div>
                      <div className="text-xs font-bold text-blue-200 mt-0.5">{item.assigned}</div>
                    </div>
                    <div className={`p-2 rounded border ${
                      item.remaining === 0
                        ? "bg-red-950/60 border-red-800/80"
                        : "bg-slate-900/90 border-slate-800"
                    }`}>
                      <div className="text-[9px] text-slate-400 uppercase">Remaining</div>
                      <div className={`text-xs font-bold mt-0.5 ${
                        item.remaining === 0 ? "text-red-300" : "text-slate-200"
                      }`}>{item.remaining}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop & Tablet Table (>= sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-[10px] sm:text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 sm:px-4">RESOURCE</th>
                  <th className="py-2.5 px-3 text-center">AVAILABLE</th>
                  <th className="py-2.5 px-3 text-center">ASSIGNED</th>
                  <th className="py-2.5 px-3 text-center">REMAINING</th>
                  <th className="py-2.5 px-3 sm:px-4 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {items.map((item) => {
                  const utilization =
                    item.available > 0
                      ? Math.round((item.assigned / item.available) * 100)
                      : 0;

                  return (
                    <tr
                      key={item.resourceType}
                      className="hover:bg-slate-900/40 transition-colors group"
                    >
                      {/* RESOURCE COLUMN */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800 group-hover:border-slate-700 transition-colors">
                            {getResourceIcon(item.resourceType)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-200 text-xs sm:text-sm">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-slate-500 font-normal">
                              Requested: {item.requested}{" "}
                              {item.isCapped ? (
                                <span className="text-amber-400 font-semibold">
                                  (Capped at {item.assigned})
                                </span>
                              ) : (
                                <span>({utilization}% deployed)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* AVAILABLE COLUMN */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2.5 py-1 rounded bg-slate-900/90 border border-slate-800 text-slate-200 font-bold text-xs sm:text-sm">
                          {item.available}
                        </span>
                      </td>

                      {/* ASSIGNED COLUMN */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2.5 py-1 rounded bg-blue-950/80 border border-blue-700/60 text-blue-300 font-bold text-xs sm:text-sm shadow-sm">
                          {item.assigned}
                        </span>
                      </td>

                      {/* REMAINING COLUMN */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded border font-bold text-xs sm:text-sm ${
                            item.remaining === 0
                              ? "bg-red-950/60 border-red-800/80 text-red-300"
                              : "bg-slate-900/90 border-slate-800 text-slate-300"
                          }`}
                        >
                          {item.remaining}
                        </span>
                      </td>

                      {/* STATUS COLUMN */}
                      <td className="py-3 px-3 sm:px-4 text-right">
                        {getStatusBadge(item.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Allocation Progress Bar Footer */}
          <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                Total Assets Mobilized:{" "}
                <strong className="text-white">
                  {summary.totalAssigned} / {summary.totalAvailable}
                </strong>{" "}
                units ({summary.totalRemaining} in reserve)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Fleet Deployment:</span>
              <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    summary.utilizationPercentage > 85
                      ? "bg-amber-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(100, summary.utilizationPercentage)}%` }}
                />
              </div>
              <span className="font-bold text-slate-300">
                {summary.utilizationPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* TACTICAL ESCALATION & ADJUSTMENT CONTROLS */}
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Tactical Allocation Controls & Escalation Simulator</span>
            </div>
            <button
              onClick={() => setShowAdjuster(!showAdjuster)}
              className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sliders className="h-3 w-3" />
              {showAdjuster ? "Hide Custom Adjuster" : "Custom Adjuster"}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 font-mono">
            Simulate dynamic load changes across initial scenario and emergency escalations.
          </p>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetInitial}
              className="text-[11px] font-mono h-7 px-2.5 text-slate-300 border-slate-700 hover:border-blue-500"
            >
              <RefreshCw className="h-3 w-3 mr-1 text-slate-400" />
              Initial Scenario (2 Amb / 2 Teams / 1 Drone)
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleEscalationPreset}
              className="text-[11px] font-mono h-7 px-2.5 text-amber-300 border-amber-600/60 hover:bg-amber-950/40"
            >
              <Flame className="h-3 w-3 mr-1 text-amber-400" />
              Escalation Surge (6 Amb / 3 Teams / 2 Drones)
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleExceedAvailabilityTest}
              className="text-[11px] font-mono h-7 px-2.5 text-red-300 border-red-700/60 hover:bg-red-950/40"
            >
              <AlertTriangle className="h-3 w-3 mr-1 text-red-400" />
              Test Exceed Availability (10 Amb / 6 Teams / 5 Drones)
            </Button>
          </div>

          {/* Custom Interactive Sliders / Inputs */}
          {showAdjuster && (
            <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              {/* Ambulances Adjuster */}
              <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <Ambulance className="h-3 w-3 text-emerald-400" />
                    Ambulances
                  </span>
                  <span className="text-slate-400">Avail: {available.ambulances}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCustomAmbulances((v) => Math.max(0, v - 1))}
                    className="h-6 w-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={customAmbulances}
                    onChange={(e) => setCustomAmbulances(parseInt(e.target.value) || 0)}
                    className="w-full text-center bg-slate-900 border border-slate-700 rounded py-0.5 text-white font-bold text-xs"
                  />
                  <button
                    onClick={() => setCustomAmbulances((v) => v + 1)}
                    className="h-6 w-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Rescue Teams Adjuster */}
              <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <Users className="h-3 w-3 text-indigo-400" />
                    Rescue Teams
                  </span>
                  <span className="text-slate-400">Avail: {available.rescueTeams}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCustomTeams((v) => Math.max(0, v - 1))}
                    className="h-6 w-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={customTeams}
                    onChange={(e) => setCustomTeams(parseInt(e.target.value) || 0)}
                    className="w-full text-center bg-slate-900 border border-slate-700 rounded py-0.5 text-white font-bold text-xs"
                  />
                  <button
                    onClick={() => setCustomTeams((v) => v + 1)}
                    className="h-6 w-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Drones Adjuster */}
              <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <Navigation className="h-3 w-3 text-cyan-400" />
                    Drones
                  </span>
                  <span className="text-slate-400">Avail: {available.drones}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCustomDrones((v) => Math.max(0, v - 1))}
                    className="h-6 w-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={customDrones}
                    onChange={(e) => setCustomDrones(parseInt(e.target.value) || 0)}
                    className="w-full text-center bg-slate-900 border border-slate-700 rounded py-0.5 text-white font-bold text-xs"
                  />
                  <button
                    onClick={() => setCustomDrones((v) => v + 1)}
                    className="h-6 w-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="sm:col-span-3 flex justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleApplyCustom()}
                  className="text-xs font-mono bg-blue-600 hover:bg-blue-500 text-white font-bold h-7 px-3"
                >
                  Apply Custom Allocation
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
