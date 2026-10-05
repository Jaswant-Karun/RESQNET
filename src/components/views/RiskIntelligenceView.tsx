"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Bot,
  Brain,
  CheckCircle2,
  CloudRain,
  Compass,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  Globe,
  HelpCircle,
  Info,
  Layers,
  Loader2,
  MapPin,
  Radio,
  RefreshCw,
  Satellite,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Waves,
  Wind,
  X,
import { LiveDisasterRiskMap } from "@/components/dashboard/LiveDisasterRiskMap";
import { CriticalRiskAlertBanner } from "@/components/dashboard/CriticalRiskAlertBanner";
import {
  AreaRiskAssessment,
  GdacsAlertEvent,
  FirmsFireDetection,
  WeatherDataPoint,
  ProviderStatus,
  LiveDisasterIntelligencePayload,
} from "@/lib/disaster-data/types";

export function RiskIntelligenceView() {
  const { simulationStage } = useDashboard();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LiveDisasterIntelligencePayload | null>(null);

  // Selected area for deep-dive explanation
  const [selectedArea, setSelectedArea] = useState<AreaRiskAssessment | null>(null);
  const [geminiExplanation, setGeminiExplanation] = useState<string | null>(null);
  const [explainingWithAi, setExplainingWithAi] = useState(false);

  // Fetch live disaster risk intelligence
  const fetchRiskIntelligence = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/risk-intelligence?stage=${simulationStage}&refresh=${forceRefresh}`
      );
      const json = await res.json();

      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error(json.error || "Failed to load risk intelligence.");
      }
    } catch (err: unknown) {
      console.error("[Risk Intelligence View Error]", err);
      setError(
        err instanceof Error ? err.message : "Error connecting to risk intelligence gateway."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRiskIntelligence();
  }, [simulationStage]);

  // Request Gemini explanation of the deterministic risk score
  const handleExplainWithGemini = async (area: AreaRiskAssessment) => {
    setSelectedArea(area);
    setGeminiExplanation(null);
    setExplainingWithAi(true);

    try {
      const res = await fetch("/api/risk-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EXPLAIN_RISK",
          assessment: area,
        }),
      });
      const json = await res.json();
      if (json.success && json.explanation) {
        setGeminiExplanation(json.explanation);
      } else {
        setGeminiExplanation(area.explanation);
      }
    } catch {
      setGeminiExplanation(area.explanation);
    } finally {
      setExplainingWithAi(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. MODULE HEADER & TAXONOMY CLASSIFICATION RIBBON */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-500/60 text-indigo-400 shadow-xl shadow-indigo-950/40">
              <ShieldAlert className="h-7 w-7 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white uppercase">
                  LIVE DISASTER RISK INTELLIGENCE
                </h1>
                <Badge
                  variant="outline"
                  className="bg-indigo-950/80 border-indigo-500/60 text-indigo-300 font-mono text-[10px]"
                >
                  <Sparkles className="h-3 w-3 mr-1 text-indigo-400" />
                  MULTISOURCE SENSORS
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
                Deterministic Risk Modeling • Open-Meteo • GDACS • NASA FIRMS
              </p>
            </div>
          </div>
        </div>

        {/* Global Refresh & Stage Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={simulationStage === "ESCALATED" ? "critical" : "info"}
            pulse={simulationStage === "ESCALATED"}
            className="font-mono text-[10px] uppercase"
          >
            {simulationStage === "ESCALATED" ? "SCENARIO: ESCALATED SURGE" : "SCENARIO: BASELINE INUNDATION"}
          </Badge>

          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchRiskIntelligence(true)}
            disabled={refreshing || loading}
            className="h-8 px-3 text-xs font-mono bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Intelligence
          </Button>
        </div>
      </div>

      {/* CRITICAL RISK DETECTION & COMMANDER REVIEW BANNER */}
      <CriticalRiskAlertBanner />

      {/* 2. STRICT TAXONOMY DISCLOSURE BAR */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-300">
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
          <div>
            <span className="text-red-400 font-bold block text-[10px] uppercase">1. Observed / Reported</span>
            <span className="text-[10px] text-slate-400">GDACS & NASA FIRMS feeds</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
          <div>
            <span className="text-blue-400 font-bold block text-[10px] uppercase">2. Forecast Conditions</span>
            <span className="text-[10px] text-slate-400">Open-Meteo precipitation</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
          <div>
            <span className="text-indigo-400 font-bold block text-[10px] uppercase">3. RESQNET Risk Assessment</span>
            <span className="text-[10px] text-slate-400">Deterministic 0–100 engine</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
          <div>
            <span className="text-cyan-400 font-bold block text-[10px] uppercase">4. Simulated Events</span>
            <span className="text-[10px] text-slate-400">Controlled drill scenario</span>
          </div>
        </div>
      </div>

      {/* 3. PROVIDER STATUS RIBBON */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {data?.providerStatuses?.map((provider) => {
          const isConnected = provider.status === "CONNECTED";
          const lastUpdatedStr = new Date(provider.lastUpdated).toLocaleTimeString();

          return (
            <div
              key={provider.sourceId}
              className={`p-3.5 rounded-xl border flex items-center justify-between font-mono text-xs ${
                isConnected
                  ? "bg-slate-950/80 border-slate-800 text-slate-200"
                  : "bg-slate-950/50 border-amber-900/40 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg border shrink-0 ${
                    isConnected
                      ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-400"
                      : "bg-amber-950/40 border-amber-600/40 text-amber-400"
                  }`}
                >
                  {provider.sourceId === "OPEN_METEO" ? (
                    <CloudRain className="h-4 w-4" />
                  ) : provider.sourceId === "GDACS" ? (
                    <Globe className="h-4 w-4" />
                  ) : (
                    <Satellite className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <span>{provider.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {provider.itemsCount} items • Sync: {lastUpdatedStr}
                  </div>
                </div>
              </div>

              <Badge
                variant={isConnected ? "neutral" : "outline"}
                className={`font-mono text-[9px] uppercase font-bold ${
                  isConnected
                    ? "bg-emerald-950 border-emerald-500/60 text-emerald-300"
                    : "bg-amber-950/60 border-amber-500/50 text-amber-300"
                }`}
              >
                {provider.status}
              </Badge>
            </div>
          );
        })}
      </div>

      {/* 4. MAIN LIVE DISASTER RISK MAP COMPONENT */}
      <div>
        <LiveDisasterRiskMap
          assessments={data?.riskAssessments || []}
          gdacsAlerts={data?.gdacsAlerts || []}
          fireDetections={data?.fireDetections || []}
          weatherForecasts={data?.weatherForecasts || []}
          onSelectArea={(area) => handleExplainWithGemini(area)}
          onRefresh={() => fetchRiskIntelligence(true)}
          isRefreshing={refreshing}
        />
      </div>

      {/* 5. MONITORED SECTORS RISK ASSESSMENT CARDS GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-indigo-400 animate-pulse" />
            <h2 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
              SECTOR RISK ASSESSMENTS (DETERMINISTIC 0–100 SCORING)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {data?.riskAssessments?.length || 0} Monitored Sectors Evaluated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.riskAssessments?.map((area) => {
            const isCritical = area.riskLevel === "CRITICAL";
            const isHigh = area.riskLevel === "HIGH";
            const isMod = area.riskLevel === "MODERATE";

            let scoreBg = "bg-emerald-950/80 border-emerald-500/60 text-emerald-300";
            let levelColor = "text-emerald-400";
            if (isCritical) {
              scoreBg = "bg-red-950/80 border-red-500/60 text-red-300";
              levelColor = "text-red-400";
            } else if (isHigh) {
              scoreBg = "bg-orange-950/80 border-orange-500/60 text-orange-300";
              levelColor = "text-orange-400";
            } else if (isMod) {
              scoreBg = "bg-yellow-950/80 border-yellow-500/60 text-yellow-300";
              levelColor = "text-yellow-400";
            }

            return (
              <Card
                key={area.areaId}
                className="bg-[#080d1a] border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <CardHeader className="p-4 bg-slate-950/70 border-b border-slate-800/80">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300 uppercase">
                        {area.label}
                      </span>
                      <CardTitle className="text-sm font-bold text-white font-mono mt-1.5">
                        {area.areaName}
                      </CardTitle>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Elev: {area.elevationMeters ?? "N/A"}m MSL • Lat: {area.latitude.toFixed(4)}, Lon: {area.longitude.toFixed(4)}
                      </p>
                    </div>

                    <div className={`p-2 rounded-xl border text-center font-mono shrink-0 ${scoreBg}`}>
                      <div className="text-lg font-black">{area.riskScore}</div>
                      <div className="text-[9px] font-bold tracking-widest uppercase mt-[-2px]">
                        {area.riskLevel}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3 font-mono text-xs">
                  {/* Weather Snapshot */}
                  {area.weatherSnapshot && (
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/90 text-[11px] grid grid-cols-2 gap-2 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <CloudRain className="h-3.5 w-3.5 text-blue-400" />
                        <span>Rain: <strong>{area.weatherSnapshot.precipitationMm.toFixed(1)}mm</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Prob: <strong>{area.weatherSnapshot.precipitationProbability}%</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                        <span>Temp: <strong>{area.weatherSnapshot.temperatureC}°C</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wind className="h-3.5 w-3.5 text-teal-400" />
                        <span>Wind: <strong>{area.weatherSnapshot.windSpeedKmh}km/h</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Contributing Factors */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                      Contributing Factors:
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-300 font-sans">
                      {area.contributingFactors.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-indigo-400 mt-0.5">•</span>
                          <div>
                            <strong className="text-slate-100">{f.name}</strong>
                            <span className="text-slate-400 text-[10px] block">{f.description}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[9px] text-slate-500 font-mono">
                    Deterministic score
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExplainWithGemini(area)}
                    className="h-7 px-2.5 text-[10px] font-mono bg-indigo-950/60 border-indigo-500/50 hover:bg-indigo-900 text-indigo-300 hover:text-white cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3 text-indigo-400" />
                    Explain with Gemini
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 6. TRANSPARENT EXPLANATION MODAL / DRAWER */}
      {selectedArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="max-w-xl w-full bg-[#0a0f24] border-2 border-indigo-500/60 shadow-2xl overflow-hidden font-sans">
            <CardHeader className="p-4 bg-slate-950 border-b border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-500/50 text-indigo-400">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold font-mono text-white uppercase">
                    Risk Explanation: {selectedArea.areaName}
                  </CardTitle>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Deterministic Score: {selectedArea.riskScore}/100 ({selectedArea.riskLevel})
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedArea(null)}
                className="h-7 w-7 p-0 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-5 space-y-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Calculated Risk Index</span>
                  <span className="text-xl font-black text-indigo-300 font-mono">
                    {selectedArea.riskScore} / 100
                  </span>
                </div>
                <Badge
                  variant={selectedArea.riskLevel === "CRITICAL" ? "critical" : "warning"}
                  className="text-xs uppercase font-mono"
                >
                  {selectedArea.riskLevel}
                </Badge>
              </div>

              {/* Explaining Status */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Tactical AI Reasoning (Gemini Explains Calculated Score):</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 font-sans text-xs text-slate-200 leading-relaxed min-h-[90px] flex items-center">
                  {explainingWithAi ? (
                    <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing tactical explanation from factor weights...</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-line">{geminiExplanation}</p>
                  )}
                </div>
              </div>

              {/* Quantitative Factor Breakdown */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">
                  Auditable Factor Weightings (Risk Engine Source of Truth):
                </div>
                <div className="space-y-1.5">
                  {selectedArea.contributingFactors.map((f, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px] flex items-center justify-between"
                    >
                      <div className="pr-2">
                        <strong className="text-slate-200">{f.name}</strong>
                        <span className="text-slate-400 text-[10px] block font-sans">{f.description}</span>
                      </div>
                      <span className="text-indigo-400 font-bold shrink-0">
                        {f.weight > 0 ? `+${f.weight}` : f.weight} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>* Gemini explains the score; does not invent the numerical value.</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedArea(null)}
                className="h-7 text-xs font-mono"
              >
                Close
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* 7. MANDATORY DISCLAIMER BANNER */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs font-mono text-indigo-200/90 leading-relaxed flex items-start gap-3">
        <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-indigo-300 block mb-0.5">DISASTER PREDICTION & OFFICIAL WARNING NOTICE:</strong>
          RESQNET does not claim to perfectly predict disasters. This system synthesizes observed sensor telemetry, Open-Meteo meteorological projections, and NASA/GDACS reports into deterministic operational risk assessments for tactical coordination. It does not constitute or replace official governmental disaster warnings issued by meteorological departments or state emergency authorities.
        </div>
      </div>
    </div>
  );
}
