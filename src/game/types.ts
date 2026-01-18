export type LocationId = "home" | "school" | "job-district" | "bar";

export type ActivityId =
  | "sleep"
  | "shower"
  | "cook-meal"
  | "attend-class"
  | "study"
  | "work-dishwasher"
  | "work-retail"
  | "work-intern"
  | "boxing-match"
  | "blackjack";

export type LogType = "info" | "event" | "warning" | "reward";

export interface Needs {
  energy: number;
  hunger: number;
  hygiene: number;
  stress: number;
  health: number;
  morale: number;
}

export interface Attributes {
  strength: number;
  agility: number;
  charisma: number;
  intelligence: number;
  luck: number;
}

export interface Skills {
  labor: number;
  fitness: number;
  hustle: number;
  office: number;
  combat: number;
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

export interface StatusEffects {
  injuryUntilDay?: number;
}

export interface PlayerState {
  money: number;
  reputation: number;
  needs: Needs;
  attributes: Attributes;
  skills: Skills;
  inventory: Inventory;
  statusEffects: StatusEffects;
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

export interface BoxingMatchResult {
  result: "win" | "loss";
  winChance: number;
  playerPower: number;
  opponentPower: number;
  reward: {
    money: number;
    reputation: number;
    combatXp: number;
  };
  injury: boolean;
}

export interface BlackjackResult {
  result: "win" | "loss" | "push";
  bet: number;
  playerTotal: number;
  dealerTotal: number;
  payout: number;
  dealerHand: number[];
}
