"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Utensils,
  Droplets,
  Map,
  Accessibility,
  HelpCircle,
  Bell,
  User,
  Globe,
  Clock,
  Ticket,
  ChevronRight,
  Thermometer,
  Wind,
  ShieldCheck,
  Phone,
  Star,
  Users,
  Timer,
} from "lucide-react";

const languages = [
  { code: "EN", label: "English" },
  { code: "ES", label: "Español" },
  { code: "FR", label: "Français" },
  { code: "DE", label: "Deutsch" },
  { code: "PT", label: "Português" },
  { code: "AR", label: "العربية" },
];

const quickActions = [
  { icon: MapPin, label: "Find My Seat", color: "text-success" },
  { icon: Utensils, label: "Food & Drinks", color: "text-warning" },
  { icon: Droplets, label: "Restrooms", color: "text-info" },
  { icon: Map, label: "Map", color: "text-primary" },
  { icon: Accessibility, label: "Accessibility", color: "text-warning" },
  { icon: HelpCircle, label: "Get Help", color: "text-danger" },
];

const nearbyFacilities = [
  { type: "Food", name: "Burger King", waitTime: "5 min", distance: "20m" },
  { type: "Drink", name: "Coca-Cola Stand", waitTime: "2 min", distance: "15m" },
  { type: "Restroom", name: "Section A3 Restrooms", waitTime: "0 min", distance: "10m" },
  { type: "Merch", name: "FIFA Store", waitTime: "8 min", distance: "40m" },
];

const liveUpdates = [
  { time: "78'", event: "Goal! Brazil 2 - 1 Argentina", type: "goal" },
  { time: "82'", event: "Yellow Card - #10 Argentina", type: "card" },
  { time: "85'", event: "Substitution - Brazil #7 ↔ #14", type: "sub" },
];

export default function FanHomePage() {
  const router = useRouter();
  const [showLanguages, setShowLanguages] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");
  const [activeNav, setActiveNav] = useState("home");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="p-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-text-primary">Welcome, Sarah</h1>
            <p className="text-sm text-text-secondary">Match Day • Round of 16</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-12 w-12"
              onClick={() => setShowLanguages(!showLanguages)}
              aria-label="Select language"
            >
              <Globe className="h-5 w-5 text-text-secondary" />
            </Button>
            <Button variant="ghost" size="icon" className="relative h-12 w-12" onClick={() => router.push("/fan/assistant")} aria-label="Notifications">
              <Bell className="h-5 w-5 text-text-secondary" />
              <span className="absolute top-1 right-1 h-3 w-3 bg-danger rounded-full text-[8px] text-white flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Language Selector Dropdown */}
      {showLanguages && (
        <div className="mx-4 mt-2 p-3 rounded-xl bg-surface backdrop-blur-md border border-border">
          <p className="text-xs text-text-muted mb-2 font-medium">Select Language</p>
          <div className="grid grid-cols-3 gap-2">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={selectedLang === lang.code ? "default" : "ghost"}
                size="sm"
                className={`text-xs h-10 ${
                  selectedLang === lang.code
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                onClick={() => {
                  setSelectedLang(lang.code);
                  setShowLanguages(false);
                }}
              >
                {lang.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Your Match Today Card */}
        <Card className="border border-border bg-surface rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-text-primary">
                Your Match Today
              </CardTitle>
              <Badge className="bg-success/10 text-success border-success/20 text-xs">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">🇧🇷</span>
                <span className="text-sm font-bold text-text-primary">Brazil</span>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-text-primary">2 - 1</p>
                <p className="text-xs text-success font-medium">78&apos; LIVE</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">🇦🇷</span>
                <span className="text-sm font-bold text-text-primary">Argentina</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Clock className="h-4 w-4" />
                <span>Kickoff: 21:00</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <MapPin className="h-4 w-4" />
                <span>MetLife Stadium</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-alt border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="h-4 w-4 text-success" />
                <span className="text-xs font-semibold text-text-primary">Your Ticket</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-xs text-text-muted">Gate</p>
                  <p className="text-sm font-bold text-text-primary">B</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Section</p>
                  <p className="text-sm font-bold text-text-primary">214</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Row</p>
                  <p className="text-sm font-bold text-text-primary">12</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Seat</p>
                  <p className="text-sm font-bold text-text-primary">8</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              className="h-auto min-h-12 py-4 flex flex-col items-center gap-2 border border-border bg-surface rounded-lg hover:bg-surface-alt transition-colors"
              onClick={() => {
                if (action.label === "Find My Seat") router.push("/fan/map");
                else if (action.label === "Food & Drinks") router.push("/fan/map");
                else if (action.label === "Restrooms") router.push("/fan/map");
                else if (action.label === "Map") router.push("/fan/map");
                else if (action.label === "Accessibility") router.push("/fan/accessibility");
                else if (action.label === "Get Help") router.push("/fan/assistant");
              }}
            >
              <action.icon className={`h-6 w-6 ${action.color}`} />
              <span className="text-xs text-text-secondary font-medium">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Nearby Facilities */}
        <Card className="border border-border bg-surface rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-text-primary">
              Nearby Facilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nearbyFacilities.map((facility, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-alt transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-surface-alt flex items-center justify-center">
                    {facility.type === "Food" && <Utensils className="h-4 w-4 text-warning" />}
                    {facility.type === "Drink" && <Droplets className="h-4 w-4 text-info" />}
                    {facility.type === "Restroom" && (
                      <Droplets className="h-4 w-4 text-primary" />
                    )}
                    {facility.type === "Merch" && <Star className="h-4 w-4 text-warning" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{facility.name}</p>
                    <p className="text-xs text-text-muted">{facility.distance} away</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    className={`text-xs ${
                      facility.waitTime === "0 min"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-warning/10 text-warning border-warning/20"
                    }`}
                  >
                    {facility.waitTime}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live Match Updates */}
        <Card className="border border-border bg-surface rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-text-primary">
                Live Updates
              </CardTitle>
              <Badge className="bg-danger/10 text-danger border-danger/20 text-xs animate-pulse">
                LIVE
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {liveUpdates.map((update, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2 rounded-lg bg-surface-alt border border-border"
              >
                <Badge className="bg-surface-alt text-text-primary text-xs shrink-0">
                  {update.time}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{update.event}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Safety Info */}
        <Card className="border border-border bg-surface rounded-lg shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-success" />
              <span className="text-sm font-semibold text-text-primary">Safety Information</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Thermometer className="h-4 w-4" />
                <span>28°C / 82°F</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Wind className="h-4 w-4" />
                <span>8 km/h SW</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-danger/10 border border-danger/20">
              <Phone className="h-4 w-4 text-danger" />
              <div>
                <p className="text-xs font-semibold text-danger">Emergency</p>
                <p className="text-xs text-text-secondary">Text &quot;HELP&quot; to 55512 or call 911</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50">
        <div className="grid grid-cols-4 gap-1 p-2 max-w-lg mx-auto">
          {[
            { id: "home", icon: Star, label: "Home" },
            { id: "map", icon: Map, label: "Map" },
            { id: "notifications", icon: Bell, label: "Alerts" },
            { id: "profile", icon: User, label: "Profile" },
          ].map((nav) => (
            <Button
              key={nav.id}
              variant="ghost"
              className={`flex flex-col items-center gap-1 h-12 py-2 ${
                activeNav === nav.id ? "text-primary" : "text-text-muted"
              }`}
              onClick={() => {
                setActiveNav(nav.id);
                if (nav.id === "home") router.push("/fan");
                else if (nav.id === "map") router.push("/fan/map");
                else if (nav.id === "notifications") router.push("/fan/assistant");
                else if (nav.id === "profile") router.push("/fan/accessibility");
              }}
            >
              <nav.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{nav.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
