"use client";

import { useState, useEffect } from "react";
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

interface Service {
  id: string;
  type: string;
  name: string;
  description: string;
  location: string;
  available: boolean;
}

interface EvacuationProcedure {
  area: string;
  procedure: string;
  exits: string;
}

interface LanguageItem {
  code: string;
  label: string;
  accessibility: string;
}

const SERVICE_ICONS: Record<string, typeof Accessibility> = {
  wheelchair: Accessibility,
  hearing_loop: Ear,
  sensory: Eye,
  companion: Users,
  accessible_restroom: Droplets,
  large_print: BookOpen,
  braille: Hand,
};

export default function AccessibilityPage() {
  const [requestType, setRequestType] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [evacuation, setEvacuation] = useState<EvacuationProcedure[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/fan/accessibility");
        if (res.ok) {
          const data = await res.json();
          setServices(data.services || []);
          setEvacuation(data.evacuationProcedures || []);
          setLanguages(data.languageSupport || []);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async () => {
    if (!requestType) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/fan/accessibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: requestType, message: requestMessage }),
      });
      if (res.ok) {
        setSubmitted(true);
        setRequestType("");
        setRequestMessage("");
      } else {
        toast.error("Failed to submit request");
      }
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
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
          {services.map((service) => {
            const IconComponent = SERVICE_ICONS[service.type] || Accessibility;
            return (
              <Card key={service.id} className="border border-border bg-surface rounded-lg shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-surface-alt flex items-center justify-center shrink-0">
                      <IconComponent className="h-5 w-5 text-success" />
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
                    </div>
                    <Button variant="ghost" size="icon" className="text-text-muted shrink-0 h-12 w-12" onClick={() => toast.info("Service details coming soon")} aria-label="View details">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
            {evacuation.map((procedure, i) => (
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
              {languages.map((lang) => (
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
