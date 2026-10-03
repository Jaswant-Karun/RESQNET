import React from "react";
import { Zone } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, ShieldAlert, Users } from "lucide-react";

interface ZoneMatrixProps {
  zones: Zone[];
}

export function ZoneMatrix({ zones }: ZoneMatrixProps) {
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs sm:text-sm">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            Operational Flood Risk Zones (Sectors)
          </CardTitle>
          <span className="text-[11px] font-mono text-slate-400">
            {zones.length} ZONED SECTORS MONITORED
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Zone Code & Name</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Water Inundation</th>
                <th className="py-2.5 px-3">Population</th>
                <th className="py-2.5 px-3">Evac Progress</th>
                <th className="py-2.5 px-3 text-right">Zone Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {zones.map((zone) => {
                const getRiskBadge = (level: string) => {
                  switch (level) {
                    case "CRITICAL":
                      return <Badge variant="critical" pulse>CRITICAL</Badge>;
                    case "HIGH":
                      return <Badge variant="warning">HIGH RISK</Badge>;
                    case "MODERATE":
                      return <Badge variant="info">MODERATE</Badge>;
                    default:
                      return <Badge variant="success">SAFE BUFFER</Badge>;
                  }
                };

                return (
                  <tr
                    key={zone.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {zone.code}
                        </span>
                        <span>{zone.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Center: {zone.center.latitude.toFixed(4)}°N, {zone.center.longitude.toFixed(4)}°E
                      </div>
                    </td>
                    <td className="py-3 px-3">{getRiskBadge(zone.riskLevel)}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-200">
                        {zone.waterDepthMeters > 0 ? `${zone.waterDepthMeters.toFixed(1)} m depth` : "Dry Ground"}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Users className="h-3 w-3 text-slate-400" />
                        <span>{zone.populationEstimate.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              zone.evacuationProgressPercentage === 100
                                ? "bg-emerald-500"
                                : zone.evacuationProgressPercentage > 60
                                ? "bg-blue-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${zone.evacuationProgressPercentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-300">
                          {zone.evacuationProgressPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase ${
                          zone.status === "SUBMERGED"
                            ? "text-red-400"
                            : zone.status === "EVACUATING"
                            ? "text-amber-400"
                            : zone.status === "AT_RISK"
                            ? "text-yellow-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {zone.status === "SUBMERGED" && <AlertCircle className="h-3 w-3" />}
                        {zone.status === "SAFE_BUFFER" && <CheckCircle2 className="h-3 w-3" />}
                        {zone.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
