import { WORMHOLE_STAGE_DATA } from "./wormhole-stage-data";

export type RadialDirection = "out" | "in" | "ccw" | "cw";
export type RadialCell = { ring: number; sector: number };
export type RadialState = { blocksOn: boolean };
export type RadialFeature = "portal" | "toggle";

export type RadialStage = {
  id: number;
  name: string;
  subtitle: string;
  ringCount: number;
  blocks: Set<string>;
  blockCells: RadialCell[];
  portals: RadialCell[];
  switches: Set<string>;
  switchCells: RadialCell[];
  toggleBlocks: Set<string>;
  toggleBlockCells: RadialCell[];
  start: RadialCell;
  goal: RadialCell;
  par: number;
  solution: RadialDirection[];
  solutionFeatures: Set<RadialFeature>;
};

export type RadialSlide =
  | { outcome: "blocked"; destination: RadialCell; path: RadialCell[]; state: RadialState; features: Set<RadialFeature> }
  | {
      outcome: "stop" | "goal" | "death" | "loop" | "switch";
      destination: RadialCell;
      path: RadialCell[];
      state: RadialState;
      features: Set<RadialFeature>;
    };

export const RADIAL_SECTORS = 12;
export const INITIAL_RADIAL_STATE: RadialState = { blocksOn: true };

const STAGE_NAMES = [
  "휘어진 첫걸음", "안쪽 고리", "반시계 산책", "바깥 궤도", "곡률 연습",
  "중력 우회", "원주 교차", "고리 건너기", "자오선 입문", "작은 에테르 핵",
  "확장 궤도", "긴 자오선", "외곽 순환", "중력 미로", "일곱 번째 고리",
  "쌍둥이 문", "공간 도약", "접힌 자오선", "순간 궤도", "웜홀 릴레이",
  "점멸 블록", "스위치 궤도", "교차 차단선", "두 번의 도약", "곡률 잠금",
  "에테르 회로", "차원 교차", "불안정 핵", "사건의 지평선", "에테르 특이점",
];

type StageSpec = {
  id: number;
  ringCount: number;
  minPar: number;
  maxPar: number;
  portals: boolean;
  toggles: boolean;
  density: number;
};

function stageSpec(id: number): StageSpec {
  if (id <= 10) {
    return {
      id,
      ringCount: 5,
      minPar: 3 + Math.floor((id - 1) / 3),
      maxPar: 7 + Math.floor(id / 5),
      portals: false,
      toggles: false,
      density: 0.2 + id * 0.005,
    };
  }
  if (id <= 15) {
    return {
      id,
      ringCount: 7,
      minPar: 7 + (id - 11),
      maxPar: 13,
      portals: false,
      toggles: false,
      density: 0.24 + (id - 11) * 0.008,
    };
  }
  if (id <= 20) {
    return {
      id,
      ringCount: 7,
      minPar: 8 + (id - 16),
      maxPar: 15,
      portals: true,
      toggles: false,
      density: 0.25 + (id - 16) * 0.008,
    };
  }
  return {
    id,
    ringCount: 7,
    minPar: 12 + Math.floor((id - 21) / 2),
    maxPar: 24,
    portals: true,
    toggles: true,
    density: 0.27 + (id - 21) * 0.004,
  };
}

export function radialCellKey(cell: RadialCell) {
  return `${cell.ring},${cell.sector}`;
}

function stateKey(cell: RadialCell, state: RadialState) {
  return `${radialCellKey(cell)}|${state.blocksOn ? 1 : 0}`;
}

function isSolid(stage: RadialStage, cell: RadialCell, state: RadialState) {
  const key = radialCellKey(cell);
  return stage.blocks.has(key) || (state.blocksOn && stage.toggleBlocks.has(key));
}

function portalExit(stage: RadialStage, cell: RadialCell) {
  if (stage.portals.length !== 2) return null;
  const key = radialCellKey(cell);
  if (radialCellKey(stage.portals[0]) === key) return stage.portals[1];
  if (radialCellKey(stage.portals[1]) === key) return stage.portals[0];
  return null;
}

export function radialSlide(
  stage: RadialStage,
  from: RadialCell,
  direction: RadialDirection,
  initialState: RadialState = INITIAL_RADIAL_STATE,
): RadialSlide {
  let current = { ...from };
  let state = { ...initialState };
  const path: RadialCell[] = [];
  const features = new Set<RadialFeature>();
  const visited = new Set([stateKey(current, state)]);
  let ignorePortalAt = radialCellKey(current);

  while (true) {
    const next = { ...current };
    if (direction === "out") next.ring += 1;
    if (direction === "in") next.ring -= 1;
    if (direction === "cw") next.sector = (next.sector + 1) % RADIAL_SECTORS;
    if (direction === "ccw") next.sector = (next.sector + RADIAL_SECTORS - 1) % RADIAL_SECTORS;

    if (next.ring < 0 || next.ring >= stage.ringCount) {
      return { outcome: "death", destination: current, path, state, features };
    }
    if (isSolid(stage, next, state)) {
      return path.length === 0
        ? { outcome: "blocked", destination: from, path, state: initialState, features }
        : { outcome: "stop", destination: current, path, state, features };
    }

    current = next;
    path.push({ ...current });
    const currentKey = radialCellKey(current);

    if (currentKey === radialCellKey(stage.goal)) {
      return { outcome: "goal", destination: current, path, state, features };
    }

    if (stage.switches.has(currentKey)) {
      state = { blocksOn: !state.blocksOn };
      features.add("toggle");
      return { outcome: "switch", destination: current, path, state, features };
    }

    const exit = currentKey === ignorePortalAt ? null : portalExit(stage, current);
    ignorePortalAt = "";
    if (exit) {
      features.add("portal");
      current = { ...exit };
      path.push({ ...current });
      ignorePortalAt = radialCellKey(current);
      if (radialCellKey(current) === radialCellKey(stage.goal)) {
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

function solve(stage: RadialStage) {
  const queue: Array<{
    cell: RadialCell;
    state: RadialState;
    path: RadialDirection[];
    features: Set<RadialFeature>;
  }> = [{ cell: stage.start, state: INITIAL_RADIAL_STATE, path: [], features: new Set() }];
  const visited = new Set([stateKey(stage.start, INITIAL_RADIAL_STATE)]);
  const directions: RadialDirection[] = ["out", "in", "ccw", "cw"];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const direction of directions) {
      const plan = radialSlide(stage, current.cell, direction, current.state);
      const features = new Set([...current.features, ...plan.features]);
      if (plan.outcome === "goal") return { path: [...current.path, direction], features };
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

function sampleCell(random: () => number, ringCount: number, used: Set<string>): RadialCell {
  for (;;) {
    const cell = {
      ring: Math.floor(random() * ringCount),
      sector: Math.floor(random() * RADIAL_SECTORS),
    };
    if (!used.has(radialCellKey(cell))) {
      used.add(radialCellKey(cell));
      return cell;
    }
  }
}

function generateStage(spec: StageSpec): RadialStage {
  for (let attempt = 0; attempt < 12000; attempt += 1) {
    const random = mulberry32(spec.id * 104729 + attempt * 8191);
    const used = new Set<string>();
    const start = sampleCell(random, spec.ringCount, used);
    const goal = sampleCell(random, spec.ringCount, used);
    const portals = spec.portals
      ? [sampleCell(random, spec.ringCount, used), sampleCell(random, spec.ringCount, used)]
      : [];
    const switchCells = spec.toggles ? [sampleCell(random, spec.ringCount, used)] : [];
    const toggleBlockCells: RadialCell[] = [];
    if (spec.toggles) {
      const count = 5 + Math.floor(random() * 4);
      for (let index = 0; index < count; index += 1) {
        toggleBlockCells.push(sampleCell(random, spec.ringCount, used));
      }
    }
    const blockCells: RadialCell[] = [];
    for (let ring = 0; ring < spec.ringCount; ring += 1) {
      for (let sector = 0; sector < RADIAL_SECTORS; sector += 1) {
        const cell = { ring, sector };
        const key = radialCellKey(cell);
        if (!used.has(key) && random() < spec.density) {
          used.add(key);
          blockCells.push(cell);
        }
      }
    }

    const stage: RadialStage = {
      id: spec.id,
      name: STAGE_NAMES[spec.id - 1],
      subtitle:
        spec.id <= 10
          ? "작은 원형 맵 · 기본 곡률 이동"
          : spec.id <= 15
            ? "확장 원형 맵 · 긴 궤도"
            : spec.id <= 20
              ? "확장 원형 맵 · 순간이동 포탈"
              : "고난도 · 포탈과 블록 온오프",
      ringCount: spec.ringCount,
      blocks: new Set(blockCells.map(radialCellKey)),
      blockCells,
      portals,
      switches: new Set(switchCells.map(radialCellKey)),
      switchCells,
      toggleBlocks: new Set(toggleBlockCells.map(radialCellKey)),
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
    if (spec.toggles && !solution.features.has("toggle")) continue;
    stage.par = solution.path.length;
    stage.solution = solution.path;
    stage.solutionFeatures = solution.features;
    return stage;
  }
  throw new Error(`웜홀 ${spec.id}번 맵을 생성하지 못했습니다.`);
}

export const WORMHOLE_STAGES: RadialStage[] = WORMHOLE_STAGE_DATA.map((stage) => ({
  ...stage,
  blocks: new Set(stage.blocks),
  switches: new Set(stage.switches),
  toggleBlocks: new Set(stage.toggleBlocks),
  solution: stage.solution as RadialDirection[],
  solutionFeatures: new Set(stage.solutionFeatures as RadialFeature[]),
}));
