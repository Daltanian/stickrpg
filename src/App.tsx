import { useMemo, useState } from "react";
import type { ActivityId, GameState, LocationId } from "./game/types";
import {
  getActivitiesForLocation,
  getLocations,
  getState,
  loadGame,
  performActivity,
  saveGame,
  startNewGame,
} from "./game/store";

const formatTime = (state: GameState["time"]) => {
  const hours = state.hour.toString().padStart(2, "0");
  const minutes = state.minute.toString().padStart(2, "0");
  return `Day ${state.day} • ${hours}:${minutes}`;
};

const NEED_LABELS: Array<{
  key: keyof GameState["player"]["needs"];
  label: string;
}> = [
  { key: "energy", label: "Energy" },
  { key: "hunger", label: "Hunger" },
  { key: "hygiene", label: "Hygiene" },
  { key: "stress", label: "Stress" },
  { key: "health", label: "Health" },
  { key: "morale", label: "Morale" },
];

const clampPercent = (value: number) => Math.min(Math.max(value, 0), 100);

const App = () => {
  const [gameState, setGameState] = useState<GameState>(() => getState());
  const [selectedLocation, setSelectedLocation] = useState<LocationId>(
    gameState.location.id
  );

  const locations = useMemo(() => getLocations(), []);
  const activities = useMemo(
    () => getActivitiesForLocation(selectedLocation),
    [selectedLocation]
  );

  const handleActivity = (activityId: ActivityId) => {
    const nextState = performActivity(activityId);
    setGameState(nextState);
    setSelectedLocation(nextState.location.id);
  };

  const handleLoad = () => {
    const nextState = loadGame();
    setGameState(nextState);
    setSelectedLocation(nextState.location.id);
  };

  const handleNewGame = () => {
    const nextState = startNewGame();
    setGameState(nextState);
    setSelectedLocation(nextState.location.id);
  };

  const handleSave = () => {
    saveGame();
    setGameState(getState());
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>StickRPG</h1>
        <div className="app__controls">
          <button type="button" onClick={handleSave}>
            Save
          </button>
          <button type="button" onClick={handleLoad}>
            Load
          </button>
          <button type="button" onClick={handleNewGame}>
            New Game
          </button>
        </div>
      </header>

      <main className="app__layout">
        <section className="panel">
          <h2>Player</h2>
          <div className="stat-row">
            <span>Money</span>
            <strong>${gameState.player.money}</strong>
          </div>
          <div className="stat-row">
            <span>Location</span>
            <strong>{gameState.location.name}</strong>
          </div>
          <div className="stat-row">
            <span>Time</span>
            <strong>{formatTime(gameState.time)}</strong>
          </div>

          <h3>Needs</h3>
          <div className="needs">
            {NEED_LABELS.map((need) => {
              const value = clampPercent(gameState.player.needs[need.key]);
              return (
                <div className="need" key={need.key}>
                  <div className="need__label">
                    <span>{need.label}</span>
                    <span>{value}</span>
                  </div>
                  <div className="need__bar">
                    <div
                      className="need__fill"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel panel--middle">
          <h2>Locations</h2>
          <select
            value={selectedLocation}
            onChange={(event) =>
              setSelectedLocation(event.target.value as LocationId)
            }
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <p className="location-description">
            {
              locations.find((location) => location.id === selectedLocation)
                ?.description
            }
          </p>

          <h3>Available Activities</h3>
          <div className="activity-list">
            {activities.map((activity) => (
              <button
                className="activity"
                type="button"
                key={activity.id}
                onClick={() => handleActivity(activity.id)}
              >
                <div>
                  <strong>{activity.name}</strong>
                  <span>{activity.minutes} min</span>
                </div>
              </button>
            ))}
            {activities.length === 0 && (
              <p>No activities available for this location.</p>
            )}
          </div>
        </section>

        <section className="panel panel--log">
          <h2>Log</h2>
          <div className="log">
            {gameState.log.length === 0 && (
              <p className="log__empty">No activity yet.</p>
            )}
            {gameState.log.map((entry) => (
              <div className={`log__entry log__entry--${entry.type}`} key={entry.id}>
                <span>{entry.message}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
