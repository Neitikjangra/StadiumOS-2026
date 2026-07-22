"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Accessibility,
  Ear,
  Eye,
  Users,
  Droplets,
  BookOpen,
  Hand,
  MapPin,
  Clock,
  Phone,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Send,
  Loader2,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const accessibilityServices = [
  {
    id: "wheelchair",
    icon: Accessibility,
    name: "Wheelchair Access",
    description: "Accessible seating areas with companion seats, wheelchair spaces, and easy access to facilities.",
    location: "All Gates • Sections 101, 201, 301",
    available: true,
    capacity: "12 spaces available",
  },
  {
    id: "hearing",
    icon: Ear,
    name: "Hearing Loop Systems",
    description: "Induction loop systems for hearing aid users. Available at all concession stands and info desks.",
    location: "Info Desks at Gates A, C, E",
    available: true,
    capacity: "Always available",
  },
  {
    id: "sensory",
    icon: Eye,
    name: "Sensory Rooms",
    description: "Quiet spaces designed for fans with autism, PTSD, or sensory processing disorders.",
    location: "Gate B, Level 2 • Gate D, Level 1",
    available: true,
    capacity: "4 rooms • 2 available now",
  },
  {
    id: "companion",
    icon: Users,
    name: "Companion Seats",
    description: "Free companion seats for fans who require assistance from a personal care attendant.",
    location: "Adjacent to all wheelchair spaces",
    available: true,
    capacity: "Available with wheelchair booking",
  },
  {
    id: "restroom",
    icon: Droplets,
    name: "Accessible Restrooms",
    description: "Fully accessible restrooms with adult changing tables and grab bars throughout the stadium.",
    location: "All Gates • Every Level",
    available: true,
    capacity: "20+ facilities",
  },
  {
    id: "print",
    icon: BookOpen,
    name: "Large Print Programs",
    description: "Match programs and stadium guides available in large print format (18pt font).",
    location: "All Info Desks",
    available: true,
    capacity: "Limited stock",
  },
  {
    id: "braille",
    icon: Hand,
    name: "Braille Guides",
    description: "Stadium navigation guides in Braille for visually impaired fans.",
    location: "Info Desks at Gates A, C, E",
    available: true,
    capacity: "15 copies available",
  },
];

const evacuationProcedures = [
  {
    area: "Wheelchair Seating",
    procedure: "Proceed to nearest accessible exit. Staff will assist with evacuation chairs if needed.",
    exits: "Gate A (South), Gate C (North)",
  },
  {
    area: "Sensory Rooms",
    procedure: "Staff will guide you to quiet evacuation route. Ear protection provided.",
    exits: "Emergency exit adjacent to each room",
  },
  {
    area: "Accessible Restrooms",
    procedure: "Alert nearest staff member. Emergency call buttons available in all accessible facilities.",
    exits: "Nearest emergency exit",
  },
];

const languageSupport = [
  { code: "EN", label: "English", accessibility: "Full" },
  { code: "ES", label: "Español", accessibility: "Full" },
  { code: "FR", label: "Français", accessibility: "Full" },
  { code: "DE", label: "Deutsch", accessibility: "Partial" },
  { code: "PT", label: "Português", accessibility: "Full" },
  { code: "AR", label: "العربية", accessibility: "Partial" },
  { code: "ZH", label: "中文", accessibility: "Partial" },
  { code: "JA", label: "日本語", accessibility: "Partial" },
];

export default function AccessibilityPage() {
  const [requestType, setRequestType] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!requestType) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setRequestType("");
      setRequestMessage("");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="p-4 flex items-center gap-3">
          <Link href="/fan">
            <Button variant="ghost" size="icon" className="text-text-primary h-12 w-12" aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-text-primary">Accessibility</h1>
            <p className="text-xs text-text-secondary">Services & Assistance</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Info Banner */}
        <Card className="border border-success/20 bg-success/5 rounded-lg shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-success">Need Immediate Assistance?</p>
                <p className="text-xs text-text-secondary mt-1">
                  Text &quot;ACCESS&quot; to 55512 or call +1 (201) 555-2026. Our accessibility team is
                  available 24/7 during tournament.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services List */}
        <div className="space-y-3">
          {accessibilityServices.map((service) => (
            <Card key={service.id} className="border border-border bg-surface rounded-lg shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-surface-alt flex items-center justify-center shrink-0">
                    <service.icon className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-text-primary">{service.name}</h3>
                      <Badge
                        className={`text-[10px] ${
                          service.available
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-danger/10 text-danger border-danger/20"
                        }`}
                      >
                        {service.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary mb-2">{service.description}</p>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{service.location}</span>
                      </div>
                    </div>
                    <p className="text-xs text-success/70 mt-1">{service.capacity}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-text-muted shrink-0 h-12 w-12" onClick={() => toast.info("Service details coming soon")} aria-label="View details">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Request Assistance Form */}
        <Card className="border border-border bg-surface rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Phone className="h-4 w-4 text-success" />
              Request Assistance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                <p className="text-sm font-semibold text-text-primary">Request Submitted!</p>
                <p className="text-xs text-text-secondary mt-1">
                  A member of our accessibility team will assist you shortly.
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 text-success h-12"
                  onClick={() => setSubmitted(false)}
                >
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs text-text-muted mb-2 block">Assistance Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Wheelchair",
                      "Hearing",
                      "Visual",
                      "Sensory",
                      "Mobility",
                      "Other",
                    ].map((type) => (
                      <Button
                        key={type}
                        variant="ghost"
                        size="sm"
                        className={`text-xs h-10 ${
                          requestType === type
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-text-muted hover:text-text-primary bg-surface-alt"
                        }`}
                        onClick={() => setRequestType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-muted mb-2 block">
                    Additional Details (optional)
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Describe any specific needs..."
                    className="w-full h-20 p-3 rounded-xl bg-surface-alt border border-border text-text-primary placeholder-text-muted text-sm resize-none focus:outline-none focus:border-primary/50"
                  />
                </div>

                <Button
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
                  onClick={handleSubmit}
                  disabled={!requestType || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Submit Request
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Emergency Evacuation */}
        <Card className="border border-danger/20 bg-danger/5 rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-danger flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Emergency Evacuation Procedures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {evacuationProcedures.map((procedure, i) => (
              <div key={i} className="p-3 rounded-lg bg-surface border border-border">
                <h4 className="text-sm font-semibold text-text-primary mb-1">{procedure.area}</h4>
                <p className="text-xs text-text-secondary mb-2">{procedure.procedure}</p>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <MapPin className="h-3 w-3" />
                  <span>Exits: {procedure.exits}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Language Support */}
        <Card className="border border-border bg-surface rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Globe className="h-4 w-4 text-success" />
              Language Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {languageSupport.map((lang) => (
                <div
                  key={lang.code}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface-alt"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{lang.label}</span>
                  </div>
                  <Badge
                    className={`text-[10px] ${
                      lang.accessibility === "Full"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-warning/10 text-warning border-warning/20"
                    }`}
                  >
                    {lang.accessibility}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-3">
              Sign language interpretation available upon request. Contact our accessibility team.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
