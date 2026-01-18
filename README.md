# StickRPG

A browser-based stick-figure life-sim where you grind stats, chase odd jobs, and min-max your way from broke to legend.

## Elevator pitch
StickRPG is a fast-paced, tongue-in-cheek life simulator inspired by classic grind RPGs. Manage energy, time, and money while pushing your stick-figure hero through jobs, training, and risky events to climb the city’s social and economic ladder.

## Core gameplay loop
1. Choose a time block (work, train, explore, rest).
2. Spend energy/time to earn money, stats, or items.
3. Trigger events that reward or punish your choices.
4. Upgrade gear, unlock new areas, and repeat with higher stakes.

## Current features (MVP targets)
- Time- and energy-based action system.
- Jobs with stat requirements and payouts.
- Training locations for stat growth.
- Random events with choices and outcomes.
- Simple inventory and item effects.
- Save/load via local storage.

## Tech stack
- Vite
- React
- TypeScript

## Run locally
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

## Folder structure
```
.
├── public/               # Static assets
├── src/
│   ├── data/             # Jobs, items, events, locations
│   ├── components/       # Reusable UI components
│   ├── features/         # Game systems (stats, time, inventory)
│   ├── pages/            # Screens/routes
│   ├── hooks/            # Shared React hooks
│   ├── styles/           # Global styles and themes
│   └── main.tsx          # App entry
└── README.md
```

## Design pillars
- **Grindy but meaningful:** Every action moves you forward.
- **Short sessions, long arcs:** Quick loops with persistent progression.
- **Readable systems:** Clear stats, costs, and outcomes.
- **Risk vs. reward:** Events push players to gamble for big gains.

## Roadmap
### MVP
- Core loop with jobs, training, events, and inventory.
- Basic UI for stats, time, and location selection.
- Local save/load.

### V1
- Expanded locations and job tiers.
- Equipment slots with set bonuses.
- Event chains and reputation system.

### V1.5
- Factions and branching story arcs.
- Daily challenges and leaderboards.
- Accessibility and UI polish.

## Contributing
Want to add content? Update the data files in `src/data/`:
- **Jobs:** Add entries with stat requirements, pay, and time cost.
- **Items:** Define effects and rarity for inventory drops.
- **Events:** Create choices with outcomes (stat changes, rewards, penalties).

Keep new content balanced and follow existing data schemas.
