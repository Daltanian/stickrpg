export type LocationId = "home" | "downtown" | "gym" | "park" | "work";

export type ActivityId = "rest" | "work" | "train" | "explore";

export type LogType = "info" | "event" | "warning" | "reward";

export interface Needs {
  energy: number;
  hunger: number;
  morale: number;
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
