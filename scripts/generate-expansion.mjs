const GRID_COLS = 23;
const GRID_ROWS = 15;
const DIRECTIONS = ["up", "down", "left", "right"];
const VECTOR = {
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
};
const CLOCKWISE = { up: "right", right: "down", down: "left", left: "up" };

const FEATURE = {
  rotator: 1,
  phaseSwitch: 2,
  phaseGate: 4,
};

const TARGETS = [
  7, 8, 9, 10, 11,
  10, 11, 12, 13, 14,
  13, 14, 15, 16, 17,
  16, 17, 18, 19, 20,
  19, 20, 21, 22, 23,
  22, 23, 24, 26, 28,
];

const GEAR_NAMES = [
  "첫 톱니", "오른쪽으로", "기어 모서리", "한 번 더", "회전 예행",
  "철제 우회", "맞물린 길", "노란 톱니", "회전 교차로", "기어 시험",
  "연속 회전", "강철 반전", "세 갈래 기어", "톱니 회랑", "회전 심판",
  "동력 전달", "맞물린 축", "회전 공장", "긴 컨베이어", "기계 회로",
  "과열 구간", "역회전 함정", "압력실", "산업 미로", "터빈 코어",
  "붉은 기어", "회전 폭주", "동력 혼합", "최후의 톱니", "기계 행성의 끝",
];

const PHASE_NAMES = [
  "첫 위상", "빛과 그림자", "청록 벽", "보라 벽", "전환 예행",
  "엇갈린 파장", "수정 통로", "두 색의 문", "위상 교차로", "수정 시험",
  "반대편 세계", "한 번 더 전환", "파장 우회", "겹친 장벽", "위상 심판",
  "회전하는 빛", "기어와 수정", "전환 회전", "이중 궤도", "공명 회로",
  "불안정 파장", "수정 함정", "공명실", "빛의 미로", "프리즘 코어",
  "붉은 파장", "위상 폭주", "삼중 혼합", "마지막 공명", "수정 행성의 끝",
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
const stateKey = (state) =>
  `${state.cell.col},${state.cell.row}|${state.phase}|${state.gateOpen ? 1 : 0}|${state.brokenMask}`;
const same = (a, b) => a.col === b.col && a.row === b.row;
const inside = (cell) =>
  cell.col >= 0 && cell.col < GRID_COLS && cell.row >= 0 && cell.row < GRID_ROWS;

const WALL_TARGETS = [82, 78, 74, 70, 68, 66];
const BOUNDARY_TARGETS = [34, 32, 30, 29, 28, 27];

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
      ) {
        count += 1;
      }
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

function makeArena(random, zone, stageInZone) {
  const rows = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill("."));
  const wallTarget = WALL_TARGETS[zone] - Math.min(stageInZone, 3);
  const boundaryTarget = BOUNDARY_TARGETS[zone];
  const boundary = [];
  const interior = [];

  for (let row = 0; row < GRID_ROWS; row += 1) {
    for (let col = 0; col < GRID_COLS; col += 1) {
      const cell = { col, row };
      if (row === 0 || row === GRID_ROWS - 1 || col === 0 || col === GRID_COLS - 1) {
        boundary.push(cell);
      } else {
        interior.push(cell);
      }
    }
  }

  shuffle(boundary, random).slice(0, boundaryTarget).forEach((cell) => {
    rows[cell.row][cell.col] = "#";
  });

  let placed = boundaryTarget;
  for (const cell of shuffle(interior, random)) {
    if (placed >= wallTarget) break;
    if (closesTwoByTwo(rows, cell) || wallNeighbors(rows, cell) > 2) continue;
    rows[cell.row][cell.col] = "#";
    placed += 1;
  }

  return rows;
}

function ordinaryCells(rows) {
  const cells = [];
  for (let row = 1; row < GRID_ROWS - 1; row += 1) {
    for (let col = 1; col < GRID_COLS - 1; col += 1) {
      if (rows[row][col] === ".") cells.push({ col, row });
    }
  }
  return cells;
}

function placeMechanics(rows, planet, zone, random) {
  const candidates = shuffle(ordinaryCells(rows), random);
  let cursor = 0;
  const take = () => candidates[cursor++];

  if (planet === 1) {
    const rotatorCount = 2 + Math.floor(zone / 2);
    for (let index = 0; index < rotatorCount; index += 1) {
      const cell = take();
      if (cell) rows[cell.row][cell.col] = "R";
    }
    return;
  }

  const phaseSwitchCount = zone >= 4 ? 2 : 1;
  const phaseACount = 2 + Math.floor(zone / 2);
  const phaseBCount = 2 + Math.floor((zone + 1) / 2);
  for (let index = 0; index < phaseSwitchCount; index += 1) {
    const cell = take();
    if (cell) rows[cell.row][cell.col] = "P";
  }
  for (let index = 0; index < phaseACount; index += 1) {
    const cell = take();
    if (cell) rows[cell.row][cell.col] = "A";
  }
  for (let index = 0; index < phaseBCount; index += 1) {
    const cell = take();
    if (cell) rows[cell.row][cell.col] = "B";
  }
  if (zone >= 3) {
    const rotatorCount = 1 + Math.floor((zone - 3) / 2);
    for (let index = 0; index < rotatorCount; index += 1) {
      const cell = take();
      if (cell) rows[cell.row][cell.col] = "R";
    }
  }
}

function parse(rows) {
  const walls = new Set();
  const rotators = new Set();
  const phaseSwitches = new Set();
  const phaseA = new Set();
  const phaseB = new Set();

  rows.forEach((row, rowIndex) => row.forEach((value, colIndex) => {
    const cell = { col: colIndex, row: rowIndex };
    if (value === "#") walls.add(key(cell));
    if (value === "R") rotators.add(key(cell));
    if (value === "P") phaseSwitches.add(key(cell));
    if (value === "A") phaseA.add(key(cell));
    if (value === "B") phaseB.add(key(cell));
  }));

  return { rows, walls, rotators, phaseSwitches, phaseA, phaseB };
}

function advance(level, state, inputDirection, goal = null) {
  let direction = inputDirection;
  let current = { ...state.cell };
  let moved = false;
  let features = 0;
  let travel = 0;
  const turns = new Set();

  while (true) {
    const vector = VECTOR[direction];
    const next = { col: current.col + vector.col, row: current.row + vector.row };
    if (!inside(next)) return { outcome: "death", travel };
    const nextKey = key(next);
    const phaseSolid =
      (level.phaseA.has(nextKey) && state.phase === 0) ||
      (level.phaseB.has(nextKey) && state.phase === 1);

    if (level.walls.has(nextKey) || phaseSolid) {
      return moved
        ? { outcome: "stop", state: { ...state, cell: current }, features, travel }
        : { outcome: "blocked", travel };
    }

    current = next;
    moved = true;
    travel += 1;

    if (level.phaseA.has(nextKey) && state.phase === 1) features |= FEATURE.phaseGate;

    if (goal && same(current, goal)) {
      return { outcome: "goal", state: { ...state, cell: current }, features, travel };
    }

    if (level.phaseSwitches.has(nextKey)) {
      return {
        outcome: "phase",
        state: { ...state, cell: current, phase: state.phase === 0 ? 1 : 0 },
        features: features | FEATURE.phaseSwitch,
        travel,
      };
    }

    if (level.rotators.has(nextKey)) {
      const turnKey = `${nextKey}|${direction}`;
      if (turns.has(turnKey)) return { outcome: "death", travel };
      turns.add(turnKey);
      features |= FEATURE.rotator;
      direction = CLOCKWISE[direction];
    }
  }
}

function explore(level, start) {
  const initial = { cell: { ...start }, phase: 0, gateOpen: false, brokenMask: 0 };
  const queue = [{ state: initial, distance: 0, used: 0 }];
  const visited = new Map([[stateKey(initial), queue[0]]]);
  let branchStates = 0;

  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    let usefulOptions = 0;
    for (const direction of DIRECTIONS) {
      const plan = advance(level, node.state, direction);
      if (plan.outcome === "death" || plan.outcome === "blocked") continue;
      usefulOptions += 1;
      const nextKey = stateKey(plan.state);
      if (visited.has(nextKey)) continue;
      const nextNode = {
        state: plan.state,
        distance: node.distance + 1,
        used: node.used | plan.features,
      };
      visited.set(nextKey, nextNode);
      queue.push(nextNode);
    }
    if (usefulOptions >= 2) branchStates += 1;
  }

  return { nodes: queue, branchStates };
}

function solve(level, start, goal) {
  const initial = { cell: { ...start }, phase: 0, gateOpen: false, brokenMask: 0 };
  const queue = [{ state: initial, path: [], used: 0 }];
  const visited = new Set([stateKey(initial)]);

  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    for (const direction of DIRECTIONS) {
      const plan = advance(level, node.state, direction, goal);
      if (plan.outcome === "goal") {
        return { path: [...node.path, direction], used: node.used | plan.features };
      }
      if (plan.outcome === "death" || plan.outcome === "blocked") continue;
      const nextKey = stateKey(plan.state);
      if (visited.has(nextKey)) continue;
      visited.add(nextKey);
      queue.push({
        state: plan.state,
        path: [...node.path, direction],
        used: node.used | plan.features,
      });
    }
  }
  return null;
}

function measureSolution(level, start, goal, path) {
  let state = { cell: { ...start }, phase: 0, gateOpen: false, brokenMask: 0 };
  const travel = [];
  for (const direction of path) {
    const plan = advance(level, state, direction, goal);
    if (plan.outcome === "blocked" || plan.outcome === "death") return null;
    travel.push(plan.travel);
    state = plan.state;
    if (plan.outcome === "goal") break;
  }
  return {
    average: travel.reduce((sum, distance) => sum + distance, 0) / travel.length,
    longMoves: travel.filter((distance) => distance >= 4).length,
    longest: Math.max(...travel),
  };
}

function requiredFeatures(planet, zone) {
  if (planet === 1) return FEATURE.rotator;
  return FEATURE.phaseSwitch | FEATURE.phaseGate | (zone >= 3 ? FEATURE.rotator : 0);
}

function generateStage(planet, stageIndex) {
  const target = TARGETS[stageIndex];
  const zone = Math.floor(stageIndex / 5);
  const required = requiredFeatures(planet, zone);
  const minimumNodes = target + 8 + zone * 3;
  const minimumBranches = Math.max(3, zone + 2);

  for (let attempt = 0; attempt < 90000; attempt += 1) {
    const random = rng(0x90a71e + planet * 0x17f31 + stageIndex * 100003 + attempt * 7919);
    const rows = makeArena(random, zone, stageIndex % 5);
    placeMechanics(rows, planet, zone, random);
    const level = parse(rows);
    const starts = shuffle(ordinaryCells(rows), random).slice(0, 18);

    for (const start of starts) {
      const explored = explore(level, start);
      if (explored.nodes.length < minimumNodes || explored.branchStates < minimumBranches) continue;
      const goalCandidates = shuffle(explored.nodes.filter((node) =>
        node.distance === target &&
        (node.used & required) === required &&
        rows[node.state.cell.row][node.state.cell.col] === ".",
      ), random);

      for (const candidate of goalCandidates.slice(0, 14)) {
        const goal = candidate.state.cell;
        if (same(start, goal)) continue;
        const solved = solve(level, start, goal);
        if (!solved || solved.path.length !== target || (solved.used & required) !== required) continue;
        const movement = measureSolution(level, start, goal, solved.path);
        if (!movement) continue;
        const minimumLongMoves = Math.max(2, Math.floor(target * 0.24));
        if (movement.average < 2.7 || movement.longMoves < minimumLongMoves) continue;

        const outputRows = rows.map((row) => [...row]);
        outputRows[start.row][start.col] = "S";
        outputRows[goal.row][goal.col] = "G";
        return {
          id: planet * 30 + stageIndex + 1,
          name: planet === 1 ? GEAR_NAMES[stageIndex] : PHASE_NAMES[stageIndex],
          rows: outputRows.map((row) => row.join("")),
          expectedPar: solved.path.length,
          stats: {
            attempt,
            states: explored.nodes.length,
            branches: explored.branchStates,
            averageTravel: movement.average,
            longMoves: movement.longMoves,
          },
        };
      }
    }
  }
  throw new Error(`Unable to generate planet ${planet + 1} stage ${stageIndex + 1}`);
}

const expansion = [];
for (const planet of [1, 2]) {
  for (let stageIndex = 0; stageIndex < TARGETS.length; stageIndex += 1) {
    const stage = generateStage(planet, stageIndex);
    expansion.push(stage);
    console.error(
      `planet=${planet + 1} map=${String(stageIndex + 1).padStart(2, "0")} par=${stage.expectedPar} avg=${stage.stats.averageTravel.toFixed(1)} states=${stage.stats.states} attempt=${stage.stats.attempt}`,
    );
  }
}

const output = expansion.map(({ id, name, rows, expectedPar }) => ({
  id,
  name,
  rows,
  expectedPar,
}));

console.log(`export const EXPANSION_ROWS = ${JSON.stringify(output, null, 2)};`);
