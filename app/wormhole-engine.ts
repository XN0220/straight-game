export type RadialDirection = "out" | "in" | "ccw" | "cw";
export type RadialCell = { ring: number; sector: number };

export type RadialStage = {
  id: number;
  name: string;
  subtitle: string;
  rows: string[];
  blocks: Set<string>;
  blockCells: RadialCell[];
  start: RadialCell;
  goal: RadialCell;
  par: number;
  solution: RadialDirection[];
};

export type RadialSlide =
  | { outcome: "blocked"; destination: RadialCell; path: RadialCell[] }
  | {
      outcome: "stop" | "goal" | "death" | "loop";
      destination: RadialCell;
      path: RadialCell[];
    };

export const RADIAL_RINGS = 7;
export const RADIAL_SECTORS = 12;

const RAW_STAGES = [
  {
    name: "휘어진 첫걸음",
    subtitle: "방사 이동과 원주 이동",
    rows: [
      "#..#.#.#..#.",
      "......#.....",
      "..#........#",
      ".#..........",
      ".S.#.......#",
      "...G.#......",
      "..#.....#...",
    ],
    par: 3,
    solution: ["cw", "out", "cw"],
  },
  {
    name: "고리 건너기",
    subtitle: "반시계 궤도와 외곽 이동",
    rows: [
      "#..S...##...",
      ".......#....",
      "...#....#...",
      ".#....#.....",
      "#....##.....",
      ".#.......G##",
      ".###.....#.#",
    ],
    par: 4,
    solution: ["ccw", "out", "ccw", "out"],
  },
  {
    name: "중력 우회",
    subtitle: "중심 방향으로 궤도 변경",
    rows: [
      ".......#..##",
      "...#....#..#",
      ".G.........#",
      "##.....#.#.#",
      "....#.#..#.#",
      "#.....#....S",
      ".#...###..#.",
    ],
    par: 5,
    solution: ["ccw", "in", "cw", "in", "ccw"],
  },
  {
    name: "자오선 회로",
    subtitle: "안쪽과 바깥쪽을 번갈아 탐색",
    rows: [
      "...#.#.....#",
      "##.......#.#",
      "....#.#.#.#.",
      ".....G#.....",
      "......#.#...",
      "S.#..#......",
      "#..#........",
    ],
    par: 6,
    solution: ["in", "cw", "out", "cw", "in", "cw"],
  },
  {
    name: "에테르 핵",
    subtitle: "네 방향을 모두 연결하는 베타 코어",
    rows: [
      ".....##.....",
      ".......##...",
      "#.....#.....",
      "#......##...",
      ".G...#...#..",
      "..##....#.#.",
      ".....S#..##.",
    ],
    par: 7,
    solution: ["in", "cw", "in", "ccw", "in", "ccw", "out"],
  },
] satisfies Array<{
  name: string;
  subtitle: string;
  rows: string[];
  par: number;
  solution: RadialDirection[];
}>;

export function radialCellKey(cell: RadialCell) {
  return `${cell.ring},${cell.sector}`;
}

function parseStage(
  raw: (typeof RAW_STAGES)[number],
  index: number,
): RadialStage {
  const blockCells: RadialCell[] = [];
  let start: RadialCell | null = null;
  let goal: RadialCell | null = null;

  raw.rows.forEach((row, ring) => {
    [...row].forEach((symbol, sector) => {
      const cell = { ring, sector };
      if (symbol === "#") blockCells.push(cell);
      if (symbol === "S") start = cell;
      if (symbol === "G") goal = cell;
    });
  });

  if (!start || !goal) throw new Error(`웜홀 ${index + 1}번 맵의 시작점 또는 목표가 없습니다.`);

  return {
    ...raw,
    id: index + 1,
    start,
    goal,
    blocks: new Set(blockCells.map(radialCellKey)),
    blockCells,
  };
}

export const WORMHOLE_STAGES = RAW_STAGES.map(parseStage);

export function radialSlide(
  stage: Pick<RadialStage, "blocks" | "goal">,
  from: RadialCell,
  direction: RadialDirection,
): RadialSlide {
  let current = { ...from };
  const path: RadialCell[] = [];
  const visited = new Set([radialCellKey(current)]);

  while (true) {
    const next = { ...current };
    if (direction === "out") next.ring += 1;
    if (direction === "in") next.ring -= 1;
    if (direction === "cw") next.sector = (next.sector + 1) % RADIAL_SECTORS;
    if (direction === "ccw") {
      next.sector = (next.sector + RADIAL_SECTORS - 1) % RADIAL_SECTORS;
    }

    if (next.ring < 0 || next.ring >= RADIAL_RINGS) {
      return { outcome: "death", destination: current, path };
    }
    if (stage.blocks.has(radialCellKey(next))) {
      return path.length === 0
        ? { outcome: "blocked", destination: from, path }
        : { outcome: "stop", destination: current, path };
    }

    current = next;
    path.push({ ...current });
    if (radialCellKey(current) === radialCellKey(stage.goal)) {
      return { outcome: "goal", destination: current, path };
    }
    if (visited.has(radialCellKey(current))) {
      return { outcome: "loop", destination: current, path };
    }
    visited.add(radialCellKey(current));
  }
}

function solve(stage: RadialStage) {
  const queue: Array<{ cell: RadialCell; path: RadialDirection[] }> = [
    { cell: stage.start, path: [] },
  ];
  const visited = new Set([radialCellKey(stage.start)]);
  const directions: RadialDirection[] = ["out", "in", "ccw", "cw"];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const direction of directions) {
      const plan = radialSlide(stage, current.cell, direction);
      if (plan.outcome === "goal") return [...current.path, direction];
      if (plan.outcome !== "stop") continue;
      const key = radialCellKey(plan.destination);
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({
        cell: plan.destination,
        path: [...current.path, direction],
      });
    }
  }
  return null;
}

WORMHOLE_STAGES.forEach((stage) => {
  const solution = solve(stage);
  if (!solution || solution.length !== stage.par) {
    throw new Error(`웜홀 ${stage.id}번 맵 PAR 검증에 실패했습니다.`);
  }
});
