"use client";

import { useState, useEffect } from "react";
import { useCommandCenter } from "@/hooks/useCommandCenter";
import TournamentOverview from "@/components/command-center/TournamentOverview";
import StadiumHealthCards from "@/components/command-center/StadiumHealthCards";
import LiveIncidentsFeed from "@/components/command-center/LiveIncidentsFeed";
import CrowdCongestionHeat from "@/components/command-center/CrowdCongestionHeat";
import QueueWatchlist from "@/components/command-center/QueueWatchlist";
import TransitDisruptions from "@/components/command-center/TransitDisruptions";
import AccessibilityActivity from "@/components/command-center/AccessibilityActivity";
import CommunicationsCenter from "@/components/command-center/CommunicationsCenter";
import { RiskRadar } from "@/components/command-center/RiskRadar";
import { MatchDayTimeline } from "@/components/command-center/MatchDayTimeline";
import { EscalationPanel } from "@/components/command-center/EscalationPanel";
import StadiumTags from "@/components/command-center/StadiumTags";
import { IncidentDrawer } from "@/components/command-center/IncidentDrawer";
import { CommandCenterFilters } from "@/components/command-center/CommandCenterFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Wifi } from "lucide-react";
import type { CommandCenterState } from "@/lib/command-center/types";

interface CommandCenterClientProps {
  initialData: CommandCenterState;
}

export default function CommandCenterClient({ initialData }: CommandCenterClientProps) {
  const { data, filters, connected, isLoading, refresh, updateFilters, acknowledgeIncident, acknowledgeRisk } =
    useCommandCenter(initialData);

  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [selectedStadium, setSelectedStadium] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const selectedIncidentData = data.incidents.find((i) => i.id === selectedIncident) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-text-primary">Command Center</h1>
          <div className="flex items-center gap-1.5">
            {connected ? (
              <Badge className="bg-success/10 text-success border-success/20 text-[10px]">
                <Wifi className="w-3 h-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge className="bg-info/10 text-info border-info/20 text-[10px]">
                <RefreshCw className="w-3 h-3 mr-1" />
                Polling
              </Badge>
            )}
            <span className="text-[10px] text-text-muted font-mono" suppressHydrationWarning>
              {new Date(data.lastUpdated).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
          className="h-7 text-xs border-border text-text-secondary"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <CommandCenterFilters filters={filters} onFilterChange={updateFilters} stadiums={data.stadiums} />

      {/* Row 1: Overview (full width) */}
      <div className="grid grid-cols-12 gap-4 items-stretch">
        <div className="col-span-12">
          <TournamentOverview data={data.overview} />
        </div>
      </div>

      {/* Row 1.5: Stadium Tags */}
      <StadiumTags
        stadiums={data.stadiums}
        transit={data.transit}
        queues={data.queues}
        accessibility={data.accessibility}
      />

      {/* Row 2: Stadium Health + Escalations */}
      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-12 lg:col-span-8">
          <StadiumHealthCards
            stadiums={data.stadiums}
            selectedStadium={selectedStadium}
            onSelectStadium={setSelectedStadium}
          />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <EscalationPanel escalations={data.escalations} className="h-full" />
        </div>
      </div>

      {/* Row 3: Incidents + Risk Radar */}
      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-12 lg:col-span-6">
          <LiveIncidentsFeed
            incidents={data.incidents}
            onSelectIncident={setSelectedIncident}
            onAcknowledge={acknowledgeIncident}
            filters={filters}
          />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <RiskRadar
            risks={data.risks}
            recommendations={data.recommendations}
            onAcknowledgeRisk={acknowledgeRisk}
          />
        </div>
      </div>

      {/* Row 4: Congestion + Queues + Transit */}
      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-12 lg:col-span-4">
          <CrowdCongestionHeat zones={data.congestion} selectedStadium={selectedStadium} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <QueueWatchlist queues={data.queues} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <TransitDisruptions disruptions={data.transit} />
        </div>
      </div>

      {/* Row 5: Timeline + Accessibility */}
      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-12 lg:col-span-8">
          <MatchDayTimeline matches={data.timeline} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <AccessibilityActivity activities={data.accessibility} />
        </div>
      </div>

      {/* Row 6: Communications (full width) */}
      <div className="grid grid-cols-12 gap-4 items-stretch">
        <div className="col-span-12">
          <CommunicationsCenter communications={data.communications} />
        </div>
      </div>

      <IncidentDrawer
        incident={selectedIncidentData}
        open={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onAcknowledge={acknowledgeIncident}
      />
    </div>
  );
}
