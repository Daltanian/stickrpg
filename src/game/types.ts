export type LocationId = "home" | "school" | "job-district";

export type ActivityId =
  | "sleep"
  | "shower"
  | "cook-meal"
  | "attend-class"
  | "study"
  | "work-dishwasher"
  | "work-retail"
  | "work-intern";

export type LogType = "info" | "event" | "warning" | "reward";

export interface Needs {
  energy: number;
  hunger: number;
  hygiene: number;
  stress: number;
  health: number;
}

export interface Attributes {
  strength: number;
  agility: number;
  charisma: number;
  intelligence: number;
}

export interface Skills {
  labor: number;
  fitness: number;
  hustle: number;
  office: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

export interface Inventory {
  capacity: number;
  items: InventoryItem[];
}

export interface PlayerState {
  money: number;
  needs: Needs;
  attributes: Attributes;
  skills: Skills;
  inventory: Inventory;
}

export interface Location {
  id: LocationId;
  name: string;
  description: string;
}

export interface TimeState {
  day: number;
  hour: number;
  minute: number;
  totalMinutes: number;
}

export interface LogEntry {
  id: string;
  message: string;
  type: LogType;
  timestamp: number;
}

export interface GameState {
  version: number;
  player: PlayerState;
  location: Location;
  time: TimeState;
  log: LogEntry[];
}
