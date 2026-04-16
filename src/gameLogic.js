export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const TICK_MS = 160;

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function createInitialState(size = GRID_SIZE, rng = Math.random) {
  const center = Math.floor(size / 2);
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];

  return {
    size,
    snake,
    direction: INITIAL_DIRECTION,
    pendingDirection: INITIAL_DIRECTION,
    food: placeFood(snake, size, rng),
    score: 0,
    gameOver: false,
    paused: false,
  };
}

export function queueDirection(state, nextDirection) {
  if (!DIRECTION_VECTORS[nextDirection]) {
    return state;
  }

  if (state.snake.length > 1 && OPPOSITES[state.direction] === nextDirection) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection,
  };
}

export function togglePause(state) {
  if (state.gameOver) {
    return state;
  }

  return {
    ...state,
    paused: !state.paused,
  };
}

export function stepGame(state, rng = Math.random) {
  if (state.gameOver || state.paused) {
    return state;
  }

  const direction = state.pendingDirection;
  const vector = DIRECTION_VECTORS[direction];
  const nextHead = {
    x: state.snake[0].x + vector.x,
    y: state.snake[0].y + vector.y,
  };

  if (hitsWall(nextHead, state.size)) {
    return {
      ...state,
      direction,
      gameOver: true,
    };
  }

  const willEat = positionsMatch(nextHead, state.food);
  const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);

  if (bodyToCheck.some((segment) => positionsMatch(segment, nextHead))) {
    return {
      ...state,
      direction,
      gameOver: true,
    };
  }

  const snake = [nextHead, ...state.snake];

  if (!willEat) {
    snake.pop();
  }

  return {
    ...state,
    snake,
    direction,
    pendingDirection: direction,
    food: willEat ? placeFood(snake, state.size, rng) : state.food,
    score: willEat ? state.score + 1 : state.score,
  };
}

export function placeFood(snake, size, rng = Math.random) {
  const occupied = new Set(snake.map((segment) => toKey(segment)));
  const available = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const cell = { x, y };
      if (!occupied.has(toKey(cell))) {
        available.push(cell);
      }
    }
  }

  if (available.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * available.length);
  return available[index];
}

export function positionsMatch(a, b) {
  return Boolean(a && b) && a.x === b.x && a.y === b.y;
}

export function toKey(position) {
  return `${position.x},${position.y}`;
}

function hitsWall(position, size) {
  return position.x < 0 || position.y < 0 || position.x >= size || position.y >= size;
}
