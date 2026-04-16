import {
  TICK_MS,
  createInitialState,
  queueDirection,
  stepGame,
  toKey,
  togglePause,
} from "./gameLogic.js";

const boardElement = document.querySelector("#board");
const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#status");
const restartButton = document.querySelector("#restart-button");
const pauseButton = document.querySelector("#pause-button");
const controlButtons = document.querySelectorAll(".control-button");

let state = createInitialState();

function renderBoard() {
  boardElement.style.setProperty("--grid-size", String(state.size));
  const snakeCells = new Set(state.snake.map((segment) => toKey(segment)));
  const headKey = toKey(state.snake[0]);
  const foodKey = state.food ? toKey(state.food) : "";

  boardElement.replaceChildren(
    ...Array.from({ length: state.size * state.size }, (_, index) => {
      const x = index % state.size;
      const y = Math.floor(index / state.size);
      const key = `${x},${y}`;
      const cell = document.createElement("div");
      cell.className = "cell";

      if (snakeCells.has(key)) {
        cell.classList.add("cell--snake");
      }

      if (key === headKey) {
        cell.classList.add("cell--head");
      }

      if (key === foodKey) {
        cell.classList.add("cell--food");
      }

      return cell;
    }),
  );
}

function renderStatus() {
  scoreElement.textContent = String(state.score);
  pauseButton.textContent = state.paused ? "Resume" : "Pause";

  if (state.gameOver) {
    statusElement.textContent = "Game over. Press restart to play again.";
    return;
  }

  if (state.paused) {
    statusElement.textContent = "Paused. Press space or resume when you're ready.";
    return;
  }

  statusElement.textContent = "Use arrow keys or WASD to guide the snake.";
}

function render() {
  renderBoard();
  renderStatus();
}

function restartGame() {
  state = createInitialState();
  render();
}

function updateGame() {
  const nextState = stepGame(state);
  if (nextState !== state) {
    state = nextState;
    render();
  }
}

function setDirection(direction) {
  state = queueDirection(state, direction);
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const directionByKey = {
    arrowup: "up",
    w: "up",
    arrowdown: "down",
    s: "down",
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right",
  };

  if (key === " ") {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  const direction = directionByKey[key];
  if (!direction) {
    return;
  }

  event.preventDefault();
  setDirection(direction);
});

restartButton.addEventListener("click", restartGame);
pauseButton.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDirection(button.dataset.direction);
  });
});

render();
window.setInterval(updateGame, TICK_MS);
