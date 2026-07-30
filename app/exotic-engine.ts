export type ExoticWorldId =
  | "overlay_dimension"
  | "echo_galaxy"
  | "eclipse_planet"
  | "gravity_core"
  | "mobius_corridor";

export type GridDirection = "up" | "down" | "left" | "right";
export type ExoticAction = GridDirection | "shift";
export type GridCell = { col: number; row: number };

export type ExoticWorld = {
  id: ExoticWorldId;
  name: string;
  english: string;
  description: string;
  tutorial: string;
  accent: string;
  icon: string;
};

export type ExoticStage = {
  id: number;
  worldId: ExoticWorldId;
  cols: number;
  rows: number;
  start: GridCell;
  echoStart: GridCell | null;
  goal: GridCell;
  echoGoal: GridCell | null;
  walls: GridCell[];
  altWalls: GridCell[];
  shiftCells: GridCell[];
  phaseWalls: GridCell[];
  gravityBlocks: GridCell[];
  keyCell: GridCell | null;
  startPhase: 0 | 1;
  verticalWrap: boolean;
  par: number;
  solution: ExoticAction[];
  exploredStates: number;
  usesCoreRule: boolean;
  auxiliaryMechanics: Array<"key-door">;
  generationAttempt: number;
};

export type ExoticRunState = {
  player: GridCell;
  echo: GridCell | null;
  echoDone: boolean;
  dimension: 0 | 1;
  phase: 0 | 1;
  previous: GridDirection | null;
  blocks: GridCell[];
  hasKey: boolean;
  usedCoreRule: boolean;
};

export type ExoticStep = {
  state: ExoticRunState;
  changed: boolean;
  complete: boolean;
  playerPath: GridCell[];
  echoPath: GridCell[];
};

export const EXOTIC_WORLDS: ExoticWorld[] = [
  {
    id: "overlay_dimension",
    name: "중첩차원",
    english: "OVERLAY DIMENSION",
    description: "두 세계를 전환하며 길을 찾으세요.",
    tutorial:
      "빛나는 전환 지점에서 차원 전환을 누르세요. 좌표는 그대로지만 벽과 통로가 바뀝니다.",
    accent: "#4f8cff",
    icon: "▣",
  },
  {
    id: "echo_galaxy",
    name: "잔상은하",
    english: "ECHO GALAXY",
    description: "이전 움직임을 따라오는 잔상을 조종하세요.",
    tutorial:
      "본체는 현재 입력을, 잔상은 직전 입력을 수행합니다. 첫 입력에서는 잔상이 기다립니다.",
    accent: "#ff5fb7",
    icon: "◉",
  },
  {
    id: "eclipse_planet",
    name: "일식행성",
    english: "ECLIPSE PLANET",
    description: "이동할 때마다 바뀌는 낮과 밤을 계산하세요.",
    tutorial:
      "한 번의 이동이 끝날 때마다 낮과 밤이 바뀝니다. 해·달 무늬 벽은 해당 상태에서만 단단합니다.",
    accent: "#ffb52e",
    icon: "◐",
  },
  {
    id: "gravity_core",
    name: "중력핵 행성",
    english: "GRAVITY CORE",
    description: "모든 물체가 함께 움직이는 경로를 만드세요.",
    tutorial:
      "방향을 입력하면 캐릭터와 이동 블록이 동시에 미끄러집니다. 블록을 새로운 정지점으로 활용하세요.",
    accent: "#57df8b",
    icon: "✣",
  },
  {
    id: "mobius_corridor",
    name: "뫼비우스 회랑",
    english: "MOBIUS CORRIDOR",
    description: "뒤집혀 연결되는 공간을 이용하세요.",
    tutorial:
      "좌우 가장자리는 세로 좌표가 뒤집힌 채 이어집니다. 빛나는 가장자리의 대응 위치를 확인하세요.",
    accent: "#b77cff",
    icon: "∞",
  },
];

const DIRECTIONS: GridDirection[] = ["up", "down", "left", "right"];
const VECTOR: Record<GridDirection, GridCell> = {
  up: { col: 0, row: -1 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
};

export function gridCellKey(cell: GridCell) {
  return `${cell.col},${cell.row}`;
}

function sameCell(a: GridCell, b: GridCell) {
  return a.col === b.col && a.row === b.row;
}

function cloneState(state: ExoticRunState): ExoticRunState {
  return {
    ...state,
    player: { ...state.player },
    echo: state.echo ? { ...state.echo } : null,
    blocks: state.blocks.map((cell) => ({ ...cell })),
  };
}

function inside(stage: ExoticStage, cell: GridCell) {
  return cell.col >= 0 && cell.col < stage.cols && cell.row >= 0 && cell.row < stage.rows;
}

function activeWallKeys(stage: ExoticStage, state: ExoticRunState) {
  const cells = [...stage.walls];
  if (stage.worldId === "overlay_dimension" && state.dimension === 1) {
    cells.splice(0, cells.length, ...stage.altWalls);
  }
  if (stage.worldId === "eclipse_planet" && state.phase === 1) {
    cells.push(...stage.phaseWalls);
  }
  const keys = new Set(cells.map(gridCellKey));
  // 상태 전환 직후 캐릭터가 선 위치에는 벽이 겹쳐 생성되지 않고,
  // 캐릭터가 떠난 다음 입력부터 해당 상태 벽으로 작동합니다.
  if (stage.worldId === "eclipse_planet") keys.delete(gridCellKey(state.player));
  return keys;
}

function collectKey(stage: ExoticStage, state: ExoticRunState, cell: GridCell) {
  if (stage.keyCell && sameCell(stage.keyCell, cell)) state.hasKey = true;
}

function goalOpen(stage: ExoticStage, state: ExoticRunState) {
  return stage.keyCell === null || state.hasKey;
}

function nextMobiusCell(
  stage: ExoticStage,
  cell: GridCell,
  direction: GridDirection,
) {
  const vector = VECTOR[direction];
  const next = { col: cell.col + vector.col, row: cell.row + vector.row };
  let wrapped = false;
  if (next.col < 0 || next.col >= stage.cols) {
    next.col = next.col < 0 ? stage.cols - 1 : 0;
    next.row = stage.rows - 1 - cell.row;
    wrapped = true;
  } else if (stage.verticalWrap && (next.row < 0 || next.row >= stage.rows)) {
    next.row = next.row < 0 ? stage.rows - 1 : 0;
    next.col = stage.cols - 1 - cell.col;
    wrapped = true;
  }
  return { next, wrapped };
}

function slideOne(
  stage: ExoticStage,
  state: ExoticRunState,
  from: GridCell,
  direction: GridDirection,
  fixed = false,
) {
  if (fixed) return { destination: { ...from }, path: [] as GridCell[], wrapped: false };
  const walls = activeWallKeys(stage, state);
  let current = { ...from };
  const path: GridCell[] = [];
  let wrapped = false;
  const visited = new Set([gridCellKey(current)]);

  for (let guard = 0; guard < stage.cols * stage.rows * 2; guard += 1) {
    const candidate =
      stage.worldId === "mobius_corridor"
        ? nextMobiusCell(stage, current, direction)
        : {
            next: {
              col: current.col + VECTOR[direction].col,
              row: current.row + VECTOR[direction].row,
            },
            wrapped: false,
          };
    if (!inside(stage, candidate.next) || walls.has(gridCellKey(candidate.next))) break;
    current = candidate.next;
    path.push({ ...current });
    wrapped ||= candidate.wrapped;
    collectKey(stage, state, current);
    if (sameCell(current, stage.goal) && goalOpen(stage, state)) break;
    const key = gridCellKey(current);
    if (visited.has(key)) break;
    visited.add(key);
  }
  return { destination: current, path, wrapped };
}

function settleGravityLine(
  stage: ExoticStage,
  state: ExoticRunState,
  direction: GridDirection,
) {
  const walls = new Set(stage.walls.map(gridCellKey));
  const mobiles = [
    { kind: "player" as const, cell: state.player },
    ...state.blocks.map((cell, index) => ({ kind: index, cell })),
  ];
  const horizontal = direction === "left" || direction === "right";
  const descending = direction === "right" || direction === "down";
  const groups = new Map<number, typeof mobiles>();
  mobiles.forEach((mobile) => {
    const axis = horizontal ? mobile.cell.row : mobile.cell.col;
    groups.set(axis, [...(groups.get(axis) ?? []), mobile]);
  });

  let player = { ...state.player };
  const blocks = state.blocks.map((cell) => ({ ...cell }));
  let movedBlock = false;

  groups.forEach((line) => {
    line.sort((a, b) => {
      const av = horizontal ? a.cell.col : a.cell.row;
      const bv = horizontal ? b.cell.col : b.cell.row;
      return descending ? bv - av : av - bv;
    });
    const occupied = new Set<string>();
    line.forEach((mobile) => {
      let current = { ...mobile.cell };
      for (;;) {
        const next = {
          col: current.col + VECTOR[direction].col,
          row: current.row + VECTOR[direction].row,
        };
        if (!inside(stage, next) || walls.has(gridCellKey(next)) || occupied.has(gridCellKey(next))) break;
        current = next;
      }
      occupied.add(gridCellKey(current));
      if (mobile.kind === "player") player = current;
      else {
        movedBlock ||= !sameCell(blocks[mobile.kind], current);
        blocks[mobile.kind] = current;
      }
    });
  });

  state.player = player;
  state.blocks = blocks;
  collectKey(stage, state, player);
  return movedBlock;
}

export function initialExoticState(stage: ExoticStage): ExoticRunState {
  return {
    player: { ...stage.start },
    echo: stage.echoStart ? { ...stage.echoStart } : null,
    echoDone: false,
    dimension: 0,
    phase: stage.startPhase,
    previous: null,
    blocks: stage.gravityBlocks.map((cell) => ({ ...cell })),
    hasKey: false,
    usedCoreRule: false,
  };
}

export function exoticComplete(stage: ExoticStage, state: ExoticRunState) {
  if (!goalOpen(stage, state) || !sameCell(state.player, stage.goal)) return false;
  if (stage.worldId === "echo_galaxy") return state.echoDone;
  return state.usedCoreRule;
}

export function exoticStep(
  stage: ExoticStage,
  source: ExoticRunState,
  action: ExoticAction,
): ExoticStep {
  const state = cloneState(source);
  const playerPath: GridCell[] = [];
  const echoPath: GridCell[] = [];

  if (action === "shift") {
    if (
      stage.worldId !== "overlay_dimension" ||
      !stage.shiftCells.some((cell) => sameCell(cell, state.player))
    ) {
      return { state, changed: false, complete: false, playerPath, echoPath };
    }
    state.dimension = state.dimension === 0 ? 1 : 0;
    state.usedCoreRule = true;
    return {
      state,
      changed: true,
      complete: exoticComplete(stage, state),
      playerPath,
      echoPath,
    };
  }

  if (stage.worldId === "gravity_core") {
    const before = JSON.stringify(state);
    const movedBlock = settleGravityLine(stage, state, action);
    state.usedCoreRule ||= movedBlock;
    const changed = before !== JSON.stringify(state);
    return { state, changed, complete: exoticComplete(stage, state), playerPath, echoPath };
  }

  if (stage.worldId === "echo_galaxy") {
    const playerMove = slideOne(stage, state, state.player, action);
    state.player = playerMove.destination;
    playerPath.push(...playerMove.path);
    collectKey(stage, state, state.player);
    if (state.previous && state.echo && !state.echoDone) {
      const echoMove = slideOne(stage, state, state.echo, state.previous);
      state.echo = echoMove.destination;
      echoPath.push(...echoMove.path);
      if (stage.echoGoal && sameCell(state.echo, stage.echoGoal)) state.echoDone = true;
      state.usedCoreRule = true;
    }
    state.previous = action;
    const changed =
      playerPath.length > 0 || echoPath.length > 0 || source.previous !== state.previous;
    return { state, changed, complete: exoticComplete(stage, state), playerPath, echoPath };
  }

  const move = slideOne(stage, state, state.player, action);
  state.player = move.destination;
  playerPath.push(...move.path);
  collectKey(stage, state, state.player);
  if (stage.worldId === "eclipse_planet") {
    state.phase = state.phase === 0 ? 1 : 0;
    state.usedCoreRule = true;
  }
  if (stage.worldId === "mobius_corridor" && move.wrapped) state.usedCoreRule = true;
  const changed = playerPath.length > 0 || stage.worldId === "eclipse_planet";
  return { state, changed, complete: exoticComplete(stage, state), playerPath, echoPath };
}

function stateKey(stage: ExoticStage, state: ExoticRunState) {
  return [
    gridCellKey(state.player),
    state.echo ? gridCellKey(state.echo) : "-",
    state.echoDone ? 1 : 0,
    state.dimension,
    state.phase,
    state.previous ?? "-",
    state.blocks.map(gridCellKey).sort().join(";"),
    state.hasKey ? 1 : 0,
    state.usedCoreRule ? 1 : 0,
  ].join("|");
}

export function solveExoticStage(stage: ExoticStage, depthLimit = 36) {
  const initial = initialExoticState(stage);
  const actions: ExoticAction[] =
    stage.worldId === "overlay_dimension" ? [...DIRECTIONS, "shift"] : DIRECTIONS;
  const queue: Array<{ state: ExoticRunState; path: ExoticAction[] }> = [
    { state: initial, path: [] },
  ];
  const visited = new Set([stateKey(stage, initial)]);
  let cursor = 0;

  while (cursor < queue.length && visited.size < 90000) {
    const current = queue[cursor++];
    if (current.path.length >= depthLimit) continue;
    for (const action of actions) {
      const step = exoticStep(stage, current.state, action);
      if (!step.changed) continue;
      const path = [...current.path, action];
      if (step.complete) {
        return { path, exploredStates: visited.size, usesCoreRule: step.state.usedCoreRule };
      }
      const key = stateKey(stage, step.state);
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

function stageBand(id: number) {
  if (id <= 5) return { cols: 4, rows: 4, min: 2, max: 5, density: 0.13 };
  if (id <= 10) return { cols: 5, rows: 5, min: 5, max: 9, density: 0.18 };
  if (id <= 15) return { cols: 6, rows: 6, min: 7, max: 12, density: 0.2 };
  if (id <= 20) return { cols: 6, rows: 6, min: 10, max: 17, density: 0.23 };
  if (id <= 25) return { cols: 7, rows: 7, min: 13, max: 20, density: 0.25 };
  if (id < 30) return { cols: 7, rows: 7, min: 16, max: 27, density: 0.27 };
  return { cols: 7, rows: 7, min: 18, max: 32, density: 0.28 };
}

function sampleCell(
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
    const key = gridCellKey(cell);
    if (!used.has(key)) {
      used.add(key);
      return cell;
    }
  }
}

function randomWalls(
  random: () => number,
  cols: number,
  rows: number,
  density: number,
  used: Set<string>,
) {
  const walls: GridCell[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cell = { col, row };
      if (!used.has(gridCellKey(cell)) && random() < density) walls.push(cell);
    }
  }
  return walls;
}

function makeCandidate(worldId: ExoticWorldId, id: number, attempt: number): ExoticStage {
  const band = stageBand(id);
  const random = mulberry32((id * 99991 + attempt * 104729 + EXOTIC_WORLDS.findIndex((w) => w.id === worldId) * 7879) >>> 0);
  const used = new Set<string>();
  const start = sampleCell(random, band.cols, band.rows, used);
  const goal = sampleCell(random, band.cols, band.rows, used);
  const keyCell = id >= 11 ? sampleCell(random, band.cols, band.rows, used) : null;
  const echoStart = worldId === "echo_galaxy" ? sampleCell(random, band.cols, band.rows, used) : null;
  const echoGoal = worldId === "echo_galaxy" ? sampleCell(random, band.cols, band.rows, used) : null;
  const gravityBlocks =
    worldId === "gravity_core"
      ? Array.from({ length: Math.min(id <= 5 ? 1 : id <= 15 ? 2 : 3, 3) }, () =>
          sampleCell(random, band.cols, band.rows, used),
        )
      : [];
  const shiftCells =
    worldId === "overlay_dimension"
      ? Array.from({ length: id <= 5 ? 2 : 3 }, () =>
          sampleCell(random, band.cols, band.rows, used),
        )
      : [];
  const walls = randomWalls(random, band.cols, band.rows, band.density, used);
  const altUsed = new Set(
    [start, goal, ...(keyCell ? [keyCell] : []), ...shiftCells].map(gridCellKey),
  );
  const altWalls =
    worldId === "overlay_dimension"
      ? randomWalls(random, band.cols, band.rows, band.density, altUsed)
      : [];
  const phaseUsed = new Set(
    [start, goal, ...(keyCell ? [keyCell] : [])].map(gridCellKey),
  );
  const phaseWalls =
    worldId === "eclipse_planet"
      ? randomWalls(random, band.cols, band.rows, Math.max(0.08, band.density * 0.55), phaseUsed)
      : [];

  return {
    id,
    worldId,
    cols: band.cols,
    rows: band.rows,
    start,
    echoStart,
    goal,
    echoGoal,
    walls,
    altWalls,
    shiftCells,
    phaseWalls,
    gravityBlocks,
    keyCell,
    startPhase: (id % 2) as 0 | 1,
    verticalWrap: worldId === "mobius_corridor" && id >= 16,
    par: 0,
    solution: [],
    exploredStates: 0,
    usesCoreRule: false,
    auxiliaryMechanics: keyCell ? ["key-door"] : [],
    generationAttempt: attempt,
  };
}

function relaxedBand(worldId: ExoticWorldId, id: number) {
  const band = stageBand(id);
  const pressure =
    id >= 21
      ? 0
      : worldId === "gravity_core"
        ? 5
        : worldId === "echo_galaxy"
          ? 3
          : 0;
  return {
    min: Math.max(2, band.min - pressure),
    max: band.max,
  };
}

const PRESET_ATTEMPTS: Record<ExoticWorldId, number[]> = {
  overlay_dimension: [
    1, 1, 1, 2, 2, 8, 0, 0, 1, 2, 2, 0, 2, 3, 5, 31, 3, 6, 1, 1, 23, 9, 13, 1, 10,
    40, 30, 72, 4, 183,
  ],
  echo_galaxy: [
    4, 4, 4, 2, 1, 0, 0, 1, 0, 4, 6, 0, 2, 5, 1, 17, 5, 13, 26, 19, 217, 11, 106, 128,
    61, 512, 330, 856, 260, 485,
  ],
  eclipse_planet: [
    1, 0, 0, 0, 0, 2, 25, 7, 24, 6, 12, 5, 0, 12, 0, 43, 1, 30, 12, 1, 44, 37, 10, 75, 7,
    237, 287, 352, 11, 433,
  ],
  gravity_core: [
    0, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 2, 0, 1, 2, 5, 0, 0, 0, 2, 7, 4, 2, 4, 1, 3, 1, 17, 11,
    1,
  ],
  mobius_corridor: [
    0, 0, 0, 0, 1, 4, 11, 21, 30, 6, 19, 29, 0, 5, 20, 299, 98, 693, 37, 9, 241, 423, 857,
    1323, 1208, 1729, 4395, 727, 784, 7745,
  ],
};

function generateStage(worldId: ExoticWorldId, id: number): ExoticStage {
  const target = relaxedBand(worldId, id);
  const attempt = PRESET_ATTEMPTS[worldId][id - 1];
  const stage = makeCandidate(worldId, id, attempt);
  const solution = solveExoticStage(stage, target.max);
  if (
    !solution ||
    solution.path.length < target.min ||
    solution.path.length > target.max ||
    !solution.usesCoreRule
  ) {
    throw new Error(`${worldId} ${id}단계 고정 시드 검증에 실패했습니다.`);
  }
  stage.par = solution.path.length;
  stage.solution = solution.path;
  stage.exploredStates = solution.exploredStates;
  stage.usesCoreRule = solution.usesCoreRule;
  return stage;
}

export const EXOTIC_STAGES: Record<ExoticWorldId, ExoticStage[]> =
  Object.fromEntries(
    EXOTIC_WORLDS.map((world) => [
      world.id,
      Array.from({ length: 30 }, (_, index) => generateStage(world.id, index + 1)),
    ]),
  ) as Record<ExoticWorldId, ExoticStage[]>;

Object.values(EXOTIC_STAGES).flat().forEach((stage) => {
  const verified = solveExoticStage(stage, stage.par);
  if (!verified || verified.path.length !== stage.par || !verified.usesCoreRule) {
    throw new Error(`${stage.worldId} ${stage.id}단계 자동 검증에 실패했습니다.`);
  }
  if (stage.auxiliaryMechanics.length > 2) {
    throw new Error(`${stage.worldId} ${stage.id}단계 보조 기믹 종류 수가 2를 초과했습니다.`);
  }
});
