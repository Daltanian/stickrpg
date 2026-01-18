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

const LOCATIONS: Location[] = [
  {
    id: "home",
    name: "Home",
    description: "A cramped apartment for rest, hygiene, and meals.",
  },
  {
    id: "school",
    name: "School",
    description: "Classes and study rooms for building knowledge.",
  },
  {
    id: "job-district",
    name: "Job District",
    description: "A busy district packed with shifts and paychecks.",
  },
];

const LOCATION_LOOKUP = Object.fromEntries(
  LOCATIONS.map((location) => [location.id, location])
) as Record<LocationId, Location>;

type ActivityDefinition = {
  id: ActivityId;
  name: string;
  minutes: number;
  locationId: LocationId;
  moneyDelta?: number;
  needsDelta?: Partial<GameState["player"]["needs"]>;
  attributeDelta?: Partial<PlayerState["attributes"]>;
  skillDelta?: Partial<PlayerState["skills"]>;
  requirements?: {
    minAttributes?: Partial<PlayerState["attributes"]>;
    minSkills?: Partial<PlayerState["skills"]>;
  };
};

const ACTIVITIES: ActivityDefinition[] = [
  {
    id: "sleep",
    name: "Sleep",
    minutes: 8 * 60,
    locationId: "home",
    needsDelta: { energy: 40, stress: -10, hunger: -5 },
  },
  {
    id: "shower",
    name: "Shower",
    minutes: 30,
    locationId: "home",
    needsDelta: { hygiene: 35 },
  },
  {
    id: "cook-meal",
    name: "Cook Meal",
    minutes: 45,
    locationId: "home",
    moneyDelta: -8,
    needsDelta: { hunger: 35 },
  },
  {
    id: "attend-class",
    name: "Attend Class",
    minutes: 2 * 60,
    locationId: "school",
    needsDelta: { stress: 5, energy: -10 },
    attributeDelta: { intelligence: 1 },
    skillDelta: { office: 2 },
  },
  {
    id: "study",
    name: "Study",
    minutes: 60,
    locationId: "school",
    needsDelta: { stress: 3, energy: -5 },
    attributeDelta: { intelligence: 1 },
  },
  {
    id: "work-dishwasher",
    name: "Work Dishwasher",
    minutes: 4 * 60,
    locationId: "job-district",
    moneyDelta: 40,
    needsDelta: { stress: 5, energy: -15, hunger: -8 },
    skillDelta: { fitness: 1 },
  },
  {
    id: "work-retail",
    name: "Work Retail",
    minutes: 4 * 60,
    locationId: "job-district",
    moneyDelta: 55,
    needsDelta: { stress: 6, energy: -15, hunger: -8 },
    attributeDelta: { charisma: 1 },
  },
  {
    id: "work-intern",
    name: "Work Intern",
    minutes: 4 * 60,
    locationId: "job-district",
    moneyDelta: 70,
    needsDelta: { stress: 7 },
    skillDelta: { office: 2 },
    requirements: {
      minAttributes: { intelligence: 5 },
    },
  },
];

const ACTIVITY_LOOKUP = Object.fromEntries(
  ACTIVITIES.map((activity) => [activity.id, activity])
) as Record<ActivityId, ActivityDefinition>;
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
    hunger: 60,
    hygiene: 70,
    stress: 15,
    health: 90,
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
    office: 0,
  },
  inventory: {
    capacity: 12,
    items: [],
  },
});

const createGameState = (): GameState => ({
  version: STATE_VERSION,
  player: createPlayerState(),
  location: LOCATION_LOOKUP.home,
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

const calculateNeedsAfterMinutes = (
  needs: GameState["player"]["needs"],
  minutes: number
): {
  needs: GameState["player"]["needs"];
  crossed: Array<keyof GameState["player"]["needs"]>;
} => {
  const ticks = Math.floor(minutes / 60);
  if (ticks <= 0) {
    return { needs, crossed: [] };
  }

  const criticalBefore = getCriticalNeeds(needs);

  let nextNeeds = { ...needs };
  for (let index = 0; index < ticks; index += 1) {
    nextNeeds = {
      ...nextNeeds,
      hunger: nextNeeds.hunger - 2,
      energy: nextNeeds.energy - 3,
      hygiene: nextNeeds.hygiene - 1,
      stress: nextNeeds.stress + 2,
    };

    if (
      nextNeeds.hunger < 20 ||
      nextNeeds.energy < 15 ||
      nextNeeds.hygiene < 15 ||
      nextNeeds.stress > 85
    ) {
      nextNeeds = {
        ...nextNeeds,
        health: nextNeeds.health - 1,
      };
    }

    nextNeeds = clampNeeds(nextNeeds);
  }

  const criticalAfter = getCriticalNeeds(nextNeeds);
  const crossed = criticalAfter.filter((need) => !criticalBefore.includes(need));

  return { needs: nextNeeds, crossed };
};

const clampNeeds = (
  needs: GameState["player"]["needs"]
): GameState["player"]["needs"] => ({
  energy: clamp(needs.energy, 0, 100),
  hunger: clamp(needs.hunger, 0, 100),
  hygiene: clamp(needs.hygiene, 0, 100),
  stress: clamp(needs.stress, 0, 100),
  health: clamp(needs.health, 0, 100),
});

const applyNeedDeltas = (
  needs: GameState["player"]["needs"],
  deltas?: Partial<GameState["player"]["needs"]>
): GameState["player"]["needs"] => {
  if (!deltas) {
    return needs;
  }

  return clampNeeds({
    energy: needs.energy + (deltas.energy ?? 0),
    hunger: needs.hunger + (deltas.hunger ?? 0),
    hygiene: needs.hygiene + (deltas.hygiene ?? 0),
    stress: needs.stress + (deltas.stress ?? 0),
    health: needs.health + (deltas.health ?? 0),
  });
};

const hasRequirement = (
  current: Record<string, number>,
  required: Record<string, number> | undefined
): string[] => {
  if (!required) {
    return [];
  }

  return Object.entries(required)
    .filter(([key, value]) => current[key] < value)
    .map(([key, value]) => `${key} ${value}`);
};

const checkActivityRequirements = (
  activity: ActivityDefinition
): string[] => {
  const unmetAttributes = hasRequirement(
    state.player.attributes,
    activity.requirements?.minAttributes
  );
  const unmetSkills = hasRequirement(
    state.player.skills,
    activity.requirements?.minSkills
  );

  return [...unmetAttributes, ...unmetSkills];
};

const getCriticalNeeds = (
  needs: GameState["player"]["needs"]
): Array<keyof GameState["player"]["needs"]> => {
  const critical: Array<keyof GameState["player"]["needs"]> = [];
  if (needs.hunger < 20) {
    critical.push("hunger");
  }
  if (needs.energy < 15) {
    critical.push("energy");
  }
  if (needs.hygiene < 15) {
    critical.push("hygiene");
  }
  if (needs.stress > 85) {
    critical.push("stress");
  }
  return critical;
};

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
  const previousDay = state.time.day;
  const totalMinutes = Math.max(0, state.time.totalMinutes + minutes);
  const { needs: nextNeeds, crossed } = calculateNeedsAfterMinutes(
    state.player.needs,
    minutes
  );
  state = {
    ...state,
    time: createTimeState(totalMinutes),
    player: {
      ...state.player,
      needs: nextNeeds,
    },
  };
  crossed.forEach((need) => {
    addLog(`Critical ${need} threshold reached.`, "warning");
  });
  if (state.time.day > previousDay) {
    addLog(`Day ${state.time.day} begins.`, "info");
  }
  const totalMinutes = Math.max(0, state.time.totalMinutes + minutes);
  state = {
    ...state,
    time: createTimeState(totalMinutes),
  };
  saveGame();
  return state;
};

export const performActivity = (activityId: ActivityId): GameState => {
  const activity = ACTIVITY_LOOKUP[activityId];
  const activity = ACTIVITIES[activityId];
  if (!activity) {
    addLog(`Unknown activity: ${activityId}`, "warning");
    return state;
  }

  const unmetRequirements = checkActivityRequirements(activity);
  if (unmetRequirements.length > 0) {
    addLog(
      `Requirements not met for ${activity.name}: ${unmetRequirements.join(
        ", "
      )}.`,
      "warning"
    );
    return state;
  }

  const updatedAttributes = { ...state.player.attributes };
  if (activity.attributeDelta) {
    Object.entries(activity.attributeDelta).forEach(([key, value]) => {
      updatedAttributes[key as keyof PlayerState["attributes"]] += value ?? 0;
    });
  }

  const updatedSkills = { ...state.player.skills };
  if (activity.skillDelta) {
    Object.entries(activity.skillDelta).forEach(([key, value]) => {
      updatedSkills[key as keyof PlayerState["skills"]] += value ?? 0;
    });
  }

  const nextNeeds = applyNeedDeltas(state.player.needs, activity.needsDelta);

  state = {
    ...state,
    location: LOCATION_LOOKUP[activity.locationId],
    player: {
      ...state.player,
      money: Math.max(0, state.player.money + (activity.moneyDelta ?? 0)),
      needs: nextNeeds,
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

export const runTimeSystemChecks = (): string[] => {
  const failures: string[] = [];
  const baseline: GameState["player"]["needs"] = {
    energy: 50,
    hunger: 50,
    hygiene: 50,
    stress: 50,
    health: 50,
  };

  const afterHour = calculateNeedsAfterMinutes(baseline, 60).needs;
  if (afterHour.hunger !== 48) {
    failures.push("Expected hunger to drop by 2 per hour.");
  }
  if (afterHour.energy !== 47) {
    failures.push("Expected energy to drop by 3 per hour.");
  }
  if (afterHour.hygiene !== 49) {
    failures.push("Expected hygiene to drop by 1 per hour.");
  }
  if (afterHour.stress !== 52) {
    failures.push("Expected stress to increase by 2 per hour.");
  }

  const criticalNeeds: GameState["player"]["needs"] = {
    energy: 10,
    hunger: 10,
    hygiene: 10,
    stress: 90,
    health: 50,
  };
  const afterCritical = calculateNeedsAfterMinutes(criticalNeeds, 60).needs;
  if (afterCritical.health !== 49) {
    failures.push("Expected health to drop when critical thresholds are met.");
  }

  return failures;
};
