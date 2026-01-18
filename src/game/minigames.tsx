import { useMemo, useState } from "react";

import {
  calculateBlackjackTotal,
  drawBlackjackCard,
  getState,
  resolveBlackjackHand,
  resolveBoxingMatch,
} from "./store";
import type { BlackjackResult, BoxingMatchResult } from "./types";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const formatPercent = (value: number): string =>
  `${Math.round(value * 100)}%`;

export const BoxingMatchModal = ({ isOpen, onClose }: ModalProps) => {
  const [result, setResult] = useState<BoxingMatchResult | null>(null);

  if (!isOpen) {
    return null;
  }

  return (
    <div aria-modal="true" className="modal" role="dialog">
      <div className="modal-card">
        <h2>Boxing Match</h2>
        <p>Step into the ring and test your strength.</p>
        {result ? (
          <div className="result">
            <p>
              Outcome: {result.result} (win chance {formatPercent(result.winChance)})
            </p>
            <p>
              Power: {result.playerPower} vs {result.opponentPower}
            </p>
            <p>
              Rewards: ${result.reward.money}, {result.reward.reputation} rep, +
              {result.reward.combatXp} combat XP
            </p>
            {result.injury && <p>Injury: Recovery slowed for 1 day.</p>}
          </div>
        ) : (
          <button type="button" onClick={() => setResult(resolveBoxingMatch())}>
            Fight
          </button>
        )}
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

const renderHand = (hand: number[]) => hand.join(" + ");

export const BlackjackModal = ({ isOpen, onClose }: ModalProps) => {
  const [bet, setBet] = useState(10);
  const [playerHand, setPlayerHand] = useState<number[]>([]);
  const [result, setResult] = useState<BlackjackResult | null>(null);
  const [phase, setPhase] = useState<"idle" | "player" | "resolved">("idle");

  const playerTotal = useMemo(
    () => calculateBlackjackTotal(playerHand),
    [playerHand]
  );
  const maxBet = getState().player.money;
  const canDeal = phase === "idle" || phase === "resolved";
  const canHit = phase === "player" && playerTotal < 21;

  const startDeal = () => {
    setPlayerHand([drawBlackjackCard(), drawBlackjackCard()]);
    setResult(null);
    setPhase("player");
  };

  const settleHand = (hand: number[]) => {
    const outcome = resolveBlackjackHand(bet, hand);
    setResult(outcome);
    setPhase("resolved");
  };

  const onHit = () => {
    const nextHand = [...playerHand, drawBlackjackCard()];
    setPlayerHand(nextHand);
    if (calculateBlackjackTotal(nextHand) > 21) {
      settleHand(nextHand);
    }
  };

  const onStand = () => {
    settleHand(playerHand);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div aria-modal="true" className="modal" role="dialog">
      <div className="modal-card">
        <h2>Blackjack-lite</h2>
        <p>Draw cards up to 21. Dealer draws to 17.</p>
        <label htmlFor="blackjack-bet">
          Bet (cash: ${maxBet})
          <input
            id="blackjack-bet"
            type="number"
            min={1}
            max={maxBet}
            value={bet}
            onChange={(event) => setBet(Number(event.target.value))}
            disabled={!canDeal}
          />
        </label>
        <div className="hand">
          <p>Player: {renderHand(playerHand)} (total {playerTotal})</p>
          {result && (
            <p>
              Dealer: {renderHand(result.dealerHand)} (total {result.dealerTotal})
            </p>
          )}
        </div>
        {result && (
          <div className="result">
            <p>
              Outcome: {result.result} (payout {result.payout})
            </p>
          </div>
        )}
        <div className="actions">
          <button type="button" onClick={startDeal} disabled={!canDeal}>
            Deal
          </button>
          <button type="button" onClick={onHit} disabled={!canHit}>
            Hit
          </button>
          <button type="button" onClick={onStand} disabled={phase !== "player"}>
            Stand
          </button>
        </div>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
