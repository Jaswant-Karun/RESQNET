import React from "react";
import { getDisasterDataSet } from "@/data";
import { IncidentBanner } from "@/components/dashboard/IncidentBanner";
import { MetricsOverview } from "@/components/dashboard/MetricsOverview";
import { ZoneMatrix } from "@/components/dashboard/ZoneMatrix";
import { ResourceFleet } from "@/components/dashboard/ResourceFleet";
import { InfrastructureStatus } from "@/components/dashboard/InfrastructureStatus";
import { ResponsePlanReview } from "@/components/dashboard/ResponsePlanReview";
import { AlertsFeed } from "@/components/dashboard/AlertsFeed";
import { TimelineFeed } from "@/components/dashboard/TimelineFeed";
import { MapPlaceholder } from "@/components/dashboard/MapPlaceholder";

export default function Home() {
  const data = getDisasterDataSet();

  return (
    <div className="space-y-6">
      {/* 1. Incident Command Banner */}
      <IncidentBanner incident={data.incident} />

      {/* 2. Key Telemetry & Readiness Metrics Bar */}
      <MetricsOverview data={data} />

      {/* 3. Main Command Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left & Center Columns: Map, AI Response Plan, Fleet & Infrastructure */}
        <div className="xl:col-span-2 space-y-6">
          {/* Spatial GIS View */}
          <MapPlaceholder zones={data.zones} />

          {/* AI Response Plan with Human-in-the-Loop Approval */}
          <ResponsePlanReview plan={data.plan} />

          {/* Asset Deployment (Drones, Teams, Ambulances) */}
          <ResourceFleet
            rescueTeams={data.rescueTeams}
            ambulances={data.ambulances}
            drones={data.drones}
          />

          {/* Sector Risk Matrix */}
          <ZoneMatrix zones={data.zones} />

          {/* Medical & Shelter Infrastructure & Roads */}
          <InfrastructureStatus
            hospitals={data.hospitals}
            shelters={data.shelters}
            roads={data.roads}
          />
        </div>

        {/* Right Column: Live Alerts & Chronological Incident Log */}
        <div className="space-y-6">
          {/* High-priority Alerts & Radio Directives */}
          <AlertsFeed alerts={data.alerts} />

          {/* Incident Timeline Log */}
          <TimelineFeed timeline={data.timeline} />
        </div>
      </div>
    </div>
  );
}
