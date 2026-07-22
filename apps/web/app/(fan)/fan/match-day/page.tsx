"use client";

import { useState } from "react";
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

const matchInfo = {
  homeTeam: { name: "Brazil", flag: "🇧🇷", score: 2 },
  awayTeam: { name: "Argentina", flag: "🇦🇷", score: 1 },
  status: "2nd Half",
  time: "78:24",
  venue: "MetLife Stadium, East Rutherford",
  attendance: "82,500",
};

const timeline = [
  { time: "12'", type: "goal", team: "home", event: "Goal - Vinícius Jr.", player: "#7" },
  { time: "34'", type: "card", team: "away", event: "Yellow Card - Rodrigo De Paul", player: "#7" },
  { time: "45+2'", type: "goal", team: "away", event: "Goal - Lautaro Martínez", player: "#22" },
  { time: "56'", type: "var", team: "none", event: "VAR Review - Penalty Check", player: "" },
  { time: "58'", type: "penalty", team: "home", event: "Penalty Awarded to Brazil", player: "" },
  { time: "59'", type: "goal", team: "home", event: "Goal - Rodrygo (Penalty)", player: "#11" },
  { time: "67'", type: "sub", team: "home", event: "Substitution - Raphinha OFF, Savinho ON", player: "#10 ↔ #18" },
  { time: "72'", type: "sub", team: "away", event: "Substitution - Messi OFF, Dybala ON", player: "#10 ↔ #21" },
  { time: "78'", type: "card", team: "home", event: "Yellow Card - Marquinhos", player: "#3" },
];

const gates = [
  { name: "Gate A", status: "open", crowd: "low" },
  { name: "Gate B", status: "open", crowd: "medium" },
  { name: "Gate C", status: "open", crowd: "high" },
  { name: "Gate D", status: "restricted", crowd: "high" },
  { name: "Gate E", status: "open", crowd: "low" },
];

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

export default function MatchPage() {
  const [activeTab, setActiveTab] = useState<"timeline" | "stadium" | "safety">("timeline");

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
            <p className="text-xs text-text-secondary">Round of 16 • MetLife Stadium</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Match Header */}
        <Card className="border border-border bg-surface rounded-lg shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-success/10 text-success border-success/20 animate-pulse">
                {matchInfo.status}
              </Badge>
              <div className="flex items-center gap-2 text-text-secondary">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-mono font-bold">{matchInfo.time}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-4xl">{matchInfo.homeTeam.flag}</span>
                <span className="text-base font-bold text-text-primary">{matchInfo.homeTeam.name}</span>
              </div>
              <div className="text-center px-6">
                <p className="text-4xl font-black text-text-primary">
                  {matchInfo.homeTeam.score} - {matchInfo.awayTeam.score}
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-4xl">{matchInfo.awayTeam.flag}</span>
                <span className="text-base font-bold text-text-primary">{matchInfo.awayTeam.name}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-text-secondary">
              <Users className="h-4 w-4" />
              <span>Attendance: {matchInfo.attendance}</span>
            </div>
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
              {timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        event.type === "goal"
                          ? "bg-success text-white"
                          : event.type === "card"
                          ? event.event.includes("Red")
                            ? "bg-danger text-white"
                            : "bg-warning text-black"
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
              ))}
            </CardContent>
          </Card>
        )}

        {/* Stadium Tab */}
        {activeTab === "stadium" && (
          <>
            <Card className="border border-border bg-surface rounded-lg shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-text-primary">
                  Stadium Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full aspect-[4/3] bg-surface-alt rounded-xl border border-border overflow-hidden">
                  {/* Simplified stadium layout */}
                  <div className="absolute inset-4 border-2 border-text-muted/20 rounded-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-success font-bold">
                      North Stand
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-xs text-success font-bold">
                      South Stand
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 text-xs text-info font-bold">
                      Gate A
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-xs text-warning font-bold">
                      Gate C
                    </div>
                    <div className="absolute top-0 right-0 text-xs text-primary font-bold">
                      Gate B
                    </div>
                    <div className="absolute bottom-0 left-0 text-xs text-danger font-bold">
                      Gate E
                    </div>
                    {/* Pitch */}
                    <div className="absolute inset-8 border border-success/20 rounded-lg flex items-center justify-center">
                      <span className="text-success/40 text-xs font-bold">PITCH</span>
                    </div>
                    {/* Your location */}
                    <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-success rounded-full animate-pulse shadow-lg shadow-success/50" />
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-2 text-center">
                  Green dot = Your location • Section 214, Row 12, Seat 8
                </p>
              </CardContent>
            </Card>

            {/* Gate Status */}
            <Card className="border border-border bg-surface rounded-lg shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-text-primary">
                  Gate Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {gates.map((gate) => (
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
                ))}
              </CardContent>
            </Card>

            {/* Weather */}
            <Card className="border border-border bg-surface rounded-lg shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Cloud className="h-5 w-5 text-info" />
                  <span className="text-sm font-semibold text-text-primary">Weather</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-warning" />
                    <span className="text-sm text-text-secondary">28°C / 82°F</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-info" />
                    <span className="text-sm text-text-secondary">8 km/h SW</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-info" />
                    <span className="text-sm text-text-secondary">65% humidity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-text-muted" />
                    <span className="text-sm text-text-secondary">Clear skies</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
