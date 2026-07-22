export interface FanProfile {
  id: string;
  userId: string;
  ticketId?: string;
  matchId?: string;
  stadiumId?: string;
  name: string;
  email: string;
  phone?: string;
  language: string;
  accessibilityNeeds: AccessibilityNeed[];
  preferences: FanPreferences;
  location?: FanLocation;
}

export interface AccessibilityNeed {
  type: AccessibilityType;
  details?: string;
  equipment?: string;
}

export type AccessibilityType =
  | "wheelchair"
  | "visual_impairment"
  | "hearing_impairment"
  | "mobility_aid"
  | "service_animal"
  | "companion_seat"
  | "sensory_room"
  | "hearing_loop"
  | "large_print"
  | "braille";

export interface FanPreferences {
  notifications: boolean;
  language: string;
  favoriteTeam?: string;
  interests: string[];
}

export interface FanLocation {
  latitude: number;
  longitude: number;
  zone?: string;
  gate?: string;
  section?: string;
}

export interface FanExperience {
  ticketInfo: TicketInfo;
  nearestFacilities: FacilityInfo[];
  currentWaitTimes: WaitTimeInfo[];
  matchInfo: MatchInfo;
  safetyTips: string[];
}

export interface TicketInfo {
  matchName: string;
  date: Date;
  gate: string;
  section: string;
  row: string;
  seat: string;
  type: string;
  barcode: string;
}

export interface FacilityInfo {
  type: FacilityType;
  name: string;
  distance: number;
  waitTime: number;
  available: boolean;
  accessible: boolean;
  location: { latitude: number; longitude: number };
}

export type FacilityType =
  | "restroom"
  | "food_beverage"
  | "first_aid"
  | "information"
  | "merchandise"
  | "atm"
  | "water_fountain"
  | "charging_station"
  | "lost_found";

export interface WaitTimeInfo {
  facility: string;
  type: FacilityType;
  estimatedMinutes: number;
  queueLength: number;
  lastUpdated: Date;
}

export interface MatchInfo {
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  kickoff: Date;
  stage: string;
  venue: string;
}
