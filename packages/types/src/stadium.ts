export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  latitude: number;
  longitude: number;
  timezone: string;
  address: string;
  imageUrl?: string;
  gates: Gate[];
  zones: Zone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Gate {
  id: string;
  stadiumId: string;
  name: string;
  type: GateType;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  status: GateStatus;
}

export type GateType = "entrance" | "exit" | "vip" | "accessible" | "emergency";
export type GateStatus = "open" | "restricted" | "closed" | "emergency_only";

export interface Zone {
  id: string;
  stadiumId: string;
  name: string;
  type: ZoneType;
  level: number;
  capacity: number;
  currentOccupancy: number;
  latitude?: number;
  longitude?: number;
}

export type ZoneType =
  | "pitch"
  | "stands"
  | "concourse"
  | "vip_lounge"
  | "press_area"
  | "operations"
  | "medical"
  | "parking"
  | "fan_zone";

export interface StadiumStatus {
  stadiumId: string;
  totalCapacity: number;
  currentOccupancy: number;
  occupancyPercent: number;
  openGates: number;
  totalGates: number;
  activeIncidents: number;
  activeAlerts: number;
  matchId?: string;
  lastUpdated: Date;
}
