import { CAMPAIGN_ROWS } from "./campaign-data";

export type Direction = "up" | "down" | "left" | "right";
export type Cell = { col: number; row: number };
export type Point = { x: number; y: number };
export type RunState = { gateOpen: boolean; brokenMask: number };
export type Mechanic = "one-way" | "portal" | "switch" | "fragile";

export type Chapter = {
  id: number;
  code: string;
  name: string;
  range: string;
  description: string;
  mechanics: string[];
  accent: string;
};

export type Level = {
  id: number;
  name: string;
  rows: string[];
  blocks: Set<string>;
  blockCells: Cell[];
  start: Cell;
  goal: Cell;
  par: number;
  solution: Direction[];
  chapter: number;
  mechanics: Mechanic[];
  oneWays: Map<string, Direction>;
  oneWayCells: Array<Cell & { direction: Direction }>;
  portals: Cell[];
  switches: Set<string>;
  switchCells: Cell[];
  gates: Set<string>;
  gateCells: Cell[];
  fragileCells: Cell[];
};

type SlideFeatures = number;

export type SlidePlan =
  | { outcome: "blocked" }
  | {
      outcome: "stop" | "goal" | "switch" | "break";
      destination: Cell;
      state: RunState;
      features: SlideFeatures;
      brokenIndex?: number;
    }
  | {
      outcome: "portal";
      entry: Cell;
      destination: Cell;
      state: RunState;
      features: SlideFeatures;
    }
  | {
      outcome: "death";
      edgeCell: Cell;
      direction: Direction;
      state: RunState;
      features: SlideFeatures;
    };

export const GRID_COLS = 23;
export const GRID_ROWS = 15;
export const CELL_SIZE = 36;
export const WORLD_WIDTH = GRID_COLS * CELL_SIZE;
export const WORLD_HEIGHT = GRID_ROWS * CELL_SIZE;
export const PLAYER_RATIO = 0.95;
export const PLAYER_SIZE = CELL_SIZE * PLAYER_RATIO;
export const INITIAL_RUN_STATE: RunState = { gateOpen: false, brokenMask: 0 };

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    code: "BASIC",
    name: "기본 궤도",
    range: "PAR 8–12",
    description: "벽에서 멈추는 감각과 위험한 경계를 익히는 구역",
    mechanics: ["벽돌", "위험 경계"],
    accent: "#74efc2",
  },
  {
    id: 2,
    code: "DETOUR",
    name: "우회 구역",
    range: "PAR 12–16",
    description: "정답처럼 보이는 샛길과 긴 우회 경로가 늘어나는 구역",
    mechanics: ["미끼 길", "다중 선택"],
    accent: "#ffd166",
  },
  {
    id: 3,
    code: "ONE-WAY",
    name: "화살표 구역",
    range: "PAR 16–20",
    description: "표시된 방향으로만 통과할 수 있는 일방통행 구역",
    mechanics: ["일방통행", "역방향 차단"],
    accent: "#5bd3ff",
  },
  {
    id: 4,
    code: "WARP",
    name: "워프 회로",
    range: "PAR 20–24",
    description: "보라색 워프 쌍과 일방통행을 함께 계산하는 구역",
    mechanics: ["워프", "일방통행"],
    accent: "#9b7bff",
  },
  {
    id: 5,
    code: "SWITCH",
    name: "스위치 요새",
    range: "PAR 24–28",
    description: "먼저 스위치를 밟아 잠긴 문을 열어야 하는 구역",
    mechanics: ["스위치", "잠금 문", "워프"],
    accent: "#ffb259",
  },
  {
    id: 6,
    code: "MASTER",
    name: "마스터 코어",
    range: "PAR 28–34",
    description: "금 간 블록을 부수고 모든 규칙을 엮어 푸는 최종 구역",
    mechanics: ["파괴 블록", "스위치", "워프", "일방통행"],
    accent: "#ff5d78",
  },
];

export const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

export const DIRECTION_VECTOR: Record<Direction, Cell> = {
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
};

const ARROW_DIRECTION: Record<string, Direction | undefined> = {
  "^": "up",
  v: "down",
  "<": "left",
  ">": "right",
};

const FEATURE = {
  oneWay: 1,
  portal: 2,
  switch: 4,
  gate: 8,
  break: 16,
  brokenPass: 32,
} as const;

type PlayableLevel = Pick<
  Level,
  | "blocks"
  | "goal"
  | "oneWays"
  | "portals"
  | "switches"
  | "gates"
  | "fragileCells"
>;

export function cellKey(cell: Cell) {
  return `${cell.col},${cell.row}`;
}

export function sameCell(a: Cell, b: Cell) {
  return a.col === b.col && a.row === b.row;
}

function stateKey(cell: Cell, state: RunState) {
  return `${cellKey(cell)}|${state.gateOpen ? 1 : 0}|${state.brokenMask}`;
}

export function cellCenter(cell: Cell): Point {
  return {
    x: cell.col * CELL_SIZE + CELL_SIZE / 2,
    y: cell.row * CELL_SIZE + CELL_SIZE / 2,
  };
}

function oneWayAllows(required: Direction, actual: Direction) {
  return required === actual;
}

function otherPortal(level: Pick<Level, "portals">, entry: Cell) {
  if (level.portals.length !== 2) return null;
  return sameCell(level.portals[0], entry) ? level.portals[1] : level.portals[0];
}

export function slide(
  level: PlayableLevel,
  from: Cell,
  direction: Direction,
  runState: RunState = INITIAL_RUN_STATE,
): SlidePlan {
  const vector = DIRECTION_VECTOR[direction];
  let current = { ...from };
  let moved = false;
  let features = 0;

  while (true) {
    const next = {
      col: current.col + vector.col,
      row: current.row + vector.row,
    };

    if (next.col < 0 || next.col >= GRID_COLS || next.row < 0 || next.row >= GRID_ROWS) {
      return {
        outcome: "death",
        edgeCell: current,
        direction,
        state: { ...runState },
        features,
      };
    }

    const nextKey = cellKey(next);
    if (level.blocks.has(nextKey) || (level.gates.has(nextKey) && !runState.gateOpen)) {
      return moved
        ? { outcome: "stop", destination: current, state: { ...runState }, features }
        : { outcome: "blocked" };
    }

    const fragileIndex = level.fragileCells.findIndex((cell) => sameCell(cell, next));
    if (fragileIndex >= 0 && (runState.brokenMask & (1 << fragileIndex)) === 0) {
      return {
        outcome: "break",
        destination: current,
        state: { ...runState, brokenMask: runState.brokenMask | (1 << fragileIndex) },
        features: features | FEATURE.break,
        brokenIndex: fragileIndex,
      };
    }

    const requiredDirection = level.oneWays.get(nextKey);
    if (requiredDirection && !oneWayAllows(requiredDirection, direction)) {
      return moved
        ? { outcome: "stop", destination: current, state: { ...runState }, features }
        : { outcome: "blocked" };
    }

    current = next;
    moved = true;
    if (requiredDirection) features |= FEATURE.oneWay;
    if (level.gates.has(nextKey) && runState.gateOpen) features |= FEATURE.gate;
    if (fragileIndex >= 0) features |= FEATURE.brokenPass;

    if (sameCell(current, level.goal)) {
      return {
        outcome: "goal",
        destination: current,
        state: { ...runState },
        features,
      };
    }

    if (level.switches.has(nextKey) && !runState.gateOpen) {
      return {
        outcome: "switch",
        destination: current,
        state: { ...runState, gateOpen: true },
        features: features | FEATURE.switch,
      };
    }

    const portalDestination = otherPortal(level, current);
    if (portalDestination && level.portals.some((portal) => sameCell(portal, current))) {
      return {
        outcome: "portal",
        entry: current,
        destination: { ...portalDestination },
        state: { ...runState },
        features: features | FEATURE.portal,
      };
    }
  }
}

export function boundaryTarget(edgeCell: Cell, direction: Direction): Point {
  const center = cellCenter(edgeCell);
  const half = PLAYER_SIZE / 2;
  if (direction === "left") return { x: half, y: center.y };
  if (direction === "right") return { x: WORLD_WIDTH - half, y: center.y };
  if (direction === "up") return { x: center.x, y: half };
  return { x: center.x, y: WORLD_HEIGHT - half };
}

function solveLevel(level: Pick<Level, keyof PlayableLevel | "start">) {
  type SearchNode = { cell: Cell; state: RunState; features: number };
  const startState = { ...INITIAL_RUN_STATE };
  const queue: SearchNode[] = [{ cell: { ...level.start }, state: startState, features: 0 }];
  const startKey = stateKey(level.start, startState);
  const visited = new Set([startKey]);
  const previous = new Map<string, { previousKey: string; direction: Direction }>();

  for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
    const current = queue[queueIndex];
    const currentKey = stateKey(current.cell, current.state);

    for (const direction of DIRECTIONS) {
      const plan = slide(level, current.cell, direction, current.state);
      if (plan.outcome === "goal") {
        const path: Direction[] = [direction];
        let cursorKey = currentKey;
        while (cursorKey !== startKey) {
          const step = previous.get(cursorKey);
          if (!step) return null;
          path.push(step.direction);
          cursorKey = step.previousKey;
        }
        return { path: path.reverse(), features: current.features | plan.features };
      }

      if (plan.outcome === "blocked" || plan.outcome === "death") continue;
      const nextKey = stateKey(plan.destination, plan.state);
      if (visited.has(nextKey)) continue;
      visited.add(nextKey);
      previous.set(nextKey, { previousKey: currentKey, direction });
      queue.push({
        cell: { ...plan.destination },
        state: { ...plan.state },
        features: current.features | plan.features,
      });
    }
  }

  return null;
}

function requiredFeatures(chapter: number) {
  if (chapter === 2) return FEATURE.oneWay;
  if (chapter === 3) return FEATURE.oneWay | FEATURE.portal;
  if (chapter === 4) return FEATURE.oneWay | FEATURE.portal | FEATURE.switch | FEATURE.gate;
  if (chapter === 5) {
    return (
      FEATURE.oneWay |
      FEATURE.portal |
      FEATURE.switch |
      FEATURE.gate |
      FEATURE.break |
      FEATURE.brokenPass
    );
  }
  return 0;
}

function buildLevel(stage: (typeof CAMPAIGN_ROWS)[number]): Level {
  const { id, name, rows, expectedPar } = stage;
  if (rows.length !== GRID_ROWS || rows.some((row) => row.length !== GRID_COLS)) {
    throw new Error(`Stage ${id} has an invalid grid size.`);
  }

  const blocks = new Set<string>();
  const blockCells: Cell[] = [];
  const oneWays = new Map<string, Direction>();
  const oneWayCells: Array<Cell & { direction: Direction }> = [];
  const portals: Cell[] = [];
  const switches = new Set<string>();
  const switchCells: Cell[] = [];
  const gates = new Set<string>();
  const gateCells: Cell[] = [];
  const fragileCells: Cell[] = [];
  let start: Cell | null = null;
  let goal: Cell | null = null;

  rows.forEach((row, rowIndex) => {
    [...row].forEach((value, colIndex) => {
      const cell = { col: colIndex, row: rowIndex };
      const key = cellKey(cell);
      if (value === "#") {
        blocks.add(key);
        blockCells.push(cell);
      }
      if (value === "S") start = cell;
      if (value === "G") goal = cell;
      const direction = ARROW_DIRECTION[value];
      if (direction) {
        oneWays.set(key, direction);
        oneWayCells.push({ ...cell, direction });
      }
      if (value === "T") portals.push(cell);
      if (value === "O") {
        switches.add(key);
        switchCells.push(cell);
      }
      if (value === "X") {
        gates.add(key);
        gateCells.push(cell);
      }
      if (value === "F") fragileCells.push(cell);
    });
  });

  if (!start || !goal) throw new Error(`Stage ${id} needs one start and one goal.`);
  if (portals.length !== 0 && portals.length !== 2) {
    throw new Error(`Stage ${id} needs exactly two portals.`);
  }

  const chapter = Math.floor((id - 1) / 5);
  const mechanics: Mechanic[] = [];
  if (oneWayCells.length > 0) mechanics.push("one-way");
  if (portals.length > 0) mechanics.push("portal");
  if (switchCells.length > 0 || gateCells.length > 0) mechanics.push("switch");
  if (fragileCells.length > 0) mechanics.push("fragile");

  const base = {
    blocks,
    goal,
    start,
    oneWays,
    portals,
    switches,
    gates,
    fragileCells,
  };
  const solved = solveLevel(base);
  if (!solved || solved.path.length !== expectedPar) {
    throw new Error(`Stage ${id} failed its verified PAR ${expectedPar}.`);
  }
  const required = requiredFeatures(chapter);
  if ((solved.features & required) !== required) {
    throw new Error(`Stage ${id} does not require all chapter mechanics.`);
  }

  return {
    id,
    name,
    rows: [...rows],
    blocks,
    blockCells,
    start,
    goal,
    par: solved.path.length,
    solution: solved.path,
    chapter,
    mechanics,
    oneWays,
    oneWayCells,
    portals,
    switches,
    switchCells,
    gates,
    gateCells,
    fragileCells,
  };
}

// 고정 시드 미로 생성기에서 후보를 만든 뒤 BFS 최단 경로와 기믹 사용을 통과한 맵만 포함합니다.
export const LEVELS: Level[] = CAMPAIGN_ROWS.map(buildLevel);
