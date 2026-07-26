import { CAMPAIGN_ROWS } from "./campaign-data";
import { EXPANSION_ROWS } from "./expansion-data";
import { TRAINING_ROWS } from "./training-data";

export type Direction = "up" | "down" | "left" | "right";
export type Cell = { col: number; row: number };
export type Point = { x: number; y: number };
export type RunState = { gateOpen: boolean; brokenMask: number; phase: 0 | 1 };
export type Mechanic =
  | "one-way"
  | "portal"
  | "switch"
  | "fragile"
  | "rotator"
  | "phase";

export type Planet = {
  id: number;
  code: string;
  name: string;
  shortName: string;
  description: string;
  mechanic: string;
  difficulty: "쉬움" | "보통";
  location: "훈련 시설" | "탐사 행성";
  accent: string;
  secondary: string;
};

export type Chapter = {
  id: number;
  planet: number;
  zone: number;
  code: string;
  name: string;
  range: string;
  description: string;
  mechanics: string[];
  accent: string;
};

export type Level = {
  id: number;
  localId: number;
  name: string;
  rows: string[];
  blocks: Set<string>;
  blockCells: Cell[];
  start: Cell;
  goal: Cell;
  par: number;
  solution: Direction[];
  chapter: number;
  planet: number;
  zone: number;
  mechanics: Mechanic[];
  oneWays: Map<string, Direction>;
  oneWayCells: Array<Cell & { direction: Direction }>;
  portals: Cell[];
  switches: Set<string>;
  switchCells: Cell[];
  gates: Set<string>;
  gateCells: Cell[];
  fragileCells: Cell[];
  rotators: Set<string>;
  rotatorCells: Cell[];
  phaseSwitches: Set<string>;
  phaseSwitchCells: Cell[];
  phaseA: Set<string>;
  phaseACells: Cell[];
  phaseB: Set<string>;
  phaseBCells: Cell[];
};

type SlideFeatures = number;
type MovingPlan = {
  destination: Cell;
  state: RunState;
  features: SlideFeatures;
  distance: number;
  waypoints: Cell[];
};

export type SlidePlan =
  | { outcome: "blocked" }
  | (MovingPlan & {
      outcome: "stop" | "goal" | "switch" | "phase" | "break";
      brokenIndex?: number;
    })
  | (MovingPlan & { outcome: "portal"; entry: Cell })
  | {
      outcome: "death";
      edgeCell: Cell;
      direction: Direction;
      state: RunState;
      features: SlideFeatures;
      distance: number;
      waypoints: Cell[];
    };

type RawStage = {
  id: number;
  name: string;
  rows: string[];
  expectedPar: number;
};

export const GRID_COLS = 23;
export const GRID_ROWS = 15;
export const CELL_SIZE = 36;
export const WORLD_WIDTH = GRID_COLS * CELL_SIZE;
export const WORLD_HEIGHT = GRID_ROWS * CELL_SIZE;
export const PLAYER_RATIO = 0.95;
export const PLAYER_SIZE = CELL_SIZE * PLAYER_RATIO;
export const MAPS_PER_PLANET = 30;
export const ZONES_PER_PLANET = 6;
export const MAPS_PER_ZONE = 5;
export const INITIAL_RUN_STATE: RunState = {
  gateOpen: false,
  brokenMask: 0,
  phase: 0,
};

export const PLANETS: Planet[] = [
  {
    id: 1,
    code: "EARTH-LAB",
    name: "지구 궤도 연구실",
    shortName: "지구 연구실",
    description: "작은 실험실에서 기본 이동부터 행성별 핵심 기믹까지 차근차근 배우는 훈련 과정",
    mechanic: "행성 기믹 예비 훈련",
    difficulty: "쉬움",
    location: "훈련 시설",
    accent: "#2377d5",
    secondary: "#19a78f",
  },
  {
    id: 2,
    code: "ARCO",
    name: "벽돌 행성 아르코",
    shortName: "아르코",
    description: "기존 30개 맵이 그대로 이어지는 붉은 벽돌 행성",
    mechanic: "기본 기믹 종합",
    difficulty: "보통",
    location: "탐사 행성",
    accent: "#ff5d78",
    secondary: "#74efc2",
  },
  {
    id: 3,
    code: "GEARA",
    name: "기계 행성 기어라",
    shortName: "기어라",
    description: "금속 블록과 90도 회전 패드가 궤도를 꺾는 산업 행성",
    mechanic: "시계 방향 회전",
    difficulty: "보통",
    location: "탐사 행성",
    accent: "#ffd166",
    secondary: "#5bd3ff",
  },
  {
    id: 4,
    code: "PRISM",
    name: "수정 행성 프리즘",
    shortName: "프리즘",
    description: "청록·보라 위상 벽을 번갈아 통과하는 수정 행성",
    mechanic: "위상 전환",
    difficulty: "보통",
    location: "탐사 행성",
    accent: "#a987ff",
    secondary: "#55f2df",
  },
];

function chapter(
  id: number,
  planet: number,
  zone: number,
  code: string,
  name: string,
  range: string,
  description: string,
  mechanics: string[],
  accent: string,
): Chapter {
  return { id, planet, zone, code, name, range, description, mechanics, accent };
}

const SPACE_CHAPTERS: Chapter[] = [
  chapter(1, 0, 0, "BASIC", "기본 궤도", "PAR 8–12", "정지 블록에서 멈추는 감각과 위험한 경계를 익히는 구역", ["벽돌", "위험 경계"], "#74efc2"),
  chapter(2, 0, 1, "DETOUR", "우회 구역", "PAR 12–16", "넓은 공간의 정지점을 골라 긴 우회 궤도를 만드는 구역", ["미끼 정지점", "다중 선택"], "#ffd166"),
  chapter(3, 0, 2, "ONE-WAY", "화살표 구역", "PAR 16–20", "표시된 방향으로만 통과할 수 있는 일방통행 구역", ["일방통행", "역방향 차단"], "#5bd3ff"),
  chapter(4, 0, 3, "WARP", "워프 회로", "PAR 20–24", "보라색 워프 쌍과 일방통행을 함께 계산하는 구역", ["워프", "일방통행"], "#9b7bff"),
  chapter(5, 0, 4, "SWITCH", "스위치 요새", "PAR 24–28", "먼저 스위치를 밟아 잠긴 문을 열어야 하는 구역", ["스위치", "잠금 문", "워프"], "#ffb259"),
  chapter(6, 0, 5, "MASTER", "마스터 코어", "PAR 28–34", "금 간 블록을 부수고 모든 규칙을 엮어 푸는 최종 구역", ["파괴 블록", "스위치", "워프", "일방통행"], "#ff5d78"),
  chapter(7, 1, 0, "GEAR-1", "회전 입문", "PAR 7–11", "노란 회전 패드를 지나면 진행 방향이 시계 방향으로 꺾입니다", ["회전 패드", "금속 블록"], "#ffd166"),
  chapter(8, 1, 1, "GEAR-2", "철제 우회", "PAR 10–14", "회전 뒤의 정지점을 읽고 열린 공장을 크게 우회합니다", ["회전 패드", "긴 이동"], "#f6bf45"),
  chapter(9, 1, 2, "GEAR-3", "연속 회전", "PAR 13–17", "여러 톱니가 한 번의 이동을 연달아 꺾습니다", ["연속 회전", "방향 예측"], "#f7ad3e"),
  chapter(10, 1, 3, "GEAR-4", "동력 회로", "PAR 16–20", "미끼 톱니 사이에서 필요한 회전만 골라야 합니다", ["미끼 회전", "다중 선택"], "#ff9954"),
  chapter(11, 1, 4, "GEAR-5", "과열 공장", "PAR 19–23", "열린 경계와 촘촘한 회전 선택을 함께 계산합니다", ["위험 경계", "회전 연계"], "#ff7b55"),
  chapter(12, 1, 5, "TURBINE", "터빈 코어", "PAR 22–28", "기계 행성의 모든 회전 규칙을 연결하는 최종 구역", ["회전 패드", "최장 궤도"], "#ff5d78"),
  chapter(13, 2, 0, "PHASE-1", "위상 입문", "PAR 7–11", "스위치를 밟으면 청록 벽과 보라 벽의 충돌 상태가 뒤바뀝니다", ["위상 스위치", "청록 벽"], "#55f2df"),
  chapter(14, 2, 1, "PHASE-2", "이중 장벽", "PAR 10–14", "한쪽이 열리면 다른 쪽이 닫히는 두 색 장벽을 읽습니다", ["청록 벽", "보라 벽"], "#67d8ef"),
  chapter(15, 2, 2, "PHASE-3", "공명 우회", "PAR 13–17", "스위치 전후에 같은 길이 다른 정지점으로 바뀝니다", ["위상 전환", "경로 변화"], "#7abdf8"),
  chapter(16, 2, 3, "RESONATE", "회전 공명", "PAR 16–20", "이전 행성의 회전 패드가 위상 장벽과 함께 돌아옵니다", ["위상 전환", "회전 패드"], "#8fa4ff"),
  chapter(17, 2, 4, "PHASE-5", "불안정 파장", "PAR 19–23", "두 스위치와 회전 패드가 매 이동의 결과를 바꿉니다", ["다중 스위치", "회전 연계"], "#a987ff"),
  chapter(18, 2, 5, "PRISM-CORE", "프리즘 코어", "PAR 22–28", "두 행성의 신규 규칙을 결합한 마지막 5개 맵", ["위상 전환", "회전 패드", "최장 궤도"], "#c878ff"),
];

export const CHAPTERS: Chapter[] = [
  chapter(1, 0, 0, "LAB-1", "직진 기초", "PAR 1–3", "벽까지 직진하고 파란 블록에서 멈추는 기본 이동을 익히는 구역", ["기본 이동", "정지 블록"], "#2377d5"),
  chapter(2, 0, 1, "LAB-2", "일방통행 훈련", "PAR 2–3", "화살표 방향으로는 통과하고 반대 방향에서는 벽처럼 쓰는 구역", ["일방통행", "역방향 차단"], "#278bd7"),
  chapter(3, 0, 2, "LAB-3", "워프 훈련", "PAR 2–4", "보라색 워프 쌍을 이용해 반대편 실험실로 이동하는 구역", ["워프", "도착 방향 읽기"], "#7b6de1"),
  chapter(4, 0, 3, "LAB-4", "게이트 훈련", "PAR 2–5", "스위치를 먼저 밟아 잠긴 문을 열고 통과하는 구역", ["스위치", "잠금 문"], "#19a78f"),
  chapter(5, 0, 4, "LAB-5", "회전 훈련", "PAR 2–4", "노란 회전 패드가 진행 방향을 시계 방향으로 꺾는 구역", ["회전 패드", "방향 예측"], "#e9a23b"),
  chapter(6, 0, 5, "LAUNCH", "위상 모의 탐사", "PAR 3–5", "위상 벽과 회전 패드를 함께 사용해 우주 탐사를 예행하는 구역", ["위상 전환", "회전 패드"], "#ef6b5b"),
  ...SPACE_CHAPTERS.map((item) => ({
    ...item,
    id: item.id + ZONES_PER_PLANET,
    planet: item.planet + 1,
  })),
];

export const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];
export const DIRECTION_VECTOR: Record<Direction, Cell> = {
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
};

const CLOCKWISE: Record<Direction, Direction> = {
  up: "right",
  right: "down",
  down: "left",
  left: "up",
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
  rotator: 64,
  phaseSwitch: 128,
  phaseGate: 256,
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
  | "rotators"
  | "phaseSwitches"
  | "phaseA"
  | "phaseB"
>;

export function cellKey(cell: Cell) {
  return cell.col + "," + cell.row;
}

export function sameCell(a: Cell, b: Cell) {
  return a.col === b.col && a.row === b.row;
}

function stateKey(cell: Cell, state: RunState) {
  return (
    cellKey(cell) +
    "|" +
    (state.gateOpen ? 1 : 0) +
    "|" +
    state.brokenMask +
    "|" +
    state.phase
  );
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

function appendEndpoint(waypoints: Cell[], destination: Cell) {
  const next = [...waypoints];
  if (next.length === 0 || !sameCell(next[next.length - 1], destination)) {
    next.push({ ...destination });
  }
  return next;
}

export function slide(
  level: PlayableLevel,
  from: Cell,
  inputDirection: Direction,
  runState: RunState = INITIAL_RUN_STATE,
): SlidePlan {
  let direction = inputDirection;
  let current = { ...from };
  let moved = false;
  let features = 0;
  let distance = 0;
  const waypoints: Cell[] = [];
  const rotations = new Set<string>();

  while (true) {
    const vector = DIRECTION_VECTOR[direction];
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
        distance,
        waypoints,
      };
    }

    const nextKey = cellKey(next);
    const phaseWallIsSolid =
      (level.phaseA.has(nextKey) && runState.phase === 0) ||
      (level.phaseB.has(nextKey) && runState.phase === 1);
    if (
      level.blocks.has(nextKey) ||
      (level.gates.has(nextKey) && !runState.gateOpen) ||
      phaseWallIsSolid
    ) {
      return moved
        ? {
            outcome: "stop",
            destination: current,
            state: { ...runState },
            features,
            distance,
            waypoints: appendEndpoint(waypoints, current),
          }
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
        distance,
        waypoints: appendEndpoint(waypoints, current),
      };
    }

    const requiredDirection = level.oneWays.get(nextKey);
    if (requiredDirection && !oneWayAllows(requiredDirection, direction)) {
      return moved
        ? {
            outcome: "stop",
            destination: current,
            state: { ...runState },
            features,
            distance,
            waypoints: appendEndpoint(waypoints, current),
          }
        : { outcome: "blocked" };
    }

    current = next;
    moved = true;
    distance += 1;
    if (requiredDirection) features |= FEATURE.oneWay;
    if (level.gates.has(nextKey) && runState.gateOpen) features |= FEATURE.gate;
    if (fragileIndex >= 0) features |= FEATURE.brokenPass;
    if (level.phaseA.has(nextKey) && runState.phase === 1) features |= FEATURE.phaseGate;

    if (sameCell(current, level.goal)) {
      return {
        outcome: "goal",
        destination: current,
        state: { ...runState },
        features,
        distance,
        waypoints: appendEndpoint(waypoints, current),
      };
    }

    if (level.switches.has(nextKey) && !runState.gateOpen) {
      return {
        outcome: "switch",
        destination: current,
        state: { ...runState, gateOpen: true },
        features: features | FEATURE.switch,
        distance,
        waypoints: appendEndpoint(waypoints, current),
      };
    }

    if (level.phaseSwitches.has(nextKey)) {
      return {
        outcome: "phase",
        destination: current,
        state: { ...runState, phase: runState.phase === 0 ? 1 : 0 },
        features: features | FEATURE.phaseSwitch,
        distance,
        waypoints: appendEndpoint(waypoints, current),
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
        distance,
        waypoints: appendEndpoint(waypoints, current),
      };
    }

    if (level.rotators.has(nextKey)) {
      const rotationKey = nextKey + "|" + direction;
      if (rotations.has(rotationKey)) {
        return {
          outcome: "stop",
          destination: current,
          state: { ...runState },
          features: features | FEATURE.rotator,
          distance,
          waypoints: appendEndpoint(waypoints, current),
        };
      }
      rotations.add(rotationKey);
      features |= FEATURE.rotator;
      waypoints.push({ ...current });
      direction = CLOCKWISE[direction];
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

function measureSolution(
  level: Pick<Level, keyof PlayableLevel | "start">,
  path: Direction[],
) {
  let cell = { ...level.start };
  let state = { ...INITIAL_RUN_STATE };
  const distances: number[] = [];

  for (const direction of path) {
    const plan = slide(level, cell, direction, state);
    if (plan.outcome === "blocked" || plan.outcome === "death") return null;
    distances.push(plan.distance);
    cell = { ...plan.destination };
    state = { ...plan.state };
  }

  return {
    average: distances.reduce((sum, distance) => sum + distance, 0) / distances.length,
    longMoves: distances.filter((distance) => distance >= 4).length,
  };
}

function requiredFeatures(planet: number, zone: number) {
  if (planet === 0) {
    if (zone === 1) return FEATURE.oneWay;
    if (zone === 2) return FEATURE.portal;
    if (zone === 3) return FEATURE.switch | FEATURE.gate;
    if (zone === 4) return FEATURE.rotator;
    if (zone === 5) return FEATURE.phaseSwitch | FEATURE.phaseGate | FEATURE.rotator;
    return 0;
  }
  if (planet === 1) {
    if (zone === 2) return FEATURE.oneWay;
    if (zone === 3) return FEATURE.oneWay | FEATURE.portal;
    if (zone === 4) return FEATURE.oneWay | FEATURE.portal | FEATURE.switch | FEATURE.gate;
    if (zone === 5) {
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
  if (planet === 2) return FEATURE.rotator;
  return FEATURE.phaseSwitch | FEATURE.phaseGate | (zone >= 3 ? FEATURE.rotator : 0);
}

const MAX_WALLS_BY_ZONE = [110, 100, 88, 86, 92, 98];

function buildLevel(stage: RawStage): Level {
  const { id, name, rows, expectedPar } = stage;
  if (rows.length !== GRID_ROWS || rows.some((row) => row.length !== GRID_COLS)) {
    throw new Error("Stage " + id + " has an invalid grid size.");
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
  const rotators = new Set<string>();
  const rotatorCells: Cell[] = [];
  const phaseSwitches = new Set<string>();
  const phaseSwitchCells: Cell[] = [];
  const phaseA = new Set<string>();
  const phaseACells: Cell[] = [];
  const phaseB = new Set<string>();
  const phaseBCells: Cell[] = [];
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
      if (value === "R") {
        rotators.add(key);
        rotatorCells.push(cell);
      }
      if (value === "P") {
        phaseSwitches.add(key);
        phaseSwitchCells.push(cell);
      }
      if (value === "A") {
        phaseA.add(key);
        phaseACells.push(cell);
      }
      if (value === "B") {
        phaseB.add(key);
        phaseBCells.push(cell);
      }
    });
  });

  if (!start || !goal) throw new Error("Stage " + id + " needs one start and one goal.");
  if (portals.length !== 0 && portals.length !== 2) {
    throw new Error("Stage " + id + " needs exactly two portals.");
  }

  const localId = ((id - 1) % MAPS_PER_PLANET) + 1;
  const planet = Math.floor((id - 1) / MAPS_PER_PLANET);
  const zone = Math.floor((localId - 1) / MAPS_PER_ZONE);
  const chapterIndex = planet * ZONES_PER_PLANET + zone;
  const mechanics: Mechanic[] = [];
  if (oneWayCells.length > 0) mechanics.push("one-way");
  if (portals.length > 0) mechanics.push("portal");
  if (switchCells.length > 0 || gateCells.length > 0) mechanics.push("switch");
  if (fragileCells.length > 0) mechanics.push("fragile");
  if (rotatorCells.length > 0) mechanics.push("rotator");
  if (phaseSwitchCells.length > 0 || phaseACells.length > 0 || phaseBCells.length > 0) {
    mechanics.push("phase");
  }

  const base = {
    blocks,
    goal,
    start,
    oneWays,
    portals,
    switches,
    gates,
    fragileCells,
    rotators,
    phaseSwitches,
    phaseA,
    phaseB,
  };
  const wallLimit = MAX_WALLS_BY_ZONE[zone];
  if (blocks.size > wallLimit) {
    throw new Error(
      "Stage " + id + " is too dense (" + blocks.size + "/" + wallLimit + " walls).",
    );
  }
  const solved = solveLevel(base);
  if (!solved || solved.path.length !== expectedPar) {
    throw new Error("Stage " + id + " failed its verified PAR " + expectedPar + ".");
  }
  const movement = measureSolution(base, solved.path);
  const minimumLongMoves = Math.max(
    planet === 0 ? 0 : planet === 1 ? 3 : 2,
    Math.floor(expectedPar * (planet === 0 ? 0 : planet === 1 ? 0.3 : 0.24)),
  );
  const minimumAverage = planet === 0 ? 2 : planet === 1 ? 3 : 2.7;
  if (
    !movement ||
    movement.average < minimumAverage ||
    movement.longMoves < minimumLongMoves
  ) {
    throw new Error("Stage " + id + " does not preserve enough straight-line movement.");
  }
  const required = requiredFeatures(planet, zone);
  if ((solved.features & required) !== required) {
    throw new Error("Stage " + id + " does not require all chapter mechanics.");
  }

  return {
    id,
    localId,
    name,
    rows: [...rows],
    blocks,
    blockCells,
    start,
    goal,
    par: solved.path.length,
    solution: solved.path,
    chapter: chapterIndex,
    planet,
    zone,
    mechanics,
    oneWays,
    oneWayCells,
    portals,
    switches,
    switchCells,
    gates,
    gateCells,
    fragileCells,
    rotators,
    rotatorCells,
    phaseSwitches,
    phaseSwitchCells,
    phaseA,
    phaseACells,
    phaseB,
    phaseBCells,
  };
}

const ALL_ROWS: RawStage[] = [
  ...TRAINING_ROWS,
  ...CAMPAIGN_ROWS,
  ...EXPANSION_ROWS,
].map((stage, index) => ({ ...stage, id: index + 1 }));

// 지구 훈련 30개와 기존 우주 탐사 90개를 모두 BFS로 다시 검증합니다.
export const LEVELS: Level[] = ALL_ROWS.map(buildLevel);

export function starsFor(best: number | null, par: number) {
  if (best === null) return 0;
  if (best <= par) return 3;
  if (best <= par + 2) return 2;
  return 1;
}
