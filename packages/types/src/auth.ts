export type UserRole =
  | "super_admin"
  | "tournament_ops"
  | "stadium_manager"
  | "security_lead"
  | "mobility_lead"
  | "vendor_manager"
  | "volunteer_lead"
  | "support_agent"
  | "fan_user";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  stadiumId?: string;
  avatarUrl?: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: User;
  expires: string;
}

export type Permission =
  | "view:command_center"
  | "manage:stadium_ops"
  | "manage:incidents"
  | "manage:mobility"
  | "manage:notifications"
  | "manage:knowledge"
  | "view:analytics"
  | "manage:users"
  | "manage:matches"
  | "manage:vendors"
  | "manage:volunteers"
  | "view:fan_data"
  | "manage:settings";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "view:command_center",
    "manage:stadium_ops",
    "manage:incidents",
    "manage:mobility",
    "manage:notifications",
    "manage:knowledge",
    "view:analytics",
    "manage:users",
    "manage:matches",
    "manage:vendors",
    "manage:volunteers",
    "view:fan_data",
    "manage:settings",
  ],
  tournament_ops: [
    "view:command_center",
    "manage:stadium_ops",
    "manage:incidents",
    "manage:mobility",
    "manage:notifications",
    "manage:knowledge",
    "view:analytics",
    "manage:matches",
  ],
  stadium_manager: [
    "manage:stadium_ops",
    "manage:incidents",
    "manage:mobility",
    "view:analytics",
    "manage:vendors",
    "manage:volunteers",
  ],
  security_lead: [
    "manage:incidents",
    "view:command_center",
    "view:analytics",
  ],
  mobility_lead: [
    "manage:mobility",
    "view:command_center",
    "view:analytics",
  ],
  vendor_manager: [
    "manage:vendors",
    "view:analytics",
  ],
  volunteer_lead: [
    "manage:volunteers",
    "view:analytics",
  ],
  support_agent: [
    "manage:incidents",
    "view:fan_data",
  ],
  fan_user: [],
};
