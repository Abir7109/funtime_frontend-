"use client";

import { useEffect } from "react";
import { Ludo } from "@/lib/ludojs/Ludo";

export default function LudoJsBoard() {
  useEffect(() => {
    new Ludo();
    return () => {
      // ludo-js does not expose a cleanup API; event listeners are fine for this demo.
    };
  }, []);

  return (
    <div className="ludo-js-root flex justify-center">
      <div className="ludo-container">
          <div className="ludo">
          <div className="player-pieces">
            <div className="player-piece" data-player-id="P1" data-piece="0" />
            <div className="player-piece" data-player-id="P1" data-piece="1" />
            <div className="player-piece" data-player-id="P1" data-piece="2" />
            <div className="player-piece" data-player-id="P1" data-piece="3" />

            <div className="player-piece" data-player-id="P2" data-piece="0" />
            <div className="player-piece" data-player-id="P2" data-piece="1" />
            <div className="player-piece" data-player-id="P2" data-piece="2" />
            <div className="player-piece" data-player-id="P2" data-piece="3" />
          </div>

          <div className="player-bases">
            <div className="player-base" data-player-id="P1" />
            <div className="player-base" data-player-id="P2" />
          </div>
        </div>
        <div className="footer">
          <div className="row">
            <button id="dice-btn" className="btn btn-dice">
              <span>Roll</span>
            </button>
            <div className="dice-value">
              <div className="dice" />
              <span className="dice-number" />
            </div>
            <button id="reset-btn" className="btn btn-reset">
              Reset
            </button>
          </div>
          <h2 className="active-player">
            Active Player: <span />
          </h2>
        </div>
      </div>
    </div>
  );
}
