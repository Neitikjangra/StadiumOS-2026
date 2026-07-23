"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Clock,
  MapPin,
  AlertTriangle,
  Shield,
  Phone,
  Cloud,
  Thermometer,
  Wind,
  Droplets,
  Eye,
  Users,
  ChevronRight,
  ShieldAlert,
  Info,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const safetyTips = [
  "Keep your ticket and ID accessible at all times",
  "Stay hydrated - free water stations at all gates",
  "Report suspicious activity to security or text HELP",
  "Know your nearest emergency exit (shown on your ticket)",
  "Keep personal belongings secure in front of you",
];

const emergencyContacts = [
  { service: "Stadium Security", number: "Text SECURE to 55512" },
  { service: "Medical Emergency", number: "Dial 911" },
  { service: "FIFA Hotline", number: "+1 (201) 555-2026" },
  { service: "Lost & Found", number: "Visit Gate A Info Desk" },
];

interface MatchData {
  id: string;
  homeTeamName: string;
  homeTeamFlag: string;
  homeScore: number | null;
  awayTeamName: string;
  awayTeamFlag: string;
  awayScore: number | null;
  status: string;
  kickOff: string;
  venue: string | null;
  attendance: number | null;
  stage: string;
}

interface MatchEvent {
  time: string;
  type: string;
  team: string;
  event: string;
  player: string;
}

interface GateData {
  name: string;
  status: string;
  crowd: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditions: string;
}

export default function MatchPage() {
  const [activeTab, setActiveTab] = useState<"timeline" | "stadium" | "safety">("timeline");
  const [match, setMatch] = useState<MatchData | null>(null);
  const [timeline, setTimeline] = useState<MatchEvent[]>([]);
  const [gates, setGates] = useState<GateData[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const matchRes = await fetch("/api/matches");
        const matchJson = await matchRes.json();
        if (matchJson.success && matchJson.data?.items?.length > 0) {
          const m = matchJson.data.items[0];
          setMatch(m);

          const evtRes = await fetch(`/api/matches/${m.id}`);
          const evtJson = await evtRes.json();
          if (evtJson.data?.events) {
            setTimeline(evtJson.data.events);
          }

          if (m.stadiumId) {
            const gateRes = await fetch(`/api/mobility?stadiumId=${m.stadiumId}`);
            const gateJson = await gateRes.json();
            if (gateJson.success && gateJson.data?.gates) {
              setGates(gateJson.data.gates.map((g: any) => ({
                name: g.name,
                status: g.status === "open" ? "open" : "restricted",
                crowd: g.queueLength > 200 ? "high" : g.queueLength > 100 ? "medium" : "low",
              })));
            }

            const weatherRes = await fetch("/api/ingest/weather");
            const weatherJson = await weatherRes.json();
            if (weatherJson.data) {
              setWeather(weatherJson.data);
            }
          }
        }
      } catch {}
    }
    loadData();
  }, []);

  const statusLabel = match?.status === "in_progress" ? "Live" : match?.status === "half_time" ? "Half Time" : match?.status === "full_time" ? "Full Time" : "Scheduled";

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="p-4 flex items-center gap-3">
          <Link href="/fan">
            <Button variant="ghost" size="icon" className="text-text-primary h-12 w-12">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-text-primary">Match Day</h1>
            <p className="text-xs text-text-secondary">{match?.stage?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Match"} • {match?.venue || "Stadium"}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Match Header */}
        <Card className="border border-border bg-surface rounded-lg shadow-sm">
          <CardContent className="p-6">
            {match ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <Badge className={`${match.status === "in_progress" ? "bg-success/10 text-success border-success/20 animate-pulse" : "bg-info/10 text-info border-info/20"}`}>
                    {statusLabel}
                  </Badge>
                  {match.status === "in_progress" && (
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-mono font-bold">LIVE</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-4xl">{match.homeTeamFlag}</span>
                    <span className="text-base font-bold text-text-primary">{match.homeTeamName}</span>
                  </div>
                  <div className="text-center px-6">
                    <p className="text-4xl font-black text-text-primary">
                      {match.homeScore ?? 0} - {match.awayScore ?? 0}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-4xl">{match.awayTeamFlag}</span>
                    <span className="text-base font-bold text-text-primary">{match.awayTeamName}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-text-secondary">
                  <Users className="h-4 w-4" />
                  <span>Attendance: {match.attendance?.toLocaleString() || "N/A"}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-text-muted">Loading match data...</div>
            )}
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "timeline" as const, label: "Timeline" },
            { id: "stadium" as const, label: "Stadium" },
            { id: "safety" as const, label: "Safety" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={`text-xs font-medium h-12 ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-text-muted hover:text-text-primary"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <Card className="border border-border bg-surface rounded-lg shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-text-primary">
                Match Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {timeline.length > 0 ? timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        event.type === "goal"
                          ? "bg-success text-white"
                          : event.type === "card"
                          ? "bg-warning text-black"
                          : event.type === "var"
                          ? "bg-primary text-white"
                          : event.type === "penalty"
                          ? "bg-warning text-white"
                          : "bg-info text-white"
                      }`}
                    >
                      {event.time}
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="w-0.5 h-6 bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-sm font-medium text-text-primary">{event.event}</p>
                    {event.player && (
                      <p className="text-xs text-text-muted">{event.player}</p>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-text-muted text-center py-4">No events yet</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stadium Tab */}
        {activeTab === "stadium" && (
          <>
            <Card className="border border-border bg-surface rounded-lg shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-text-primary">
                  Gate Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {gates.length > 0 ? gates.map((gate) => (
                  <div
                    key={gate.name}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-alt"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-text-secondary" />
                      <span className="text-sm font-medium text-text-primary">{gate.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-xs ${
                          gate.crowd === "low"
                            ? "bg-success/10 text-success border-success/20"
                            : gate.crowd === "medium"
                            ? "bg-warning/10 text-warning border-warning/20"
                            : "bg-danger/10 text-danger border-danger/20"
                        }`}
                      >
                        {gate.crowd}
                      </Badge>
                      <Badge
                        className={`text-xs ${
                          gate.status === "open"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-warning/10 text-warning border-warning/20"
                        }`}
                      >
                        {gate.status}
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-text-muted text-center py-4">Loading gate data...</p>
                )}
              </CardContent>
            </Card>

            {/* Weather */}
            {weather && (
              <Card className="border border-border bg-surface rounded-lg shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Cloud className="h-5 w-5 text-info" />
                    <span className="text-sm font-semibold text-text-primary">Weather</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-warning" />
                      <span className="text-sm text-text-secondary">{weather.temperature}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-info" />
                      <span className="text-sm text-text-secondary">{weather.windSpeed} km/h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-info" />
                      <span className="text-sm text-text-secondary">{weather.humidity}% humidity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-text-muted" />
                      <span className="text-sm text-text-secondary">{weather.conditions}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Safety Tab */}
        {activeTab === "safety" && (
          <>
            <Card className="border border-border bg-surface rounded-lg shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {safetyTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-surface-alt">
                    <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
                    <p className="text-sm text-text-secondary">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-border bg-surface rounded-lg shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Phone className="h-4 w-4 text-danger" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {emergencyContacts.map((contact, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-alt border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">{contact.service}</p>
                      <p className="text-xs text-text-muted">{contact.number}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-text-muted h-12 w-12" onClick={() => toast.info("Emergency contact: 911")}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-danger/20 bg-danger/5 rounded-lg shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-danger shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-danger">Emergency Evacuation</p>
                    <p className="text-xs text-text-secondary mt-1">
                      Follow illuminated exit signs. Proceed calmly to the nearest gate.
                      Security personnel will guide you. If you need assistance, alert
                      the nearest staff member wearing a yellow vest.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
