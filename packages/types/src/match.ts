export interface Match {
  id: string;
  tournamentId: string;
  stadiumId: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  status: MatchStatus;
  stage: MatchStage;
  kickOff: Date;
  halfTime?: Date;
  fullTime?: Date;
  attendance?: number;
  venue?: string;
  group?: string;
  round?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  flag: string;
  confederation: string;
}

export type MatchStatus =
  | "scheduled"
  | "in_progress"
  | "half_time"
  | "second_half"
  | "extra_time"
  | "penalties"
  | "full_time"
  | "postponed"
  | "cancelled";

export type MatchStage =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final";

export interface Tournament {
  id: string;
  name: string;
  year: number;
  startDate: Date;
  endDate: Date;
  status: TournamentStatus;
  hostCountries: string[];
}

export type TournamentStatus = "upcoming" | "active" | "completed";

export interface MatchDaySchedule {
  date: Date;
  matches: Match[];
  totalAttendance: number;
  venuesActive: number;
}
