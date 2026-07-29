import { writeFileSync } from "node:fs";

const GRID_COLS = 23;
const GRID_ROWS = 15;
const MAPS_PER_PLANET = 30;
const DIRECTIONS = ["up", "down", "left", "right"];
const VECTOR = {
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
};
const CLOCKWISE = { up: "right", right: "down", down: "left", left: "up" };
const ARROW_DIRECTION = { "^": "up", v: "down", "<": "left", ">": "right" };

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
};

const MECHANICS = [
  null,
  "oneWay",
  "portal",
  "switch",
  "fragile",
  "rotator",
  "phase",
];

const TARGETS = [
  2, 3, 3, 4, 5,
  5, 6, 7, 8, 9,
  7, 8, 9, 10, 11,
  10, 12, 14, 15, 17,
  14, 16, 18, 19, 20,
  20, 22, 24, 26, 30,
];

const PLANET_NAMES = [
  [
    "첫 착륙", "벽에서 멈추기", "두 번 꺾기", "반대편 먼저", "기본 항로",
    "숨은 정지점", "가까운 길의 함정", "되돌아가는 답", "엇갈린 벽", "기본 궤도 보스",
    "넓어진 항로", "두 갈래 정지점", "먼 곳의 답", "교차 항로", "중간 궤도 시험",
    "돌아온 구간", "반대편 우회", "세 번의 선택", "목표 앞 회귀", "항로 제어 보스",
    "용암 협곡", "겹치는 궤도", "멀어지는 정답", "재진입 항로", "화산 심층부",
    "붉은 우회", "두 번째 귀환", "숨은 장거리", "마지막 접근", "아르코 코어",
  ],
  [
    "첫 화살표", "정방향 통과", "반대편은 벽", "벽과 화살표", "신호 항로",
    "두 번의 통과", "화살표 순서", "나중에 통과", "거꾸로 우회", "신호 보스",
    "넓어진 신호", "되돌아온 화살표", "한쪽만 통과", "신호 교차로", "중간 신호 시험",
    "먼저 막히기", "두 방향 재진입", "우회 신호", "목표 앞 화살표", "신호 제어 보스",
    "푸른 항로", "역방향 미끼", "긴 신호 회로", "두 번째 통과", "바람 심층부",
    "바깥쪽 신호", "세 번의 재진입", "긴 화살표 우회", "최후의 신호", "에어론 코어",
  ],
  [
    "첫 워프", "반대편 도착", "워프 뒤 방향", "벽과 워프", "공간 항로",
    "두 번의 워프", "워프 순서", "나중에 이동", "가까운 문 먼 길", "공간 보스",
    "넓어진 워프", "화살표 재등장", "돌아오는 입구", "엇갈린 출구", "중간 공간 시험",
    "먼저 지나치기", "신호와 워프", "두 구역 왕복", "목표 앞 워프", "공간 제어 보스",
    "보라 항로", "사용하지 않을 문", "긴 공간 회로", "반대편 재진입", "균열 심층부",
    "바깥쪽 워프", "세 번째 귀환", "긴 공간 우회", "최후의 균열", "넥서스 코어",
  ],
  [
    "첫 스위치", "잠긴 문", "스위치 뒤 통과", "벽과 게이트", "전력 항로",
    "두 번의 접근", "작동 순서", "나중에 켜기", "열린 뒤 우회", "전력 보스",
    "넓어진 게이트", "화살표와 문", "워프와 스위치", "돌아온 통로", "중간 전력 시험",
    "먼저 멀어지기", "상태가 바뀐 길", "두 구역 왕복", "목표 앞 스위치", "전력 제어 보스",
    "주황 항로", "켜지 않는 선택", "긴 게이트 회로", "이전 구역 복귀", "발전 심층부",
    "바깥쪽 스위치", "두 번째 개방", "긴 전력 우회", "최후의 게이트", "볼테라 코어",
  ],
  [
    "첫 파괴", "부서진 뒤 통과", "충돌 위치 읽기", "벽과 파괴 블록", "균열 항로",
    "두 번의 파괴", "부수는 순서", "나중에 부수기", "열린 자리 재사용", "균열 보스",
    "넓어진 균열", "화살표와 파괴", "워프와 파괴", "게이트와 파괴", "중간 균열 시험",
    "먼저 막히기", "부순 뒤 복귀", "두 구역 왕복", "목표 앞 파괴", "균열 제어 보스",
    "분홍 항로", "부수지 않는 선택", "긴 파괴 회로", "이전 구역 재진입", "결정 심층부",
    "바깥쪽 균열", "두 번째 붕괴", "긴 결정 우회", "최후의 파괴", "샤디아 코어",
  ],
  [
    "첫 톱니", "오른쪽으로", "회전 뒤 정지", "벽과 회전", "기계 항로",
    "두 번의 회전", "톱니 순서", "나중에 회전", "미끼 톱니", "기계 보스",
    "넓어진 공장", "화살표와 회전", "워프와 회전", "게이트와 회전", "중간 기계 시험",
    "먼저 꺾이기", "다른 방향 재진입", "두 구역 왕복", "목표 앞 회전", "동력 제어 보스",
    "노란 항로", "피해야 할 톱니", "긴 동력 회로", "이전 구역 복귀", "터빈 심층부",
    "바깥쪽 회전", "연속 재진입", "긴 기계 우회", "최후의 톱니", "기어라 코어",
  ],
  [
    "첫 위상", "바뀌는 벽", "접근 방향 변화", "벽과 위상", "공명 항로",
    "두 번의 전환", "위상 순서", "나중에 전환", "반대 파장 우회", "공명 보스",
    "넓어진 장벽", "화살표와 위상", "워프와 위상", "게이트와 위상", "중간 공명 시험",
    "먼저 닫기", "다른 상태 재진입", "두 구역 왕복", "목표 앞 전환", "위상 제어 보스",
    "청록 항로", "바꾸지 않는 선택", "긴 공명 회로", "이전 구역 복귀", "수정 심층부",
    "바깥쪽 전환", "세 번째 공명", "긴 위상 우회", "최후의 파장", "프리즘 코어",
  ],
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
  `${key(state.cell)}|${state.gateOpen ? 1 : 0}|${state.brokenMask}|${state.phase}`;

function boundsFor(stageIndex) {
  if (stageIndex < 10) return { left: 5, right: 17, top: 3, bottom: 11, size: "small" };
  if (stageIndex < 20) return { left: 3, right: 19, top: 2, bottom: 12, size: "medium" };
  return { left: 0, right: 22, top: 0, bottom: 14, size: "full" };
}

function cellsInBounds(bounds, includeBoundary = false) {
  const cells = [];
  const inset = includeBoundary ? 0 : 1;
  for (let row = bounds.top + inset; row <= bounds.bottom - inset; row += 1) {
    for (let col = bounds.left + inset; col <= bounds.right - inset; col += 1) {
      cells.push({ col, row });
    }
  }
  return cells;
}

function wallNeighbors(rows, cell) {
  let count = 0;
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) continue;
      const row = cell.row + rowOffset;
      const col = cell.col + colOffset;
      if (
        row >= 0 &&
        row < GRID_ROWS &&
        col >= 0 &&
        col < GRID_COLS &&
        rows[row][col] === "#"
      ) count += 1;
    }
  }
  return count;
}

function closesTwoByTwo(rows, cell) {
  for (const rowOffset of [-1, 0]) {
    for (const colOffset of [-1, 0]) {
      const top = cell.row + rowOffset;
      const left = cell.col + colOffset;
      if (top < 0 || left < 0 || top + 1 >= GRID_ROWS || left + 1 >= GRID_COLS) continue;
      let walls = 0;
      for (let row = top; row <= top + 1; row += 1) {
        for (let col = left; col <= left + 1; col += 1) {
          if ((row === cell.row && col === cell.col) || rows[row][col] === "#") walls += 1;
        }
      }
      if (walls === 4) return true;
    }
  }
  return false;
}

function makeArena(random, stageIndex) {
  const bounds = boundsFor(stageIndex);
  const rows = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill("."));
  const boundary = cellsInBounds(bounds, true).filter(
    (cell) =>
      cell.row === bounds.top ||
      cell.row === bounds.bottom ||
      cell.col === bounds.left ||
      cell.col === bounds.right,
  );

  if (bounds.size === "full") {
    shuffle(boundary, random).slice(0, 36 - Math.min(stageIndex - 20, 4)).forEach((cell) => {
      rows[cell.row][cell.col] = "#";
    });
  } else {
    boundary.forEach((cell) => {
      rows[cell.row][cell.col] = "#";
    });
  }

  const interior = shuffle(cellsInBounds(bounds), random);
  const baseTarget = bounds.size === "small" ? 14 : bounds.size === "medium" ? 28 : 52;
  const stageInBand = stageIndex % 10;
  const wallTarget = baseTarget + Math.min(stageInBand, 4);
  let placed = 0;
  for (const cell of interior) {
    if (placed >= wallTarget) break;
    if (closesTwoByTwo(rows, cell) || wallNeighbors(rows, cell) > 2) continue;
    rows[cell.row][cell.col] = "#";
    placed += 1;
  }
  return { rows, bounds };
}

function ordinaryCells(rows, bounds) {
  return cellsInBounds(bounds).filter((cell) => rows[cell.row][cell.col] === ".");
}

function mechanicFeature(name) {
  if (name === "oneWay") return FEATURE.oneWay;
  if (name === "portal") return FEATURE.portal;
  if (name === "switch") return FEATURE.switch | FEATURE.gate;
  if (name === "fragile") return FEATURE.break | FEATURE.brokenPass;
  if (name === "rotator") return FEATURE.rotator;
  if (name === "phase") return FEATURE.phaseSwitch | FEATURE.phaseGate;
  return 0;
}

function secondaryMechanic(planet, stageIndex) {
  if (planet <= 1 || stageIndex < 10) return null;
  if ((stageIndex + planet) % 3 === 1) return null;
  return MECHANICS[1 + ((stageIndex + planet) % (planet - 1))];
}

function placeOneMechanic(rows, mechanic, count, take, random) {
  if (!mechanic) return;
  if (mechanic === "oneWay") {
    const arrows = ["^", "v", "<", ">"];
    for (let index = 0; index < count + 1; index += 1) {
      const cell = take();
      if (cell) rows[cell.row][cell.col] = arrows[Math.floor(random() * arrows.length)];
    }
  }
  if (mechanic === "portal") {
    const first = take();
    const second = take();
    if (first && second) {
      rows[first.row][first.col] = "T";
      rows[second.row][second.col] = "T";
    }
  }
  if (mechanic === "switch") {
    const switchCell = take();
    const gate = take();
    if (switchCell && gate) {
      rows[switchCell.row][switchCell.col] = "O";
      rows[gate.row][gate.col] = "X";
    }
  }
  if (mechanic === "fragile") {
    for (let index = 0; index < Math.min(3, count + 1); index += 1) {
      const cell = take();
      if (cell) rows[cell.row][cell.col] = "F";
    }
  }
  if (mechanic === "rotator") {
    for (let index = 0; index < Math.min(4, count + 1); index += 1) {
      const cell = take();
      if (cell) rows[cell.row][cell.col] = "R";
    }
  }
  if (mechanic === "phase") {
    for (let index = 0; index < Math.min(2, count); index += 1) {
      const cell = take();
      if (cell) rows[cell.row][cell.col] = "P";
    }
    for (const symbol of ["A", "A", "B", "B", ...(count >= 3 ? ["A", "B"] : [])]) {
      const cell = take();
      if (cell) rows[cell.row][cell.col] = symbol;
    }
  }
}

function placeMechanics(rows, bounds, planet, stageIndex, random) {
  const candidates = shuffle(ordinaryCells(rows, bounds), random);
  let cursor = 0;
  const take = () => candidates[cursor++];
  const primary = MECHANICS[planet];
  const secondary = secondaryMechanic(planet, stageIndex);
  const objectTier = stageIndex < 5 ? 1 : stageIndex < 10 ? 2 : stageIndex < 20 ? 2 : 3;
  placeOneMechanic(rows, primary, objectTier, take, random);
  placeOneMechanic(rows, secondary, Math.max(1, objectTier - 1), take, random);
  return { primary, secondary };
}

function parse(rows) {
  const walls = new Set();
  const gates = new Set();
  const switches = new Set();
  const oneWays = new Map();
  const portals = [];
  const fragile = [];
  const rotators = new Set();
  const phaseSwitches = new Set();
  const phaseA = new Set();
  const phaseB = new Set();

  rows.forEach((row, rowIndex) => row.forEach((value, colIndex) => {
    const cell = { col: colIndex, row: rowIndex };
    const cellKey = key(cell);
    if (value === "#") walls.add(cellKey);
    if (value === "X") gates.add(cellKey);
    if (value === "O") switches.add(cellKey);
    if (ARROW_DIRECTION[value]) oneWays.set(cellKey, ARROW_DIRECTION[value]);
    if (value === "T") portals.push(cell);
    if (value === "F") fragile.push(cell);
    if (value === "R") rotators.add(cellKey);
    if (value === "P") phaseSwitches.add(cellKey);
    if (value === "A") phaseA.add(cellKey);
    if (value === "B") phaseB.add(cellKey);
  }));
  return {
    walls, gates, switches, oneWays, portals, fragile, rotators,
    phaseSwitches, phaseA, phaseB,
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
    if (!inside(next)) return { outcome: "death", travel, features };
    const nextKey = key(next);
    const phaseSolid =
      (level.phaseA.has(nextKey) && state.phase === 0) ||
      (level.phaseB.has(nextKey) && state.phase === 1);
    if (
      level.walls.has(nextKey) ||
      (level.gates.has(nextKey) && !state.gateOpen) ||
      phaseSolid
    ) {
      return moved
        ? { outcome: "stop", state: { ...state, cell: current }, travel, features }
        : { outcome: "blocked", travel, features };
    }

    const fragileIndex = level.fragile.findIndex((cell) => same(cell, next));
    if (fragileIndex >= 0 && (state.brokenMask & (1 << fragileIndex)) === 0) {
      return {
        outcome: "break",
        state: {
          ...state,
          cell: current,
          brokenMask: state.brokenMask | (1 << fragileIndex),
        },
        travel,
        features: features | FEATURE.break,
      };
    }

    const requiredDirection = level.oneWays.get(nextKey);
    if (requiredDirection && requiredDirection !== direction) {
      return moved
        ? { outcome: "stop", state: { ...state, cell: current }, travel, features }
        : { outcome: "blocked", travel, features };
    }

    current = next;
    moved = true;
    travel += 1;
    if (requiredDirection) features |= FEATURE.oneWay;
    if (level.gates.has(nextKey) && state.gateOpen) features |= FEATURE.gate;
    if (fragileIndex >= 0) features |= FEATURE.brokenPass;
    if (
      (level.phaseA.has(nextKey) && state.phase === 1) ||
      (level.phaseB.has(nextKey) && state.phase === 0)
    ) features |= FEATURE.phaseGate;

    if (goal && same(current, goal)) {
      return { outcome: "goal", state: { ...state, cell: current }, travel, features };
    }
    if (level.switches.has(nextKey) && !state.gateOpen) {
      return {
        outcome: "switch",
        state: { ...state, cell: current, gateOpen: true },
        travel,
        features: features | FEATURE.switch,
      };
    }
    if (level.phaseSwitches.has(nextKey)) {
      return {
        outcome: "phase",
        state: { ...state, cell: current, phase: state.phase === 0 ? 1 : 0 },
        travel,
        features: features | FEATURE.phaseSwitch,
      };
    }
    const portalDestination = otherPortal(level, current);
    if (portalDestination && level.portals.some((portal) => same(portal, current))) {
      return {
        outcome: "portal",
        state: { ...state, cell: { ...portalDestination } },
        travel,
        features: features | FEATURE.portal,
      };
    }
    if (level.rotators.has(nextKey)) {
      const rotationKey = `${nextKey}|${direction}`;
      if (rotations.has(rotationKey)) {
        return {
          outcome: "stop",
          state: { ...state, cell: current },
          travel,
          features: features | FEATURE.rotator,
        };
      }
      rotations.add(rotationKey);
      features |= FEATURE.rotator;
      direction = CLOCKWISE[direction];
    }
  }
}

function explore(level, start, required) {
  const initial = { cell: { ...start }, gateOpen: false, brokenMask: 0, phase: 0 };
  const queue = [{ state: initial, distance: 0, used: 0, path: [], travels: [] }];
  const visited = new Set([`${stateKey(initial)}|0`]);
  let branchStates = 0;
  let deadlyChoices = 0;

  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    let useful = 0;
    for (const direction of DIRECTIONS) {
      const plan = advance(level, node.state, direction);
      if (plan.outcome === "death") {
        deadlyChoices += 1;
        continue;
      }
      if (plan.outcome === "blocked") continue;
      useful += 1;
      const used = (node.used | plan.features) & required;
      const nextKey = `${stateKey(plan.state)}|${used}`;
      if (visited.has(nextKey)) continue;
      visited.add(nextKey);
      queue.push({
        state: plan.state,
        distance: node.distance + 1,
        used,
        path: [...node.path, direction],
        travels: [...node.travels, plan.travel],
      });
    }
    if (useful >= 2) branchStates += 1;
  }
  return { nodes: queue, branchStates, deadlyChoices };
}

function analyzeGoal(level, start, goal, required, maxDistance) {
  const initial = { cell: { ...start }, gateOpen: false, brokenMask: 0, phase: 0 };
  const queue = [{ state: initial, distance: 0, used: 0, count: 1, path: [], travels: [] }];
  const best = new Map([[`${stateKey(initial)}|0`, 0]]);
  let minimum = Infinity;
  let shortestCount = 0;
  let bypassCount = 0;
  let selected = null;

  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    if (node.distance >= Math.min(minimum, maxDistance)) continue;
    for (const direction of DIRECTIONS) {
      const plan = advance(level, node.state, direction, goal);
      if (plan.outcome === "blocked" || plan.outcome === "death") continue;
      const distance = node.distance + 1;
      const used = (node.used | plan.features) & required;
      if (plan.outcome === "goal") {
        if (distance < minimum) {
          minimum = distance;
          shortestCount = 0;
          bypassCount = 0;
          selected = null;
        }
        if (distance === minimum) {
          shortestCount = Math.min(9, shortestCount + node.count);
          if (used !== required) bypassCount = Math.min(9, bypassCount + node.count);
          if (!selected && used === required) {
            selected = {
              path: [...node.path, direction],
              travels: [...node.travels, plan.travel],
            };
          }
        }
        continue;
      }
      if (distance >= Math.min(minimum, maxDistance)) continue;
      const nextKey = `${stateKey(plan.state)}|${used}`;
      const previousDistance = best.get(nextKey);
      if (previousDistance !== undefined && previousDistance < distance) continue;
      if (previousDistance === distance) {
        const existing = queue.find(
          (candidate) =>
            candidate.distance === distance &&
            `${stateKey(candidate.state)}|${candidate.used}` === nextKey,
        );
        if (existing) existing.count = Math.min(9, existing.count + node.count);
        continue;
      }
      best.set(nextKey, distance);
      queue.push({
        state: plan.state,
        distance,
        used,
        count: node.count,
        path: [...node.path, direction],
        travels: [...node.travels, plan.travel],
      });
    }
  }
  return { minimum, shortestCount, bypassCount, selected };
}

function movementQuality(travels) {
  return {
    average: travels.reduce((sum, value) => sum + value, 0) / travels.length,
    longMoves: travels.filter((value) => value >= 3).length,
    longest: Math.max(...travels),
  };
}

function generateStage(planet, stageIndex) {
  const target = TARGETS[stageIndex];
  const primary = MECHANICS[planet];
  const secondary = secondaryMechanic(planet, stageIndex);
  const required = mechanicFeature(primary) | mechanicFeature(secondary);
  const minimumBranches = stageIndex < 5 ? 2 : stageIndex < 10 ? 4 : 5;
  const attemptLimit = stageIndex >= 25 ? 140000 : 80000;

  for (let attempt = 0; attempt < attemptLimit; attempt += 1) {
    const random = rng(
      0x7a11ce + planet * 0x1f123bb + stageIndex * 100003 + attempt * 7919,
    );
    const { rows, bounds } = makeArena(random, stageIndex);
    placeMechanics(rows, bounds, planet, stageIndex, random);
    const level = parse(rows);
    const starts = shuffle(ordinaryCells(rows, bounds), random).slice(0, 24);

    for (const start of starts) {
      const explored = explore(level, start, required);
      if (explored.branchStates < minimumBranches) continue;
      const candidates = shuffle(
        explored.nodes.filter(
          (node) =>
            node.distance === target &&
            node.used === required &&
            rows[node.state.cell.row][node.state.cell.col] === ".",
        ),
        random,
      );

      for (const candidate of candidates.slice(0, 20)) {
        const goal = candidate.state.cell;
        if (same(start, goal)) continue;
        const analysis = analyzeGoal(level, start, goal, required, target + 1);
        if (
          analysis.minimum !== target ||
          !analysis.selected ||
          analysis.bypassCount > 0 ||
          analysis.shortestCount > 4
        ) continue;
        const quality = movementQuality(analysis.selected.travels);
        const minAverage = stageIndex < 10 ? 1.7 : stageIndex < 20 ? 2.1 : 2.7;
        const minLong = Math.max(1, Math.floor(target * (stageIndex < 10 ? 0.16 : 0.22)));
        if (quality.average < minAverage || quality.longMoves < minLong) continue;

        const outputRows = rows.map((row) => [...row]);
        outputRows[start.row][start.col] = "S";
        outputRows[goal.row][goal.col] = "G";
        return {
          id: planet * MAPS_PER_PLANET + stageIndex + 1,
          name: PLANET_NAMES[planet][stageIndex],
          rows: outputRows.map((row) => row.join("")),
          expectedPar: target,
          expectedMechanics: [primary, secondary].filter(Boolean),
          shortestPaths: analysis.shortestCount,
          mapSize: bounds.size,
          stats: {
            attempt,
            branches: explored.branchStates,
            averageTravel: Number(quality.average.toFixed(2)),
            longMoves: quality.longMoves,
            longestTravel: quality.longest,
          },
        };
      }
    }
  }
  throw new Error(`Unable to generate planet ${planet} stage ${stageIndex + 1}`);
}

const selectedPlanet = process.argv[2] === undefined ? null : Number(process.argv[2]);
const planets = selectedPlanet === null
  ? Array.from({ length: MECHANICS.length }, (_, index) => index)
  : [selectedPlanet];
const outputPath = process.argv[3] ?? null;
const stages = [];

for (const planet of planets) {
  if (!Number.isInteger(planet) || planet < 0 || planet >= MECHANICS.length) {
    throw new Error(`Invalid planet index: ${planet}`);
  }
  for (let stageIndex = 0; stageIndex < TARGETS.length; stageIndex += 1) {
    const stage = generateStage(planet, stageIndex);
    stages.push(stage);
    console.error(
      `planet=${planet} stage=${String(stageIndex + 1).padStart(2, "0")} ` +
      `par=${stage.expectedPar} size=${stage.mapSize} mechanics=${stage.expectedMechanics.join("+") || "basic"} ` +
      `paths=${stage.shortestPaths} avg=${stage.stats.averageTravel} attempt=${stage.stats.attempt}`,
    );
  }
}

const serialized = JSON.stringify(stages, null, 2);
if (outputPath) {
  writeFileSync(outputPath, `${serialized}\n`);
} else {
  console.log(serialized);
}
