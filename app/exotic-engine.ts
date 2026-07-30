export type ExoticWorldId =
  | "overlay_dimension"
  | "echo_galaxy"
  | "eclipse_planet"
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
  keyCell: GridCell | null;
  startPhase: 0 | 1;
  verticalWrap: boolean;
  par: number;
  auxiliaryMechanics: Array<"key-door">;
};

export type ExoticRunState = {
  player: GridCell;
  playerDone: boolean;
  echo: GridCell | null;
  echoDone: boolean;
  dimension: 0 | 1;
  phase: 0 | 1;
  previous: GridDirection | null;
  hasKey: boolean;
  usedCoreRule: boolean;
};

export type ExoticStep = {
  state: ExoticRunState;
  changed: boolean;
  complete: boolean;
  dead: boolean;
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
  target: GridCell,
  fixed = false,
) {
  if (fixed) {
    return {
      destination: { ...from },
      path: [] as GridCell[],
      wrapped: false,
      dead: false,
      usedPhaseWall: false,
    };
  }
  const walls = activeWallKeys(stage, state);
  const phaseWallKeys = new Set(stage.phaseWalls.map(gridCellKey));
  let current = { ...from };
  const path: GridCell[] = [];
  let wrapped = false;
  let usedPhaseWall = false;
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
    if (!inside(stage, candidate.next)) {
      return { destination: current, path, wrapped, dead: true, usedPhaseWall };
    }
    const nextKey = gridCellKey(candidate.next);
    if (walls.has(nextKey)) {
      usedPhaseWall ||= stage.worldId === "eclipse_planet" && phaseWallKeys.has(nextKey);
      break;
    }
    current = candidate.next;
    path.push({ ...current });
    wrapped ||= candidate.wrapped;
    usedPhaseWall ||= stage.worldId === "eclipse_planet" && phaseWallKeys.has(nextKey);
    collectKey(stage, state, current);
    if (sameCell(current, target) && (target !== stage.goal || goalOpen(stage, state))) break;
    const key = gridCellKey(current);
    if (visited.has(key)) {
      return { destination: current, path, wrapped, dead: true, usedPhaseWall };
    }
    visited.add(key);
  }
  return { destination: current, path, wrapped, dead: false, usedPhaseWall };
}

export function initialExoticState(stage: ExoticStage): ExoticRunState {
  return {
    player: { ...stage.start },
    playerDone: false,
    echo: stage.echoStart ? { ...stage.echoStart } : null,
    echoDone: false,
    dimension: 0,
    phase: stage.startPhase,
    previous: null,
    hasKey: false,
    usedCoreRule: false,
  };
}

export function exoticComplete(stage: ExoticStage, state: ExoticRunState) {
  if (!goalOpen(stage, state) || !state.playerDone) return false;
  if (stage.worldId === "echo_galaxy") return state.echoDone && state.usedCoreRule;
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
      return { state, changed: false, complete: false, dead: false, playerPath, echoPath };
    }
    state.dimension = state.dimension === 0 ? 1 : 0;
    return {
      state,
      changed: true,
      complete: exoticComplete(stage, state),
      dead: false,
      playerPath,
      echoPath,
    };
  }

  if (stage.worldId === "echo_galaxy") {
    const playerMove = slideOne(stage, state, state.player, action, stage.goal, state.playerDone);
    if (playerMove.dead) {
      return { state, changed: true, complete: false, dead: true, playerPath, echoPath };
    }
    state.player = playerMove.destination;
    playerPath.push(...playerMove.path);
    collectKey(stage, state, state.player);
    if (sameCell(state.player, stage.goal) && goalOpen(stage, state)) state.playerDone = true;
    if (state.previous && state.echo && !state.echoDone) {
      const echoMove = slideOne(
        stage,
        state,
        state.echo,
        state.previous,
        stage.echoGoal ?? stage.goal,
      );
      if (echoMove.dead) {
        return { state, changed: true, complete: false, dead: true, playerPath, echoPath };
      }
      state.echo = echoMove.destination;
      echoPath.push(...echoMove.path);
      if (stage.echoGoal && sameCell(state.echo, stage.echoGoal)) state.echoDone = true;
      state.usedCoreRule ||= echoMove.path.length > 0;
    }
    state.previous = action;
    const changed =
      playerPath.length > 0 || echoPath.length > 0 || source.previous !== state.previous;
    return {
      state,
      changed,
      complete: exoticComplete(stage, state),
      dead: false,
      playerPath,
      echoPath,
    };
  }

  const comparison =
    stage.worldId === "overlay_dimension"
      ? slideOne(
          stage,
          { ...cloneState(state), dimension: state.dimension === 0 ? 1 : 0 },
          state.player,
          action,
          stage.goal,
          state.playerDone,
        )
      : null;
  const move = slideOne(stage, state, state.player, action, stage.goal, state.playerDone);
  if (move.dead) {
    return { state, changed: true, complete: false, dead: true, playerPath, echoPath };
  }
  state.player = move.destination;
  playerPath.push(...move.path);
  collectKey(stage, state, state.player);
  if (sameCell(state.player, stage.goal) && goalOpen(stage, state)) state.playerDone = true;
  if (
    comparison &&
    (comparison.dead !== move.dead ||
      !sameCell(comparison.destination, move.destination) ||
      comparison.path.length !== move.path.length)
  ) {
    state.usedCoreRule = true;
  }
  if (stage.worldId === "eclipse_planet" && playerPath.length > 0) {
    state.usedCoreRule ||= move.usedPhaseWall;
    state.phase = state.phase === 0 ? 1 : 0;
  }
  if (stage.worldId === "mobius_corridor" && move.wrapped) state.usedCoreRule = true;
  const changed = playerPath.length > 0;
  return {
    state,
    changed,
    complete: exoticComplete(stage, state),
    dead: false,
    playerPath,
    echoPath,
  };
}

function stateKey(stage: ExoticStage, state: ExoticRunState) {
  return [
    gridCellKey(state.player),
    state.playerDone ? 1 : 0,
    state.echo ? gridCellKey(state.echo) : "-",
    state.echoDone ? 1 : 0,
    state.dimension,
    state.phase,
    state.previous ?? "-",
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
      if (!step.changed || step.dead) continue;
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

export function exoticStageBand(id: number) {
  if (id <= 5) return { cols: 5, rows: 5, min: 2, max: 5, density: 0.28 };
  if (id === 10) return { cols: 5, rows: 5, min: 6, max: 9, density: 0.33 };
  if (id <= 10) return { cols: 5, rows: 5, min: 4, max: 8, density: 0.32 };
  if (id <= 15) return { cols: 6, rows: 6, min: 6, max: 11, density: 0.31 };
  if (id === 20) return { cols: 6, rows: 6, min: 10, max: 17, density: 0.35 };
  if (id <= 20) return { cols: 6, rows: 6, min: 8, max: 15, density: 0.34 };
  if (id <= 25) return { cols: 7, rows: 7, min: 11, max: 18, density: 0.34 };
  if (id < 30) return { cols: 7, rows: 7, min: 14, max: 23, density: 0.36 };
  return { cols: 8, rows: 8, min: 18, max: 28, density: 0.34 };
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

export function makeExoticCandidate(
  worldId: ExoticWorldId,
  id: number,
  attempt: number,
): ExoticStage {
  const band = exoticStageBand(id);
  const random = mulberry32((id * 99991 + attempt * 104729 + EXOTIC_WORLDS.findIndex((w) => w.id === worldId) * 7879) >>> 0);
  const used = new Set<string>();
  const start = sampleCell(random, band.cols, band.rows, used);
  const goal = sampleCell(random, band.cols, band.rows, used);
  const keyCell = id >= 11 ? sampleCell(random, band.cols, band.rows, used) : null;
  const echoStart = worldId === "echo_galaxy" ? sampleCell(random, band.cols, band.rows, used) : null;
  const echoGoal = worldId === "echo_galaxy" ? sampleCell(random, band.cols, band.rows, used) : null;
  const shiftCells =
    worldId === "overlay_dimension"
      ? Array.from({ length: id <= 5 ? 1 : id <= 15 ? 2 : 3 }, () =>
          sampleCell(random, band.cols, band.rows, used),
        )
      : [];
  const worldDensity =
    worldId === "echo_galaxy"
      ? Math.min(0.45, band.density + 0.04)
      : worldId === "mobius_corridor"
        ? Math.max(0.26, band.density - 0.03)
        : band.density;
  const walls = randomWalls(random, band.cols, band.rows, worldDensity, used);
  const altUsed = new Set(
    [start, goal, ...(keyCell ? [keyCell] : []), ...shiftCells].map(gridCellKey),
  );
  const altWalls =
    worldId === "overlay_dimension"
      ? randomWalls(random, band.cols, band.rows, band.density, altUsed)
      : [];
  const phaseUsed = new Set(
    [start, goal, ...(keyCell ? [keyCell] : []), ...walls].map(gridCellKey),
  );
  const phaseWalls =
    worldId === "eclipse_planet"
      ? randomWalls(random, band.cols, band.rows, Math.max(0.12, band.density * 0.5), phaseUsed)
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
    keyCell,
    startPhase: 0,
    verticalWrap: worldId === "mobius_corridor" && id >= 16,
    par: 0,
    auxiliaryMechanics: keyCell ? ["key-door"] : [],
  };
}

const PRESET_ATTEMPTS: Record<ExoticWorldId, number[]> = {
  overlay_dimension: [
    130, 123, 115, 157, 179, 15, 94, 28, 20, 625, 2308, 853, 1028, 3243, 1508, 1200,
    269, 223, 1331, 2846, 6686, 32206, 2631, 3991, 12917, 17340, 54776, 76671, 88027,
    19942,
  ],
  echo_galaxy: [
    0, 3, 29, 4, 11, 20, 6, 131, 90, 354, 171, 1212, 208, 2586, 370, 851, 511,
    1001, 319, 307, 837, 6871, 2580, 2201, 7394, 4346, 39151, 13072, 15906, 96799,
  ],
  eclipse_planet: [
    4, 31, 0, 7, 5, 7, 1, 12, 13, 1097, 244, 129, 68, 38, 22, 6, 326, 60, 69,
    3049, 140, 47, 1006, 1179, 1493, 13994, 15062, 2627, 11931, 34618,
  ],
  mobius_corridor: [
    0, 0, 0, 1, 1, 20, 38, 34, 6, 151, 59, 53, 84, 42, 15, 27, 3, 10, 0, 30,
    348, 6, 44, 26, 144, 334, 355, 581, 852, 1567,
  ],
};

// 맵 제작 시 solveExoticStage로 검증해 고정한 최단 조작 수입니다.
// 플레이 요청마다 120개 맵을 재탐색하지 않아 서버 실행 제한을 피합니다.
const PRESET_PARS: Record<ExoticWorldId, number[]> = {
  overlay_dimension: [
    4, 5, 4, 4, 4, 4, 4, 4, 4, 6, 8, 9, 9, 6, 9, 11, 8, 8, 9, 13, 16, 14,
    13, 15, 11, 15, 15, 14, 14, 22,
  ],
  echo_galaxy: [
    4, 3, 5, 5, 4, 4, 4, 4, 5, 6, 6, 7, 8, 8, 8, 8, 9, 8, 9, 10, 12, 13, 11,
    11, 12, 15, 15, 15, 14, 18,
  ],
  eclipse_planet: [
    4, 5, 4, 2, 3, 4, 5, 4, 4, 6, 6, 6, 6, 6, 7, 8, 9, 8, 10, 11, 13, 11, 11,
    11, 12, 14, 15, 14, 15, 21,
  ],
  mobius_corridor: [
    2, 2, 2, 2, 2, 4, 7, 5, 4, 6, 6, 7, 6, 6, 6, 9, 8, 8, 8, 11, 11, 13, 11,
    11, 13, 14, 15, 14, 17, 18,
  ],
};

function loadStage(worldId: ExoticWorldId, id: number): ExoticStage {
  const stage = makeExoticCandidate(worldId, id, PRESET_ATTEMPTS[worldId][id - 1]);
  stage.par = PRESET_PARS[worldId][id - 1];
  return stage;
}

export const EXOTIC_STAGES: Record<ExoticWorldId, ExoticStage[]> =
  Object.fromEntries(
    EXOTIC_WORLDS.map((world) => [
      world.id,
      Array.from({ length: 30 }, (_, index) => loadStage(world.id, index + 1)),
    ]),
  ) as Record<ExoticWorldId, ExoticStage[]>;
