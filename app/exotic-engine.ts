import {
  DIRECTIONS,
  INITIAL_RUN_STATE,
  cellKey,
  sameCell,
  slide,
  type Cell,
  type Direction,
  type RunState,
  type StraightSlideLevel,
  type StraightTopology,
} from "./game-engine";

export type ExoticWorldId =
  | "overlay_dimension"
  | "echo_galaxy"
  | "eclipse_planet"
  | "mobius_corridor";

export type GridDirection = Direction;
export type ExoticAction = GridDirection | "shift";
export type GridCell = Cell;

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
  dayWalls: GridCell[];
  nightWalls: GridCell[];
  keyCell: GridCell | null;
  startPhase: 0 | 1;
  goalDimension: 0 | 1 | null;
  goalPhase: 0 | 1 | null;
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
  playerWrapped: boolean;
  echoWrapped: boolean;
  dimensionChanged: boolean;
  phaseChanged: boolean;
};

type SharedSlideResult = {
  destination: GridCell;
  path: GridCell[];
  wrapped: boolean;
  dead: boolean;
  blocked: boolean;
  reachedGoal: boolean;
  hasKey: boolean;
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
      "직진 이동이 끝나면 낮과 밤이 바뀝니다. 해·달 무늬 벽과 같은 무늬의 목표만 현재 상태에서 작동합니다.",
    accent: "#ffb52e",
    icon: "◐",
  },
  {
    id: "mobius_corridor",
    name: "뫼비우스 회랑",
    english: "MOBIUS CORRIDOR",
    description: "뒤집혀 연결되는 공간을 이용하세요.",
    tutorial:
      "좌우 가장자리는 세로 좌표가 뒤집힌 채 이어집니다. 같은 색 표시가 연결되는 위치입니다.",
    accent: "#b77cff",
    icon: "∞",
  },
];

const EMPTY_SET = new Set<string>();
const EMPTY_MAP = new Map<string, Direction>();
const INACTIVE_GOAL = { col: -10_000, row: -10_000 };

export function gridCellKey(cell: GridCell) {
  return cellKey(cell);
}

function cloneState(state: ExoticRunState): ExoticRunState {
  return {
    ...state,
    player: { ...state.player },
    echo: state.echo ? { ...state.echo } : null,
  };
}

function activeWallKeys(stage: ExoticStage, state: ExoticRunState) {
  if (stage.worldId === "overlay_dimension") {
    return new Set(
      (state.dimension === 0 ? stage.walls : stage.altWalls).map(gridCellKey),
    );
  }

  const walls = new Set(stage.walls.map(gridCellKey));
  if (stage.worldId === "eclipse_planet") {
    const phaseWalls = state.phase === 0 ? stage.dayWalls : stage.nightWalls;
    phaseWalls.forEach((cell) => walls.add(gridCellKey(cell)));
  }
  return walls;
}

function playerGoalOpen(stage: ExoticStage, state: ExoticRunState) {
  if (stage.keyCell !== null && !state.hasKey) return false;
  if (
    stage.worldId === "overlay_dimension" &&
    stage.goalDimension !== null &&
    state.dimension !== stage.goalDimension
  ) {
    return false;
  }
  if (
    stage.worldId === "eclipse_planet" &&
    stage.goalPhase !== null &&
    state.phase !== stage.goalPhase
  ) {
    return false;
  }
  return true;
}

function topologyFor(stage: ExoticStage): StraightTopology {
  const isMobius = stage.worldId === "mobius_corridor";
  return {
    minCol: 0,
    maxCol: stage.cols - 1,
    minRow: 0,
    maxRow: stage.rows - 1,
    horizontal: isMobius ? "mobius" : "death",
    vertical: isMobius ? (stage.verticalWrap ? "mobius" : "wall") : "death",
  };
}

function straightLevelFor(
  stage: ExoticStage,
  state: ExoticRunState,
  target: GridCell,
  goalOpen: boolean,
): StraightSlideLevel {
  const keySwitches =
    stage.keyCell && !state.hasKey
      ? new Set([gridCellKey(stage.keyCell)])
      : EMPTY_SET;
  return {
    blocks: activeWallKeys(stage, state),
    goal: goalOpen ? target : INACTIVE_GOAL,
    oneWays: EMPTY_MAP,
    portals: [],
    switches: keySwitches,
    gates: EMPTY_SET,
    fragileCells: [],
    rotators: EMPTY_SET,
    phaseSwitches: EMPTY_SET,
    phaseA: EMPTY_SET,
    phaseB: EMPTY_SET,
    topology: topologyFor(stage),
  };
}

function sharedRunState(state: ExoticRunState): RunState {
  return {
    ...INITIAL_RUN_STATE,
    gateOpen: state.hasKey,
    phase: state.phase,
  };
}

export function sharedStraightSlide(
  stage: ExoticStage,
  state: ExoticRunState,
  from: GridCell,
  direction: GridDirection,
  target: GridCell,
  fixed = false,
  goalOpen = true,
): SharedSlideResult {
  if (fixed) {
    return {
      destination: { ...from },
      path: [],
      wrapped: false,
      dead: false,
      blocked: true,
      reachedGoal: false,
      hasKey: state.hasKey,
    };
  }

  const plan = slide(
    straightLevelFor(stage, state, target, goalOpen),
    from,
    direction,
    sharedRunState(state),
  );

  if (plan.outcome === "blocked") {
    return {
      destination: { ...from },
      path: [],
      wrapped: false,
      dead: false,
      blocked: true,
      reachedGoal: false,
      hasKey: state.hasKey,
    };
  }

  if (plan.outcome === "death") {
    return {
      destination: { ...plan.edgeCell },
      path: plan.path,
      wrapped: plan.wraps.length > 0,
      dead: true,
      blocked: false,
      reachedGoal: false,
      hasKey: plan.state.gateOpen,
    };
  }

  return {
    destination: { ...plan.destination },
    path: plan.path,
    wrapped: plan.wraps.length > 0,
    dead: false,
    blocked: false,
    reachedGoal: plan.outcome === "goal",
    hasKey: plan.state.gateOpen,
  };
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
  if (!state.playerDone) return false;
  if (stage.worldId === "echo_galaxy") {
    return state.echoDone && state.usedCoreRule;
  }
  return state.usedCoreRule;
}

function unchangedStep(state: ExoticRunState): ExoticStep {
  return {
    state,
    changed: false,
    complete: false,
    dead: false,
    playerPath: [],
    echoPath: [],
    playerWrapped: false,
    echoWrapped: false,
    dimensionChanged: false,
    phaseChanged: false,
  };
}

export function exoticStep(
  stage: ExoticStage,
  source: ExoticRunState,
  action: ExoticAction,
): ExoticStep {
  const state = cloneState(source);
  const playerPath: GridCell[] = [];
  const echoPath: GridCell[] = [];
  let playerWrapped = false;
  let echoWrapped = false;
  let dimensionChanged = false;
  let phaseChanged = false;

  if (action === "shift") {
    if (
      stage.worldId !== "overlay_dimension" ||
      !stage.shiftCells.some((cell) => sameCell(cell, state.player))
    ) {
      return unchangedStep(state);
    }
    state.dimension = state.dimension === 0 ? 1 : 0;
    state.usedCoreRule = true;
    dimensionChanged = true;
    return {
      state,
      changed: true,
      complete: exoticComplete(stage, state),
      dead: false,
      playerPath,
      echoPath,
      playerWrapped,
      echoWrapped,
      dimensionChanged,
      phaseChanged,
    };
  }

  if (stage.worldId === "echo_galaxy") {
    const playerMove = sharedStraightSlide(
      stage,
      state,
      state.player,
      action,
      stage.goal,
      state.playerDone,
      playerGoalOpen(stage, state),
    );
    playerPath.push(...playerMove.path);
    playerWrapped = playerMove.wrapped;
    if (playerMove.dead) {
      return {
        state,
        changed: true,
        complete: false,
        dead: true,
        playerPath,
        echoPath,
        playerWrapped,
        echoWrapped,
        dimensionChanged,
        phaseChanged,
      };
    }
    state.player = playerMove.destination;
    state.hasKey ||= playerMove.hasKey;
    state.playerDone ||= playerMove.reachedGoal;

    if (state.previous && state.echo && !state.echoDone) {
      const echoMove = sharedStraightSlide(
        stage,
        state,
        state.echo,
        state.previous,
        stage.echoGoal ?? stage.goal,
        false,
        true,
      );
      echoPath.push(...echoMove.path);
      echoWrapped = echoMove.wrapped;
      if (echoMove.dead) {
        return {
          state,
          changed: true,
          complete: false,
          dead: true,
          playerPath,
          echoPath,
          playerWrapped,
          echoWrapped,
          dimensionChanged,
          phaseChanged,
        };
      }
      state.echo = echoMove.destination;
      state.hasKey ||= echoMove.hasKey;
      state.echoDone ||= echoMove.reachedGoal;
      state.usedCoreRule = true;
    }

    state.previous = action;
    return {
      state,
      changed:
        playerPath.length > 0 ||
        echoPath.length > 0 ||
        source.previous !== state.previous,
      complete: exoticComplete(stage, state),
      dead: false,
      playerPath,
      echoPath,
      playerWrapped,
      echoWrapped,
      dimensionChanged,
      phaseChanged,
    };
  }

  const move = sharedStraightSlide(
    stage,
    state,
    state.player,
    action,
    stage.goal,
    state.playerDone,
    playerGoalOpen(stage, state),
  );
  playerPath.push(...move.path);
  playerWrapped = move.wrapped;
  if (move.blocked) return unchangedStep(state);
  if (move.dead) {
    return {
      state,
      changed: true,
      complete: false,
      dead: true,
      playerPath,
      echoPath,
      playerWrapped,
      echoWrapped,
      dimensionChanged,
      phaseChanged,
    };
  }

  state.player = move.destination;
  state.hasKey ||= move.hasKey;
  state.playerDone ||= move.reachedGoal;

  if (stage.worldId === "eclipse_planet") {
    const nextPhase: 0 | 1 = state.phase === 0 ? 1 : 0;
    const nextWalls = nextPhase === 0 ? stage.dayWalls : stage.nightWalls;
    if (nextWalls.some((cell) => sameCell(cell, state.player))) {
      return {
        state,
        changed: true,
        complete: false,
        dead: true,
        playerPath,
        echoPath,
        playerWrapped,
        echoWrapped,
        dimensionChanged,
        phaseChanged,
      };
    }
    state.phase = nextPhase;
    state.usedCoreRule = true;
    phaseChanged = true;
  }
  if (stage.worldId === "mobius_corridor" && move.wrapped) {
    state.usedCoreRule = true;
  }

  return {
    state,
    changed: playerPath.length > 0,
    complete: exoticComplete(stage, state),
    dead: false,
    playerPath,
    echoPath,
    playerWrapped,
    echoWrapped,
    dimensionChanged,
    phaseChanged,
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
    stage.worldId,
  ].join("|");
}

export function solveExoticStage(stage: ExoticStage, depthLimit = 36) {
  const initial = initialExoticState(stage);
  const actions: ExoticAction[] =
    stage.worldId === "overlay_dimension"
      ? [...DIRECTIONS, "shift"]
      : DIRECTIONS;
  const queue: Array<{ state: ExoticRunState; path: ExoticAction[] }> = [
    { state: initial, path: [] },
  ];
  const visited = new Set([stateKey(stage, initial)]);
  let cursor = 0;

  while (cursor < queue.length && visited.size < 90_000) {
    const current = queue[cursor++];
    if (current.path.length >= depthLimit) continue;
    for (const action of actions) {
      const step = exoticStep(stage, current.state, action);
      if (!step.changed || step.dead) continue;
      const path = [...current.path, action];
      if (step.complete) {
        return {
          path,
          exploredStates: visited.size,
          usesCoreRule: step.state.usedCoreRule,
        };
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
  const worldIndex = EXOTIC_WORLDS.findIndex((world) => world.id === worldId);
  const random = mulberry32(
    (id * 99991 + attempt * 104729 + worldIndex * 7879) >>> 0,
  );
  const used = new Set<string>();
  const start = sampleCell(random, band.cols, band.rows, used);
  const goal = sampleCell(random, band.cols, band.rows, used);
  const keyCell =
    id >= 11 ? sampleCell(random, band.cols, band.rows, used) : null;
  const echoStart =
    worldId === "echo_galaxy"
      ? sampleCell(random, band.cols, band.rows, used)
      : null;
  const echoGoal =
    worldId === "echo_galaxy"
      ? sampleCell(random, band.cols, band.rows, used)
      : null;
  const shiftCells =
    worldId === "overlay_dimension"
      ? Array.from({ length: id <= 5 ? 1 : id <= 15 ? 2 : 3 }, () =>
          sampleCell(random, band.cols, band.rows, used),
        )
      : [];
  const eclipseWallCount =
    id <= 2 ? 1 : id <= 5 ? 2 : id <= 15 ? 3 : id <= 25 ? 4 : 5;
  const dayWalls =
    worldId === "eclipse_planet"
      ? Array.from({ length: eclipseWallCount }, () =>
          sampleCell(random, band.cols, band.rows, used),
        )
      : [];
  const nightWalls =
    worldId === "eclipse_planet"
      ? Array.from({ length: eclipseWallCount }, () =>
          sampleCell(random, band.cols, band.rows, used),
        )
      : [];
  const worldDensity =
    worldId === "echo_galaxy"
      ? Math.min(0.45, band.density + 0.04)
      : worldId === "mobius_corridor"
        ? Math.max(0.26, band.density - 0.03)
        : band.density;
  const walls = randomWalls(
    random,
    band.cols,
    band.rows,
    worldDensity,
    used,
  );
  const altUsed = new Set(
    [start, goal, ...(keyCell ? [keyCell] : []), ...shiftCells].map(
      gridCellKey,
    ),
  );
  const altWalls =
    worldId === "overlay_dimension"
      ? randomWalls(random, band.cols, band.rows, band.density, altUsed)
      : [];
  const startPhase: 0 | 1 =
    worldId === "eclipse_planet" && id % 4 === 0 ? 1 : 0;
  const goalDimension: 0 | 1 | null =
    worldId === "overlay_dimension" ? (id % 3 === 0 ? 0 : 1) : null;
  const goalPhase: 0 | 1 | null =
    worldId === "eclipse_planet" ? (startPhase === 0 ? 1 : 0) : null;

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
    dayWalls,
    nightWalls,
    keyCell,
    startPhase,
    goalDimension,
    goalPhase,
    verticalWrap: worldId === "mobius_corridor" && id >= 16,
    par: 0,
    auxiliaryMechanics: keyCell ? ["key-door"] : [],
  };
}

const PRESET_ATTEMPTS: Record<ExoticWorldId, number[]> = {
  overlay_dimension: [
    130, 108, 76, 4, 122, 33, 68, 28, 45, 625, 3401, 43, 68831, 9324, 93,
    2984, 39, 70, 4664, 5563, 25045, 3179, 2631, 34650, 217, 8063, 58180,
    327, 12146, 8786,
  ],
  echo_galaxy: [
    0, 3, 29, 4, 11, 20, 6, 131, 90, 354, 154, 126, 208, 115, 257, 1810,
    511, 496, 165, 5388, 2259, 3058, 1025, 72, 291, 4346, 2717, 5916,
    12845, 19540,
  ],
  eclipse_planet: [
    1, 0, 4, 1, 4, 129, 25, 172, 201, 2493, 87, 32, 35, 117, 2, 136, 49,
    270, 861, 2453, 1272, 827, 77, 1314, 726, 2146, 8795, 201, 13758, 1195,
  ],
  mobius_corridor: [
    0, 0, 0, 0, 1, 1, 26, 1, 6, 30, 2, 0, 3, 6, 0, 27, 3, 10, 0, 30,
    212, 6, 44, 26, 144, 334, 355, 581, 852, 4996,
  ],
};

const PRESET_PARS: Record<ExoticWorldId, number[]> = {
  overlay_dimension: [
    4, 3, 4, 4, 4, 5, 5, 4, 5, 6, 9, 7, 9, 10, 11, 12, 8, 8, 10, 15,
    16, 12, 13, 13, 14, 16, 16, 17, 19, 27,
  ],
  echo_galaxy: [
    4, 3, 5, 5, 4, 4, 4, 4, 5, 6, 6, 6, 8, 6, 7, 11, 9, 8, 9, 10, 11,
    12, 11, 12, 11, 16, 15, 17, 14, 18,
  ],
  eclipse_planet: [
    2, 2, 2, 2, 2, 4, 4, 4, 4, 6, 10, 6, 6, 6, 6, 8, 14, 10, 8, 10,
    12, 12, 12, 12, 12, 14, 14, 14, 14, 20,
  ],
  mobius_corridor: [
    2, 2, 2, 3, 2, 7, 4, 5, 4, 6, 6, 6, 6, 9, 9, 9, 8, 8, 8, 11, 11,
    13, 11, 11, 13, 14, 15, 14, 17, 19,
  ],
};

function loadStage(worldId: ExoticWorldId, id: number): ExoticStage {
  const stage = makeExoticCandidate(
    worldId,
    id,
    PRESET_ATTEMPTS[worldId][id - 1],
  );
  stage.par = PRESET_PARS[worldId][id - 1];
  return stage;
}

export const EXOTIC_STAGES: Record<ExoticWorldId, ExoticStage[]> =
  Object.fromEntries(
    EXOTIC_WORLDS.map((world) => [
      world.id,
      Array.from({ length: 30 }, (_, index) =>
        loadStage(world.id, index + 1),
      ),
    ]),
  ) as Record<ExoticWorldId, ExoticStage[]>;
