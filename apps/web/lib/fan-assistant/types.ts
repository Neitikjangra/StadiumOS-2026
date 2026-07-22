export type FanLanguage = 'en' | 'es' | 'fr' | 'ar';

export type AccessibilityPreference = 'none' | 'wheelchair' | 'low_sensory' | 'audio_first' | 'visual_impairment';

export type FanIntent =
  | 'wayfinding'
  | 'gate_recommendation'
  | 'restroom_recommendation'
  | 'concession_recommendation'
  | 'seat_to_gate'
  | 'seat_to_amenity'
  | 'faq'
  | 'safety'
  | 'transport_exit'
  | 'help_request'
  | 'lost_found'
  | 'live_alerts'
  | 'language_change'
  | 'accessibility_settings'
  | 'greeting'
  | 'unknown';

export type FanEntityType =
  | 'gate'
  | 'section'
  | 'zone'
  | 'restroom'
  | 'concession'
  | 'first_aid'
  | 'exit'
  | 'merchandise'
  | 'lounge'
  | 'parking'
  | 'transport'
  | 'seat';

export interface FanEntity {
  type: FanEntityType;
  value: string;
  raw: string;
}

export interface FanParsedQuery {
  intent: FanIntent;
  entities: FanEntity[];
  originalText: string;
  language: FanLanguage;
}

export interface StadiumZone {
  id: string;
  name: string;
  section: string;
  level: string;
  lat: number;
  lng: number;
  capacity: number;
  currentOccupancy: number;
}

export interface StadiumGate {
  id: string;
  name: string;
  zone: string;
  sections: string[];
  waitTimeMin: number;
  isOpen: boolean;
  accessible: boolean;
  lat: number;
  lng: number;
}

export interface StadiumRestroom {
  id: string;
  name: string;
  zone: string;
  level: string;
  waitTimeMin: number;
  accessible: boolean;
  familyFriendly: boolean;
  open: boolean;
  lat: number;
  lng: number;
}

export interface StadiumConcession {
  id: string;
  name: string;
  type: string;
  zone: string;
  level: string;
  waitTimeMin: number;
  open: boolean;
  accessible: boolean;
  lat: number;
  lng: number;
}

export interface StadiumFirstAid {
  id: string;
  name: string;
  zone: string;
  lat: number;
  lng: number;
  staffed: boolean;
}

export interface StadiumExit {
  id: string;
  name: string;
  zone: string;
  type: 'gate' | 'emergency' | 'transport';
  lat: number;
  lng: number;
  congestion: 'low' | 'medium' | 'high';
}

export interface StadiumTransport {
  id: string;
  name: string;
  type: 'shuttle' | 'metro' | 'bus' | 'taxi' | 'rideshare';
  stopLocation: string;
  zone: string;
  nextDeparture: string;
  capacity: number;
  currentLoad: number;
}

export interface StadiumParking {
  id: string;
  name: string;
  zone: string;
  exitRoute: string;
  walkTimeMin: number;
  lat: number;
  lng: number;
}

export interface StadiumMap {
  gates: StadiumGate[];
  restrooms: StadiumRestroom[];
  concessions: StadiumConcession[];
  firstAid: StadiumFirstAid[];
  exits: StadiumExit[];
  transport: StadiumTransport[];
  parking: StadiumParking[];
  zones: StadiumZone[];
}

export interface FanTicket {
  section: string;
  row: string;
  seat: string;
  gate: string;
  zone: string;
  matchId: string;
  matchTitle: string;
  kickoffTime: string;
}

export interface FanProfile {
  language: FanLanguage;
  accessibility: AccessibilityPreference;
  ticket: FanTicket | null;
  currentLat: number | null;
  currentLng: number | null;
  locationPermission: 'granted' | 'denied' | 'prompt';
}

export interface FanMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  richContent?: FanRichContent;
  quickReplies?: string[];
}

export interface FanRichContent {
  type: 'card' | 'route' | 'alert' | 'list' | 'map';
  title: string;
  subtitle?: string;
  items?: FanRichItem[];
  route?: FanRoute;
  alert?: FanAlert;
}

export interface FanRichItem {
  label: string;
  value: string;
  icon?: string;
  action?: string;
}

export interface FanRoute {
  from: string;
  to: string;
  steps: string[];
  distance: string;
  estimatedTime: string;
  accessible: boolean;
}

export interface FanAlert {
  id: string;
  type: 'safety' | 'weather' | 'delay' | 'gate_change' | 'evacuation' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  zone?: string;
  timestamp: number;
  expiresAt: number;
}

export interface FanFAQ {
  id: string;
  category: string;
  question: string;
  answer: Record<FanLanguage, string>;
  keywords: string[];
}

export interface FanSafetyInfo {
  id: string;
  category: string;
  title: Record<FanLanguage, string>;
  content: Record<FanLanguage, string>;
  keywords: string[];
}

export interface HelpRequest {
  type: 'lost_found' | 'medical' | 'safety' | 'accessibility' | 'general';
  description: string;
  location: string;
  section?: string;
  contactInfo?: string;
  language: FanLanguage;
  accessibility: AccessibilityPreference;
  timestamp: number;
}

export interface WayfindingResult {
  from: string;
  to: string;
  route: string[];
  distance: string;
  estimatedTime: string;
  accessible: boolean;
  instructions: Record<FanLanguage, string[]>;
}

export interface RecommendationResult {
  id: string;
  name: string;
  distance: string;
  waitTime: string;
  reason: string;
  accessible: boolean;
  lat: number;
  lng: number;
}
