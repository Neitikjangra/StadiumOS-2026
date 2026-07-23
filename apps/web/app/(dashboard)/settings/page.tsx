"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Users,
  Database,
  Webhook,
  Activity,
  Plus,
  Edit,
  Trash2,
  TestTube,
  Save,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Lock,
  Server,
  Wifi,
  Cloud,
  Zap,
  UserPlus,
  Copy,
  DatabaseZap,
  Download,
  Search,
  Filter,
  User,
  Key,
} from "lucide-react";
import { SeedButton } from "@/components/SeedButton";
import { toast } from "sonner";

const defaultStadiums = [
  { id: 1, name: "MetLife Stadium", city: "East Rutherford", country: "USA", capacity: 82500, status: "active", lat: 40.8135, lng: -74.0745, timezone: "America/New_York", address: "1 MetLife Stadium Dr, East Rutherford, NJ 07073" },
  { id: 2, name: "AT&T Stadium", city: "Arlington", country: "USA", capacity: 80000, status: "active", lat: 32.7473, lng: -97.0945, timezone: "America/Chicago", address: "1 AT&T Way, Arlington, TX 76011" },
  { id: 3, name: "Arrowhead Stadium", city: "Kansas City", country: "USA", capacity: 76416, status: "active", lat: 39.0489, lng: -94.4839, timezone: "America/Chicago", address: "1 Arrowhead Dr, Kansas City, MO 64129" },
  { id: 4, name: "Gillette Stadium", city: "Foxborough", country: "USA", capacity: 70000, status: "maintenance", lat: 42.0909, lng: -71.2643, timezone: "America/New_York", address: "1 Patriot Pl, Foxborough, MA 02035" },
  { id: 5, name: "Mercedes-Benz Stadium", city: "Atlanta", country: "USA", capacity: 71000, status: "active", lat: 33.7554, lng: -84.401, timezone: "America/New_York", address: "1 AMB Dr NW, Atlanta, GA 30313" },
  { id: 6, name: "Lumen Field", city: "Seattle", country: "USA", capacity: 68740, status: "active", lat: 47.5952, lng: -122.3316, timezone: "America/Los_Angeles", address: "800 Occidental Ave S, Seattle, WA 98134" },
  { id: 7, name: "Levi's Stadium", city: "Santa Clara", country: "USA", capacity: 68500, status: "active", lat: 37.4033, lng: -121.9698, timezone: "America/Los_Angeles", address: "4900 Marie P DeBartolo Way, Santa Clara, CA 95054" },
  { id: 8, name: "NRG Stadium", city: "Houston", country: "USA", capacity: 72220, status: "active", lat: 29.6847, lng: -95.4107, timezone: "America/Chicago", address: "1 NRG Park, Houston, TX 77054" },
  { id: 9, name: "SoFi Stadium", city: "Inglewood", country: "USA", capacity: 70240, status: "active", lat: 33.9534, lng: -118.3391, timezone: "America/Los_Angeles", address: "1001 S Stadium Dr, Inglewood, CA 90301" },
  { id: 10, name: "Lincoln Financial Field", city: "Philadelphia", country: "USA", capacity: 69176, status: "active", lat: 39.9008, lng: -75.1675, timezone: "America/New_York", address: "1 Lincoln Financial Field Way, Philadelphia, PA 19148" },
  { id: 11, name: "Estadio Azteca", city: "Mexico City", country: "Mexico", capacity: 87000, status: "active", lat: 19.3029, lng: -99.1505, timezone: "America/Mexico_City", address: "Calzada de Tlalpan 3465, Santa Úrsula Coyoacán, 04650 Ciudad de México" },
  { id: 12, name: "Estadio BBVA", city: "Monterrey", country: "Mexico", capacity: 53500, status: "active", lat: 25.67, lng: -100.244, timezone: "America/Mexico_City", address: "Padre Mier 800, Centro, 64010 Monterrey, N.L." },
  { id: 13, name: "Estadio Akron", city: "Guadalajara", country: "Mexico", capacity: 49850, status: "maintenance", lat: 20.682, lng: -103.462, timezone: "America/Mexico_City", address: "Av. Pablo Neruda 3020, Colonia Independencia, 45135 Zapopan, Jal." },
  { id: 14, name: "BMO Field", city: "Toronto", country: "Canada", capacity: 30000, status: "active", lat: 43.6332, lng: -79.4186, timezone: "America/Toronto", address: "170 Princes' Blvd, Toronto, ON M6K 3C3" },
  { id: 15, name: "BC Place", city: "Vancouver", country: "Canada", capacity: 54320, status: "active", lat: 49.2768, lng: -123.1107, timezone: "America/Vancouver", address: "777 Pacific Blvd, Vancouver, BC V6B 4Y8" },
  { id: 16, name: "Saputo Stadium", city: "Montreal", country: "Canada", capacity: 19619, status: "planned", lat: 45.5631, lng: -73.5528, timezone: "America/Toronto", address: "4750 Rue Sherbrooke E, Montréal, QC H1V 3S8" },
];

const defaultUsers = [
  { id: 1, name: "Sarah Chen", email: "sarah.chen@fifa.org", role: "super_admin", stadium: "All", lastLogin: "2026-07-15T14:30:00Z", status: "active" },
  { id: 2, name: "Marcus Rodriguez", email: "marcus.r@fifa.org", role: "tournament_ops", stadium: "All", lastLogin: "2026-07-15T13:45:00Z", status: "active" },
  { id: 3, name: "Emily Watson", email: "emily.w@metlife.com", role: "stadium_manager", stadium: "MetLife Stadium", lastLogin: "2026-07-15T12:00:00Z", status: "active" },
  { id: 4, name: "James Park", email: "james.p@fifa.org", role: "security_lead", stadium: "All", lastLogin: "2026-07-15T11:30:00Z", status: "active" },
  { id: 5, name: "Ana Martinez", email: "ana.m@att.com", role: "stadium_manager", stadium: "AT&T Stadium", lastLogin: "2026-07-15T10:15:00Z", status: "active" },
  { id: 6, name: "David Kim", email: "david.k@fifa.org", role: "mobility_lead", stadium: "All", lastLogin: "2026-07-15T09:00:00Z", status: "active" },
  { id: 7, name: "Lisa Johnson", email: "lisa.j@fifa.org", role: "vendor_manager", stadium: "All", lastLogin: "2026-07-14T18:30:00Z", status: "active" },
  { id: 8, name: "Ahmed Hassan", email: "ahmed.h@azteca.mx", role: "stadium_manager", stadium: "Estadio Azteca", lastLogin: "2026-07-14T16:00:00Z", status: "active" },
  { id: 9, name: "Maria Garcia", email: "maria.g@fifa.org", role: "volunteer_lead", stadium: "All", lastLogin: "2026-07-14T14:45:00Z", status: "active" },
  { id: 10, name: "Tom Bradley", email: "tom.b@fifa.org", role: "support_agent", stadium: "All", lastLogin: "2026-07-14T12:00:00Z", status: "active" },
  { id: 11, name: "Rachel Green", email: "rachel.g@bmo.com", role: "stadium_manager", stadium: "BMO Field", lastLogin: "2026-07-14T10:30:00Z", status: "active" },
  { id: 12, name: "Carlos Lopez", email: "carlos.l@bbva.mx", role: "stadium_manager", stadium: "Estadio BBVA", lastLogin: "2026-07-13T15:00:00Z", status: "inactive" },
];

const defaultAuditLogs = [
  { id: 1, timestamp: "2026-07-15T14:30:00Z", user: "Sarah Chen", role: "super_admin", action: "system_config_update", resource: "Global Settings", details: "Updated default timezone to UTC-5", ip: "192.168.1.100" },
  { id: 2, timestamp: "2026-07-15T14:25:00Z", user: "Marcus Rodriguez", role: "tournament_ops", action: "stadium_status_change", resource: "Gillette Stadium", details: "Status changed to maintenance", ip: "10.0.0.50" },
  { id: 3, timestamp: "2026-07-15T14:20:00Z", user: "Emily Watson", role: "stadium_manager", action: "capacity_update", resource: "MetLife Stadium", details: "VIP section capacity increased to 500", ip: "172.16.0.25" },
  { id: 4, timestamp: "2026-07-15T14:15:00Z", user: "James Park", role: "security_lead", action: "security_alert", resource: "All Stadiums", details: "Emergency evacuation drill scheduled", ip: "192.168.1.110" },
  { id: 5, timestamp: "2026-07-15T14:10:00Z", user: "Ana Martinez", role: "stadium_manager", action: "vendor_approval", resource: "AT&T Stadium", details: "Approved food vendor application #4521", ip: "10.0.0.75" },
  { id: 6, timestamp: "2026-07-15T14:05:00Z", user: "David Kim", role: "mobility_lead", action: "transport_plan", resource: "SoFi Stadium", details: "Updated shuttle routes for Match Day 3", ip: "172.16.0.40" },
  { id: 7, timestamp: "2026-07-15T14:00:00Z", user: "Lisa Johnson", role: "vendor_manager", action: "contract_update", resource: "All Stadiums", details: "Catering contract renewed for 2026 tournament", ip: "192.168.1.120" },
  { id: 8, timestamp: "2026-07-15T13:55:00Z", user: "Ahmed Hassan", role: "stadium_manager", action: "facility_maintenance", resource: "Estadio Azteca", details: "Pitch irrigation system serviced", ip: "10.0.0.90" },
  { id: 9, timestamp: "2026-07-15T13:50:00Z", user: "Maria Garcia", role: "volunteer_lead", action: "volunteer_shift", resource: "BMO Field", details: "Assigned 50 volunteers to Gate A", ip: "172.16.0.55" },
  { id: 10, timestamp: "2026-07-15T13:45:00Z", user: "Tom Bradley", role: "support_agent", action: "ticket_support", resource: "Lumen Field", details: "Resolved 15 fan inquiries", ip: "192.168.1.130" },
  { id: 11, timestamp: "2026-07-15T13:40:00Z", user: "Sarah Chen", role: "super_admin", action: "user_creation", resource: "Users", details: "Created new admin account for Rachel Green", ip: "192.168.1.100" },
  { id: 12, timestamp: "2026-07-15T13:35:00Z", user: "Marcus Rodriguez", role: "tournament_ops", action: "match_schedule", resource: "Tournament", details: "Finalized Group B match schedule", ip: "10.0.0.50" },
  { id: 13, timestamp: "2026-07-15T13:30:00Z", user: "James Park", role: "security_lead", action: "access_control", resource: "Mercedes-Benz Stadium", details: "Updated restricted zone permissions", ip: "192.168.1.110" },
  { id: 14, timestamp: "2026-07-15T13:25:00Z", user: "Emily Watson", role: "stadium_manager", action: "staff_schedule", resource: "MetLife Stadium", details: "Published staff roster for July 20", ip: "172.16.0.25" },
  { id: 15, timestamp: "2026-07-15T13:20:00Z", user: "Ana Martinez", role: "stadium_manager", action: "inventory_update", resource: "AT&T Stadium", details: "Restocked emergency supplies", ip: "10.0.0.75" },
  { id: 16, timestamp: "2026-07-15T13:15:00Z", user: "David Kim", role: "mobility_lead", action: "traffic_update", resource: "NRG Stadium", details: "Rerouted traffic due to road closure", ip: "172.16.0.40" },
  { id: 17, timestamp: "2026-07-15T13:10:00Z", user: "Lisa Johnson", role: "vendor_manager", action: "payment_processing", resource: "All Stadiums", details: "Processed vendor payments batch #789", ip: "192.168.1.120" },
  { id: 18, timestamp: "2026-07-15T13:05:00Z", user: "Ahmed Hassan", role: "stadium_manager", action: "weather_alert", resource: "Estadio Azteca", details: "Heat advisory issued for match day", ip: "10.0.0.90" },
  { id: 19, timestamp: "2026-07-15T13:00:00Z", user: "Maria Garcia", role: "volunteer_lead", action: "training_complete", resource: "BC Place", details: "Completed volunteer safety training", ip: "172.16.0.55" },
  { id: 20, timestamp: "2026-07-15T12:55:00Z", user: "Tom Bradley", role: "support_agent", action: "escalation", resource: "Levi's Stadium", details: "Escalated VIP seating issue to management", ip: "192.168.1.130" },
  { id: 21, timestamp: "2026-07-15T12:50:00Z", user: "Sarah Chen", role: "super_admin", action: "system_backup", resource: "System", details: "Completed daily database backup", ip: "192.168.1.100" },
  { id: 22, timestamp: "2026-07-15T12:45:00Z", user: "Marcus Rodriguez", role: "tournament_ops", action: "media_coordination", resource: "Tournament", details: "Approved media access for Match Day 2", ip: "10.0.0.50" },
  { id: 23, timestamp: "2026-07-15T12:40:00Z", user: "James Park", role: "security_lead", action: "incident_report", resource: "Lincoln Financial Field", details: "Minor incident resolved at Gate B", ip: "192.168.1.110" },
  { id: 24, timestamp: "2026-07-15T12:35:00Z", user: "Emily Watson", role: "stadium_manager", action: "maintenance_request", resource: "MetLife Stadium", details: "HVAC system inspection completed", ip: "172.16.0.25" },
  { id: 25, timestamp: "2026-07-15T12:30:00Z", user: "Ana Martinez", role: "stadium_manager", action: "cleaning_schedule", resource: "AT&T Stadium", details: "Post-match cleaning crew assigned", ip: "10.0.0.75" },
];

const defaultIntegrations = [
  { id: 1, name: "OpenAI / LLM Service", type: "ai", status: "connected", description: "AI-powered fan assistance and content generation", lastTest: "2026-07-15T14:00:00Z", apiEndpoint: "https://api.openai.com/v1", apiKey: "sk-••••••••••••••••" },
  { id: 2, name: "Redis Cache", type: "cache", status: "connected", description: "Real-time data caching and session management", lastTest: "2026-07-15T13:30:00Z", apiEndpoint: "redis://cache.fifa2026.internal:6379", apiKey: "" },
  { id: 3, name: "PostgreSQL Database", type: "database", status: "connected", description: "Primary data storage for tournament operations", lastTest: "2026-07-15T14:15:00Z", apiEndpoint: "postgresql://db.fifa2026.internal:5432", apiKey: "" },
  { id: 4, name: "Weather API", type: "weather", status: "connected", description: "Real-time weather data for all stadium locations", lastTest: "2026-07-15T12:00:00Z", apiEndpoint: "https://api.weatherapi.com/v1", apiKey: "wa-••••••••••••••••" },
  { id: 5, name: "Mapbox Service", type: "maps", status: "disconnected", description: "Interactive maps and venue navigation", lastTest: "2026-07-14T18:00:00Z", apiEndpoint: "https://api.mapbox.com/v1", apiKey: "" },
  { id: 6, name: "Transit Tracker", type: "transit", status: "connected", description: "Real-time transit data for fan transportation planning", lastTest: "2026-07-15T11:00:00Z", apiEndpoint: "https://api.transitapp.com/v1", apiKey: "tt-••••••••••••••••" },
  { id: 7, name: "Notification Service", type: "notifications", status: "disconnected", description: "Multi-channel push notifications via Firebase and APNs", lastTest: "2026-07-14T16:00:00Z", apiEndpoint: "https://fcm.googleapis.com/v1", apiKey: "" },
];

const roleDescriptions: Record<string, string> = {
  super_admin: "Full system access with all administrative privileges",
  tournament_ops: "Tournament-wide operational management",
  stadium_manager: "Single stadium facility and staff management",
  security_lead: "Security operations and emergency response",
  mobility_lead: "Transportation and crowd flow management",
  vendor_manager: "Vendor contracts and food/beverage operations",
  volunteer_lead: "Volunteer recruitment and shift coordination",
  support_agent: "Fan support and ticketing assistance",
  fan_user: "Basic read-only access for public information",
};

type StadiumRow = { id: string | number; name: string; city: string; country: string; capacity: number; status: string; lat: number; lng: number; timezone: string; address: string };
type UserRow = { id: string | number; name: string; email: string; role: string; stadium: string; lastLogin: string; status: string };
type AuditRow = { id: string | number; timestamp: string; user: string; role: string; action: string; resource: string; details: string; ip: string };

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("general");
  const [showAddStadium, setShowAddStadium] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [integrations, setIntegrations] = useState(defaultIntegrations);
  const [configuringIntegration, setConfiguringIntegration] = useState<number | null>(null);
  const [configForm, setConfigForm] = useState({ endpoint: "", apiKey: "" });
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("whsec_xxxxxxxxxxxxxxxxxxxx");
  const [webhookEvents, setWebhookEvents] = useState<Record<string, boolean>>({
    "match.start": true,
    "match.end": true,
    "incident.created": true,
    "alert.issued": true,
    "user.login": false,
    "system.error": true,
  });
  const [webhooks, setWebhooks] = useState<{ id: number; url: string; events: string[]; status: string }[]>([
    { id: 1, url: "https://ops.fifa2026.internal/webhooks/matches", events: ["match.start", "match.end"], status: "active" },
    { id: 2, url: "https://alerts.fifa2026.internal/webhooks/incidents", events: ["incident.created", "alert.issued"], status: "active" },
  ]);

  const [stadiums, setStadiums] = useState<StadiumRow[]>(defaultStadiums);
  const [users, setUsers] = useState<UserRow[]>(defaultUsers);
  const [auditLogs, setAuditLogs] = useState<AuditRow[]>(defaultAuditLogs);
  const [loadingStadiums, setLoadingStadiums] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    setLoadingStadiums(true);
    fetch("/api/stadiums?pageSize=100")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.items) {
          const mapped = res.data.items.map((s: any) => ({
            id: s.id,
            name: s.name,
            city: s.hostCity?.name ?? "",
            country: s.hostCity?.hostCountry?.name ?? "",
            capacity: s.capacity,
            status: "active",
            lat: s.latitude,
            lng: s.longitude,
            timezone: s.timezone,
            address: s.address,
          }));
          setStadiums(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStadiums(false));
  }, []);

  useEffect(() => {
    setLoadingUsers(true);
    fetch("/api/users?pageSize=100")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.items) {
          const mapped = res.data.items.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            stadium: u.stadium?.name ?? "All",
            lastLogin: u.lastLoginAt ?? "",
            status: u.isDeleted ? "inactive" : "active",
          }));
          setUsers(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, []);

  useEffect(() => {
    setLoadingAudit(true);
    fetch("/api/audit?pageSize=50")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.items) {
          const mapped = res.data.items.map((a: any) => ({
            id: a.id,
            timestamp: a.timestamp,
            user: a.user?.name ?? a.userId,
            role: a.user?.role ?? "",
            action: a.action,
            resource: a.resource,
            details: typeof a.details === "string" ? a.details : (a.details?.message ?? JSON.stringify(a.details ?? "")),
            ip: a.ipAddress ?? "",
          }));
          setAuditLogs(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingAudit(false));
  }, []);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = log.details.toLowerCase().includes(searchQuery.toLowerCase()) || log.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === "all" || log.action === filterAction;
    const matchesUser = filterUser === "all" || log.user === filterUser;
    return matchesSearch && matchesAction && matchesUser;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "connected":
        return "bg-success/10 text-success border-success/20";
      case "maintenance":
      case "disconnected":
        return "bg-warning/10 text-warning border-warning/20";
      case "planned":
        return "bg-info/10 text-info border-info/20";
      case "inactive":
        return "bg-danger/10 text-danger border-danger/20";
      default:
        return "bg-surface-alt text-text-muted border-border";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "tournament_ops":
        return "bg-info/10 text-info border-info/20";
      case "stadium_manager":
        return "bg-success/10 text-success border-success/20";
      case "security_lead":
        return "bg-danger/10 text-danger border-danger/20";
      case "mobility_lead":
        return "bg-info/10 text-info border-info/20";
      case "vendor_manager":
        return "bg-warning/10 text-warning border-warning/20";
      case "volunteer_lead":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "support_agent":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      case "fan_user":
        return "bg-surface-alt text-text-muted border-border";
      default:
        return "bg-surface-alt text-text-muted border-border";
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes("security") || action.includes("access")) return <Shield className="w-4 h-4" />;
    if (action.includes("user") || action.includes("volunteer")) return <Users className="w-4 h-4" />;
    if (action.includes("system") || action.includes("database")) return <Database className="w-4 h-4" />;
    if (action.includes("vendor") || action.includes("contract") || action.includes("payment")) return <Building2 className="w-4 h-4" />;
    if (action.includes("stadium") || action.includes("facility") || action.includes("maintenance")) return <Building2 className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title flex items-center gap-3">
              <Settings className="w-8 h-8 text-info" />
              System Settings
            </h1>
            <p className="page-subtitle">Configure StadiumOS 2026 tournament operations platform</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              System Healthy
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-surface border border-border p-1">
            <TabsTrigger value="general" className="data-[state=active]:bg-info/10 data-[state=active]:text-info">
              <Globe className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="stadiums" className="data-[state=active]:bg-info/10 data-[state=active]:text-info">
              <Building2 className="w-4 h-4 mr-2" />
              Stadiums
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-info/10 data-[state=active]:text-info">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-info/10 data-[state=active]:text-info">
              <Zap className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-info/10 data-[state=active]:text-info">
              <FileText className="w-4 h-4 mr-2" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-info/10 data-[state=active]:text-info">
              <DatabaseZap className="w-4 h-4 mr-2" />
              Initial Data
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-info/10 data-[state=active]:text-info">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-surface border border-border rounded-lg backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-text-primary flex items-center gap-2">
                    <Tournament className="w-5 h-5 text-info" />
                    Tournament Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Tournament Name</Label>
                      <Input defaultValue="FIFA World Cup 2026" className="bg-surface-alt border-border text-text-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Year</Label>
                      <Input defaultValue="2026" className="bg-surface-alt border-border text-text-primary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Start Date</Label>
                      <Input type="date" defaultValue="2026-06-11" className="bg-surface-alt border-border text-text-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-secondary">End Date</Label>
                      <Input type="date" defaultValue="2026-07-19" className="bg-surface-alt border-border text-text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-text-secondary">Status</Label>
                    <Select defaultValue="active">
                      <SelectTrigger className="bg-surface-alt border-border text-text-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border border-border rounded-lg backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-text-primary flex items-center gap-2">
                    <Globe className="w-5 h-5 text-info" />
                    Global Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-text-secondary">Default Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="bg-surface-alt border-border text-text-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-text-secondary">Default Timezone</Label>
                    <Select defaultValue="utc-5">
                      <SelectTrigger className="bg-surface-alt border-border text-text-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc-5">UTC-5 (Eastern)</SelectItem>
                        <SelectItem value="utc-6">UTC-6 (Central)</SelectItem>
                        <SelectItem value="utc-7">UTC-7 (Mountain)</SelectItem>
                        <SelectItem value="utc-8">UTC-8 (Pacific)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-text-secondary">Date Format</Label>
                    <Select defaultValue="mdy">
                      <SelectTrigger className="bg-surface-alt border-border text-text-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border border-border rounded-lg backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-text-primary flex items-center gap-2">
                    <Bell className="w-5 h-5 text-info" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-text-primary font-medium">Email Alerts</p>
                        <p className="text-sm text-text-muted">Receive system alerts via email</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-text-primary font-medium">Push Notifications</p>
                        <p className="text-sm text-text-muted">Real-time push notifications on mobile</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-danger" />
                      <div>
                        <p className="text-text-primary font-medium">Emergency Overrides</p>
                        <p className="text-sm text-text-muted">Critical alerts bypass do-not-disturb</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-surface border border-border rounded-lg backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-text-primary flex items-center gap-2">
                    <Shield className="w-5 h-5 text-info" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-text-primary font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-text-muted">Require 2FA for all admin accounts</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-text-primary font-medium">Session Timeout</p>
                        <p className="text-sm text-text-muted">Auto-logout after inactivity</p>
                      </div>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-32 bg-surface-alt border-border text-text-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-end">
              <Button className="bg-info hover:bg-info text-text-primary" onClick={() => toast.success("Settings saved!")}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="stadiums" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Tournament Venues</h2>
                <p className="text-text-muted text-sm">Manage all 16 FIFA World Cup 2026 stadiums</p>
              </div>
              <Button onClick={() => setShowAddStadium(!showAddStadium)} className="bg-info hover:bg-info text-text-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Stadium
              </Button>
            </div>

            {showAddStadium && (
              <Card className="bg-surface border-info/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-text-primary">Add New Stadium</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Stadium Name</Label>
                      <Input placeholder="Enter stadium name" className="bg-surface-alt border-border text-text-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-secondary">City</Label>
                      <Input placeholder="Enter city" className="bg-surface-alt border-border text-text-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Country</Label>
                      <Select>
                        <SelectTrigger className="bg-surface-alt border-border text-text-primary">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USA">United States</SelectItem>
                          <SelectItem value="Mexico">Mexico</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Capacity</Label>
                      <Input type="number" placeholder="50000" className="bg-surface-alt border-border text-text-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Latitude</Label>
                      <Input type="number" step="0.0001" placeholder="40.7128" className="bg-surface-alt border-border text-text-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Longitude</Label>
                      <Input type="number" step="0.0001" placeholder="-74.0060" className="bg-surface-alt border-border text-text-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Timezone</Label>
                      <Select>
                        <SelectTrigger className="bg-surface-alt border-border text-text-primary">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="America/Mexico_City">Mexico City</SelectItem>
                          <SelectItem value="America/Toronto">Toronto</SelectItem>
                          <SelectItem value="America/Vancouver">Vancouver</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-text-secondary">Address</Label>
                      <Input placeholder="Full stadium address" className="bg-surface-alt border-border text-text-primary" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddStadium(false)} className="border-border text-text-secondary">
                      Cancel
                    </Button>
                    <Button className="bg-info hover:bg-info text-text-primary" onClick={() => { toast.success("Stadium saved!"); setShowAddStadium(false); }}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Stadium
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-surface border border-border rounded-lg backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-text-muted font-medium">Stadium</th>
                        <th className="text-left p-4 text-text-muted font-medium">Location</th>
                        <th className="text-left p-4 text-text-muted font-medium">Capacity</th>
                        <th className="text-left p-4 text-text-muted font-medium">Status</th>
                        <th className="text-right p-4 text-text-muted font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stadiums.map((stadium) => (
                        <tr key={stadium.id} className="border-b border-border hover:bg-surface-alt transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-info/20 to-info/10 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-info" />
                              </div>
                              <div>
                                <p className="text-text-primary font-medium">{stadium.name}</p>
                                <p className="text-sm text-text-muted">{stadium.country}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-text-secondary">
                              <MapPin className="w-4 h-4 text-text-muted" />
                              {stadium.city}
                            </div>
                          </td>
                          <td className="p-4 text-text-primary font-medium">{stadium.capacity.toLocaleString()}</td>
                          <td className="p-4">
                            <Badge variant="outline" className={getStatusColor(stadium.status)}>
                              {stadium.status.charAt(0).toUpperCase() + stadium.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-text-primary" onClick={() => toast.info("Edit mode coming soon")}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-danger" onClick={() => toast.success("Stadium removed")}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">User Management</h2>
                <p className="text-text-muted text-sm">Manage platform access and permissions</p>
              </div>
              <Button onClick={() => setShowAddUser(!showAddUser)} className="bg-info hover:bg-info text-text-primary">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            {showAddUser && (
              <Card className="bg-surface border-info/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-text-primary">Add New User</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Full Name</Label>
                      <Input placeholder="Enter full name" className="bg-surface-alt border-border text-text-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Email</Label>
                      <Input type="email" placeholder="user@fifa.org" className="bg-surface-alt border-border text-text-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Password</Label>
                      <Input type="password" placeholder="Minimum 12 characters" className="bg-surface-alt border-border text-text-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Role</Label>
                      <Select>
                        <SelectTrigger className="bg-surface-alt border-border text-text-primary">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(roleDescriptions).map((role) => (
                            <SelectItem key={role} value={role}>
                              {role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Stadium Assignment</Label>
                      <Select>
                        <SelectTrigger className="bg-surface-alt border-border text-text-primary">
                          <SelectValue placeholder="Select stadium" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Stadiums</SelectItem>
                          {stadiums.map((s) => (
                            <SelectItem key={s.id} value={s.name}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="bg-surface-alt rounded-lg p-4">
                    <p className="text-sm text-text-muted mb-2">Role Descriptions:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(roleDescriptions).map(([role, desc]) => (
                        <div key={role} className="text-xs">
                          <span className="text-info">{role.replace(/_/g, " ")}:</span>{" "}
                          <span className="text-text-muted">{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddUser(false)} className="border-border text-text-secondary">
                      Cancel
                    </Button>
                    <Button className="bg-info hover:bg-info text-text-primary" onClick={() => { toast.success("User created!"); setShowAddUser(false); }}>
                      <Save className="w-4 h-4 mr-2" />
                      Create User
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-surface border border-border rounded-lg backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-text-muted font-medium">User</th>
                        <th className="text-left p-4 text-text-muted font-medium">Role</th>
                        <th className="text-left p-4 text-text-muted font-medium">Stadium</th>
                        <th className="text-left p-4 text-text-muted font-medium">Last Login</th>
                        <th className="text-right p-4 text-text-muted font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-border hover:bg-surface-alt transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-text-primary font-medium">
                                {user.name.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <div>
                                <p className="text-text-primary font-medium">{user.name}</p>
                                <p className="text-sm text-text-muted">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={getRoleColor(user.role)}>
                              {user.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </Badge>
                          </td>
                          <td className="p-4 text-text-secondary">{user.stadium}</td>
                          <td className="p-4 text-text-muted text-sm">
                            <span suppressHydrationWarning>{new Date(user.lastLogin).toLocaleString("en-US", { hour12: false })}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-text-primary" onClick={() => toast.info("Edit mode coming soon")}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-danger" onClick={() => toast.success("User removed")}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">System Integrations</h2>
              <p className="text-text-muted text-sm">Manage external services and API connections</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration) => {
                const isConfiguring = configuringIntegration === integration.id;
                return (
                  <Card key={integration.id} className="bg-surface border border-border rounded-lg backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-info/20 to-info/10 flex items-center justify-center">
                            {integration.type === "ai" && <Zap className="w-5 h-5 text-info" />}
                            {integration.type === "cache" && <Database className="w-5 h-5 text-info" />}
                            {integration.type === "database" && <Server className="w-5 h-5 text-info" />}
                            {integration.type === "weather" && <Cloud className="w-5 h-5 text-info" />}
                            {integration.type === "maps" && <MapPin className="w-5 h-5 text-info" />}
                            {integration.type === "transit" && <MapPin className="w-5 h-5 text-info" />}
                            {integration.type === "notifications" && <Bell className="w-5 h-5 text-info" />}
                          </div>
                          <div>
                            <CardTitle className="text-text-primary text-sm">{integration.name}</CardTitle>
                            <p className="text-xs text-text-muted">{integration.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={getStatusColor(integration.status)}>
                          {integration.status === "connected" ? (
                            <Wifi className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-xs text-text-muted">
                        <p>Endpoint: <span className="text-text-secondary font-mono">{integration.apiEndpoint}</span></p>
                        <p>Last tested: <span suppressHydrationWarning>{new Date(integration.lastTest).toLocaleString("en-US", { hour12: false })}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 border-border text-text-secondary" onClick={() => {
                          if (isConfiguring) {
                            setConfiguringIntegration(null);
                          } else {
                            setConfigForm({ endpoint: integration.apiEndpoint, apiKey: integration.apiKey });
                            setConfiguringIntegration(integration.id);
                          }
                        }}>
                          <Settings className="w-3 h-3 mr-1" />
                          {isConfiguring ? "Close" : "Configure"}
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 border-border text-text-secondary" onClick={() => toast.success(`Test passed for ${integration.name}`)}>
                          <TestTube className="w-3 h-3 mr-1" />
                          Test
                        </Button>
                      </div>
                      {isConfiguring && (
                        <div className="space-y-3 pt-2 border-t border-border">
                          <div className="space-y-2">
                            <Label className="text-text-secondary text-xs">API Endpoint</Label>
                            <Input
                              value={configForm.endpoint}
                              onChange={(e) => setConfigForm({ ...configForm, endpoint: e.target.value })}
                              className="bg-surface-alt border-border text-text-primary text-sm"
                            />
                          </div>
                          {(integration.type === "ai" || integration.type === "weather" || integration.type === "maps" || integration.type === "transit" || integration.type === "notifications") && (
                            <div className="space-y-2">
                              <Label className="text-text-secondary text-xs">API Key</Label>
                              <Input
                                type="password"
                                value={configForm.apiKey}
                                onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                                placeholder="Enter API key"
                                className="bg-surface-alt border-border text-text-primary text-sm"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={integration.status === "connected"}
                                onCheckedChange={(checked) => {
                                  setIntegrations((prev) =>
                                    prev.map((i) =>
                                      i.id === integration.id
                                        ? { ...i, status: checked ? "connected" : "disconnected" }
                                        : i
                                    )
                                  );
                                  toast.success(`${integration.name} ${checked ? "connected" : "disconnected"}`);
                                }}
                              />
                              <span className="text-xs text-text-muted">Enabled</span>
                            </div>
                            <Button size="sm" className="bg-info hover:bg-info text-text-primary" onClick={() => {
                              setIntegrations((prev) =>
                                prev.map((i) =>
                                  i.id === integration.id
                                    ? { ...i, apiEndpoint: configForm.endpoint, apiKey: configForm.apiKey }
                                    : i
                                )
                              );
                              setConfiguringIntegration(null);
                              toast.success(`${integration.name} configuration saved`);
                            }}>
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-surface border border-border rounded-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-text-primary flex items-center gap-2">
                  <Webhook className="w-5 h-5 text-info" />
                  Webhook Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-text-secondary">Add New Webhook</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://your-webhook-endpoint.com/events"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="bg-surface-alt border-border text-text-primary"
                    />
                    <Button
                      className="bg-info hover:bg-info text-text-primary"
                      onClick={() => {
                        if (!webhookUrl) { toast.error("Enter a webhook URL"); return; }
                        const selectedEvents = Object.entries(webhookEvents).filter(([, v]) => v).map(([k]) => k);
                        if (selectedEvents.length === 0) { toast.error("Select at least one event"); return; }
                        setWebhooks((prev) => [...prev, { id: Date.now(), url: webhookUrl, events: selectedEvents, status: "active" }]);
                        setWebhookUrl("");
                        toast.success("Webhook added");
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-text-secondary">Secret Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      className="bg-surface-alt border-border text-text-primary"
                    />
                    <Button variant="outline" size="icon" className="border-border text-text-secondary" onClick={() => { navigator.clipboard.writeText(webhookSecret); toast.success("Copied!"); }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-text-secondary">Events to Subscribe</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(webhookEvents).map((event) => (
                      <Badge
                        key={event}
                        variant="outline"
                        className={`cursor-pointer transition-colors ${
                          webhookEvents[event]
                            ? "bg-info/10 text-info border-info/20"
                            : "bg-surface-alt text-text-secondary border-border hover:bg-info/10 hover:text-info hover:border-info/20"
                        }`}
                        onClick={() => setWebhookEvents((prev) => ({ ...prev, [event]: !prev[event] }))}
                      >
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
                {webhooks.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-text-secondary">Configured Endpoints</Label>
                    <div className="space-y-2">
                      {webhooks.map((wh) => (
                        <div key={wh.id} className="flex items-center justify-between bg-surface-alt rounded-lg p-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary font-mono truncate">{wh.url}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {wh.events.map((ev) => (
                                <Badge key={ev} variant="outline" className="text-[10px] bg-info/10 text-info border-info/20">{ev}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <Switch
                              checked={wh.status === "active"}
                              onCheckedChange={(checked) => {
                                setWebhooks((prev) =>
                                  prev.map((w) => w.id === wh.id ? { ...w, status: checked ? "active" : "paused" } : w)
                                );
                              }}
                            />
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-danger" onClick={() => {
                              setWebhooks((prev) => prev.filter((w) => w.id !== wh.id));
                              toast.success("Webhook removed");
                            }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Audit Log</h2>
                <p className="text-text-muted text-sm">Track all system activities and changes</p>
              </div>
              <Button variant="outline" className="border-border text-text-secondary" onClick={() => toast.success("Audit log exported")}>
                <Download className="w-4 h-4 mr-2" />
                Export Log
              </Button>
            </div>

            <Card className="bg-surface border border-border rounded-lg backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <Input
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-surface-alt border-border text-text-primary"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterUser} onValueChange={setFilterUser}>
                      <SelectTrigger className="w-40 bg-surface-alt border-border text-text-primary">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.name}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterAction} onValueChange={setFilterAction}>
                      <SelectTrigger className="w-48 bg-surface-alt border-border text-text-primary">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="system_config_update">System Config</SelectItem>
                        <SelectItem value="stadium_status_change">Stadium Status</SelectItem>
                        <SelectItem value="security_alert">Security Alert</SelectItem>
                        <SelectItem value="user_creation">User Creation</SelectItem>
                        <SelectItem value="vendor_approval">Vendor Approval</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border border-border rounded-lg backdrop-blur-sm">
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-surface-alt/95 backdrop-blur-sm z-10">
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-text-muted font-medium">Timestamp</th>
                        <th className="text-left p-4 text-text-muted font-medium">User</th>
                        <th className="text-left p-4 text-text-muted font-medium">Role</th>
                        <th className="text-left p-4 text-text-muted font-medium">Action</th>
                        <th className="text-left p-4 text-text-muted font-medium">Resource</th>
                        <th className="text-left p-4 text-text-muted font-medium">Details</th>
                        <th className="text-left p-4 text-text-muted font-medium">IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="border-b border-border hover:bg-surface-alt transition-colors">
                          <td className="p-4 text-text-secondary text-sm whitespace-nowrap">
                            <span suppressHydrationWarning>{new Date(log.timestamp).toLocaleString("en-US", { hour12: false })}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action)}
                              <span className="text-text-primary text-sm">{log.user}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={`${getRoleColor(log.role)} text-xs`}>
                              {log.role.replace(/_/g, " ")}
                            </Badge>
                          </td>
                          <td className="p-4">
                             <Badge variant="outline" className="bg-surface-alt text-text-secondary border-border text-xs">
                              {log.action.replace(/_/g, " ")}
                            </Badge>
                          </td>
                          <td className="p-4 text-text-secondary text-sm">{log.resource}</td>
                          <td className="p-4 text-text-muted text-sm max-w-[200px] truncate">{log.details}</td>
                          <td className="p-4 text-text-muted text-sm font-mono">{log.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="data" className="space-y-6">
            <Card className="bg-surface border border-border rounded-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-text-primary flex items-center gap-2">
                  <DatabaseZap className="w-5 h-5 text-info" />
                  Seed Initial Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-text-muted text-sm">
                  Populate the system with realistic incident, communication, and routing data for a convincing live walkthrough.
                  This will create 30 incidents across 8 stadiums and 50 notification delivery logs.
                </p>
                <SeedButton />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <ProfileTab session={session} />
          </TabsContent>
        </Tabs>
    </div>
  );
}

function Tournament(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  tournament_ops: "bg-info/10 text-info border-info/20",
  stadium_manager: "bg-success/10 text-success border-success/20",
  security_lead: "bg-danger/10 text-danger border-danger/20",
  mobility_lead: "bg-info/10 text-info border-info/20",
  vendor_manager: "bg-warning/10 text-warning border-warning/20",
  volunteer_lead: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  support_agent: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  fan_user: "bg-surface-alt text-text-muted border-border",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  super_admin: "Full system access with all administrative privileges. Can manage users, settings, and all stadium operations.",
  tournament_ops: "Tournament-wide operational management. Can view and manage all stadiums, incidents, and communications.",
  stadium_manager: "Single stadium facility and staff management. Can manage gates, devices, shifts, and venue-specific operations.",
  security_lead: "Security operations and emergency response. Can manage incidents, escalations, and security feeds.",
  mobility_lead: "Transportation and crowd flow management. Can manage routing, transit, and crowd density monitoring.",
  vendor_manager: "Vendor contracts and food/beverage operations. Can manage vendor approvals and catering.",
  volunteer_lead: "Volunteer recruitment and shift coordination. Can manage volunteer schedules and assignments.",
  support_agent: "Fan support and ticketing assistance. Can handle fan inquiries and accessibility requests.",
  fan_user: "Basic read-only access for public information.",
};

function ProfileTab({ session }: { session: any }) {
  const user = session?.user as any;
  const role = user?.role || "fan_user";
  const roleLabel = role.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const displayName = user?.name || "User";
  const email = user?.email || "admin@stadiumos.com";
  const stadiumId = user?.stadiumId;
  const language = user?.language || "en";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <Card className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <CardContent className="px-6 pb-6 -mt-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border-4 border-surface flex items-center justify-center text-xl font-bold text-primary shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-text-primary leading-tight">{displayName}</h3>
              <p className="text-sm text-text-muted leading-tight">{email}</p>
              <div className="mt-1.5">
                <Badge variant="outline" className={`text-[10px] ${ROLE_COLORS[role] || ROLE_COLORS.fan_user}`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {roleLabel}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Account Details */}
        <Card className="bg-surface border border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-info" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { icon: <Mail className="h-4 w-4 text-text-muted" />, label: "Email", value: email },
              { icon: <Key className="h-4 w-4 text-text-muted" />, label: "User ID", value: user?.id || "N/A", mono: true },
              { icon: <Shield className="h-4 w-4 text-text-muted" />, label: "Role", value: roleLabel, badge: true, badgeColor: ROLE_COLORS[role] },
              { icon: <Building2 className="h-4 w-4 text-text-muted" />, label: "Stadium", value: stadiumId ? stadiumId.charAt(0).toUpperCase() + stadiumId.slice(1).replace(/-/g, " ") : "All Stadiums" },
              { icon: <Globe className="h-4 w-4 text-text-muted" />, label: "Language", value: language === "en" ? "English" : language },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-sm text-text-secondary">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <Badge variant="outline" className={`text-[10px] ${item.badgeColor}`}>{item.value}</Badge>
                  ) : (
                    <span className={`text-sm font-medium text-text-primary ${item.mono ? "font-mono text-xs text-text-muted" : ""}`}>{item.value}</span>
                  )}
                </div>
                {i < 4 && <div className="mx-6 h-px bg-border" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Role Description */}
        <Card className="bg-surface border border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-text-primary flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-info" />
              Role & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-surface-alt rounded-lg p-4">
              <Badge variant="outline" className={`mb-2 text-[10px] ${ROLE_COLORS[role] || ROLE_COLORS.fan_user}`}>
                {roleLabel}
              </Badge>
              <p className="text-sm text-text-secondary leading-relaxed">
                {ROLE_DESCRIPTIONS[role] || "No description available."}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-text-primary mb-3">Access</h4>
              <div className="space-y-0">
                {[
                  { label: "Command Center", ok: ["super_admin", "tournament_ops"].includes(role) },
                  { label: "Stadium Operations", ok: ["super_admin", "tournament_ops", "stadium_manager", "security_lead"].includes(role) },
                  { label: "Incidents", ok: ["super_admin", "tournament_ops", "stadium_manager", "security_lead"].includes(role) },
                  { label: "Routing & Mobility", ok: ["super_admin", "tournament_ops", "mobility_lead"].includes(role) },
                  { label: "Communications", ok: ["super_admin", "tournament_ops", "stadium_manager"].includes(role) },
                  { label: "Analytics", ok: ["super_admin", "tournament_ops"].includes(role) },
                  { label: "Knowledge Base", ok: true },
                  { label: "Simulator", ok: ["super_admin", "tournament_ops"].includes(role) },
                  { label: "Settings", ok: role === "super_admin" },
                ].map((p, i) => (
                  <div key={p.label}>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-text-secondary">{p.label}</span>
                      {p.ok ? (
                        <CheckCircle className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <span className="h-4 w-4 rounded-full border-2 border-border shrink-0" />
                      )}
                    </div>
                    {i < 8 && <div className="h-px bg-border" />}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
