import { writeFileSync } from "node:fs";

const GRID_COLS = 23;
const GRID_ROWS = 15;
const LEFT = 5;
const RIGHT = 17;
const TOP = 3;
const BOTTOM = 11;
const DIRECTIONS = ["up", "down", "left", "right"];
const VECTOR = {
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
};
const CLOCKWISE = {
  up: "right",
  right: "down",
  down: "left",
  left: "up",
};
const ARROW_DIRECTION = {
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
  rotator: 64,
  phaseSwitch: 128,
  phaseGate: 256,
};

const names = [
  "직진 시작", "벽에서 멈추기", "두 번 꺾기", "정지점 찾기", "기초 조종 완료",
  "화살표 첫 통과", "같은 방향으로", "반대편은 벽", "화살표 우회", "일방통행 완료",
  "첫 워프", "반대편 도착", "워프 뒤 방향", "두 번의 공간 이동", "워프 훈련 완료",
  "스위치 켜기", "잠긴 문", "돌아서 열기", "스위치와 문", "게이트 훈련 완료",
  "첫 회전 패드", "오른쪽으로 꺾기", "회전 뒤 정지", "두 번의 회전", "회전 훈련 완료",
  "위상 스위치", "바뀌는 벽", "회전과 위상", "두 기믹 연결", "우주 탐사 예행",
];

const targets = [
  1, 1, 2, 2, 3,
  2, 2, 3, 3, 3,
  2, 3, 3, 4, 4,
  2, 3, 3, 4, 5,
  2, 3, 3, 4, 4,
  3, 3, 4, 4, 5,
];

function rng(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(values, random) {
  const next = [...values];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

const key = (cell) => `${cell.col},${cell.row}`;
const same = (a, b) => a.col === b.col && a.row === b.row;
const inside = (cell) =>
  cell.col >= 0 && cell.col < GRID_COLS && cell.row >= 0 && cell.row < GRID_ROWS;
const stateKey = (state) =>
  `${key(state.cell)}|${state.gateOpen ? 1 : 0}|${state.phase}`;

function makeLab(random, stageIndex) {
  const rows = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill("."));
  for (let col = LEFT; col <= RIGHT; col += 1) {
    rows[TOP][col] = "#";
    rows[BOTTOM][col] = "#";
  }
  for (let row = TOP; row <= BOTTOM; row += 1) {
    rows[row][LEFT] = "#";
    rows[row][RIGHT] = "#";
  }

  const group = Math.floor(stageIndex / 5);
  const stageInGroup = stageIndex % 5;
  const obstacleTarget = 2 + group * 2 + stageInGroup;
  shuffle(ordinaryCells(rows), random)
    .slice(0, obstacleTarget)
    .forEach((cell) => {
      rows[cell.row][cell.col] = "#";
    });
  return rows;
}

function ordinaryCells(rows) {
  const cells = [];
  for (let row = TOP + 1; row < BOTTOM; row += 1) {
    for (let col = LEFT + 1; col < RIGHT; col += 1) {
      if (rows[row][col] === ".") cells.push({ col, row });
    }
  }
  return cells;
}

function placeMechanics(rows, group, random) {
  const candidates = shuffle(ordinaryCells(rows), random);
  let cursor = 0;
  const take = () => candidates[cursor++];

  if (group === 1) {
    const arrows = ["^", "v", "<", ">"];
    for (let index = 0; index < 3; index += 1) {
      const cell = take();
      if (cell) rows[cell.row][cell.col] = arrows[Math.floor(random() * arrows.length)];
    }
  }

  if (group === 2) {
    const first = take();
    const second = take();
    if (first && second) {
      rows[first.row][first.col] = "T";
      rows[second.row][second.col] = "T";
    }
  }

  if (group === 3) {
    const switchCell = take();
    const gate = take();
    if (switchCell && gate) {
      rows[switchCell.row][switchCell.col] = "O";
      rows[gate.row][gate.col] = "X";
    }
  }

  if (group === 4) {
    for (let index = 0; index < 2; index += 1) {
      const cell = take();
      if (cell) rows[cell.row][cell.col] = "R";
    }
  }

  if (group === 5) {
    const phaseSwitch = take();
    if (phaseSwitch) rows[phaseSwitch.row][phaseSwitch.col] = "P";
    for (const symbol of ["A", "A", "B", "B", "R", "R"]) {
      const cell = take();
      if (cell) rows[cell.row][cell.col] = symbol;
    }
  }
}

function parse(rows) {
  const walls = new Set();
  const gates = new Set();
  const switches = new Set();
  const oneWays = new Map();
  const portals = [];
  const rotators = new Set();
  const phaseSwitches = new Set();
  const phaseA = new Set();
  const phaseB = new Set();

  rows.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const cell = { col: colIndex, row: rowIndex };
      const cellKey = key(cell);
      if (value === "#") walls.add(cellKey);
      if (value === "X") gates.add(cellKey);
      if (value === "O") switches.add(cellKey);
      if (ARROW_DIRECTION[value]) oneWays.set(cellKey, ARROW_DIRECTION[value]);
      if (value === "T") portals.push(cell);
      if (value === "R") rotators.add(cellKey);
      if (value === "P") phaseSwitches.add(cellKey);
      if (value === "A") phaseA.add(cellKey);
      if (value === "B") phaseB.add(cellKey);
    });
  });

  return {
    walls,
    gates,
    switches,
    oneWays,
    portals,
    rotators,
    phaseSwitches,
    phaseA,
    phaseB,
  };
}

function otherPortal(level, entry) {
  if (level.portals.length !== 2) return null;
  return same(level.portals[0], entry) ? level.portals[1] : level.portals[0];
}

function advance(level, state, inputDirection, goal = null) {
  let direction = inputDirection;
  let current = { ...state.cell };
  let moved = false;
  let features = 0;
  let travel = 0;
  const rotations = new Set();

  while (true) {
    const vector = VECTOR[direction];
    const next = { col: current.col + vector.col, row: current.row + vector.row };
    if (!inside(next)) return { outcome: "death", travel };
    const nextKey = key(next);
    const phaseWallIsSolid =
      (level.phaseA.has(nextKey) && state.phase === 0) ||
      (level.phaseB.has(nextKey) && state.phase === 1);

    if (
      level.walls.has(nextKey) ||
      (level.gates.has(nextKey) && !state.gateOpen) ||
      phaseWallIsSolid
    ) {
      return moved
        ? { outcome: "stop", state: { ...state, cell: current }, features, travel }
        : { outcome: "blocked", travel };
    }

    const requiredDirection = level.oneWays.get(nextKey);
    if (requiredDirection && requiredDirection !== direction) {
      return moved
        ? { outcome: "stop", state: { ...state, cell: current }, features, travel }
        : { outcome: "blocked", travel };
    }

    current = next;
    moved = true;
    travel += 1;
    if (requiredDirection) features |= FEATURE.oneWay;
    if (level.gates.has(nextKey) && state.gateOpen) features |= FEATURE.gate;
    if (level.phaseA.has(nextKey) && state.phase === 1) features |= FEATURE.phaseGate;

    if (goal && same(current, goal)) {
      return { outcome: "goal", state: { ...state, cell: current }, features, travel };
    }

    if (level.switches.has(nextKey) && !state.gateOpen) {
      return {
        outcome: "switch",
        state: { ...state, cell: current, gateOpen: true },
        features: features | FEATURE.switch,
        travel,
      };
    }

    if (level.phaseSwitches.has(nextKey)) {
      return {
        outcome: "phase",
        state: { ...state, cell: current, phase: state.phase === 0 ? 1 : 0 },
        features: features | FEATURE.phaseSwitch,
        travel,
      };
    }

    const portalDestination = otherPortal(level, current);
    if (portalDestination && level.portals.some((portal) => same(portal, current))) {
      return {
        outcome: "portal",
        state: { ...state, cell: { ...portalDestination } },
        features: features | FEATURE.portal,
        travel,
      };
    }

    if (level.rotators.has(nextKey)) {
      const rotationKey = `${nextKey}|${direction}`;
      if (rotations.has(rotationKey)) {
        return {
          outcome: "stop",
          state: { ...state, cell: current },
          features: features | FEATURE.rotator,
          travel,
        };
      }
      rotations.add(rotationKey);
      features |= FEATURE.rotator;
      direction = CLOCKWISE[direction];
    }
  }
}

function solve(level, start, goal) {
  const initial = { cell: { ...start }, gateOpen: false, phase: 0 };
  const queue = [{ state: initial, path: [], used: 0, distances: [] }];
  const visited = new Set([stateKey(initial)]);

  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    for (const direction of DIRECTIONS) {
      const plan = advance(level, node.state, direction, goal);
      if (plan.outcome === "goal") {
        return {
          path: [...node.path, direction],
          used: node.used | plan.features,
          distances: [...node.distances, plan.travel],
        };
      }
      if (plan.outcome === "blocked" || plan.outcome === "death") continue;
      const nextKey = stateKey(plan.state);
      if (visited.has(nextKey)) continue;
      visited.add(nextKey);
      queue.push({
        state: plan.state,
        path: [...node.path, direction],
        used: node.used | plan.features,
        distances: [...node.distances, plan.travel],
      });
    }
  }
  return null;
}

function explore(level, start) {
  const initial = { cell: { ...start }, gateOpen: false, phase: 0 };
  const queue = [{ state: initial, distance: 0, used: 0 }];
  const visited = new Set([stateKey(initial)]);

  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    for (const direction of DIRECTIONS) {
      const plan = advance(level, node.state, direction);
      if (plan.outcome === "blocked" || plan.outcome === "death") continue;
      const nextKey = stateKey(plan.state);
      if (visited.has(nextKey)) continue;
      visited.add(nextKey);
      queue.push({
        state: plan.state,
        distance: node.distance + 1,
        used: node.used | plan.features,
      });
    }
  }
  return queue;
}

function requiredFeatures(group) {
  if (group === 1) return FEATURE.oneWay;
  if (group === 2) return FEATURE.portal;
  if (group === 3) return FEATURE.switch | FEATURE.gate;
  if (group === 4) return FEATURE.rotator;
  if (group === 5) return FEATURE.phaseSwitch | FEATURE.phaseGate | FEATURE.rotator;
  return 0;
}

function createStage(stageIndex) {
  const target = targets[stageIndex];
  const group = Math.floor(stageIndex / 5);
  const required = requiredFeatures(group);

  for (let attempt = 0; attempt < 80000; attempt += 1) {
    const random = rng(20260727 + stageIndex * 100003 + attempt * 7919);
    const rows = makeLab(random, stageIndex);
    placeMechanics(rows, group, random);
    const level = parse(rows);
    const starts = shuffle(ordinaryCells(rows), random).slice(0, 18);

    for (const start of starts) {
      const explored = explore(level, start);
      const goalCandidates = shuffle(
        explored.filter(
          (node) =>
            node.distance === target &&
            (node.used & required) === required &&
            rows[node.state.cell.row][node.state.cell.col] === ".",
        ),
        random,
      );

      for (const candidate of goalCandidates.slice(0, 18)) {
        const goal = candidate.state.cell;
        if (same(start, goal)) continue;
        const solved = solve(level, start, goal);
        if (
          !solved ||
          solved.path.length !== target ||
          (solved.used & required) !== required
        ) {
          continue;
        }
        const average =
          solved.distances.reduce((sum, distance) => sum + distance, 0) /
          solved.distances.length;
        if (average < 2) continue;

        const outputRows = rows.map((row) => [...row]);
        outputRows[start.row][start.col] = "S";
        outputRows[goal.row][goal.col] = "G";
        return {
          id: stageIndex + 1,
          name: names[stageIndex],
          rows: outputRows.map((row) => row.join("")),
          expectedPar: solved.path.length,
        };
      }
    }
  }
  throw new Error(`Could not generate training stage ${stageIndex + 1}`);
}

const stages = Array.from({ length: 30 }, (_, index) => createStage(index));
const output =
  "// scripts/generate-training.mjs로 생성한 지구 연구실 기믹 훈련 맵입니다.\n" +
  "export const TRAINING_ROWS = " +
  JSON.stringify(stages, null, 2) +
  ";\n";

writeFileSync(new URL("../app/training-data.ts", import.meta.url), output);
console.log(
  stages
    .map((stage) => `${String(stage.id).padStart(2, "0")}: ${stage.expectedPar} ${stage.name}`)
    .join("\n"),
);
