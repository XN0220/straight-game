import { HEX_STAGE_DATA } from "./hex-stage-data";

export type HexDirection = "nw" | "ne" | "w" | "e" | "sw" | "se";
export type HexCell = { q: number; r: number };
export type HexState = { gatesOn: boolean };
export type HexFeature = "portal" | "switch";

export type HexStage = {
  id: number;
  radius: number;
  cells: HexCell[];
  blocks: Set<string>;
  blockCells: HexCell[];
  portals: HexCell[];
  switches: Set<string>;
  switchCells: HexCell[];
  toggleBlocks: Set<string>;
  toggleBlockCells: HexCell[];
  start: HexCell;
  goal: HexCell;
  par: number;
  solution: HexDirection[];
  solutionFeatures: Set<HexFeature>;
};

export type HexSlide =
  | {
      outcome: "blocked";
      destination: HexCell;
      path: HexCell[];
      state: HexState;
      features: Set<HexFeature>;
    }
  | {
      outcome: "stop" | "goal" | "death" | "loop" | "switch";
      destination: HexCell;
      path: HexCell[];
      state: HexState;
      features: Set<HexFeature>;
    };

type StageSpec = {
  id: number;
  radius: number;
  minPar: number;
  maxPar: number;
  portals: boolean;
  toggles: boolean;
  density: number;
};

const VECTORS: Record<HexDirection, HexCell> = {
  nw: { q: 0, r: -1 },
  ne: { q: 1, r: -1 },
  w: { q: -1, r: 0 },
  e: { q: 1, r: 0 },
  sw: { q: -1, r: 1 },
  se: { q: 0, r: 1 },
};

const DIRECTIONS = Object.keys(VECTORS) as HexDirection[];
export const INITIAL_HEX_STATE: HexState = { gatesOn: true };

function stageSpec(id: number): StageSpec {
  if (id <= 5) {
    return {
      id,
      radius: 2,
      minPar: 1,
      maxPar: 3,
      portals: false,
      toggles: false,
      density: 0.2 + id * 0.012,
    };
  }
  if (id <= 10) {
    return {
      id,
      radius: 2,
      minPar: 3,
      maxPar: 5,
      portals: false,
      toggles: false,
      density: 0.28 + (id - 6) * 0.012,
    };
  }
  if (id <= 15) {
    return {
      id,
      radius: 3,
      minPar: 5,
      maxPar: 10,
      portals: false,
      toggles: false,
      density: 0.27 + (id - 11) * 0.012,
    };
  }
  if (id <= 20) {
    return {
      id,
      radius: 4,
      minPar: 10,
      maxPar: 15,
      portals: false,
      toggles: false,
      density: 0.3 + (id - 16) * 0.012,
    };
  }
  if (id <= 25) {
    return {
      id,
      radius: 4,
      minPar: 8,
      maxPar: 20,
      portals: true,
      toggles: false,
      density: 0.31 + (id - 21) * 0.01,
    };
  }
  return {
    id,
    radius: 4,
    minPar: 8,
    maxPar: 20,
    portals: true,
    toggles: true,
    density: 0.33 + (id - 26) * 0.008,
  };
}

export function hexCellKey(cell: HexCell) {
  return `${cell.q},${cell.r}`;
}

function stateKey(cell: HexCell, state: HexState) {
  return `${hexCellKey(cell)}|${state.gatesOn ? 1 : 0}`;
}

export function isInsideHex(cell: HexCell, radius: number) {
  const s = -cell.q - cell.r;
  return Math.max(Math.abs(cell.q), Math.abs(cell.r), Math.abs(s)) <= radius;
}

function allCells(radius: number) {
  const cells: HexCell[] = [];
  for (let q = -radius; q <= radius; q += 1) {
    const minR = Math.max(-radius, -q - radius);
    const maxR = Math.min(radius, -q + radius);
    for (let r = minR; r <= maxR; r += 1) cells.push({ q, r });
  }
  return cells;
}

function isSolid(stage: HexStage, cell: HexCell, state: HexState) {
  const key = hexCellKey(cell);
  return stage.blocks.has(key) || (state.gatesOn && stage.toggleBlocks.has(key));
}

function portalExit(stage: HexStage, cell: HexCell) {
  if (stage.portals.length !== 2) return null;
  const key = hexCellKey(cell);
  if (hexCellKey(stage.portals[0]) === key) return stage.portals[1];
  if (hexCellKey(stage.portals[1]) === key) return stage.portals[0];
  return null;
}

export function hexSlide(
  stage: HexStage,
  from: HexCell,
  direction: HexDirection,
  initialState: HexState = INITIAL_HEX_STATE,
): HexSlide {
  let current = { ...from };
  let state = { ...initialState };
  const path: HexCell[] = [];
  const features = new Set<HexFeature>();
  const visited = new Set([stateKey(current, state)]);
  let ignorePortalAt = hexCellKey(current);
  const vector = VECTORS[direction];

  while (true) {
    const next = { q: current.q + vector.q, r: current.r + vector.r };
    if (!isInsideHex(next, stage.radius)) {
      return { outcome: "death", destination: current, path, state, features };
    }
    if (isSolid(stage, next, state)) {
      return path.length === 0
        ? {
            outcome: "blocked",
            destination: from,
            path,
            state: initialState,
            features,
          }
        : { outcome: "stop", destination: current, path, state, features };
    }

    current = next;
    path.push({ ...current });
    const currentKey = hexCellKey(current);

    if (currentKey === hexCellKey(stage.goal)) {
      return { outcome: "goal", destination: current, path, state, features };
    }

    if (stage.switches.has(currentKey)) {
      state = { gatesOn: !state.gatesOn };
      features.add("switch");
      return { outcome: "switch", destination: current, path, state, features };
    }

    const exit = currentKey === ignorePortalAt ? null : portalExit(stage, current);
    ignorePortalAt = "";
    if (exit) {
      features.add("portal");
      current = { ...exit };
      path.push({ ...current });
      ignorePortalAt = hexCellKey(current);
      if (hexCellKey(current) === hexCellKey(stage.goal)) {
        return { outcome: "goal", destination: current, path, state, features };
      }
    }

    const key = stateKey(current, state);
    if (visited.has(key)) {
      return { outcome: "loop", destination: current, path, state, features };
    }
    visited.add(key);
  }
}

function solve(stage: HexStage) {
  const queue: Array<{
    cell: HexCell;
    state: HexState;
    path: HexDirection[];
    features: Set<HexFeature>;
  }> = [
    {
      cell: stage.start,
      state: INITIAL_HEX_STATE,
      path: [],
      features: new Set(),
    },
  ];
  const visited = new Set([stateKey(stage.start, INITIAL_HEX_STATE)]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const direction of DIRECTIONS) {
      const plan = hexSlide(stage, current.cell, direction, current.state);
      const features = new Set([...current.features, ...plan.features]);
      if (plan.outcome === "goal") {
        return { path: [...current.path, direction], features };
      }
      if (plan.outcome !== "stop" && plan.outcome !== "switch") continue;
      const key = stateKey(plan.destination, plan.state);
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({
        cell: plan.destination,
        state: plan.state,
        path: [...current.path, direction],
        features,
      });
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

function sampleCell(random: () => number, cells: HexCell[], used: Set<string>) {
  for (;;) {
    const cell = cells[Math.floor(random() * cells.length)];
    if (!used.has(hexCellKey(cell))) {
      used.add(hexCellKey(cell));
      return { ...cell };
    }
  }
}

function generateStage(spec: StageSpec): HexStage {
  const cells = allCells(spec.radius);
  for (let attempt = 0; attempt < 30000; attempt += 1) {
    const random = mulberry32(spec.id * 1618033 + attempt * 7919);
    const used = new Set<string>();
    const start = sampleCell(random, cells, used);
    const goal = sampleCell(random, cells, used);
    const portals = spec.portals
      ? [sampleCell(random, cells, used), sampleCell(random, cells, used)]
      : [];
    const switchCells = spec.toggles ? [sampleCell(random, cells, used)] : [];
    const toggleBlockCells: HexCell[] = [];

    if (spec.toggles) {
      const count = 4 + Math.floor(random() * 4);
      for (let index = 0; index < count; index += 1) {
        toggleBlockCells.push(sampleCell(random, cells, used));
      }
    }

    const blockCells: HexCell[] = [];
    cells.forEach((cell) => {
      const key = hexCellKey(cell);
      if (!used.has(key) && random() < spec.density) {
        used.add(key);
        blockCells.push({ ...cell });
      }
    });

    const stage: HexStage = {
      id: spec.id,
      radius: spec.radius,
      cells,
      blocks: new Set(blockCells.map(hexCellKey)),
      blockCells,
      portals,
      switches: new Set(switchCells.map(hexCellKey)),
      switchCells,
      toggleBlocks: new Set(toggleBlockCells.map(hexCellKey)),
      toggleBlockCells,
      start,
      goal,
      par: 0,
      solution: [],
      solutionFeatures: new Set(),
    };
    const solution = solve(stage);
    if (!solution) continue;
    if (solution.path.length < spec.minPar || solution.path.length > spec.maxPar) continue;
    if (spec.portals && !solution.features.has("portal")) continue;
    if (spec.toggles && !solution.features.has("switch")) continue;

    stage.par = solution.path.length;
    stage.solution = solution.path;
    stage.solutionFeatures = solution.features;
    return stage;
  }
  throw new Error(`헥사리움 ${spec.id}번 맵을 생성하지 못했습니다.`);
}

export const HEX_STAGES: HexStage[] = HEX_STAGE_DATA.map((stage) => ({
  ...stage,
  blocks: new Set(stage.blocks),
  switches: new Set(stage.switches),
  toggleBlocks: new Set(stage.toggleBlocks),
  solution: stage.solution as HexDirection[],
  solutionFeatures: new Set(stage.solutionFeatures as HexFeature[]),
}));
