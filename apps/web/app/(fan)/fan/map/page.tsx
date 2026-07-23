"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Utensils,
  Droplets,
  Navigation,
  ChevronRight,
  Search,
  LocateFixed,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Gate {
  name: string;
  status: string;
  crowd: string;
  waitTime?: number;
  flowIn?: number;
  flowOut?: number;
  x: string;
  y: string;
}

interface Facility {
  type: string;
  name: string;
  waitTime: string;
  distance: string;
  rating?: number | null;
  x: string;
  y: string;
}

interface NearbyFacility {
  type: string;
  name: string;
  waitTime: string;
  distance: string;
}

const facilityFilters = [
  { id: "all", label: "All" },
  { id: "food", label: "Food" },
  { id: "restroom", label: "Restrooms" },
];

export default function MapPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [gates, setGates] = useState<Gate[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [nearbyFacilities, setNearbyFacilities] = useState<NearbyFacility[]>([]);
  const [stadiumName, setStadiumName] = useState("Stadium");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/fan/map");
        if (res.ok) {
          const data = await res.json();
          setGates(data.gates || []);
          setFacilities(data.facilities || []);
          setNearbyFacilities(data.nearbyFacilities || []);
          setStadiumName(data.stadium?.name || "Stadium");
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredFacilities =
    activeFilter === "all"
      ? facilities
      : facilities.filter((f) => f.type === activeFilter);

  const getIcon = (type: string) => {
    switch (type) {
      case "food": return Utensils;
      case "drink": return Droplets;
      case "restroom": return Droplets;
      default: return Utensils;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "food": return "text-warning";
      case "drink": return "text-info";
      case "restroom": return "text-primary";
      default: return "text-warning";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

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
            <h1 className="text-lg font-bold text-text-primary">Stadium Map</h1>
            <p className="text-xs text-text-secondary">{stadiumName} • Interactive View</p>
          </div>
          <Button variant="ghost" size="icon" className="text-text-primary h-12 w-12" onClick={() => toast.info("Centering on your location")}>
            <LocateFixed className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search facilities..."
            className="w-full h-12 pl-10 pr-4 rounded-xl bg-surface border border-border text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-primary/50"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {facilityFilters.map((filter) => (
            <Button
              key={filter.id}
              variant="ghost"
              size="sm"
              className={`shrink-0 text-xs h-10 ${
                activeFilter === filter.id
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-text-muted hover:text-text-primary bg-surface"
              }`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Stadium Map */}
        <Card className="border border-border bg-surface rounded-lg shadow-sm">
          <CardContent className="p-4">
            <div className="relative w-full aspect-square bg-surface-alt rounded-xl border border-border overflow-hidden">
              {/* Stadium outline */}
              <div className="absolute inset-4 border-2 border-text-muted/20 rounded-full">
                {/* Pitch */}
                <div className="absolute inset-8 border border-success/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-success/40 text-sm font-bold block">PITCH</span>
                    <span className="text-success/20 text-xs">Field of Play</span>
                  </div>
                </div>

                {/* Gates */}
                {gates.map((gate) => (
                  <div
                    key={gate.name}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: gate.x, top: gate.y }}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold cursor-pointer ${
                        gate.status === "open"
                          ? gate.crowd === "low"
                            ? "bg-success/30 text-success border border-success/50"
                            : gate.crowd === "medium"
                            ? "bg-warning/30 text-warning border border-warning/50"
                            : "bg-danger/30 text-danger border border-danger/50"
                          : "bg-warning/30 text-warning border border-warning/50"
                      }`}
                    >
                      {gate.name.replace("Gate ", "")}
                    </div>
                  </div>
                ))}

                {/* Facilities */}
                {filteredFacilities.map((facility, i) => (
                  <div
                    key={i}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ left: facility.x, top: facility.y }}
                    onClick={() => setSelectedFacility(facility.name)}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedFacility === facility.name
                          ? "bg-success/40 border-2 border-success scale-110"
                          : "bg-surface-alt border border-border"
                      } transition-all`}
                    >
                      {(() => {
                        const Icon = getIcon(facility.type);
                        return <Icon className={`h-4 w-4 ${getIconColor(facility.type)}`} />;
                      })()}
                    </div>
                  </div>
                ))}

                {/* Your location */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: "72%", top: "55%" }}
                >
                  <div className="relative">
                    <div className="w-4 h-4 bg-success rounded-full animate-pulse shadow-lg shadow-success/50" />
                    <div className="absolute inset-0 w-4 h-4 bg-success/30 rounded-full animate-ping" />
                  </div>
                </div>
              </div>
            </div>

            {/* Map Legend */}
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-text-muted">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-success rounded-full" />
                <span>You</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-success/30 border border-success/50 rounded-full" />
                <span>Low crowd</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-warning/30 border border-warning/50 rounded-full" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-danger/30 border border-danger/50 rounded-full" />
                <span>High crowd</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route to Seat */}
        <Card className="border border-border bg-surface rounded-lg shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Navigation className="h-5 w-5 text-success" />
              <span className="text-sm font-semibold text-text-primary">Route to Your Seat</span>
            </div>
            <p className="text-xs text-text-secondary mb-3">
              Select your gate from the map above for turn-by-turn directions to your section.
            </p>
            <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white" onClick={() => toast.success("Navigation started")}>
              <Navigation className="h-4 w-4 mr-2" />
              Start Navigation
            </Button>
          </CardContent>
        </Card>

        {/* Nearby Facilities */}
        <Card className="border border-border bg-surface rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-text-primary">
              Nearby Facilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nearbyFacilities.length === 0 ? (
              <p className="text-xs text-text-muted">No facilities nearby.</p>
            ) : (
              nearbyFacilities.map((facility, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-alt transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-surface-alt flex items-center justify-center">
                      {facility.type === "Food" && <Utensils className="h-4 w-4 text-warning" />}
                      {facility.type === "Restroom" && (
                        <Droplets className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{facility.name}</p>
                      <p className="text-xs text-text-muted">{facility.distance} away</p>
                    </div>
                  </div>
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
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
