-- ============================================================
-- StadiumOS 2026 - Complete Database Setup & Seed
-- Paste into Supabase SQL Editor and run.
-- ============================================================

-- ============================================================
-- SECTION 1: ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM (
    'super_admin','tournament_ops','stadium_manager','security_lead',
    'mobility_lead','vendor_manager','volunteer_lead','support_agent','fan_user'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "TournamentStatus" AS ENUM ('upcoming','active','completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "MatchStatus" AS ENUM (
    'scheduled','in_progress','half_time','second_half',
    'extra_time','penalties','full_time','postponed','cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "MatchStage" AS ENUM (
    'group','round_of_32','round_of_16','quarter_final',
    'semi_final','third_place','final'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "GateType" AS ENUM ('entrance','exit','vip','accessible','emergency');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "GateStatus" AS ENUM ('open','restricted','closed','emergency_only');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ZoneType" AS ENUM (
    'pitch','stands_lower','stands_upper','concourse',
    'vip_lounge','press_box','operations','medical','parking','fan_zone'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "IncidentType" AS ENUM (
    'medical','security','crowd_control','infrastructure','weather',
    'fire','vip','fan_behavior','equipment','communication','accessibility','vendor'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "IncidentSeverity" AS ENUM ('critical','high','medium','low');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "IncidentStatus" AS ENUM (
    'reported','acknowledged','in_progress','escalated','resolved','closed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ResponseTeam" AS ENUM (
    'security','medical','operations','fire_safety',
    'crowd_management','vip_services','technical','communications'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AlertType" AS ENUM (
    'crowd_surge','gate_congestion','capacity_warning','queue_threshold',
    'evacuation_advisory','accessibility_concern','weather_impact',
    'securitythreat','equipment_failure'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AlertSeverity" AS ENUM ('info','warning','critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationChannel" AS ENUM (
    'push','sms','email','in_app','digital_signage','public_address'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationPriority" AS ENUM ('critical','high','normal','low');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationStatus" AS ENUM (
    'draft','scheduled','sending','sent','failed','cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "QueueType" AS ENUM (
    'entry_gate','security_check','food_beverage','restroom',
    'merchandise','ticket_office','will_call','accessible_entry'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "MobilityStatus" AS ENUM ('normal','elevated','congested','critical','evacuation');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "Language" AS ENUM (
    'en','es','fr','pt','ar','zh','de','ja','ko','it'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AccessibilityNeedType" AS ENUM (
    'wheelchair','visual_impairment','hearing_impairment','mobility_aid',
    'service_animal','companion_seat','sensory_room','hearing_loop',
    'large_print','braille'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "KnowledgeCategory" AS ENUM (
    'emergency_procedures','stadium_policy','fan_services','security_protocols',
    'accessibility_guide','vendor_operations','match_day_operations',
    'weather_contingency','evacuation_plan','faq'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "VolunteerShiftStatus" AS ENUM (
    'scheduled','checked_in','on_duty','on_break','completed','no_show'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "DevicePlatform" AS ENUM ('ios','android','web','signage');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AuditAction" AS ENUM (
    'incident_create','incident_update','incident_escalate','incident_resolve',
    'incident_close','notification_broadcast','notification_cancel',
    'sop_create','sop_update','sop_publish','sop_archive',
    'gate_status_change','gate_capacity_override',
    'match_status_update','match_score_update',
    'alert_acknowledge','alert_escalate',
    'user_login','user_logout','user_create','user_role_change',
    'settings_update','mobility_override','evacuation_initiate',
    'routing_staged_exit','routing_simulation'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "IngestionChannel" AS ENUM (
    'crowd_density','gate_throughput','queue_length','incident_report',
    'transit_feed','weather_feed','device_heartbeat','manual_update','fan_help_request'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "EventType" AS ENUM (
    'crowd_density_update','gate_throughput_update','queue_length_update',
    'incident_created','incident_updated','transit_update','weather_update',
    'device_online','device_offline','manual_operator_update',
    'fan_help_request','anomaly_detected','threshold_breached'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AnomalyType" AS ENUM (
    'crowd_surge','crowd_drop','gate_congestion','unusual_wait_time',
    'device_silence','capacity_breach','rapid_queue_growth',
    'weather_deterioration','transit_disruption'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "DeviceStatus" AS ENUM ('online','offline','degraded','maintenance');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "EventProcessingStatus" AS ENUM (
    'pending','processing','completed','failed','dead_letter'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
-- ============================================================
-- SECTION 2: TABLES (in dependency order)
-- ============================================================

CREATE TABLE IF NOT EXISTS "Tournament" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "startDate" TIMESTAMPTZ NOT NULL,
  "endDate" TIMESTAMPTZ NOT NULL,
  "status" "TournamentStatus" NOT NULL DEFAULT 'upcoming',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "HostCountry" (
  "id" TEXT PRIMARY KEY,
  "tournamentId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "flag" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id"),
  UNIQUE ("tournamentId", "code")
);

CREATE TABLE IF NOT EXISTS "HostCity" (
  "id" TEXT PRIMARY KEY,
  "hostCountryId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("hostCountryId") REFERENCES "HostCountry"("id")
);

CREATE TABLE IF NOT EXISTS "Stadium" (
  "id" TEXT PRIMARY KEY,
  "hostCityId" TEXT NOT NULL,
  "tournamentId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
  "imageUrl" TEXT,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("hostCityId") REFERENCES "HostCity"("id"),
  FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id")
);
CREATE INDEX IF NOT EXISTS "Stadium_hostCityId_idx" ON "Stadium"("hostCityId");
CREATE INDEX IF NOT EXISTS "Stadium_tournamentId_idx" ON "Stadium"("tournamentId");

CREATE TABLE IF NOT EXISTS "Gate" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "GateType" NOT NULL DEFAULT 'entrance',
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "capacity" INTEGER NOT NULL,
  "status" "GateStatus" NOT NULL DEFAULT 'open',
  "flowIn" INTEGER NOT NULL DEFAULT 0,
  "flowOut" INTEGER NOT NULL DEFAULT 0,
  "throughput" INTEGER NOT NULL DEFAULT 0,
  "queueLength" INTEGER NOT NULL DEFAULT 0,
  "waitTime" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id")
);
CREATE INDEX IF NOT EXISTS "Gate_stadiumId_idx" ON "Gate"("stadiumId");
CREATE INDEX IF NOT EXISTS "Gate_status_idx" ON "Gate"("status");

CREATE TABLE IF NOT EXISTS "Zone" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "ZoneType" NOT NULL,
  "level" INTEGER NOT NULL DEFAULT 1,
  "capacity" INTEGER NOT NULL,
  "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
  "density" TEXT NOT NULL DEFAULT 'low',
  "trend" TEXT NOT NULL DEFAULT 'stable',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id")
);
CREATE INDEX IF NOT EXISTS "Zone_stadiumId_idx" ON "Zone"("stadiumId");
CREATE INDEX IF NOT EXISTS "Zone_type_idx" ON "Zone"("type");

CREATE TABLE IF NOT EXISTS "Concession" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "level" INTEGER,
  "section" TEXT,
  "isOpen" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id")
);
CREATE INDEX IF NOT EXISTS "Concession_stadiumId_idx" ON "Concession"("stadiumId");

CREATE TABLE IF NOT EXISTS "Restroom" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "level" INTEGER,
  "section" TEXT,
  "accessible" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'operational',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id")
);
CREATE INDEX IF NOT EXISTS "Restroom_stadiumId_idx" ON "Restroom"("stadiumId");

CREATE TABLE IF NOT EXISTS "ParkingLot" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id")
);
CREATE INDEX IF NOT EXISTS "ParkingLot_stadiumId_idx" ON "ParkingLot"("stadiumId");

CREATE TABLE IF NOT EXISTS "TransitHub" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "capacity" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id")
);
CREATE INDEX IF NOT EXISTS "TransitHub_stadiumId_idx" ON "TransitHub"("stadiumId");

CREATE TABLE IF NOT EXISTS "CrowdSensor" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "zoneId" TEXT,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id")
);
CREATE INDEX IF NOT EXISTS "CrowdSensor_stadiumId_idx" ON "CrowdSensor"("stadiumId");

CREATE TABLE IF NOT EXISTS "StaffUser" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'fan_user',
  "stadiumId" TEXT,
  "avatarUrl" TEXT,
  "language" "Language" NOT NULL DEFAULT 'en',
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMPTZ,
  "lastLoginAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id")
);
CREATE INDEX IF NOT EXISTS "StaffUser_role_idx" ON "StaffUser"("role");
CREATE INDEX IF NOT EXISTS "StaffUser_stadiumId_idx" ON "StaffUser"("stadiumId");

CREATE TABLE IF NOT EXISTS "VolunteerShift" (
  "id" TEXT PRIMARY KEY,
  "staffUserId" TEXT NOT NULL,
  "stadiumId" TEXT NOT NULL,
  "date" TIMESTAMPTZ NOT NULL,
  "startTime" TIMESTAMPTZ NOT NULL,
  "endTime" TIMESTAMPTZ NOT NULL,
  "role" TEXT NOT NULL,
  "zone" TEXT,
  "gateId" TEXT,
  "status" "VolunteerShiftStatus" NOT NULL DEFAULT 'scheduled',
  "checkedInAt" TIMESTAMPTZ,
  "checkedOutAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("staffUserId") REFERENCES "StaffUser"("id"),
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id")
);
CREATE INDEX IF NOT EXISTS "VolunteerShift_staffUserId_idx" ON "VolunteerShift"("staffUserId");
CREATE INDEX IF NOT EXISTS "VolunteerShift_stadiumId_date_idx" ON "VolunteerShift"("stadiumId","date");
CREATE INDEX IF NOT EXISTS "VolunteerShift_status_idx" ON "VolunteerShift"("status");

CREATE TABLE IF NOT EXISTS "Match" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "tournamentId" TEXT,
  "externalId" TEXT UNIQUE,
  "homeTeamCode" TEXT NOT NULL,
  "homeTeamName" TEXT NOT NULL,
  "homeTeamFlag" TEXT NOT NULL,
  "awayTeamCode" TEXT NOT NULL,
  "awayTeamName" TEXT NOT NULL,
  "awayTeamFlag" TEXT NOT NULL,
  "homeScore" INTEGER,
  "awayScore" INTEGER,
  "status" "MatchStatus" NOT NULL DEFAULT 'scheduled',
  "stage" "MatchStage" NOT NULL DEFAULT 'group',
  "groupCode" TEXT,
  "round" TEXT,
  "kickOff" TIMESTAMPTZ NOT NULL,
  "halfTime" TIMESTAMPTZ,
  "fullTime" TIMESTAMPTZ,
  "attendance" INTEGER,
  "venue" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id"),
  FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id")
);
CREATE INDEX IF NOT EXISTS "Match_stadiumId_idx" ON "Match"("stadiumId");
CREATE INDEX IF NOT EXISTS "Match_status_idx" ON "Match"("status");
CREATE INDEX IF NOT EXISTS "Match_kickOff_idx" ON "Match"("kickOff");
CREATE INDEX IF NOT EXISTS "Match_stage_idx" ON "Match"("stage");

CREATE TABLE IF NOT EXISTS "MatchEvent" (
  "id" TEXT PRIMARY KEY,
  "matchId" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "team" TEXT NOT NULL DEFAULT 'none',
  "event" TEXT NOT NULL,
  "player" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("matchId") REFERENCES "Match"("id")
);
CREATE INDEX IF NOT EXISTS "MatchEvent_matchId_idx" ON "MatchEvent"("matchId");

CREATE TABLE IF NOT EXISTS "QueueSnapshot" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "gateId" TEXT,
  "zoneId" TEXT,
  "queueType" "QueueType" NOT NULL,
  "length" INTEGER NOT NULL,
  "waitTime" INTEGER NOT NULL,
  "status" "MobilityStatus" NOT NULL DEFAULT 'normal',
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id"),
  FOREIGN KEY ("gateId") REFERENCES "Gate"("id"),
  FOREIGN KEY ("zoneId") REFERENCES "Zone"("id")
);
CREATE INDEX IF NOT EXISTS "QueueSnapshot_stadiumId_timestamp_idx" ON "QueueSnapshot"("stadiumId","timestamp");
CREATE INDEX IF NOT EXISTS "QueueSnapshot_gateId_idx" ON "QueueSnapshot"("gateId");

CREATE TABLE IF NOT EXISTS "Incident" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "matchId" TEXT,
  "zoneId" TEXT,
  "type" "IncidentType" NOT NULL,
  "severity" "IncidentSeverity" NOT NULL,
  "status" "IncidentStatus" NOT NULL DEFAULT 'reported',
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "locationDesc" TEXT NOT NULL,
  "locationLat" DOUBLE PRECISION,
  "locationLng" DOUBLE PRECISION,
  "assignedTeam" "ResponseTeam",
  "escalationLevel" INTEGER NOT NULL DEFAULT 0,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMPTZ,
  "reportedById" TEXT NOT NULL,
  "assignedToId" TEXT,
  "resolvedById" TEXT,
  "reportedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "resolvedAt" TIMESTAMPTZ,
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id"),
  FOREIGN KEY ("matchId") REFERENCES "Match"("id"),
  FOREIGN KEY ("zoneId") REFERENCES "Zone"("id"),
  FOREIGN KEY ("reportedById") REFERENCES "StaffUser"("id"),
  FOREIGN KEY ("assignedToId") REFERENCES "StaffUser"("id"),
  FOREIGN KEY ("resolvedById") REFERENCES "StaffUser"("id")
);
CREATE INDEX IF NOT EXISTS "Incident_stadiumId_idx" ON "Incident"("stadiumId");
CREATE INDEX IF NOT EXISTS "Incident_matchId_idx" ON "Incident"("matchId");
CREATE INDEX IF NOT EXISTS "Incident_status_idx" ON "Incident"("status");
CREATE INDEX IF NOT EXISTS "Incident_severity_idx" ON "Incident"("severity");
CREATE INDEX IF NOT EXISTS "Incident_type_idx" ON "Incident"("type");
CREATE INDEX IF NOT EXISTS "Incident_reportedAt_idx" ON "Incident"("reportedAt");

CREATE TABLE IF NOT EXISTS "IncidentUpdate" (
  "id" TEXT PRIMARY KEY,
  "incidentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "oldStatus" "IncidentStatus",
  "newStatus" "IncidentStatus",
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("incidentId") REFERENCES "Incident"("id")
);
CREATE INDEX IF NOT EXISTS "IncidentUpdate_incidentId_idx" ON "IncidentUpdate"("incidentId");

CREATE TABLE IF NOT EXISTS "Alert" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "incidentId" TEXT,
  "gateId" TEXT,
  "type" "AlertType" NOT NULL,
  "severity" "AlertSeverity" NOT NULL,
  "message" TEXT NOT NULL,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "acknowledgedAt" TIMESTAMPTZ,
  "acknowledgedById" TEXT,
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id"),
  FOREIGN KEY ("incidentId") REFERENCES "Incident"("id"),
  FOREIGN KEY ("gateId") REFERENCES "Gate"("id")
);
CREATE INDEX IF NOT EXISTS "Alert_stadiumId_idx" ON "Alert"("stadiumId");
CREATE INDEX IF NOT EXISTS "Alert_severity_idx" ON "Alert"("severity");
CREATE INDEX IF NOT EXISTS "Alert_type_idx" ON "Alert"("type");
CREATE INDEX IF NOT EXISTS "Alert_createdAt_idx" ON "Alert"("createdAt");

CREATE TABLE IF NOT EXISTS "NotificationCampaign" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT,
  "matchId" TEXT,
  "type" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT '[]',
  "priority" "NotificationPriority" NOT NULL DEFAULT 'normal',
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "richContent" JSONB,
  "targetAudience" JSONB NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'draft',
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMPTZ,
  "createdBy" TEXT NOT NULL,
  "scheduledAt" TIMESTAMPTZ,
  "sentAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id"),
  FOREIGN KEY ("matchId") REFERENCES "Match"("id")
);
CREATE INDEX IF NOT EXISTS "NotificationCampaign_stadiumId_idx" ON "NotificationCampaign"("stadiumId");
CREATE INDEX IF NOT EXISTS "NotificationCampaign_status_idx" ON "NotificationCampaign"("status");
CREATE INDEX IF NOT EXISTS "NotificationCampaign_type_idx" ON "NotificationCampaign"("type");
CREATE INDEX IF NOT EXISTS "NotificationCampaign_createdAt_idx" ON "NotificationCampaign"("createdAt");

CREATE TABLE IF NOT EXISTS "KnowledgeDocument" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" "KnowledgeCategory" NOT NULL,
  "tags" TEXT NOT NULL DEFAULT '[]',
  "language" "Language" NOT NULL DEFAULT 'en',
  "stadiumId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'published',
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMPTZ,
  "createdBy" TEXT NOT NULL,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "helpfulCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "KnowledgeDocument_category_idx" ON "KnowledgeDocument"("category");
CREATE INDEX IF NOT EXISTS "KnowledgeDocument_language_idx" ON "KnowledgeDocument"("language");
CREATE INDEX IF NOT EXISTS "KnowledgeDocument_status_idx" ON "KnowledgeDocument"("status");

CREATE TABLE IF NOT EXISTS "SOPRunbook" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "stadiumId" TEXT,
  "tags" TEXT NOT NULL DEFAULT '[]',
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMPTZ,
  "createdBy" TEXT NOT NULL,
  "publishedBy" TEXT,
  "publishedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "SOPRunbook_status_idx" ON "SOPRunbook"("status");
CREATE INDEX IF NOT EXISTS "SOPRunbook_stadiumId_idx" ON "SOPRunbook"("stadiumId");

CREATE TABLE IF NOT EXISTS "FAQ" (
  "id" TEXT PRIMARY KEY,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "language" "Language" NOT NULL DEFAULT 'en',
  "stadiumId" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "FAQ_category_idx" ON "FAQ"("category");
CREATE INDEX IF NOT EXISTS "FAQ_language_idx" ON "FAQ"("language");

CREATE TABLE IF NOT EXISTS "TranslationKey" (
  "key" TEXT NOT NULL,
  "language" "Language" NOT NULL,
  "value" TEXT NOT NULL,
  "context" TEXT,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY ("key", "language")
);

CREATE TABLE IF NOT EXISTS "AccessibilityService" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "type" "AccessibilityNeedType" NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id")
);
CREATE INDEX IF NOT EXISTS "AccessibilityService_stadiumId_idx" ON "AccessibilityService"("stadiumId");
CREATE INDEX IF NOT EXISTS "AccessibilityService_type_idx" ON "AccessibilityService"("type");

CREATE TABLE IF NOT EXISTS "FanUser" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "language" "Language" NOT NULL DEFAULT 'en',
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "FanUser_email_idx" ON "FanUser"("email");

CREATE TABLE IF NOT EXISTS "TicketProfile" (
  "id" TEXT PRIMARY KEY,
  "fanUserId" TEXT NOT NULL,
  "matchId" TEXT,
  "barcode" TEXT NOT NULL UNIQUE,
  "gate" TEXT NOT NULL,
  "section" TEXT NOT NULL,
  "row" TEXT NOT NULL,
  "seat" TEXT NOT NULL,
  "ticketType" TEXT NOT NULL,
  "isRedeemed" BOOLEAN NOT NULL DEFAULT false,
  "redeemedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("fanUserId") REFERENCES "FanUser"("id")
);
CREATE INDEX IF NOT EXISTS "TicketProfile_fanUserId_idx" ON "TicketProfile"("fanUserId");
CREATE INDEX IF NOT EXISTS "TicketProfile_barcode_idx" ON "TicketProfile"("barcode");
CREATE INDEX IF NOT EXISTS "TicketProfile_matchId_idx" ON "TicketProfile"("matchId");

CREATE TABLE IF NOT EXISTS "DeviceHeartbeat" (
  "id" TEXT PRIMARY KEY,
  "staffUserId" TEXT NOT NULL,
  "stadiumId" TEXT NOT NULL,
  "platform" "DevicePlatform" NOT NULL,
  "deviceId" TEXT NOT NULL,
  "ip" TEXT,
  "lastSeen" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("staffUserId") REFERENCES "StaffUser"("id"),
  FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id"),
  UNIQUE ("staffUserId", "deviceId")
);
CREATE INDEX IF NOT EXISTS "DeviceHeartbeat_stadiumId_idx" ON "DeviceHeartbeat"("stadiumId");
CREATE INDEX IF NOT EXISTS "DeviceHeartbeat_lastSeen_idx" ON "DeviceHeartbeat"("lastSeen");

CREATE TABLE IF NOT EXISTS "AIConversation" (
  "id" TEXT PRIMARY KEY,
  "staffUserId" TEXT NOT NULL,
  "context" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("staffUserId") REFERENCES "StaffUser"("id")
);
CREATE INDEX IF NOT EXISTS "AIConversation_staffUserId_idx" ON "AIConversation"("staffUserId");

CREATE TABLE IF NOT EXISTS "AIMessage" (
  "id" TEXT PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "sources" JSONB,
  "tokenCount" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id")
);
CREATE INDEX IF NOT EXISTS "AIMessage_conversationId_idx" ON "AIMessage"("conversationId");

CREATE TABLE IF NOT EXISTS "RecommendationLog" (
  "id" TEXT PRIMARY KEY,
  "staffUserId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "input" JSONB NOT NULL,
  "output" JSONB NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "wasAccepted" BOOLEAN,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("staffUserId") REFERENCES "StaffUser"("id")
);
CREATE INDEX IF NOT EXISTS "RecommendationLog_staffUserId_idx" ON "RecommendationLog"("staffUserId");
CREATE INDEX IF NOT EXISTS "RecommendationLog_type_idx" ON "RecommendationLog"("type");
CREATE INDEX IF NOT EXISTS "RecommendationLog_createdAt_idx" ON "RecommendationLog"("createdAt");

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "action" "AuditAction" NOT NULL,
  "resource" TEXT NOT NULL,
  "resourceId" TEXT NOT NULL,
  "stadiumId" TEXT,
  "details" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("userId") REFERENCES "StaffUser"("id")
);
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_resource_resourceId_idx" ON "AuditLog"("resource","resourceId");
CREATE INDEX IF NOT EXISTS "AuditLog_stadiumId_idx" ON "AuditLog"("stadiumId");
CREATE INDEX IF NOT EXISTS "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

CREATE TABLE IF NOT EXISTS "ThresholdConfig" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "zoneId" TEXT,
  "name" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "warning" DOUBLE PRECISION NOT NULL,
  "critical" DOUBLE PRECISION NOT NULL,
  "unit" TEXT NOT NULL DEFAULT '',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("stadiumId", "zoneId", "metric")
);
CREATE INDEX IF NOT EXISTS "ThresholdConfig_stadiumId_idx" ON "ThresholdConfig"("stadiumId");

CREATE TABLE IF NOT EXISTS "RawEvent" (
  "id" TEXT PRIMARY KEY,
  "channel" "IngestionChannel" NOT NULL,
  "eventType" "EventType" NOT NULL,
  "stadiumId" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL UNIQUE,
  "payload" JSONB NOT NULL,
  "normalized" JSONB,
  "status" "EventProcessingStatus" NOT NULL DEFAULT 'pending',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  "lastError" TEXT,
  "processedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "RawEvent_channel_createdAt_idx" ON "RawEvent"("channel","createdAt");
CREATE INDEX IF NOT EXISTS "RawEvent_stadiumId_createdAt_idx" ON "RawEvent"("stadiumId","createdAt");
CREATE INDEX IF NOT EXISTS "RawEvent_status_idx" ON "RawEvent"("status");
CREATE INDEX IF NOT EXISTS "RawEvent_idempotencyKey_idx" ON "RawEvent"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "RawEvent_createdAt_idx" ON "RawEvent"("createdAt");

CREATE TABLE IF NOT EXISTS "DeadLetter" (
  "id" TEXT PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "channel" "IngestionChannel" NOT NULL,
  "payload" JSONB NOT NULL,
  "error" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL,
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  "resolvedAt" TIMESTAMPTZ,
  "resolvedBy" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("eventId") REFERENCES "RawEvent"("id")
);
CREATE INDEX IF NOT EXISTS "DeadLetter_channel_resolved_idx" ON "DeadLetter"("channel","resolved");
CREATE INDEX IF NOT EXISTS "DeadLetter_createdAt_idx" ON "DeadLetter"("createdAt");

CREATE TABLE IF NOT EXISTS "AnomalyEvent" (
  "id" TEXT PRIMARY KEY,
  "eventId" TEXT,
  "stadiumId" TEXT NOT NULL,
  "zoneId" TEXT,
  "gateId" TEXT,
  "type" "AnomalyType" NOT NULL,
  "severity" "AlertSeverity" NOT NULL,
  "metric" TEXT NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "threshold" DOUBLE PRECISION NOT NULL,
  "message" TEXT NOT NULL,
  "acknowledged" BOOLEAN NOT NULL DEFAULT false,
  "acknowledgedAt" TIMESTAMPTZ,
  "acknowledgedBy" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY ("eventId") REFERENCES "RawEvent"("id")
);
CREATE INDEX IF NOT EXISTS "AnomalyEvent_stadiumId_type_idx" ON "AnomalyEvent"("stadiumId","type");
CREATE INDEX IF NOT EXISTS "AnomalyEvent_createdAt_idx" ON "AnomalyEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "AnomalyEvent_acknowledged_idx" ON "AnomalyEvent"("acknowledged");

CREATE TABLE IF NOT EXISTS "DeviceStatusRecord" (
  "id" TEXT PRIMARY KEY,
  "deviceId" TEXT NOT NULL,
  "stadiumId" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "status" "DeviceStatus" NOT NULL DEFAULT 'online',
  "lastSeen" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "metadata" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("deviceId", "stadiumId")
);
CREATE INDEX IF NOT EXISTS "DeviceStatusRecord_stadiumId_status_idx" ON "DeviceStatusRecord"("stadiumId","status");
CREATE INDEX IF NOT EXISTS "DeviceStatusRecord_lastSeen_idx" ON "DeviceStatusRecord"("lastSeen");

CREATE TABLE IF NOT EXISTS "TransitUpdate" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "hubId" TEXT,
  "route" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "delay" INTEGER,
  "message" TEXT,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "TransitUpdate_stadiumId_timestamp_idx" ON "TransitUpdate"("stadiumId","timestamp");

CREATE TABLE IF NOT EXISTS "WeatherSnapshot" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "temperature" DOUBLE PRECISION NOT NULL,
  "humidity" DOUBLE PRECISION NOT NULL,
  "windSpeed" DOUBLE PRECISION NOT NULL,
  "conditions" TEXT NOT NULL,
  "alerts" TEXT NOT NULL DEFAULT '[]',
  "uvIndex" INTEGER,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "WeatherSnapshot_stadiumId_timestamp_idx" ON "WeatherSnapshot"("stadiumId","timestamp");

CREATE TABLE IF NOT EXISTS "SimulatorRun" (
  "id" TEXT PRIMARY KEY,
  "stadiumId" TEXT NOT NULL,
  "scenario" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'running',
  "eventsPerSec" DOUBLE PRECISION NOT NULL,
  "totalEvents" INTEGER NOT NULL DEFAULT 0,
  "startedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "stoppedAt" TIMESTAMPTZ,
  "config" JSONB
);
CREATE INDEX IF NOT EXISTS "SimulatorRun_stadiumId_idx" ON "SimulatorRun"("stadiumId");
CREATE INDEX IF NOT EXISTS "SimulatorRun_status_idx" ON "SimulatorRun"("status");
-- ============================================================
-- SECTION 3: SEED DATA
-- ============================================================

-- 3.1 Tournament
INSERT INTO "Tournament" ("id","name","year","startDate","endDate","status")
VALUES ('wc2026','FIFA World Cup 2026',2026,'2026-06-11T00:00:00Z','2026-07-19T00:00:00Z','active')
ON CONFLICT ("id") DO NOTHING;

-- 3.2 HostCountry
INSERT INTO "HostCountry" ("id","tournamentId","name","code","flag")
VALUES
  ('usa','wc2026','USA','US','US'),
  ('mex','wc2026','Mexico','MX','MX'),
  ('can','wc2026','Canada','CA','CA')
ON CONFLICT ("id") DO NOTHING;

-- 3.3 HostCity
INSERT INTO "HostCity" ("id","hostCountryId","name","latitude","longitude")
VALUES
  ('eastrutherford','usa','East Rutherford',40.8135,-74.0745),
  ('inglewood','usa','Inglewood',33.9534,-118.3391),
  ('arlington','usa','Arlington',32.7473,-97.0945),
  ('kansascity','usa','Kansas City',39.0489,-94.4839),
  ('atlanta','usa','Atlanta',33.7554,-84.401),
  ('houston','usa','Houston',29.6847,-95.4107),
  ('miami','usa','Miami',25.958,-80.2389),
  ('philadelphia','usa','Philadelphia',39.9008,-75.1675),
  ('seattle','usa','Seattle',47.5952,-122.3316),
  ('santaclara','usa','Santa Clara',37.4033,-121.9698),
  ('foxborough','usa','Foxborough',42.0909,-71.2643),
  ('toronto','can','Toronto',43.6332,-79.4186),
  ('mexicocity','mex','Mexico City',19.3029,-99.1505),
  ('monterrey','mex','Monterrey',25.67,-100.244),
  ('vancouver','can','Vancouver',49.2768,-123.1107),
  ('nashville','usa','Nashville',36.1664,-86.7713)
ON CONFLICT ("id") DO NOTHING;

-- 3.4 Stadium
INSERT INTO "Stadium" ("id","hostCityId","tournamentId","name","address","capacity","latitude","longitude","timezone")
VALUES
  ('metlife','eastrutherford','wc2026','MetLife Stadium','1 MetLife Stadium Dr, East Rutherford, NJ 07073',82500,40.8135,-74.0745,'America/New_York'),
  ('sofi','inglewood','wc2026','SoFi Stadium','1001 S Stadium Dr, Inglewood, CA 90301',70240,33.9534,-118.3391,'America/Los_Angeles'),
  ('att','arlington','wc2026','AT&T Stadium','1 AT&T Way, Arlington, TX 76011',80000,32.7473,-97.0945,'America/Chicago'),
  ('arrowhead','kansascity','wc2026','Arrowhead Stadium','1 Arrowhead Dr, Kansas City, MO 64129',76416,39.0489,-94.4839,'America/Chicago'),
  ('mercedes-benz','atlanta','wc2026','Mercedes-Benz Stadium','1 AMB Dr NW, Atlanta, GA 30313',71000,33.7554,-84.401,'America/New_York'),
  ('nrg','houston','wc2026','NRG Stadium','1 NRG Park, Houston, TX 77054',72220,29.6847,-95.4107,'America/Chicago'),
  ('hard-rock','miami','wc2026','Hard Rock Stadium','347 Don Shula Dr, Miami Gardens, FL 33056',65326,25.958,-80.2389,'America/New_York'),
  ('lincoln','philadelphia','wc2026','Lincoln Financial Field','1 Lincoln Financial Field Way, Philadelphia, PA 19148',69176,39.9008,-75.1675,'America/New_York'),
  ('lumen','seattle','wc2026','Lumen Field','800 Occidental Ave S, Seattle, WA 98134',68740,47.5952,-122.3316,'America/Los_Angeles'),
  ('levi','santaclara','wc2026',"Levi's Stadium",'4900 Marie P DeBartolo Way, Santa Clara, CA 95054',68500,37.4033,-121.9698,'America/Los_Angeles'),
  ('gillette','foxborough','wc2026','Gillette Stadium','1 Patriot Pl, Foxborough, MA 02035',70000,42.0909,-71.2643,'America/New_York'),
  ('bmo','toronto','wc2026','BMO Field','170 Princes'' Blvd, Toronto, ON M6K 3C3',30000,43.6332,-79.4186,'America/Toronto'),
  ('azteca','mexicocity','wc2026','Estadio Azteca','Calzada de Tlalpan 3465, Ciudad de Mexico',87000,19.3029,-99.1505,'America/Mexico_City'),
  ('bbva','monterrey','wc2026','Estadio BBVA','Padre Mier 800, Monterrey, N.L.',53500,25.67,-100.244,'America/Mexico_City'),
  ('bc-place','vancouver','wc2026','BC Place','777 Pacific Blvd, Vancouver, BC V6B 4Y8',54320,49.2768,-123.1107,'America/Vancouver'),
  ('nissan','nashville','wc2026','Nissan Stadium','1 Titans Way, Nashville, TN 37213',69143,36.1664,-86.7713,'America/Chicago')
ON CONFLICT ("id") DO NOTHING;
-- 3.5 Gate (128 total: 8 per stadium)
INSERT INTO "Gate" ("id","stadiumId","name","type","latitude","longitude","capacity","status")
VALUES
  -- MetLife Stadium (capacity 82500, gate cap 10312)
  ('metlife-gate-1','metlife','Gate A','entrance',40.8155,-74.0755,10312,'open'),
  ('metlife-gate-2','metlife','Gate B','entrance',40.8125,-74.0725,10312,'open'),
  ('metlife-gate-3','metlife','Gate C','entrance',40.8145,-74.0735,10312,'open'),
  ('metlife-gate-4','metlife','Gate D','entrance',40.8115,-74.0765,10312,'closed'),
  ('metlife-gate-5','metlife','Gate E','entrance',40.8150,-74.0750,10312,'open'),
  ('metlife-gate-6','metlife','Gate F','entrance',40.8120,-74.0740,10312,'open'),
  ('metlife-gate-7','metlife','Gate G','vip',40.8140,-74.0730,10312,'open'),
  ('metlife-gate-8','metlife','Gate H','accessible',40.8130,-74.0760,10312,'open'),
  -- SoFi Stadium (capacity 70240, gate cap 8780)
  ('sofi-gate-1','sofi','Gate A','entrance',33.9554,-118.3401,8780,'open'),
  ('sofi-gate-2','sofi','Gate B','entrance',33.9524,-118.3371,8780,'open'),
  ('sofi-gate-3','sofi','Gate C','entrance',33.9544,-118.3381,8780,'open'),
  ('sofi-gate-4','sofi','Gate D','entrance',33.9514,-118.3411,8780,'open'),
  ('sofi-gate-5','sofi','Gate E','entrance',33.9549,-118.3396,8780,'open'),
  ('sofi-gate-6','sofi','Gate F','entrance',33.9519,-118.3386,8780,'open'),
  ('sofi-gate-7','sofi','Gate G','vip',33.9539,-118.3376,8780,'open'),
  ('sofi-gate-8','sofi','Gate H','accessible',33.9529,-118.3406,8780,'open'),
  -- AT&T Stadium (capacity 80000, gate cap 10000)
  ('att-gate-1','att','Gate A','entrance',32.7493,-97.0955,10000,'open'),
  ('att-gate-2','att','Gate B','entrance',32.7463,-97.0925,10000,'open'),
  ('att-gate-3','att','Gate C','entrance',32.7483,-97.0935,10000,'open'),
  ('att-gate-4','att','Gate D','entrance',32.7453,-97.0965,10000,'open'),
  ('att-gate-5','att','Gate E','entrance',32.7488,-97.0950,10000,'open'),
  ('att-gate-6','att','Gate F','entrance',32.7458,-97.0940,10000,'open'),
  ('att-gate-7','att','Gate G','vip',32.7478,-97.0930,10000,'open'),
  ('att-gate-8','att','Gate H','accessible',32.7468,-97.0960,10000,'open'),
  -- Arrowhead Stadium (capacity 76416, gate cap 9552)
  ('arrowhead-gate-1','arrowhead','Gate A','entrance',39.0509,-94.4849,9552,'open'),
  ('arrowhead-gate-2','arrowhead','Gate B','entrance',39.0479,-94.4819,9552,'open'),
  ('arrowhead-gate-3','arrowhead','Gate C','entrance',39.0499,-94.4829,9552,'open'),
  ('arrowhead-gate-4','arrowhead','Gate D','entrance',39.0469,-94.4859,9552,'open'),
  ('arrowhead-gate-5','arrowhead','Gate E','entrance',39.0504,-94.4844,9552,'open'),
  ('arrowhead-gate-6','arrowhead','Gate F','entrance',39.0474,-94.4834,9552,'open'),
  ('arrowhead-gate-7','arrowhead','Gate G','vip',39.0494,-94.4824,9552,'open'),
  ('arrowhead-gate-8','arrowhead','Gate H','accessible',39.0484,-94.4854,9552,'open'),
  -- Mercedes-Benz Stadium (capacity 71000, gate cap 8875)
  ('mercedes-benz-gate-1','mercedes-benz','Gate A','entrance',33.7574,-84.4020,8875,'open'),
  ('mercedes-benz-gate-2','mercedes-benz','Gate B','entrance',33.7544,-84.3990,8875,'open'),
  ('mercedes-benz-gate-3','mercedes-benz','Gate C','entrance',33.7564,-84.4000,8875,'open'),
  ('mercedes-benz-gate-4','mercedes-benz','Gate D','entrance',33.7534,-84.4030,8875,'open'),
  ('mercedes-benz-gate-5','mercedes-benz','Gate E','entrance',33.7569,-84.4015,8875,'open'),
  ('mercedes-benz-gate-6','mercedes-benz','Gate F','entrance',33.7539,-84.4005,8875,'open'),
  ('mercedes-benz-gate-7','mercedes-benz','Gate G','vip',33.7559,-84.3995,8875,'open'),
  ('mercedes-benz-gate-8','mercedes-benz','Gate H','accessible',33.7549,-84.4015,8875,'open'),
  -- NRG Stadium (capacity 72220, gate cap 9027)
  ('nrg-gate-1','nrg','Gate A','entrance',29.6867,-95.4117,9027,'open'),
  ('nrg-gate-2','nrg','Gate B','entrance',29.6837,-95.4087,9027,'open'),
  ('nrg-gate-3','nrg','Gate C','entrance',29.6857,-95.4097,9027,'open'),
  ('nrg-gate-4','nrg','Gate D','entrance',29.6827,-95.4127,9027,'open'),
  ('nrg-gate-5','nrg','Gate E','entrance',29.6862,-95.4112,9027,'open'),
  ('nrg-gate-6','nrg','Gate F','entrance',29.6832,-95.4102,9027,'open'),
  ('nrg-gate-7','nrg','Gate G','vip',29.6852,-95.4092,9027,'open'),
  ('nrg-gate-8','nrg','Gate H','accessible',29.6842,-95.4122,9027,'open'),
  -- Hard Rock Stadium (capacity 65326, gate cap 8165)
  ('hard-rock-gate-1','hard-rock','Gate A','entrance',25.9600,-80.2399,8165,'open'),
  ('hard-rock-gate-2','hard-rock','Gate B','entrance',25.9570,-80.2369,8165,'open'),
  ('hard-rock-gate-3','hard-rock','Gate C','entrance',25.9590,-80.2379,8165,'open'),
  ('hard-rock-gate-4','hard-rock','Gate D','entrance',25.9560,-80.2409,8165,'open'),
  ('hard-rock-gate-5','hard-rock','Gate E','entrance',25.9595,-80.2394,8165,'open'),
  ('hard-rock-gate-6','hard-rock','Gate F','entrance',25.9565,-80.2384,8165,'open'),
  ('hard-rock-gate-7','hard-rock','Gate G','vip',25.9585,-80.2374,8165,'open'),
  ('hard-rock-gate-8','hard-rock','Gate H','accessible',25.9575,-80.2404,8165,'open'),
  -- Lincoln Financial Field (capacity 69176, gate cap 8647)
  ('lincoln-gate-1','lincoln','Gate A','entrance',39.9028,-75.1685,8647,'open'),
  ('lincoln-gate-2','lincoln','Gate B','entrance',39.8998,-75.1655,8647,'open'),
  ('lincoln-gate-3','lincoln','Gate C','entrance',39.9018,-75.1665,8647,'open'),
  ('lincoln-gate-4','lincoln','Gate D','entrance',39.8988,-75.1695,8647,'open'),
  ('lincoln-gate-5','lincoln','Gate E','entrance',39.9023,-75.1680,8647,'open'),
  ('lincoln-gate-6','lincoln','Gate F','entrance',39.8993,-75.1670,8647,'open'),
  ('lincoln-gate-7','lincoln','Gate G','vip',39.9013,-75.1660,8647,'open'),
  ('lincoln-gate-8','lincoln','Gate H','accessible',39.9003,-75.1690,8647,'open'),
  -- Lumen Field (capacity 68740, gate cap 8592)
  ('lumen-gate-1','lumen','Gate A','entrance',47.5972,-122.3326,8592,'open'),
  ('lumen-gate-2','lumen','Gate B','entrance',47.5942,-122.3296,8592,'open'),
  ('lumen-gate-3','lumen','Gate C','entrance',47.5962,-122.3306,8592,'open'),
  ('lumen-gate-4','lumen','Gate D','entrance',47.5932,-122.3336,8592,'open'),
  ('lumen-gate-5','lumen','Gate E','entrance',47.5967,-122.3321,8592,'open'),
  ('lumen-gate-6','lumen','Gate F','entrance',47.5937,-122.3311,8592,'open'),
  ('lumen-gate-7','lumen','Gate G','vip',47.5957,-122.3301,8592,'open'),
  ('lumen-gate-8','lumen','Gate H','accessible',47.5947,-122.3331,8592,'open'),
  -- Levi's Stadium (capacity 68500, gate cap 8562)
  ('levi-gate-1','levi','Gate A','entrance',37.4053,-121.9708,8562,'open'),
  ('levi-gate-2','levi','Gate B','entrance',37.4023,-121.9678,8562,'open'),
  ('levi-gate-3','levi','Gate C','entrance',37.4043,-121.9688,8562,'open'),
  ('levi-gate-4','levi','Gate D','entrance',37.4013,-121.9718,8562,'open'),
  ('levi-gate-5','levi','Gate E','entrance',37.4048,-121.9703,8562,'open'),
  ('levi-gate-6','levi','Gate F','entrance',37.4018,-121.9693,8562,'open'),
  ('levi-gate-7','levi','Gate G','vip',37.4038,-121.9683,8562,'open'),
  ('levi-gate-8','levi','Gate H','accessible',37.4028,-121.9713,8562,'open'),
  -- Gillette Stadium (capacity 70000, gate cap 8750)
  ('gillette-gate-1','gillette','Gate A','entrance',42.0929,-71.2653,8750,'open'),
  ('gillette-gate-2','gillette','Gate B','entrance',42.0899,-71.2623,8750,'open'),
  ('gillette-gate-3','gillette','Gate C','entrance',42.0919,-71.2633,8750,'open'),
  ('gillette-gate-4','gillette','Gate D','entrance',42.0889,-71.2663,8750,'open'),
  ('gillette-gate-5','gillette','Gate E','entrance',42.0924,-71.2648,8750,'open'),
  ('gillette-gate-6','gillette','Gate F','entrance',42.0894,-71.2638,8750,'open'),
  ('gillette-gate-7','gillette','Gate G','vip',42.0914,-71.2628,8750,'open'),
  ('gillette-gate-8','gillette','Gate H','accessible',42.0904,-71.2658,8750,'open'),
  -- BMO Field (capacity 30000, gate cap 3750)
  ('bmo-gate-1','bmo','Gate A','entrance',43.6352,-79.4196,3750,'open'),
  ('bmo-gate-2','bmo','Gate B','entrance',43.6322,-79.4166,3750,'open'),
  ('bmo-gate-3','bmo','Gate C','entrance',43.6342,-79.4176,3750,'open'),
  ('bmo-gate-4','bmo','Gate D','entrance',43.6312,-79.4206,3750,'open'),
  ('bmo-gate-5','bmo','Gate E','entrance',43.6347,-79.4191,3750,'open'),
  ('bmo-gate-6','bmo','Gate F','entrance',43.6317,-79.4181,3750,'open'),
  ('bmo-gate-7','bmo','Gate G','vip',43.6337,-79.4171,3750,'open'),
  ('bmo-gate-8','bmo','Gate H','accessible',43.6327,-79.4201,3750,'open'),
  -- Estadio Azteca (capacity 87000, gate cap 10875)
  ('azteca-gate-1','azteca','Gate A','entrance',19.3049,-99.1515,10875,'open'),
  ('azteca-gate-2','azteca','Gate B','entrance',19.3019,-99.1485,10875,'open'),
  ('azteca-gate-3','azteca','Gate C','entrance',19.3039,-99.1495,10875,'open'),
  ('azteca-gate-4','azteca','Gate D','entrance',19.3009,-99.1525,10875,'open'),
  ('azteca-gate-5','azteca','Gate E','entrance',19.3044,-99.1510,10875,'open'),
  ('azteca-gate-6','azteca','Gate F','entrance',19.3014,-99.1500,10875,'open'),
  ('azteca-gate-7','azteca','Gate G','vip',19.3034,-99.1490,10875,'open'),
  ('azteca-gate-8','azteca','Gate H','accessible',19.3024,-99.1520,10875,'open'),
  -- Estadio BBVA (capacity 53500, gate cap 6687)
  ('bbva-gate-1','bbva','Gate A','entrance',25.6720,-100.2450,6687,'open'),
  ('bbva-gate-2','bbva','Gate B','entrance',25.6690,-100.2420,6687,'open'),
  ('bbva-gate-3','bbva','Gate C','entrance',25.6710,-100.2430,6687,'open'),
  ('bbva-gate-4','bbva','Gate D','entrance',25.6680,-100.2460,6687,'open'),
  ('bbva-gate-5','bbva','Gate E','entrance',25.6715,-100.2445,6687,'open'),
  ('bbva-gate-6','bbva','Gate F','entrance',25.6685,-100.2435,6687,'open'),
  ('bbva-gate-7','bbva','Gate G','vip',25.6705,-100.2425,6687,'open'),
  ('bbva-gate-8','bbva','Gate H','accessible',25.6695,-100.2455,6687,'open'),
  -- BC Place (capacity 54320, gate cap 6790)
  ('bc-place-gate-1','bc-place','Gate A','entrance',49.2788,-123.1117,6790,'open'),
  ('bc-place-gate-2','bc-place','Gate B','entrance',49.2758,-123.1087,6790,'open'),
  ('bc-place-gate-3','bc-place','Gate C','entrance',49.2778,-123.1097,6790,'open'),
  ('bc-place-gate-4','bc-place','Gate D','entrance',49.2748,-123.1127,6790,'open'),
  ('bc-place-gate-5','bc-place','Gate E','entrance',49.2783,-123.1112,6790,'open'),
  ('bc-place-gate-6','bc-place','Gate F','entrance',49.2753,-123.1102,6790,'open'),
  ('bc-place-gate-7','bc-place','Gate G','vip',49.2773,-123.1092,6790,'open'),
  ('bc-place-gate-8','bc-place','Gate H','accessible',49.2763,-123.1122,6790,'open'),
  -- Nissan Stadium (capacity 69143, gate cap 8642)
  ('nissan-gate-1','nissan','Gate A','entrance',36.1684,-86.7723,8642,'open'),
  ('nissan-gate-2','nissan','Gate B','entrance',36.1654,-86.7693,8642,'open'),
  ('nissan-gate-3','nissan','Gate C','entrance',36.1674,-86.7703,8642,'open'),
  ('nissan-gate-4','nissan','Gate D','entrance',36.1644,-86.7733,8642,'open'),
  ('nissan-gate-5','nissan','Gate E','entrance',36.1679,-86.7718,8642,'open'),
  ('nissan-gate-6','nissan','Gate F','entrance',36.1649,-86.7708,8642,'open'),
  ('nissan-gate-7','nissan','Gate G','vip',36.1669,-86.7698,8642,'open'),
  ('nissan-gate-8','nissan','Gate H','accessible',36.1659,-86.7728,8642,'open')
ON CONFLICT ("id") DO NOTHING;
-- 3.6 Zone (64 total: 4 per stadium)
INSERT INTO "Zone" ("id","stadiumId","name","type","capacity")
VALUES
  -- MetLife (cap 82500)
  ('metlife-zone-1','metlife','Zone A','stands_lower',20625),
  ('metlife-zone-2','metlife','Zone B','stands_upper',20625),
  ('metlife-zone-3','metlife','Zone C','concourse',20625),
  ('metlife-zone-4','metlife','Zone D','fan_zone',20625),
  -- SoFi (cap 70240)
  ('sofi-zone-1','sofi','Zone A','stands_lower',17560),
  ('sofi-zone-2','sofi','Zone B','stands_upper',17560),
  ('sofi-zone-3','sofi','Zone C','concourse',17560),
  ('sofi-zone-4','sofi','Zone D','fan_zone',17560),
  -- AT&T (cap 80000)
  ('att-zone-1','att','Zone A','stands_lower',20000),
  ('att-zone-2','att','Zone B','stands_upper',20000),
  ('att-zone-3','att','Zone C','concourse',20000),
  ('att-zone-4','att','Zone D','fan_zone',20000),
  -- Arrowhead (cap 76416)
  ('arrowhead-zone-1','arrowhead','Zone A','stands_lower',19104),
  ('arrowhead-zone-2','arrowhead','Zone B','stands_upper',19104),
  ('arrowhead-zone-3','arrowhead','Zone C','concourse',19104),
  ('arrowhead-zone-4','arrowhead','Zone D','fan_zone',19104),
  -- Mercedes-Benz (cap 71000)
  ('mercedes-benz-zone-1','mercedes-benz','Zone A','stands_lower',17750),
  ('mercedes-benz-zone-2','mercedes-benz','Zone B','stands_upper',17750),
  ('mercedes-benz-zone-3','mercedes-benz','Zone C','concourse',17750),
  ('mercedes-benz-zone-4','mercedes-benz','Zone D','fan_zone',17750),
  -- NRG (cap 72220)
  ('nrg-zone-1','nrg','Zone A','stands_lower',18055),
  ('nrg-zone-2','nrg','Zone B','stands_upper',18055),
  ('nrg-zone-3','nrg','Zone C','concourse',18055),
  ('nrg-zone-4','nrg','Zone D','fan_zone',18055),
  -- Hard Rock (cap 65326)
  ('hard-rock-zone-1','hard-rock','Zone A','stands_lower',16331),
  ('hard-rock-zone-2','hard-rock','Zone B','stands_upper',16331),
  ('hard-rock-zone-3','hard-rock','Zone C','concourse',16331),
  ('hard-rock-zone-4','hard-rock','Zone D','fan_zone',16331),
  -- Lincoln (cap 69176)
  ('lincoln-zone-1','lincoln','Zone A','stands_lower',17294),
  ('lincoln-zone-2','lincoln','Zone B','stands_upper',17294),
  ('lincoln-zone-3','lincoln','Zone C','concourse',17294),
  ('lincoln-zone-4','lincoln','Zone D','fan_zone',17294),
  -- Lumen (cap 68740)
  ('lumen-zone-1','lumen','Zone A','stands_lower',17185),
  ('lumen-zone-2','lumen','Zone B','stands_upper',17185),
  ('lumen-zone-3','lumen','Zone C','concourse',17185),
  ('lumen-zone-4','lumen','Zone D','fan_zone',17185),
  -- Levi's (cap 68500)
  ('levi-zone-1','levi','Zone A','stands_lower',17125),
  ('levi-zone-2','levi','Zone B','stands_upper',17125),
  ('levi-zone-3','levi','Zone C','concourse',17125),
  ('levi-zone-4','levi','Zone D','fan_zone',17125),
  -- Gillette (cap 70000)
  ('gillette-zone-1','gillette','Zone A','stands_lower',17500),
  ('gillette-zone-2','gillette','Zone B','stands_upper',17500),
  ('gillette-zone-3','gillette','Zone C','concourse',17500),
  ('gillette-zone-4','gillette','Zone D','fan_zone',17500),
  -- BMO (cap 30000)
  ('bmo-zone-1','bmo','Zone A','stands_lower',7500),
  ('bmo-zone-2','bmo','Zone B','stands_upper',7500),
  ('bmo-zone-3','bmo','Zone C','concourse',7500),
  ('bmo-zone-4','bmo','Zone D','fan_zone',7500),
  -- Azteca (cap 87000)
  ('azteca-zone-1','azteca','Zone A','stands_lower',21750),
  ('azteca-zone-2','azteca','Zone B','stands_upper',21750),
  ('azteca-zone-3','azteca','Zone C','concourse',21750),
  ('azteca-zone-4','azteca','Zone D','fan_zone',21750),
  -- BBVA (cap 53500)
  ('bbva-zone-1','bbva','Zone A','stands_lower',13375),
  ('bbva-zone-2','bbva','Zone B','stands_upper',13375),
  ('bbva-zone-3','bbva','Zone C','concourse',13375),
  ('bbva-zone-4','bbva','Zone D','fan_zone',13375),
  -- BC Place (cap 54320)
  ('bc-place-zone-1','bc-place','Zone A','stands_lower',13580),
  ('bc-place-zone-2','bc-place','Zone B','stands_upper',13580),
  ('bc-place-zone-3','bc-place','Zone C','concourse',13580),
  ('bc-place-zone-4','bc-place','Zone D','fan_zone',13580),
  -- Nissan (cap 69143)
  ('nissan-zone-1','nissan','Zone A','stands_lower',17285),
  ('nissan-zone-2','nissan','Zone B','stands_upper',17285),
  ('nissan-zone-3','nissan','Zone C','concourse',17285),
  ('nissan-zone-4','nissan','Zone D','fan_zone',17285)
ON CONFLICT ("id") DO NOTHING;

-- 3.7 Concession (48 total: 3 per stadium)
INSERT INTO "Concession" ("id","stadiumId","name","type","isOpen")
VALUES
  ('metlife-conc-1','metlife','Concession 1','food',true),
  ('metlife-conc-2','metlife','Concession 2','beverage',true),
  ('metlife-conc-3','metlife','Concession 3','merchandise',true),
  ('sofi-conc-1','sofi','Concession 1','food',true),
  ('sofi-conc-2','sofi','Concession 2','beverage',true),
  ('sofi-conc-3','sofi','Concession 3','merchandise',true),
  ('att-conc-1','att','Concession 1','food',true),
  ('att-conc-2','att','Concession 2','beverage',true),
  ('att-conc-3','att','Concession 3','merchandise',true),
  ('arrowhead-conc-1','arrowhead','Concession 1','food',true),
  ('arrowhead-conc-2','arrowhead','Concession 2','beverage',true),
  ('arrowhead-conc-3','arrowhead','Concession 3','merchandise',true),
  ('mercedes-benz-conc-1','mercedes-benz','Concession 1','food',true),
  ('mercedes-benz-conc-2','mercedes-benz','Concession 2','beverage',true),
  ('mercedes-benz-conc-3','mercedes-benz','Concession 3','merchandise',true),
  ('nrg-conc-1','nrg','Concession 1','food',true),
  ('nrg-conc-2','nrg','Concession 2','beverage',true),
  ('nrg-conc-3','nrg','Concession 3','merchandise',true),
  ('hard-rock-conc-1','hard-rock','Concession 1','food',true),
  ('hard-rock-conc-2','hard-rock','Concession 2','beverage',true),
  ('hard-rock-conc-3','hard-rock','Concession 3','merchandise',true),
  ('lincoln-conc-1','lincoln','Concession 1','food',true),
  ('lincoln-conc-2','lincoln','Concession 2','beverage',true),
  ('lincoln-conc-3','lincoln','Concession 3','merchandise',true),
  ('lumen-conc-1','lumen','Concession 1','food',true),
  ('lumen-conc-2','lumen','Concession 2','beverage',true),
  ('lumen-conc-3','lumen','Concession 3','merchandise',true),
  ('levi-conc-1','levi','Concession 1','food',true),
  ('levi-conc-2','levi','Concession 2','beverage',true),
  ('levi-conc-3','levi','Concession 3','merchandise',true),
  ('gillette-conc-1','gillette','Concession 1','food',true),
  ('gillette-conc-2','gillette','Concession 2','beverage',true),
  ('gillette-conc-3','gillette','Concession 3','merchandise',true),
  ('bmo-conc-1','bmo','Concession 1','food',true),
  ('bmo-conc-2','bmo','Concession 2','beverage',true),
  ('bmo-conc-3','bmo','Concession 3','merchandise',true),
  ('azteca-conc-1','azteca','Concession 1','food',true),
  ('azteca-conc-2','azteca','Concession 2','beverage',true),
  ('azteca-conc-3','azteca','Concession 3','merchandise',true),
  ('bbva-conc-1','bbva','Concession 1','food',true),
  ('bbva-conc-2','bbva','Concession 2','beverage',true),
  ('bbva-conc-3','bbva','Concession 3','merchandise',true),
  ('bc-place-conc-1','bc-place','Concession 1','food',true),
  ('bc-place-conc-2','bc-place','Concession 2','beverage',true),
  ('bc-place-conc-3','bc-place','Concession 3','merchandise',true),
  ('nissan-conc-1','nissan','Concession 1','food',true),
  ('nissan-conc-2','nissan','Concession 2','beverage',true),
  ('nissan-conc-3','nissan','Concession 3','merchandise',true)
ON CONFLICT ("id") DO NOTHING;

-- 3.8 Restroom (48 total: 3 per stadium)
INSERT INTO "Restroom" ("id","stadiumId","name","accessible","status")
VALUES
  ('metlife-rest-1','metlife','Restroom 1',false,'operational'),
  ('metlife-rest-2','metlife','Restroom 2',false,'operational'),
  ('metlife-rest-3','metlife','Restroom 3',true,'operational'),
  ('sofi-rest-1','sofi','Restroom 1',false,'operational'),
  ('sofi-rest-2','sofi','Restroom 2',false,'operational'),
  ('sofi-rest-3','sofi','Restroom 3',true,'operational'),
  ('att-rest-1','att','Restroom 1',false,'operational'),
  ('att-rest-2','att','Restroom 2',false,'operational'),
  ('att-rest-3','att','Restroom 3',true,'operational'),
  ('arrowhead-rest-1','arrowhead','Restroom 1',false,'operational'),
  ('arrowhead-rest-2','arrowhead','Restroom 2',false,'operational'),
  ('arrowhead-rest-3','arrowhead','Restroom 3',true,'operational'),
  ('mercedes-benz-rest-1','mercedes-benz','Restroom 1',false,'operational'),
  ('mercedes-benz-rest-2','mercedes-benz','Restroom 2',false,'operational'),
  ('mercedes-benz-rest-3','mercedes-benz','Restroom 3',true,'operational'),
  ('nrg-rest-1','nrg','Restroom 1',false,'operational'),
  ('nrg-rest-2','nrg','Restroom 2',false,'operational'),
  ('nrg-rest-3','nrg','Restroom 3',true,'operational'),
  ('hard-rock-rest-1','hard-rock','Restroom 1',false,'operational'),
  ('hard-rock-rest-2','hard-rock','Restroom 2',false,'operational'),
  ('hard-rock-rest-3','hard-rock','Restroom 3',true,'operational'),
  ('lincoln-rest-1','lincoln','Restroom 1',false,'operational'),
  ('lincoln-rest-2','lincoln','Restroom 2',false,'operational'),
  ('lincoln-rest-3','lincoln','Restroom 3',true,'operational'),
  ('lumen-rest-1','lumen','Restroom 1',false,'operational'),
  ('lumen-rest-2','lumen','Restroom 2',false,'operational'),
  ('lumen-rest-3','lumen','Restroom 3',true,'operational'),
  ('levi-rest-1','levi','Restroom 1',false,'operational'),
  ('levi-rest-2','levi','Restroom 2',false,'operational'),
  ('levi-rest-3','levi','Restroom 3',true,'operational'),
  ('gillette-rest-1','gillette','Restroom 1',false,'operational'),
  ('gillette-rest-2','gillette','Restroom 2',false,'operational'),
  ('gillette-rest-3','gillette','Restroom 3',true,'operational'),
  ('bmo-rest-1','bmo','Restroom 1',false,'operational'),
  ('bmo-rest-2','bmo','Restroom 2',false,'operational'),
  ('bmo-rest-3','bmo','Restroom 3',true,'operational'),
  ('azteca-rest-1','azteca','Restroom 1',false,'operational'),
  ('azteca-rest-2','azteca','Restroom 2',false,'operational'),
  ('azteca-rest-3','azteca','Restroom 3',true,'operational'),
  ('bbva-rest-1','bbva','Restroom 1',false,'operational'),
  ('bbva-rest-2','bbva','Restroom 2',false,'operational'),
  ('bbva-rest-3','bbva','Restroom 3',true,'operational'),
  ('bc-place-rest-1','bc-place','Restroom 1',false,'operational'),
  ('bc-place-rest-2','bc-place','Restroom 2',false,'operational'),
  ('bc-place-rest-3','bc-place','Restroom 3',true,'operational'),
  ('nissan-rest-1','nissan','Restroom 1',false,'operational'),
  ('nissan-rest-2','nissan','Restroom 2',false,'operational'),
  ('nissan-rest-3','nissan','Restroom 3',true,'operational')
ON CONFLICT ("id") DO NOTHING;
-- 3.9 StaffUser (7 users)
INSERT INTO "StaffUser" ("id","email","name","passwordHash","role","stadiumId","language","lastLoginAt")
VALUES
  ('op-1','sarah@fifa.org','Sarah Chen','$2a$10$EghLq3THQqKCFex6S/jsNe6SfQQG8KHJ4.9/JgB9cE/l8rH9ezXnK','super_admin','metlife','en',now() - interval '45 minutes'),
  ('op-2','marcus@fifa.org','Marcus Johnson','$2a$10$EghLq3THQqKCFex6S/jsNe6SfQQG8KHJ4.9/JgB9cE/l8rH9ezXnK','stadium_manager','sofi','en',now() - interval '90 minutes'),
  ('op-3','fatima@fifa.org','Fatima Al-Hassan','$2a$10$EghLq3THQqKCFex6S/jsNe6SfQQG8KHJ4.9/JgB9cE/l8rH9ezXnK','security_lead','att','en',now() - interval '30 minutes'),
  ('op-4','james@fifa.org','James Rodriguez','$2a$10$EghLq3THQqKCFex6S/jsNe6SfQQG8KHJ4.9/JgB9cE/l8rH9ezXnK','mobility_lead','arrowhead','en',now() - interval '120 minutes'),
  ('op-5','aisha@fifa.org','Aisha Patel','$2a$10$EghLq3THQqKCFex6S/jsNe6SfQQG8KHJ4.9/JgB9cE/l8rH9ezXnK','stadium_manager','mercedes-benz','en',now() - interval '60 minutes'),
  ('admin-1','admin@stadiumos.com','Sarah Chen','$2a$10$EghLq3THQqKCFex6S/jsNe6SfQQG8KHJ4.9/JgB9cE/l8rH9ezXnK','super_admin',NULL,'en',now()),
  ('fan-user-1','fan@stadiumos.com','Fan User','$2a$10$EghLq3THQqKCFex6S/jsNe6SfQQG8KHJ4.9/JgB9cE/l8rH9ezXnK','fan_user',NULL,'en',now() - interval '200 minutes')
ON CONFLICT ("id") DO NOTHING;

-- 3.10 Match (12 matches)
INSERT INTO "Match" ("id","stadiumId","tournamentId","homeTeamCode","homeTeamName","homeTeamFlag","awayTeamCode","awayTeamName","awayTeamFlag","homeScore","awayScore","status","stage","groupCode","kickOff","attendance")
VALUES
  ('match-1','metlife','wc2026','USA','USA','US','MEX','Mexico','MX',2,1,'in_progress','group','A','2026-06-11T20:00:00Z',78500),
  ('match-2','sofi','wc2026','BRA','Brazil','BR','ARG','Argentina','AR',1,1,'half_time','group','B','2026-06-12T20:00:00Z',68200),
  ('match-3','att','wc2026','FRA','France','FR','GER','Germany','DE',0,2,'in_progress','group','C','2026-06-13T20:00:00Z',76000),
  ('match-4','arrowhead','wc2026','ENG','England','EN','ESP','Spain','ES',NULL,NULL,'scheduled','group','D','2026-06-14T18:00:00Z',74000),
  ('match-5','mercedes-benz','wc2026','JPN','Japan','JP','AUS','Australia','AU',NULL,NULL,'scheduled','group','E','2026-06-15T18:00:00Z',69500),
  ('match-6','nrg','wc2026','MAR','Morocco','MA','SEN','Senegal','SN',NULL,NULL,'scheduled','group','F','2026-06-16T18:00:00Z',70000),
  ('match-7','hard-rock','wc2026','CAN','Canada','CA','CRC','Costa Rica','CR',NULL,NULL,'scheduled','group','G','2026-06-17T20:00:00Z',63000),
  ('match-8','lincoln','wc2026','POR','Portugal','PT','NED','Netherlands','NL',3,1,'full_time','group','H','2026-06-18T20:00:00Z',67500),
  ('match-9','lumen','wc2026','ITA','Italy','IT','BEL','Belgium','BE',NULL,NULL,'scheduled','group','A','2026-06-19T22:00:00Z',66000),
  ('match-10','levi','wc2026','KOR','South Korea','KR','URU','Uruguay','UY',2,0,'full_time','group','B','2026-06-20T20:00:00Z',65000),
  ('match-11','gillette','wc2026','COL','Colombia','CO','ECU','Ecuador','EC',NULL,NULL,'scheduled','group','C','2026-06-21T18:00:00Z',68000),
  ('match-12','bmo','wc2026','CRO','Croatia','HR','SRB','Serbia','RS',1,2,'full_time','group','D','2026-06-22T20:00:00Z',28500)
ON CONFLICT ("id") DO NOTHING;

-- 3.11 MatchEvent (108 events: 9 per match)
INSERT INTO "MatchEvent" ("id","matchId","time","type","team","event","player")
VALUES
  -- Match 1: USA vs Mexico
  ('me-match-1-1','match-1','12''','goal','home','Goal - USA #7','#7'),
  ('me-match-1-2','match-1','23''','card','away','Yellow Card - Mexico #10','#10'),
  ('me-match-1-3','match-1','35''','goal','away','Goal - Mexico #9','#9'),
  ('me-match-1-4','match-1','41''','sub','home','Substitution - USA #14 ON','#14'),
  ('me-match-1-5','match-1','45+2''','goal','home','Goal - USA #11','#11'),
  ('me-match-1-6','match-1','56''','var','none','VAR Review - Offside Check',''),
  ('me-match-1-7','match-1','67''','sub','away','Substitution - Mexico #21 ON','#21'),
  ('me-match-1-8','match-1','72''','card','home','Yellow Card - USA #3','#3'),
  ('me-match-1-9','match-1','78''','goal','home','Goal - USA #10','#10'),
  -- Match 2: Brazil vs Argentina
  ('me-match-2-1','match-2','12''','goal','home','Goal - Brazil #7','#7'),
  ('me-match-2-2','match-2','23''','card','away','Yellow Card - Argentina #10','#10'),
  ('me-match-2-3','match-2','35''','goal','away','Goal - Argentina #9','#9'),
  ('me-match-2-4','match-2','41''','sub','home','Substitution - Brazil #14 ON','#14'),
  ('me-match-2-5','match-2','45+2''','goal','home','Goal - Brazil #11','#11'),
  ('me-match-2-6','match-2','56''','var','none','VAR Review - Offside Check',''),
  ('me-match-2-7','match-2','67''','sub','away','Substitution - Argentina #21 ON','#21'),
  ('me-match-2-8','match-2','72''','card','home','Yellow Card - Brazil #3','#3'),
  ('me-match-2-9','match-2','78''','goal','home','Goal - Brazil #10','#10'),
  -- Match 3: France vs Germany
  ('me-match-3-1','match-3','12''','goal','home','Goal - France #7','#7'),
  ('me-match-3-2','match-3','23''','card','away','Yellow Card - Germany #10','#10'),
  ('me-match-3-3','match-3','35''','goal','away','Goal - Germany #9','#9'),
  ('me-match-3-4','match-3','41''','sub','home','Substitution - France #14 ON','#14'),
  ('me-match-3-5','match-3','45+2''','goal','home','Goal - France #11','#11'),
  ('me-match-3-6','match-3','56''','var','none','VAR Review - Offside Check',''),
  ('me-match-3-7','match-3','67''','sub','away','Substitution - Germany #21 ON','#21'),
  ('me-match-3-8','match-3','72''','card','home','Yellow Card - France #3','#3'),
  ('me-match-3-9','match-3','78''','goal','home','Goal - France #10','#10'),
  -- Match 4: England vs Spain
  ('me-match-4-1','match-4','12''','goal','home','Goal - England #7','#7'),
  ('me-match-4-2','match-4','23''','card','away','Yellow Card - Spain #10','#10'),
  ('me-match-4-3','match-4','35''','goal','away','Goal - Spain #9','#9'),
  ('me-match-4-4','match-4','41''','sub','home','Substitution - England #14 ON','#14'),
  ('me-match-4-5','match-4','45+2''','goal','home','Goal - England #11','#11'),
  ('me-match-4-6','match-4','56''','var','none','VAR Review - Offside Check',''),
  ('me-match-4-7','match-4','67''','sub','away','Substitution - Spain #21 ON','#21'),
  ('me-match-4-8','match-4','72''','card','home','Yellow Card - England #3','#3'),
  ('me-match-4-9','match-4','78''','goal','home','Goal - England #10','#10'),
  -- Match 5: Japan vs Australia
  ('me-match-5-1','match-5','12''','goal','home','Goal - Japan #7','#7'),
  ('me-match-5-2','match-5','23''','card','away','Yellow Card - Australia #10','#10'),
  ('me-match-5-3','match-5','35''','goal','away','Goal - Australia #9','#9'),
  ('me-match-5-4','match-5','41''','sub','home','Substitution - Japan #14 ON','#14'),
  ('me-match-5-5','match-5','45+2''','goal','home','Goal - Japan #11','#11'),
  ('me-match-5-6','match-5','56''','var','none','VAR Review - Offside Check',''),
  ('me-match-5-7','match-5','67''','sub','away','Substitution - Australia #21 ON','#21'),
  ('me-match-5-8','match-5','72''','card','home','Yellow Card - Japan #3','#3'),
  ('me-match-5-9','match-5','78''','goal','home','Goal - Japan #10','#10'),
  -- Match 6: Morocco vs Senegal
  ('me-match-6-1','match-6','12''','goal','home','Goal - Morocco #7','#7'),
  ('me-match-6-2','match-6','23''','card','away','Yellow Card - Senegal #10','#10'),
  ('me-match-6-3','match-6','35''','goal','away','Goal - Senegal #9','#9'),
  ('me-match-6-4','match-6','41''','sub','home','Substitution - Morocco #14 ON','#14'),
  ('me-match-6-5','match-6','45+2''','goal','home','Goal - Morocco #11','#11'),
  ('me-match-6-6','match-6','56''','var','none','VAR Review - Offside Check',''),
  ('me-match-6-7','match-6','67''','sub','away','Substitution - Senegal #21 ON','#21'),
  ('me-match-6-8','match-6','72''','card','home','Yellow Card - Morocco #3','#3'),
  ('me-match-6-9','match-6','78''','goal','home','Goal - Morocco #10','#10'),
  -- Match 7: Canada vs Costa Rica
  ('me-match-7-1','match-7','12''','goal','home','Goal - Canada #7','#7'),
  ('me-match-7-2','match-7','23''','card','away','Yellow Card - Costa Rica #10','#10'),
  ('me-match-7-3','match-7','35''','goal','away','Goal - Costa Rica #9','#9'),
  ('me-match-7-4','match-7','41''','sub','home','Substitution - Canada #14 ON','#14'),
  ('me-match-7-5','match-7','45+2''','goal','home','Goal - Canada #11','#11'),
  ('me-match-7-6','match-7','56''','var','none','VAR Review - Offside Check',''),
  ('me-match-7-7','match-7','67''','sub','away','Substitution - Costa Rica #21 ON','#21'),
  ('me-match-7-8','match-7','72''','card','home','Yellow Card - Canada #3','#3'),
  ('me-match-7-9','match-7','78''','goal','home','Goal - Canada #10','#10'),
  -- Match 8: Portugal vs Netherlands
  ('me-match-8-1','match-8','12''','goal','home','Goal - Portugal #7','#7'),
  ('me-match-8-2','match-8','23''','card','away','Yellow Card - Netherlands #10','#10'),
  ('me-match-8-3','match-8','35''','goal','away','Goal - Netherlands #9','#9'),
  ('me-match-8-4','match-8','41''','sub','home','Substitution - Portugal #14 ON','#14'),
  ('me-match-8-5','match-8','45+2''','goal','home','Goal - Portugal #11','#11'),
  ('me-match-8-6','match-8','56''','var','none','VAR Review - Offside Check',''),
  ('me-match-8-7','match-8','67''','sub','away','Substitution - Netherlands #21 ON','#21'),
  ('me-match-8-8','match-8','72''','card','home','Yellow Card - Portugal #3','#3'),
  ('me-match-8-9','match-8','78''','goal','home','Goal - Portugal #10','#10'),
  -- Match 9: Italy vs Belgium
  ('me-match-9-1','match-9','12''','goal','home','Goal - Italy #7','#7'),
  ('me-match-9-2','match-9','23''','card','away','Yellow Card - Belgium #10','#10'),
  ('me-match-9-3','match-9','35''','goal','away','Goal - Belgium #9','#9'),
  ('me-match-9-4','match-9','41''','sub','home','Substitution - Italy #14 ON','#14'),
  ('me-match-9-5','match-9','45+2''','goal','home','Goal - Italy #11','#11'),
  ('me-match-9-6','match-9','56''','var','none','VAR Review - Offside Check',''),
  ('me-match-9-7','match-9','67''','sub','away','Substitution - Belgium #21 ON','#21'),
  ('me-match-9-8','match-9','72''','card','home','Yellow Card - Italy #3','#3'),
  ('me-match-9-9','match-9','78''','goal','home','Goal - Italy #10','#10'),
  -- Match 10: South Korea vs Uruguay
  ('me-match-10-1','match-10','12''','goal','home','Goal - South Korea #7','#7'),
  ('me-match-10-2','match-10','23''','card','away','Yellow Card - Uruguay #10','#10'),
  ('me-match-10-3','match-10','35''','goal','away','Goal - Uruguay #9','#9'),
  ('me-match-10-4','match-10','41''','sub','home','Substitution - South Korea #14 ON','#14'),
  ('me-match-10-5','match-10','45+2''','goal','home','Goal - South Korea #11','#11'),
  ('me-match-10-6','match-10','56''','var','none','VAR Review - Offside Check',''),
  ('me-match-10-7','match-10','67''','sub','away','Substitution - Uruguay #21 ON','#21'),
  ('me-match-10-8','match-10','72''','card','home','Yellow Card - South Korea #3','#3'),
  ('me-match-10-9','match-10','78''','goal','home','Goal - South Korea #10','#10'),
  -- Match 11: Colombia vs Ecuador
  ('me-match-11-1','match-11','12''','goal','home','Goal - Colombia #7','#7'),
  ('me-match-11-2','match-11','23''','card','away','Yellow Card - Ecuador #10','#10'),
  ('me-match-11-3','match-11','35''','goal','away','Goal - Ecuador #9','#9'),
  ('me-match-11-4','match-11','41''','sub','home','Substitution - Colombia #14 ON','#14'),
  ('me-match-11-5','match-11','45+2''','goal','home','Goal - Colombia #11','#11'),
  ('me-match-11-6','match-11','56''','var','none','VAR Review - Offside Check',''),
  ('me-match-11-7','match-11','67''','sub','away','Substitution - Ecuador #21 ON','#21'),
  ('me-match-11-8','match-11','72''','card','home','Yellow Card - Colombia #3','#3'),
  ('me-match-11-9','match-11','78''','goal','home','Goal - Colombia #10','#10'),
  -- Match 12: Croatia vs Serbia
  ('me-match-12-1','match-12','12''','goal','home','Goal - Croatia #7','#7'),
  ('me-match-12-2','match-12','23''','card','away','Yellow Card - Serbia #10','#10'),
  ('me-match-12-3','match-12','35''','goal','away','Goal - Serbia #9','#9'),
  ('me-match-12-4','match-12','41''','sub','home','Substitution - Croatia #14 ON','#14'),
  ('me-match-12-5','match-12','45+2''','goal','home','Goal - Croatia #11','#11'),
  ('me-match-12-6','match-12','56''','var','none','VAR Review - Offside Check',''),
  ('me-match-12-7','match-12','67''','sub','away','Substitution - Serbia #21 ON','#21'),
  ('me-match-12-8','match-12','72''','card','home','Yellow Card - Croatia #3','#3'),
  ('me-match-12-9','match-12','78''','goal','home','Goal - Croatia #10','#10')
ON CONFLICT ("id") DO NOTHING;
-- 3.12 Incident (30 incidents with 20 titles cycling)
INSERT INTO "Incident" ("id","stadiumId","matchId","type","severity","status","title","description","locationDesc","reportedById","assignedTeam","escalationLevel","reportedAt")
VALUES
  ('inc-1','metlife','match-1','security','high','in_progress','Gate A backup exceeding 15 min wait','Gate A backup exceeding 15 min wait at MetLife Stadium.','Zone A, Section 112','op-3','security',1,now() - interval '2 hours'),
  ('inc-2','sofi','match-2','medical','critical','escalated','Fan heat exhaustion near Section 201','Fan heat exhaustion near Section 201 at SoFi Stadium.','Zone B, Section 201','op-4','medical',2,now() - interval '3 hours'),
  ('inc-3','att','match-3','security','high','acknowledged','Unattended bag near Gate D','Unattended bag near Gate D at AT&T Stadium.','Zone C, Section 105','op-5','security',1,now() - interval '90 minutes'),
  ('inc-4','arrowhead','match-4','equipment','medium','closed','Camera 14B offline - east concourse','Camera 14B offline - east concourse at Arrowhead Stadium.','Zone C, Section 114','op-2','technical',0,now() - interval '4 hours'),
  ('inc-5','mercedes-benz','match-5','crowd_control','critical','in_progress','Crowd density critical at Section 201','Crowd density critical at Section 201 at Mercedes-Benz Stadium.','Zone A, Section 201','op-3','crowd_management',2,now() - interval '45 minutes'),
  ('inc-6','nrg','match-6','weather','high','in_progress','Lightning detected 8 miles NW','Lightning detected 8 miles NW at NRG Stadium.','Zone D, Concourse','op-5','operations',1,now() - interval '50 minutes'),
  ('inc-7','hard-rock','match-7','accessibility','medium','acknowledged','Wheelchair user needs escort Section 301','Wheelchair user needs escort Section 301 at Hard Rock Stadium.','Zone B, Section 301','op-4','medical',0,now() - interval '1 hour'),
  ('inc-8','lincoln','match-8','crowd_control','high','in_progress','Restroom Queue 20+ min Zone C','Restroom Queue 20+ min Zone C at Lincoln Financial Field.','Zone C, Section 114','op-3','crowd_management',1,now() - interval '80 minutes'),
  ('inc-9','lumen','match-9','infrastructure','medium','in_progress','Concession stockout at Concourse A','Concession stockout at Concourse A at Lumen Field.','Zone C, Concourse A','op-2','operations',0,now() - interval '2 hours'),
  ('inc-10','levi','match-10','accessibility','low','acknowledged','PA system Zone C intermittent','PA system Zone C intermittent at Levi''s Stadium.','Zone C, Section 122','op-5','technical',0,now() - interval '3 hours'),
  ('inc-11','gillette','match-11','security','critical','escalated','Perimeter breach attempt at east fence','Perimeter breach attempt at east fence at Gillette Stadium.','Zone D, East perimeter','op-4','security',2,now() - interval '2 hours'),
  ('inc-12','bmo','match-12','fan_behavior','high','escalated','Disruptive fan in Section 301','Disruptive fan in Section 301 at BMO Field.','Zone B, Section 301','op-3','security',1,now() - interval '40 minutes'),
  ('inc-13','azteca','match-1','infrastructure','low','resolved','Bus route 42 delayed 15 min','Bus route 42 delayed 15 min at Estadio Azteca.','Zone D, Transit hub','op-2','operations',0,now() - interval '3 hours'),
  ('inc-14','bbva','match-2','medical','medium','resolved','Lost child reported near Gate B','Lost child reported near Gate B at Estadio BBVA.','Zone A, Gate B','op-5','medical',0,now() - interval '5 hours'),
  ('inc-15','bc-place','match-3','equipment','low','acknowledged','Turnstile 7 not responding','Turnstile 7 not responding at BC Place.','Zone A, Gate C','op-3','technical',0,now() - interval '1 hour'),
  ('inc-16','nissan','match-4','infrastructure','medium','resolved','Water station Section 202 empty','Water station Section 202 empty at Nissan Stadium.','Zone B, Section 202','op-2','operations',0,now() - interval '2 hours'),
  ('inc-17','metlife','match-5','crowd_control','high','closed','Stairwell congestion post-goal','Stairwell congestion post-goal at MetLife Stadium.','Zone A, Section 108','op-4','crowd_management',0,now() - interval '6 hours'),
  ('inc-18','sofi','match-6','infrastructure','medium','in_progress','Parking lot E exit blocked','Parking lot E exit blocked at SoFi Stadium.','Zone D, Parking E','op-3','operations',0,now() - interval '70 minutes'),
  ('inc-19','att','match-7','accessibility','medium','in_progress','Accessible restroom maintenance needed','Accessible restroom maintenance needed at AT&T Stadium.','Zone C, Section 130','op-5','technical',0,now() - interval '90 minutes'),
  ('inc-20','arrowhead','match-8','infrastructure','low','reported','Shuttle service suspended at Hub B','Shuttle service suspended at Hub B at Arrowhead Stadium.','Zone D, Hub B','op-2','operations',0,now() - interval '30 minutes'),
  ('inc-21','mercedes-benz','match-9','medical','medium','acknowledged','Medical stand requesting additional supplies','Medical stand requesting additional supplies at Mercedes-Benz Stadium.','Zone C, Section 115','op-4','medical',0,now() - interval '2 hours'),
  ('inc-22','nrg','match-10','equipment','medium','acknowledged','CCTV camera feed loss at Parking Lot D','CCTV camera feed loss at Parking Lot D at NRG Stadium.','Zone D, Parking D','op-3','technical',0,now() - interval '1 hour'),
  ('inc-23','hard-rock','match-11','medical','low','acknowledged','Volunteer no-show reported for Gate C shift','Volunteer no-show reported for Gate C shift at Hard Rock Stadium.','Zone A, Gate C','op-5','operations',0,now() - interval '3 hours'),
  ('inc-24','lincoln','match-12','vendor','medium','resolved','Concession stand running out of stock on key items','Concession stand running out of stock on key items at Lincoln Financial Field.','Zone C, Concourse A','op-2','operations',0,now() - interval '4 hours'),
  ('inc-25','lumen','match-1','crowd_control','high','resolved','Queue at Security Checkpoint 3 exceeding 20-minute wait threshold','Queue at Security Checkpoint 3 exceeding 20-minute wait threshold at Lumen Field.','Zone A, Gate B','op-4','crowd_management',1,now() - interval '3 hours'),
  ('inc-26','levi','match-2','fan_behavior','medium','in_progress','Noise complaint from VIP suite','Noise complaint from VIP suite at Levi''s Stadium.','Zone B, VIP Suite 3','op-3','vip_services',0,now() - interval '50 minutes'),
  ('inc-27','gillette','match-3','equipment','low','closed','Elevator B3 out of service','Elevator B3 out of service at Gillette Stadium.','Zone C, Elevator B3','op-2','technical',0,now() - interval '5 hours'),
  ('inc-28','bmo','match-4','medical','low','closed','Lost child reported near Fan Zone','Lost child reported near Fan Zone at BMO Field.','Zone D, Fan Zone','op-5','medical',0,now() - interval '7 hours'),
  ('inc-29','azteca','match-5','infrastructure','critical','escalated','Power fluctuation detected in Operations Center','Power fluctuation detected in Operations Center at Estadio Azteca.','Zone C, Operations','op-4','technical',2,now() - interval '1 hour'),
  ('inc-30','bbva','match-6','security','medium','closed','Media credential issue at Press Box entrance','Media credential issue at Press Box entrance at Estadio BBVA.','Zone B, Press Box','op-3','communications',0,now() - interval '6 hours')
ON CONFLICT ("id") DO NOTHING;

-- 3.13 IncidentUpdate (58 updates from seed-realtime.sql)
INSERT INTO "IncidentUpdate" ("id","incidentId","userId","content","oldStatus","newStatus","timestamp")
VALUES
  ('iu-001','inc-1','op-3','Initial report received. Team dispatched to assess the situation.','reported','acknowledged',now() - interval '2 hours'),
  ('iu-002','inc-1','op-3','Assessment complete. Crowd density exceeding safe thresholds in Section 112. Additional security staff deployed.','acknowledged','in_progress',now() - interval '1 hour'),
  ('iu-003','inc-2','op-4','Medical emergency reported near Gate B. First aid team en route.','reported','acknowledged',now() - interval '3 hours'),
  ('iu-004','inc-2','op-4','Patient requires advanced medical attention. Ambulance dispatched. Escalating to operations lead.','acknowledged','escalated',now() - interval '2 hours'),
  ('iu-005','inc-3','op-5','Suspicious package reported at Concourse Level 2. Security perimeter established.','reported','acknowledged',now() - interval '90 minutes'),
  ('iu-006','inc-4','op-2','Equipment malfunction logged. Maintenance team notified.','reported','acknowledged',now() - interval '4 hours'),
  ('iu-007','inc-4','op-2','Repair completed. System back online. No further action required.','acknowledged','in_progress',now() - interval '3 hours'),
  ('iu-008','inc-4','op-2','Issue resolved. Equipment operating normally. Closing incident.','in_progress','closed',now() - interval '2 hours'),
  ('iu-009','inc-5','op-3','Fan disturbance reported in Lower Bowl Section 205. Security responding.','reported','acknowledged',now() - interval '45 minutes'),
  ('iu-010','inc-6','op-5','Weather alert: Lightning detected 8 miles from venue. Monitoring conditions.','reported','acknowledged',now() - interval '50 minutes'),
  ('iu-011','inc-6','op-5','Storm system approaching. Preparing contingency measures for outdoor areas.','acknowledged','in_progress',now() - interval '30 minutes'),
  ('iu-012','inc-7','op-4','VIP area access issue reported. Investigating credential system.','reported','acknowledged',now() - interval '1 hour'),
  ('iu-013','inc-8','op-3','Crowd control issue at Main Entrance. Gate throughput below expected.','reported','acknowledged',now() - interval '80 minutes'),
  ('iu-014','inc-8','op-3','Opening additional screening lanes. Estimated resolution in 10 minutes.','acknowledged','in_progress',now() - interval '60 minutes'),
  ('iu-015','inc-9','op-2','Infrastructure concern: Section 14 concourse lighting failure.','reported','acknowledged',now() - interval '2 hours'),
  ('iu-016','inc-9','op-2','Backup lighting activated. Electrician dispatched for permanent repair.','acknowledged','in_progress',now() - interval '1 hour'),
  ('iu-017','inc-10','op-5','Accessibility elevator out of service at Gate C. Temporary ramp deployed.','reported','acknowledged',now() - interval '3 hours'),
  ('iu-018','inc-11','op-4','Fire alarm triggered in Concourse Level 3. Evacuation protocol under review.','reported','acknowledged',now() - interval '2 hours'),
  ('iu-019','inc-11','op-4','False alarm confirmed - sensor malfunction. However, escalating for sensor fleet inspection.','acknowledged','escalated',now() - interval '1 hour'),
  ('iu-020','inc-12','op-3','Vendor dispute at Food Court B. Fan confrontation escalating.','reported','acknowledged',now() - interval '40 minutes'),
  ('iu-021','inc-12','op-3','Situation escalating. Security backup requested. Crowd management alert issued.','acknowledged','escalated',now() - interval '20 minutes'),
  ('iu-022','inc-13','op-2','Restroom maintenance issue in Block 300. Cleaning crew dispatched.','reported','acknowledged',now() - interval '3 hours'),
  ('iu-023','inc-13','op-2','Maintenance completed. Restroom fully operational.','acknowledged','in_progress',now() - interval '2 hours'),
  ('iu-024','inc-13','op-2','Issue resolved. Closing incident.','in_progress','resolved',now() - interval '1 hour'),
  ('iu-025','inc-14','op-5','Communication system intermittent failure on PA Zone 4.','reported','acknowledged',now() - interval '5 hours'),
  ('iu-026','inc-14','op-5','Backup comms channel activated. Primary system being reset.','acknowledged','in_progress',now() - interval '4 hours'),
  ('iu-027','inc-14','op-5','System restored. All PA zones operational.','in_progress','resolved',now() - interval '3 hours'),
  ('iu-028','inc-15','op-3','Parking Lot C congestion building. Traffic management team alerted.','reported','acknowledged',now() - interval '1 hour'),
  ('iu-029','inc-16','op-2','Signage error on Digital Board 7. Content team notified.','reported','acknowledged',now() - interval '2 hours'),
  ('iu-030','inc-16','op-2','Content corrected and re-uploaded. Signage displaying correctly.','acknowledged','resolved',now() - interval '1 hour'),
  ('iu-031','inc-17','op-4','Minor crowd control adjustment needed at Gate D exit.','reported','acknowledged',now() - interval '6 hours'),
  ('iu-032','inc-17','op-4','Additional exit staff deployed. Flow normalized.','acknowledged','in_progress',now() - interval '5 hours'),
  ('iu-033','inc-17','op-4','Situation fully resolved. Closing incident.','in_progress','closed',now() - interval '4 hours'),
  ('iu-034','inc-18','op-3','Transit hub delay: Metro line experiencing 15-minute delays.','reported','acknowledged',now() - interval '70 minutes'),
  ('iu-035','inc-18','op-3','Coordinating with transit authority. Alternative shuttle routes being arranged.','acknowledged','in_progress',now() - interval '45 minutes'),
  ('iu-036','inc-19','op-5','VIP hospitality suite temperature complaint. HVAC system underperforming.','reported','acknowledged',now() - interval '90 minutes'),
  ('iu-037','inc-19','op-5','HVAC technician on-site. Temporary cooling units deployed to affected suites.','acknowledged','in_progress',now() - interval '60 minutes'),
  ('iu-038','inc-20','op-2','Ticket scanning error at Gate A. Multiple passes failing validation.','reported','reported',now() - interval '15 minutes'),
  ('iu-039','inc-21','op-3','Medical stand requesting additional supplies. Inventory running low.','reported','acknowledged',now() - interval '2 hours'),
  ('iu-040','inc-22','op-4','CCTV camera feed loss at Parking Lot D. Security blind spot identified.','reported','acknowledged',now() - interval '1 hour'),
  ('iu-041','inc-23','op-5','Volunteer no-show reported for Gate C shift. Coverage gap identified.','reported','acknowledged',now() - interval '3 hours'),
  ('iu-042','inc-24','op-2','Concession stand running out of stock on key items. Vendor notified.','reported','acknowledged',now() - interval '4 hours'),
  ('iu-043','inc-24','op-2','Emergency restock completed. Inventory levels restored.','acknowledged','resolved',now() - interval '2 hours'),
  ('iu-044','inc-25','op-4','Queue at Security Checkpoint 3 exceeding 20-minute wait threshold.','reported','acknowledged',now() - interval '3 hours'),
  ('iu-045','inc-25','op-4','Additional screening lanes opened. Wait time reduced to normal levels.','acknowledged','resolved',now() - interval '1 hour'),
  ('iu-046','inc-26','op-3','Noise complaint from VIP suite. Entertainment volume exceeding limits.','reported','acknowledged',now() - interval '50 minutes'),
  ('iu-047','inc-26','op-3','AV team adjusting volume levels. Monitoring for compliance.','acknowledged','in_progress',now() - interval '30 minutes'),
  ('iu-048','inc-27','op-2','Elevator B3 out of service. Maintenance team dispatched.','reported','acknowledged',now() - interval '5 hours'),
  ('iu-049','inc-27','op-2','Repair completed. Elevator back in service.','acknowledged','in_progress',now() - interval '4 hours'),
  ('iu-050','inc-27','op-2','Fully operational. Incident closed.','in_progress','closed',now() - interval '3 hours'),
  ('iu-051','inc-28','op-5','Lost child reported near Fan Zone. Security and volunteer teams alerted.','reported','acknowledged',now() - interval '7 hours'),
  ('iu-052','inc-28','op-5','Child located and reunited with parents. No further action needed.','acknowledged','resolved',now() - interval '6 hours'),
  ('iu-053','inc-28','op-5','Closing incident. All clear.','resolved','closed',now() - interval '5 hours'),
  ('iu-054','inc-29','op-4','Power fluctuation detected in Operations Center. UPS system engaging.','reported','acknowledged',now() - interval '1 hour'),
  ('iu-055','inc-29','op-4','Utility company notified. Generator on standby. Escalating for priority response.','acknowledged','escalated',now() - interval '30 minutes'),
  ('iu-056','inc-30','op-3','Media credential issue at Press Box entrance. Journalism team lead contacted.','reported','acknowledged',now() - interval '6 hours'),
  ('iu-057','inc-30','op-3','Credentials verified and access granted.','acknowledged','in_progress',now() - interval '5 hours'),
  ('iu-058','inc-30','op-3','Issue resolved. Press access fully restored.','in_progress','closed',now() - interval '4 hours')
ON CONFLICT ("id") DO NOTHING;

-- 3.14 Alert (10 alerts)
INSERT INTO "Alert" ("id","stadiumId","type","severity","message")
VALUES
  ('alert-1','metlife','crowd_surge','warning','Crowd surge detected at Section 201'),
  ('alert-2','sofi','gate_congestion','info','Gate congestion warning at Gate B'),
  ('alert-3','att','capacity_warning','critical','Capacity threshold reached in Zone C'),
  ('alert-4','arrowhead','weather_impact','warning','Weather advisory: Heat warning'),
  ('alert-5','mercedes-benz','crowd_surge','critical','Crowd surge detected at Section 201'),
  ('alert-6','nrg','queue_threshold','warning','Gate congestion warning at Gate B'),
  ('alert-7','hard-rock','capacity_warning','info','Capacity threshold reached in Zone C'),
  ('alert-8','lincoln','weather_impact','critical','Weather advisory: Heat warning'),
  ('alert-9','lumen','crowd_surge','warning','Crowd surge detected at Section 201'),
  ('alert-10','levi','gate_congestion','info','Gate congestion warning at Gate B')
ON CONFLICT ("id") DO NOTHING;

-- 3.15 NotificationCampaign (8 notifications)
INSERT INTO "NotificationCampaign" ("id","stadiumId","type","channel","priority","title","body","targetAudience","status","sentAt","createdBy")
VALUES
  ('notif-1','metlife','emergency','["push","in_app"]','critical','Evacuate Section 201','Notification body content.','{"type":"all_fans"}','sent',now() - interval '30 minutes','op-1'),
  ('notif-2','sofi','weather','["push","in_app"]','high','Heat Advisory Active','Notification body content.','{"type":"all_fans"}','sent',now() - interval '60 minutes','op-3'),
  ('notif-3','att','gate_reroute','["push","in_app"]','normal','Gate D Redirected','Notification body content.','{"type":"all_fans"}','draft',NULL,'op-2'),
  ('notif-4','arrowhead','info','["push","in_app"]','critical','Lost Child Alert','Notification body content.','{"type":"all_fans"}','sent',now() - interval '15 minutes','op-5'),
  ('notif-5','mercedes-benz','emergency','["push","in_app"]','high','Evacuate Section 201','Notification body content.','{"type":"all_fans"}','scheduled',now() + interval '10 minutes','op-1'),
  ('notif-6','nrg','weather','["push","in_app"]','normal','Heat Advisory Active','Notification body content.','{"type":"all_fans"}','sent',now() - interval '90 minutes','op-3'),
  ('notif-7','hard-rock','gate_reroute','["push","in_app"]','critical','Gate D Redirected','Notification body content.','{"type":"all_fans"}','draft',NULL,'op-2'),
  ('notif-8','lincoln','info','["push","in_app"]','high','Lost Child Alert','Notification body content.','{"type":"all_fans"}','sent',now() - interval '45 minutes','op-5')
ON CONFLICT ("id") DO NOTHING;
-- 3.16 QueueSnapshot (20 base + 660 live = 680 total)
INSERT INTO "QueueSnapshot" ("id","stadiumId","queueType","length","waitTime","timestamp")
VALUES
  ('qs-1','metlife','entry_gate',25,5,now() - interval '60 minutes'),
  ('qs-2','sofi','security_check',35,8,now() - interval '55 minutes'),
  ('qs-3','att','food_beverage',15,3,now() - interval '50 minutes'),
  ('qs-4','arrowhead','restroom',42,12,now() - interval '45 minutes'),
  ('qs-5','mercedes-benz','entry_gate',30,7,now() - interval '40 minutes'),
  ('qs-6','nrg','security_check',20,4,now() - interval '35 minutes'),
  ('qs-7','hard-rock','food_beverage',55,15,now() - interval '30 minutes'),
  ('qs-8','lincoln','restroom',18,3,now() - interval '25 minutes'),
  ('qs-9','lumen','entry_gate',40,10,now() - interval '20 minutes'),
  ('qs-10','levi','security_check',28,6,now() - interval '15 minutes'),
  ('qs-11','gillette','food_beverage',33,8,now() - interval '12 minutes'),
  ('qs-12','bmo','restroom',12,2,now() - interval '9 minutes'),
  ('qs-13','azteca','entry_gate',45,11,now() - interval '8 minutes'),
  ('qs-14','bbva','security_check',38,9,now() - interval '7 minutes'),
  ('qs-15','bc-place','food_beverage',22,5,now() - interval '6 minutes'),
  ('qs-16','nissan','restroom',50,14,now() - interval '5 minutes'),
  ('qs-17','metlife','entry_gate',35,8,now() - interval '4 minutes'),
  ('qs-18','sofi','security_check',25,6,now() - interval '3 minutes'),
  ('qs-19','att','food_beverage',18,4,now() - interval '2 minutes'),
  ('qs-20','arrowhead','restroom',30,7,now() - interval '1 minute')
ON CONFLICT ("id") DO NOTHING;

-- 660 live queue snapshots via generate_series CTE
WITH stadium_list AS (
  SELECT * FROM (VALUES
    ('metlife',0),('sofi',1),('att',2),('arrowhead',3),
    ('mercedes-benz',4),('nrg',5),('hard-rock',6),('lincoln',7),
    ('lumen',8),('levi',9),('gillette',10),('bmo',11),
    ('azteca',12),('bbva',13),('bc-place',14),('nissan',15)
  ) AS t(id,idx)
),
snapshots AS (
  SELECT sl.id AS sid, sl.idx AS sidx, gs.n AS n,
    ROW_NUMBER() OVER (ORDER BY sl.idx, gs.n) AS rn
  FROM stadium_list sl
  CROSS JOIN generate_series(0,40) AS gs(n)
)
INSERT INTO "QueueSnapshot" ("id","stadiumId","gateId","zoneId","queueType","length","waitTime","status","timestamp")
SELECT
  'qs-live-' || rn,
  sid,
  sid || '-gate-' || ((n % 8) + 1),
  sid || '-zone-' || ((n % 4) + 1),
  (ARRAY['entry_gate'::"QueueType",'security_check','food_beverage','restroom','ticket_office','merchandise'])[(n % 6) + 1],
  (5 + (n * 7 + sidx * 13) % 246),
  (1 + (n * 3 + sidx * 11) % 25),
  (ARRAY['normal'::"MobilityStatus",'elevated','congested','critical'])[(n % 4) + 1],
  now() - ((660 - rn) * interval '109 seconds')
FROM snapshots;

-- 4 extra to reach exactly 660 live snapshots
INSERT INTO "QueueSnapshot" ("id","stadiumId","gateId","zoneId","queueType","length","waitTime","status","timestamp")
VALUES
  ('qs-live-657','metlife','metlife-gate-1','metlife-zone-1','entry_gate',45,8,'normal',now() - interval '30 seconds'),
  ('qs-live-658','metlife','metlife-gate-2','metlife-zone-2','security_check',32,6,'elevated',now() - interval '20 seconds'),
  ('qs-live-659','metlife','metlife-gate-3','metlife-zone-3','food_beverage',18,3,'normal',now() - interval '10 seconds'),
  ('qs-live-660','metlife','metlife-gate-4','metlife-zone-4','restroom',25,5,'congested',now())
ON CONFLICT ("id") DO NOTHING;
-- 3.17 TransitUpdate (5 transit updates)
INSERT INTO "TransitUpdate" ("id","stadiumId","route","type","status","delay","message","timestamp")
VALUES
  ('tu-1','metlife','Bus Route 42','delay','active',15,'Traffic congestion on I-95',now() - interval '10 minutes'),
  ('tu-2','sofi','Shuttle Alpha','cancellation','active',0,'Shuttle suspended',now() - interval '30 minutes'),
  ('tu-3','att','Metro Line 3','reroute','resolved',10,'Road work detour',now() - interval '60 minutes'),
  ('tu-4','arrowhead','Parking Express','delay','active',20,'Traffic congestion on I-95',now() - interval '90 minutes'),
  ('tu-5','mercedes-benz','Shuttle Alpha','reroute','resolved',5,'Road work detour',now() - interval '120 minutes')
ON CONFLICT ("id") DO NOTHING;

-- 3.18 WeatherSnapshot (16 weather snapshots: one per stadium)
INSERT INTO "WeatherSnapshot" ("id","stadiumId","temperature","humidity","windSpeed","conditions","alerts","uvIndex","timestamp")
VALUES
  ('ws-001','metlife',31.2,72.5,14.0,'Hot & Humid','[]',8,now() - interval '10 minutes'),
  ('ws-002','sofi',28.8,45.3,8.5,'Sunny','[]',9,now() - interval '10 minutes'),
  ('ws-003','att',34.5,58.0,11.2,'Clear & Hot','[]',9,now() - interval '10 minutes'),
  ('ws-004','arrowhead',30.1,62.8,16.5,'Partly Cloudy','[]',7,now() - interval '10 minutes'),
  ('ws-005','mercedes-benz',32.4,70.1,9.3,'Thunderstorms Possible','["Heat advisory in effect"]',7,now() - interval '10 minutes'),
  ('ws-006','nrg',33.8,75.2,7.8,'Hot & Muggy','["Heat index 39C"]',8,now() - interval '10 minutes'),
  ('ws-007','hard-rock',32.0,78.4,12.1,'Partly Cloudy','[]',9,now() - interval '10 minutes'),
  ('ws-008','lincoln',29.7,65.0,13.4,'Mostly Sunny','[]',7,now() - interval '10 minutes'),
  ('ws-009','lumen',23.5,55.8,18.2,'Clear','[]',6,now() - interval '10 minutes'),
  ('ws-010','levi',25.0,50.2,15.0,'Sunny','[]',8,now() - interval '10 minutes'),
  ('ws-011','gillette',27.3,60.5,14.8,'Partly Cloudy','[]',6,now() - interval '10 minutes'),
  ('ws-012','bmo',24.8,58.3,12.0,'Mostly Sunny','[]',6,now() - interval '10 minutes'),
  ('ws-013','azteca',24.0,52.0,10.5,'Partly Cloudy','[]',9,now() - interval '10 minutes'),
  ('ws-014','bbva',33.2,55.8,8.0,'Clear & Hot','[]',10,now() - interval '10 minutes'),
  ('ws-015','bc-place',21.5,62.0,16.8,'Overcast','[]',4,now() - interval '10 minutes'),
  ('ws-016','nissan',32.8,68.5,10.0,'Hot & Humid','["Heat advisory in effect"]',8,now() - interval '10 minutes')
ON CONFLICT ("id") DO NOTHING;

-- 3.19 AnomalyEvent (6 anomalies)
INSERT INTO "AnomalyEvent" ("id","stadiumId","type","severity","metric","value","threshold","message","acknowledged")
VALUES
  ('anom-1','metlife','crowd_surge','warning','density',92.5,85.0,'Crowd density exceeds threshold',false),
  ('anom-2','sofi','gate_congestion','info','wait_time',22.0,20.0,'Gate wait time 22 min',false),
  ('anom-3','att','device_silence','critical','connectivity',0.0,85.0,'Camera offline',false),
  ('anom-4','arrowhead','capacity_breach','critical','density',95.0,85.0,'Crowd density exceeds threshold',false),
  ('anom-5','mercedes-benz','unusual_wait_time','warning','wait_time',28.0,20.0,'Gate wait time 28 min',false),
  ('anom-6','nrg','crowd_surge','info','density',88.0,85.0,'Crowd density exceeds threshold',false)
ON CONFLICT ("id") DO NOTHING;

-- 3.20 AccessibilityService (24 services: 3 per stadium x 8 stadiums)
INSERT INTO "AccessibilityService" ("id","stadiumId","type","name","description","location","isAvailable")
VALUES
  -- MetLife
  ('metlife-acc-0','metlife','wheelchair','Wheelchair Escort','Escort service for wheelchair users to seating','Zone A, Level 1',true),
  ('metlife-acc-1','metlife','visual_impairment','Visual Assistance','Visual impairment assistance and guidance','Zone B, Level 1',true),
  ('metlife-acc-2','metlife','hearing_impairment','Hearing Support','Hearing loop and sign language support','Zone C, Level 1',true),
  -- SoFi
  ('sofi-acc-0','sofi','wheelchair','Wheelchair Escort','Escort service for wheelchair users to seating','Zone A, Level 1',true),
  ('sofi-acc-1','sofi','visual_impairment','Visual Assistance','Visual impairment assistance and guidance','Zone B, Level 1',true),
  ('sofi-acc-2','sofi','hearing_impairment','Hearing Support','Hearing loop and sign language support','Zone C, Level 1',true),
  -- AT&T
  ('att-acc-0','att','wheelchair','Wheelchair Escort','Escort service for wheelchair users to seating','Zone A, Level 1',true),
  ('att-acc-1','att','visual_impairment','Visual Assistance','Visual impairment assistance and guidance','Zone B, Level 1',true),
  ('att-acc-2','att','hearing_impairment','Hearing Support','Hearing loop and sign language support','Zone C, Level 1',true),
  -- Arrowhead
  ('arrowhead-acc-0','arrowhead','wheelchair','Wheelchair Escort','Escort service for wheelchair users to seating','Zone A, Level 1',true),
  ('arrowhead-acc-1','arrowhead','visual_impairment','Visual Assistance','Visual impairment assistance and guidance','Zone B, Level 1',true),
  ('arrowhead-acc-2','arrowhead','hearing_impairment','Hearing Support','Hearing loop and sign language support','Zone C, Level 1',true),
  -- Mercedes-Benz
  ('mercedes-benz-acc-0','mercedes-benz','wheelchair','Wheelchair Escort','Escort service for wheelchair users to seating','Zone A, Level 1',true),
  ('mercedes-benz-acc-1','mercedes-benz','visual_impairment','Visual Assistance','Visual impairment assistance and guidance','Zone B, Level 1',true),
  ('mercedes-benz-acc-2','mercedes-benz','hearing_impairment','Hearing Support','Hearing loop and sign language support','Zone C, Level 1',true),
  -- NRG
  ('nrg-acc-0','nrg','wheelchair','Wheelchair Escort','Escort service for wheelchair users to seating','Zone A, Level 1',true),
  ('nrg-acc-1','nrg','visual_impairment','Visual Assistance','Visual impairment assistance and guidance','Zone B, Level 1',true),
  ('nrg-acc-2','nrg','hearing_impairment','Hearing Support','Hearing loop and sign language support','Zone C, Level 1',true),
  -- Hard Rock
  ('hard-rock-acc-0','hard-rock','wheelchair','Wheelchair Escort','Escort service for wheelchair users to seating','Zone A, Level 1',true),
  ('hard-rock-acc-1','hard-rock','visual_impairment','Visual Assistance','Visual impairment assistance and guidance','Zone B, Level 1',true),
  ('hard-rock-acc-2','hard-rock','hearing_impairment','Hearing Support','Hearing loop and sign language support','Zone C, Level 1',true),
  -- Lincoln
  ('lincoln-acc-0','lincoln','wheelchair','Wheelchair Escort','Escort service for wheelchair users to seating','Zone A, Level 1',true),
  ('lincoln-acc-1','lincoln','visual_impairment','Visual Assistance','Visual impairment assistance and guidance','Zone B, Level 1',true),
  ('lincoln-acc-2','lincoln','hearing_impairment','Hearing Support','Hearing loop and sign language support','Zone C, Level 1',true)
ON CONFLICT ("id") DO NOTHING;

-- 3.21 KnowledgeDocument (10 documents)
INSERT INTO "KnowledgeDocument" ("id","title","content","category","tags","language","status","createdBy")
VALUES
  ('doc-1','Crowd Management Protocol','FIFA World Cup crowd management procedures.','security_protocols','["security_protocols"]','en','published','op-1'),
  ('doc-2','Emergency Evacuation SOP','Standard operating procedures for stadium evacuation.','emergency_procedures','["emergency_procedures"]','en','published','op-1'),
  ('doc-3','Weather Response Plan','Procedures for weather-related disruptions.','weather_contingency','["weather_contingency"]','en','published','op-3'),
  ('doc-4','Accessibility Services Guide','Guide for accessibility services.','accessibility_guide','["accessibility_guide"]','en','published','op-5'),
  ('doc-5','Gate Operations Manual','Manual for gate operations and crowd flow.','match_day_operations','["match_day_operations"]','en','published','op-2'),
  ('doc-6','Medical Emergency Response','Procedures for medical emergencies.','emergency_procedures','["emergency_procedures"]','en','published','op-3'),
  ('doc-7','VIP Hospitality Protocol','VIP services management.','fan_services','["fan_services"]','en','published','op-4'),
  ('doc-8','Vendor Management Guide','Guidelines for food and beverage vendors.','vendor_operations','["vendor_operations"]','en','published','op-2'),
  ('doc-9','Volunteer Training Manual','Training materials for match day volunteers.','match_day_operations','["match_day_operations"]','en','published','op-5'),
  ('doc-10','Communication Protocols','Internal and external communication procedures.','stadium_policy','["stadium_policy"]','en','published','op-1')
ON CONFLICT ("id") DO NOTHING;
