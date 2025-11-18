import lottie from 'lottie-web';
import { COORDINATES_MAP, PLAYERS, STEP_LENGTH } from './constants.js';

const DICE_ROLL_DURATION_MS = 1500;

function getDiceButtonElement() {
  return document.querySelector('#dice-btn');
}

function getPlayerPiecesElements() {
  return {
    P1: document.querySelectorAll('[data-player-id="P1"].player-piece'),
    P2: document.querySelectorAll('[data-player-id="P2"].player-piece'),
  };
}

function getDiceElement() {
  const container = document.querySelector('.dice-value');
  if (!container) return null;
  return container.querySelector('.dice');
}

let diceAnimation = null;
let isRolling = false;
let lastDiceValue = null;
let diceTimeoutId = null;

function renderDiceNumber(value) {
  const numEl = document.querySelector('.dice-number');
  if (!numEl) return;
  numEl.textContent = value == null ? '' : String(value);
}

function ensureDiceAnimation() {
  const diceEl = getDiceElement();
  if (!diceEl) return null;
  if (diceAnimation) return diceAnimation;

  diceAnimation = lottie.loadAnimation({
    container: diceEl,
    renderer: 'svg',
    loop: true,
    autoplay: false,
    path: '/dice-animation.json',
  });

  return diceAnimation;
}

function startDiceAnimation() {
  const anim = ensureDiceAnimation();
  if (!anim) return;

  // Reset any previous timer / spin state
  if (diceTimeoutId != null) {
    clearTimeout(diceTimeoutId);
    diceTimeoutId = null;
  }

  isRolling = true;
  renderDiceNumber(null);

  anim.stop();
  anim.play();

  // After the configured duration, stop the animation and show the last rolled value
  diceTimeoutId = setTimeout(() => {
    diceTimeoutId = null;
    anim.stop();
    isRolling = false;
    if (lastDiceValue != null) {
      renderDiceNumber(lastDiceValue);
    }
  }, DICE_ROLL_DURATION_MS);
}

export class UI {
  static listenDiceClick(callback) {
    const diceButtonElement = getDiceButtonElement();
    if (!diceButtonElement) {
      console.error('dice button element not found');
      return;
    }
    diceButtonElement.addEventListener('click', () => {
      // Start visual dice spin immediately, but delay game logic
      // (dice value + highlighting) until spin is done so it feels natural.
      startDiceAnimation();

      // Also defensively disable the dice button until the roll resolves.
      diceButtonElement.setAttribute('disabled', '');

      setTimeout(() => {
        callback();
        // Re-enable will be handled by game state when it returns to DICE_NOT_ROLLED.
      }, DICE_ROLL_DURATION_MS);
    });
  }

  static listenResetClick(callback) {
    const resetBtn = document.querySelector('button#reset-btn');
    if (!resetBtn) {
      console.error('reset button element not found');
      return;
    }
    resetBtn.addEventListener('click', callback);
  }

  static listenPieceClick(callback) {
    const container = document.querySelector('.player-pieces');
    if (!container) {
      console.error('player-pieces container not found');
      return;
    }
    container.addEventListener('click', callback);
  }

  /**
   * @param {string} player
   * @param {Number} piece
   * @param {Number} newPosition
   */
  static setPiecePosition(player, piece, newPosition) {
    const playerPiecesElements = getPlayerPiecesElements();

    if (!playerPiecesElements[player] || !playerPiecesElements[player][piece]) {
      console.error(`Player element of given player: ${player} and piece: ${piece} not found`);
      return;
    }

    const [x, y] = COORDINATES_MAP[newPosition];

    const pieceElement = playerPiecesElements[player][piece];

    // Add a short "hop" animation class while the piece moves.
    pieceElement.classList.add('moving');

    pieceElement.style.top = y * STEP_LENGTH + '%';
    pieceElement.style.left = x * STEP_LENGTH + '%';

    // Remove the moving class after the CSS transition finishes.
    setTimeout(() => {
      pieceElement.classList.remove('moving');
    }, 220);
  }

  static setTurn(index) {
    if (index < 0 || index >= PLAYERS.length) {
      console.error('index out of bound!');
      return;
    }

    const player = PLAYERS[index];

    const playerSpan = document.querySelector('.active-player span');
    if (playerSpan) {
      playerSpan.innerText = player;
    }

    const activePlayerBase = document.querySelector('.player-base.highlight');
    if (activePlayerBase) {
      activePlayerBase.classList.remove('highlight');
    }

    const base = document.querySelector(`[data-player-id="${player}"].player-base`);
    if (base) {
      base.classList.add('highlight');
    }
  }

  static enableDice() {
    const diceButtonElement = getDiceButtonElement();
    if (!diceButtonElement) return;
    diceButtonElement.removeAttribute('disabled');
  }

  static disableDice() {
    const diceButtonElement = getDiceButtonElement();
    if (!diceButtonElement) return;
    diceButtonElement.setAttribute('disabled', '');
  }

  /**
   * @param {string} player
   * @param {Number[]} pieces
   */
  static highlightPieces(player, pieces) {
    const playerPiecesElements = getPlayerPiecesElements();

    pieces.forEach((piece) => {
      const pieceElement = playerPiecesElements[player][piece];
      if (pieceElement) {
        pieceElement.classList.add('highlight');
      }
    });
  }

  static unhighlightPieces() {
    document.querySelectorAll('.player-piece.highlight').forEach((ele) => {
      ele.classList.remove('highlight');
    });
  }

  static setDiceValue(value) {
    // Store the rolled value; the timer in startDiceAnimation will
    // stop the spin after 1.5s and then show this number beside the dice.
    lastDiceValue = value;

    // If, for some reason, we're not spinning, show immediately.
    if (!isRolling) {
      renderDiceNumber(value);
    }
  }
}
