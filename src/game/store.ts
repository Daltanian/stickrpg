import type {
  ActivityId,
  GameState,
  Location,
  LocationId,
  LogEntry,
  LogType,
  PlayerState,
  TimeState,
} from "./types";

const STORAGE_KEY = "stickrpg:save";
const STATE_VERSION = 1;

const LOCATIONS: Record<LocationId, Location> = {
  home: {
    id: "home",
    name: "Tiny Apartment",
    description: "Rest, recover, and plan your next grind.",
  },
  downtown: {
    id: "downtown",
    name: "Downtown",
    description: "Jobs, shops, and the hustle of city life.",
  },
  gym: {
    id: "gym",
    name: "Gym",
    description: "Push your limits to build strength and stamina.",
  },
  park: {
    id: "park",
    name: "City Park",
    description: "Low-pressure exploration and casual encounters.",
  },
  work: {
    id: "work",
    name: "Worksite",
    description: "Clock in and trade time for cash.",
  },
};

const ACTIVITIES: Record<
  ActivityId,
  {
    id: ActivityId;
    name: string;
    minutes: number;
    energyCost: number;
    moneyDelta: number;
    location: LocationId;
    attributeGain?: keyof PlayerState["attributes"];
    skillGain?: keyof PlayerState["skills"];
  }
> = {
  rest: {
    id: "rest",
    name: "Rest",
    minutes: 60,
    energyCost: -20,
    moneyDelta: 0,
    location: "home",
  },
  work: {
    id: "work",
    name: "Work Shift",
    minutes: 120,
    energyCost: 20,
    moneyDelta: 45,
    location: "work",
    skillGain: "labor",
  },
  train: {
    id: "train",
    name: "Training",
    minutes: 90,
    energyCost: 18,
    moneyDelta: -10,
    location: "gym",
    attributeGain: "strength",
    skillGain: "fitness",
  },
  explore: {
    id: "explore",
    name: "Explore",
    minutes: 45,
    energyCost: 10,
    moneyDelta: 0,
    location: "downtown",
    skillGain: "hustle",
  },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const createTimeState = (totalMinutes: number): TimeState => {
  const minutesPerDay = 24 * 60;
  const day = Math.floor(totalMinutes / minutesPerDay) + 1;
  const remaining = totalMinutes % minutesPerDay;
  const hour = Math.floor(remaining / 60);
  const minute = remaining % 60;

  return { day, hour, minute, totalMinutes };
};

const createPlayerState = (): PlayerState => ({
  money: 25,
  needs: {
    energy: 80,
    hunger: 20,
    morale: 50,
  },
  attributes: {
    strength: 5,
    agility: 5,
    charisma: 5,
    intelligence: 5,
  },
  skills: {
    labor: 1,
    fitness: 1,
    hustle: 1,
  },
  inventory: {
    capacity: 12,
    items: [],
  },
});

const createGameState = (): GameState => ({
  version: STATE_VERSION,
  player: createPlayerState(),
  location: LOCATIONS.home,
  time: createTimeState(8 * 60),
  log: [],
});

const createLogEntry = (message: string, type: LogType): LogEntry => ({
  id: crypto.randomUUID(),
  message,
  type,
  timestamp: Date.now(),
});

let state: GameState = createGameState();

export const getState = (): GameState => state;

export const startNewGame = (): GameState => {
  state = createGameState();
  addLog("A new grind begins.", "info");
  saveGame();
  return state;
};

export const loadGame = (): GameState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return startNewGame();
  }

  try {
    const parsed = JSON.parse(stored) as GameState;
    if (!parsed || parsed.version !== STATE_VERSION) {
      return startNewGame();
    }
    state = parsed;
    return state;
  } catch (error) {
    console.warn("Failed to load save data.", error);
    return startNewGame();
  }
};

export const saveGame = (): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const advanceTime = (minutes: number): GameState => {
  const totalMinutes = Math.max(0, state.time.totalMinutes + minutes);
  state = {
    ...state,
    time: createTimeState(totalMinutes),
  };
  saveGame();
  return state;
};

export const performActivity = (activityId: ActivityId): GameState => {
  const activity = ACTIVITIES[activityId];
  if (!activity) {
    addLog(`Unknown activity: ${activityId}`, "warning");
    return state;
  }

  const nextEnergy = clamp(
    state.player.needs.energy - activity.energyCost,
    0,
    100
  );
  const nextHunger = clamp(state.player.needs.hunger + 8, 0, 100);
  const nextMorale = clamp(state.player.needs.morale + 2, 0, 100);

  const updatedAttributes = { ...state.player.attributes };
  if (activity.attributeGain) {
    updatedAttributes[activity.attributeGain] += 1;
  }

  const updatedSkills = { ...state.player.skills };
  if (activity.skillGain) {
    updatedSkills[activity.skillGain] += 1;
  }

  state = {
    ...state,
    location: LOCATIONS[activity.location],
    player: {
      ...state.player,
      money: Math.max(0, state.player.money + activity.moneyDelta),
      needs: {
        energy: nextEnergy,
        hunger: nextHunger,
        morale: nextMorale,
      },
      attributes: updatedAttributes,
      skills: updatedSkills,
    },
  };

  advanceTime(activity.minutes);
  addLog(`${activity.name} completed.`, "event");
  saveGame();
  return state;
};

export const addLog = (message: string, type: LogType): void => {
  const entry = createLogEntry(message, type);
  state = {
    ...state,
    log: [...state.log, entry].slice(-100),
  };
};
