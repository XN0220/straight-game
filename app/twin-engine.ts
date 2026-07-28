import { HEX_STAGES } from "./hex-engine";

export type TwinDirection = "up" | "down" | "left" | "right";
export type TwinCell = { col: number; row: number };

export type TwinBoard = {
  cols: number;
  rows: number;
  blocks: Set<string>;
  blockCells: TwinCell[];
  start: TwinCell;
  goal: TwinCell;
};

export type TwinStage = {
  id: number;
  left: TwinBoard;
  right: TwinBoard;
  par: number;
  solution: TwinDirection[];
  parOffset: number;
};

export type TwinRunState = {
  left: TwinCell;
  right: TwinCell;
  leftDone: boolean;
  rightDone: boolean;
};

export type TwinBoardMove = {
  outcome: "blocked" | "stop" | "goal" | "fixed";
  destination: TwinCell;
  path: TwinCell[];
};

export type TwinStep = {
  left: TwinBoardMove;
  right: TwinBoardMove;
  state: TwinRunState;
  changed: boolean;
};

type StageSpec = {
  id: number;
  cols: number;
  rows: number;
  targetPar: number;
  density: number;
  parOffset: number;
};

const DIRECTIONS: TwinDirection[] = ["up", "down", "left", "right"];
const VECTOR: Record<TwinDirection, TwinCell> = {
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
};

export function twinCellKey(cell: TwinCell) {
  return `${cell.col},${cell.row}`;
}

function sameCell(a: TwinCell, b: TwinCell) {
  return a.col === b.col && a.row === b.row;
}

function stateKey(state: TwinRunState) {
  return [
    twinCellKey(state.left),
    twinCellKey(state.right),
    state.leftDone ? 1 : 0,
    state.rightDone ? 1 : 0,
  ].join("|");
}

function inside(board: TwinBoard, cell: TwinCell) {
  return (
    cell.col >= 0 &&
    cell.col < board.cols &&
    cell.row >= 0 &&
    cell.row < board.rows
  );
}

export function twinBoardSlide(
  board: TwinBoard,
  from: TwinCell,
  direction: TwinDirection,
  fixed = false,
): TwinBoardMove {
  if (fixed) {
    return { outcome: "fixed", destination: { ...from }, path: [] };
  }

  const vector = VECTOR[direction];
  const path: TwinCell[] = [];
  let current = { ...from };

  while (true) {
    const next = {
      col: current.col + vector.col,
      row: current.row + vector.row,
    };
    if (!inside(board, next) || board.blocks.has(twinCellKey(next))) {
      return {
        outcome: path.length === 0 ? "blocked" : "stop",
        destination: current,
        path,
      };
    }

    current = next;
    path.push({ ...current });
    if (sameCell(current, board.goal)) {
      return { outcome: "goal", destination: current, path };
    }
  }
}

export function twinStep(
  stage: TwinStage,
  state: TwinRunState,
  direction: TwinDirection,
): TwinStep {
  const left = twinBoardSlide(stage.left, state.left, direction, state.leftDone);
  const right = twinBoardSlide(stage.right, state.right, direction, state.rightDone);
  const leftDone = state.leftDone || left.outcome === "goal";
  const rightDone = state.rightDone || right.outcome === "goal";
  const nextState = {
    left: { ...left.destination },
    right: { ...right.destination },
    leftDone,
    rightDone,
  };

  return {
    left,
    right,
    state: nextState,
    changed: stateKey(nextState) !== stateKey(state),
  };
}

export function initialTwinState(stage: TwinStage): TwinRunState {
  return {
    left: { ...stage.left.start },
    right: { ...stage.right.start },
    leftDone: sameCell(stage.left.start, stage.left.goal),
    rightDone: sameCell(stage.right.start, stage.right.goal),
  };
}

function solve(stage: TwinStage, depthLimit = 28) {
  const initial = initialTwinState(stage);
  const queue: Array<{ state: TwinRunState; path: TwinDirection[] }> = [
    { state: initial, path: [] },
  ];
  const visited = new Set([stateKey(initial)]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.path.length >= depthLimit) continue;

    for (const direction of DIRECTIONS) {
      const step = twinStep(stage, current.state, direction);
      if (!step.changed) continue;
      const path = [...current.path, direction];
      if (step.state.leftDone && step.state.rightDone) return path;
      const key = stateKey(step.state);
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ state: step.state, path });
    }
  }
  return null;
}

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function randomOpenCell(
  random: () => number,
  cols: number,
  rows: number,
  used: Set<string>,
) {
  for (;;) {
    const cell = {
      col: Math.floor(random() * cols),
      row: Math.floor(random() * rows),
    };
    const key = twinCellKey(cell);
    if (!used.has(key)) {
      used.add(key);
      return cell;
    }
  }
}

function makeBoard(
  random: () => number,
  cols: number,
  rows: number,
  density: number,
): TwinBoard {
  const used = new Set<string>();
  const start = randomOpenCell(random, cols, rows, used);
  const goal = randomOpenCell(random, cols, rows, used);
  const blockCells: TwinCell[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cell = { col, row };
      const key = twinCellKey(cell);
      if (!used.has(key) && random() < density) blockCells.push(cell);
    }
  }

  return {
    cols,
    rows,
    blocks: new Set(blockCells.map(twinCellKey)),
    blockCells,
    start,
    goal,
  };
}

function stageSpec(id: number): StageSpec {
  if (id <= 5) {
    return {
      id,
      cols: 4 + (id >= 4 ? 1 : 0),
      rows: 4 + (id === 5 ? 1 : 0),
      targetPar: 1 + ((id - 1) % 3),
      density: 0.14 + id * 0.018,
      parOffset: 0,
    };
  }

  const parOffset = 2 + ((id - 6) % 3);
  const targetPar = HEX_STAGES[id - 1].par + parOffset;
  if (id <= 10) {
    return { id, cols: 5, rows: 5, targetPar, density: 0.2, parOffset };
  }
  if (id <= 15) {
    return { id, cols: 6, rows: 6, targetPar, density: 0.23, parOffset };
  }
  if (id <= 20) {
    return { id, cols: 7, rows: 7, targetPar, density: 0.26, parOffset };
  }
  return { id, cols: 8, rows: 7, targetPar, density: 0.28, parOffset };
}

function generateStage(spec: StageSpec): TwinStage {
  for (let attempt = 0; attempt < 60000; attempt += 1) {
    const random = mulberry32(spec.id * 244949 + attempt * 104729);
    const densityWave = (attempt % 5) * 0.012 - 0.024;
    const stage: TwinStage = {
      id: spec.id,
      left: makeBoard(
        random,
        spec.cols,
        spec.rows,
        Math.max(0.08, spec.density + densityWave),
      ),
      right: makeBoard(
        random,
        spec.cols,
        spec.rows,
        Math.max(0.08, spec.density - densityWave),
      ),
      par: 0,
      solution: [],
      parOffset: spec.parOffset,
    };
    const solution = solve(stage, spec.targetPar);
    if (!solution || solution.length !== spec.targetPar) continue;
    stage.par = solution.length;
    stage.solution = solution;
    return stage;
  }
  throw new Error(`제미니아 ${spec.id}번 맵을 생성하지 못했습니다.`);
}

export const TWIN_STAGES = Array.from({ length: 30 }, (_, index) =>
  generateStage(stageSpec(index + 1)),
);

TWIN_STAGES.forEach((stage) => {
  const solution = solve(stage, stage.par);
  if (!solution || solution.length !== stage.par) {
    throw new Error(`제미니아 ${stage.id}번 맵 최단 경로 검증에 실패했습니다.`);
  }
  if (stage.id <= 5 && (stage.par < 1 || stage.par > 3)) {
    throw new Error(`제미니아 ${stage.id}번 맵이 1~3회 난이도를 벗어났습니다.`);
  }
  if (stage.id >= 6) {
    const offset = stage.par - HEX_STAGES[stage.id - 1].par;
    if (offset < 2 || offset > 4) {
      throw new Error(`제미니아 ${stage.id}번 맵의 추가 이동 수가 2~4회를 벗어났습니다.`);
    }
  }
});
