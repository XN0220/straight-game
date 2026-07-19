const GRID_COLS = 23;
const GRID_ROWS = 15;
const DIRECTIONS = ["up", "down", "left", "right"];
const VECTOR = {
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
};

const targets = [
  8, 9, 10, 11, 12,
  12, 13, 14, 15, 16,
  16, 17, 18, 19, 20,
  20, 21, 22, 23, 24,
  24, 25, 26, 27, 28,
  28, 29, 30, 32, 34,
];

const names = [
  "첫 추진", "모서리 수업", "네 번의 선택", "긴 복도", "기본 시험",
  "가짜 출구", "돌아가는 답", "닿을 듯 먼 곳", "엇갈린 선택", "미끼의 방",
  "화살표 입문", "역방향 금지", "일방통행", "교차 신호", "화살표 심판",
  "첫 워프", "뒤집힌 거리", "쌍둥이 문", "먼 곳의 지름길", "워프 회로",
  "스위치 온", "닫힌 문", "먼저 돌아가기", "두 번의 회귀", "게이트 코어",
  "금 간 벽", "부수고 돌아서", "혼합 회로", "마지막 함정", "직선의 끝",
];

const FEATURE = {
  oneWay: 1,
  portal: 2,
  switch: 4,
  gate: 8,
  break: 16,
  brokenPass: 32,
};

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
const stateKey = (state) => `${state.cell.col},${state.cell.row}|${state.gateOpen ? 1 : 0}|${state.brokenMask}`;
const same = (a, b) => a.col === b.col && a.row === b.row;
const inside = (cell) => cell.col >= 0 && cell.col < GRID_COLS && cell.row >= 0 && cell.row < GRID_ROWS;

const WALL_TARGETS = [102, 88, 74, 72, 76, 82];
const BOUNDARY_TARGETS = [46, 40, 34, 32, 34, 36];

function wallNeighbors(rows, cell) {
  let count = 0;
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) continue;
      const row = cell.row + rowOffset;
      const col = cell.col + colOffset;
      if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS && rows[row][col] === "#") {
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

// 열린 보드에 듬성듬성 놓인 '정지 블록'으로 직선 이동 퍼즐을 만듭니다.
// 벽으로 복도를 파는 미로와 달리, 플레이어가 긴 직선을 읽고 다음 정지점을 고르게 합니다.
function makeSparseArena(random, group, stageInGroup) {
  const rows = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill("."));
  const wallTarget = WALL_TARGETS[group] - Math.min(stageInGroup, 3) * 2;
  const boundaryTarget = BOUNDARY_TARGETS[group] - Math.min(stageInGroup, 2);
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

  // 경계에는 안전한 정지점과 죽는 틈을 모두 남깁니다.
  shuffle(boundary, random).slice(0, boundaryTarget).forEach((cell) => {
    rows[cell.row][cell.col] = "#";
  });

  let placed = boundaryTarget;
  for (const cell of shuffle(interior, random)) {
    if (placed >= wallTarget) break;
    if (closesTwoByTwo(rows, cell)) continue;
    const neighborLimit = group <= 1 ? 3 : 2;
    if (wallNeighbors(rows, cell) > neighborLimit) continue;
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

function placeMechanics(rows, group, random) {
  const candidates = shuffle(ordinaryCells(rows), random);
  let cursor = 0;
  const take = () => candidates[cursor++];

  if (group >= 2) {
    const arrows = ["^", "v", "<", ">"];
    const count = 3 + Math.min(3, group - 2);
    for (let index = 0; index < count; index += 1) {
      const cell = take();
      if (cell) rows[cell.row][cell.col] = arrows[Math.floor(random() * arrows.length)];
    }
  }

  if (group >= 3) {
    const first = take();
    const second = take();
    if (first && second) {
      rows[first.row][first.col] = "T";
      rows[second.row][second.col] = "T";
    }
  }

  if (group >= 4) {
    const gate = take();
    const switchCell = take();
    if (gate && switchCell) {
      rows[gate.row][gate.col] = "X";
      rows[switchCell.row][switchCell.col] = "O";
    }
  }

  if (group >= 5) {
    const count = 2;
    for (let index = 0; index < count; index += 1) {
      const cell = take();
      if (cell) rows[cell.row][cell.col] = "F";
    }
  }
}

function parse(rows) {
  const walls = new Set();
  const gates = new Set();
  const switches = new Set();
  const oneWays = new Map();
  const portals = [];
  const fragile = [];

  rows.forEach((row, rowIndex) => row.forEach((value, colIndex) => {
    const cell = { col: colIndex, row: rowIndex };
    if (value === "#") walls.add(key(cell));
    if (value === "X") gates.add(key(cell));
    if (value === "O") switches.add(key(cell));
    if (["^", "v", "<", ">"].includes(value)) oneWays.set(key(cell), value);
    if (value === "T") portals.push(cell);
    if (value === "F") fragile.push(cell);
  }));

  return { rows, walls, gates, switches, oneWays, portals, fragile };
}

function arrowAllows(symbol, direction) {
  return (symbol === "^" && direction === "up") ||
    (symbol === "v" && direction === "down") ||
    (symbol === "<" && direction === "left") ||
    (symbol === ">" && direction === "right");
}

function advance(level, state, direction, goal = null) {
  const vector = VECTOR[direction];
  let current = { ...state.cell };
  let moved = false;
  let features = 0;
  let travel = 0;

  while (true) {
    const next = { col: current.col + vector.col, row: current.row + vector.row };
    if (!inside(next)) return { outcome: "death", travel };
    const nextKey = key(next);

    if (level.walls.has(nextKey) || (level.gates.has(nextKey) && !state.gateOpen)) {
      return moved
        ? { outcome: "stop", state: { ...state, cell: current }, features, travel }
        : { outcome: "blocked", travel };
    }

    const fragileIndex = level.fragile.findIndex((cell) => same(cell, next));
    if (fragileIndex >= 0 && (state.brokenMask & (1 << fragileIndex)) === 0) {
      return {
        outcome: "break",
        state: { ...state, cell: current, brokenMask: state.brokenMask | (1 << fragileIndex) },
        features: features | FEATURE.break,
        travel,
      };
    }

    const oneWay = level.oneWays.get(nextKey);
    if (oneWay && !arrowAllows(oneWay, direction)) {
      return moved
        ? { outcome: "stop", state: { ...state, cell: current }, features, travel }
        : { outcome: "blocked", travel };
    }

    current = next;
    moved = true;
    travel += 1;
    if (oneWay) features |= FEATURE.oneWay;
    if (level.gates.has(nextKey) && state.gateOpen) features |= FEATURE.gate;
    if (fragileIndex >= 0) features |= FEATURE.brokenPass;

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

    const portalIndex = level.portals.findIndex((cell) => same(cell, current));
    if (portalIndex >= 0 && level.portals.length === 2) {
      return {
        outcome: "portal",
        state: { ...state, cell: { ...level.portals[portalIndex === 0 ? 1 : 0] } },
        features: features | FEATURE.portal,
        travel,
      };
    }
  }
}

function measureSolution(level, start, goal, path) {
  let state = { cell: { ...start }, gateOpen: false, brokenMask: 0 };
  const travel = [];
  for (const direction of path) {
    const plan = advance(level, state, direction, goal);
    if (["blocked", "death"].includes(plan.outcome)) return null;
    travel.push(plan.travel);
    if (plan.outcome === "goal") break;
    state = plan.state;
  }
  return {
    average: travel.reduce((sum, distance) => sum + distance, 0) / travel.length,
    longMoves: travel.filter((distance) => distance >= 4).length,
    longest: Math.max(...travel),
  };
}

function explore(level, start) {
  const initial = { cell: { ...start }, gateOpen: false, brokenMask: 0 };
  const queue = [{ state: initial, distance: 0, used: 0 }];
  const visited = new Map([[stateKey(initial), queue[0]]]);
  let branchStates = 0;
  let deadlyChoices = 0;

  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    let usefulOptions = 0;
    for (const direction of DIRECTIONS) {
      const plan = advance(level, node.state, direction);
      if (plan.outcome === "death") {
        deadlyChoices += 1;
        continue;
      }
      if (plan.outcome === "blocked") continue;
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

  return { nodes: queue, branchStates, deadlyChoices };
}

function solve(level, start, goal) {
  const initial = { cell: { ...start }, gateOpen: false, brokenMask: 0 };
  const queue = [{ state: initial, path: [], used: 0 }];
  const visited = new Set([stateKey(initial)]);

  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    for (const direction of DIRECTIONS) {
      const plan = advance(level, node.state, direction, goal);
      if (plan.outcome === "goal") {
        return { path: [...node.path, direction], used: node.used | plan.features };
      }
      if (["blocked", "death"].includes(plan.outcome)) continue;
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

function requiredFeatures(group) {
  if (group === 2) return FEATURE.oneWay;
  if (group === 3) return FEATURE.oneWay | FEATURE.portal;
  if (group === 4) return FEATURE.oneWay | FEATURE.portal | FEATURE.switch | FEATURE.gate;
  if (group === 5) return FEATURE.oneWay | FEATURE.portal | FEATURE.switch | FEATURE.gate | FEATURE.break | FEATURE.brokenPass;
  return 0;
}

function generateStage(stageIndex) {
  const target = targets[stageIndex];
  const group = Math.floor(stageIndex / 5);
  const required = requiredFeatures(group);
  const minimumNodes = target + 10 + group * 4;
  const minimumBranches = Math.max(3, group + 3);

  for (let attempt = 0; attempt < 70000; attempt += 1) {
    const random = rng(0x51f15e + stageIndex * 100003 + attempt * 7919);
    const rows = makeSparseArena(random, group, stageIndex % 5);
    placeMechanics(rows, group, random);
    const level = parse(rows);
    const starts = shuffle(ordinaryCells(rows), random).slice(0, 14);

    for (const start of starts) {
      const explored = explore(level, start);
      if (explored.nodes.length < minimumNodes || explored.branchStates < minimumBranches) continue;
      const goalCandidates = shuffle(explored.nodes.filter((node) =>
        node.distance === target &&
        (node.used & required) === required &&
        rows[node.state.cell.row][node.state.cell.col] === ".",
      ), random);

      for (const candidate of goalCandidates.slice(0, 12)) {
        const goal = candidate.state.cell;
        if (same(start, goal)) continue;
        const solved = solve(level, start, goal);
        if (!solved || solved.path.length !== target || (solved.used & required) !== required) continue;
        const movement = measureSolution(level, start, goal, solved.path);
        if (!movement) continue;
        const minimumLongMoves = Math.max(3, Math.floor(target * 0.3));
        if (movement.average < 3 || movement.longMoves < minimumLongMoves) continue;

        const outputRows = rows.map((row) => [...row]);
        outputRows[start.row][start.col] = "S";
        outputRows[goal.row][goal.col] = "G";
        return {
          id: stageIndex + 1,
          name: names[stageIndex],
          rows: outputRows.map((row) => row.join("")),
          par: solved.path.length,
          solution: solved.path,
          stats: {
            states: explored.nodes.length,
            branches: explored.branchStates,
            deadlyChoices: explored.deadlyChoices,
            averageTravel: movement.average,
            longMoves: movement.longMoves,
            longestTravel: movement.longest,
            attempt,
          },
        };
      }
    }
  }
  throw new Error(`Unable to generate stage ${stageIndex + 1}`);
}

const campaign = [];
for (let index = 0; index < targets.length; index += 1) {
  const stage = generateStage(index);
  campaign.push(stage);
  console.error(
    `stage ${String(stage.id).padStart(2, "0")} par=${stage.par} walls=${stage.rows.join("").split("#").length - 1} avg=${stage.stats.averageTravel.toFixed(1)} long=${stage.stats.longMoves} max=${stage.stats.longestTravel} states=${stage.stats.states} branches=${stage.stats.branches} attempt=${stage.stats.attempt}`,
  );
}

const campaignRows = campaign.map(({ id, name, rows, par }) => ({
  id,
  name,
  rows,
  expectedPar: par,
}));

console.log(`export const CAMPAIGN_ROWS = ${JSON.stringify(campaignRows, null, 2)};`);
