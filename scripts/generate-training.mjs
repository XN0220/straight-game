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

const names = [
  "첫 직진", "목표까지 한 번", "한 번 멈추기", "두 번째 방향", "기초 조종 완료",
  "정지 블록", "바깥으로 돌아서", "반대편 정지점", "세 번의 추진", "정지 훈련 완료",
  "모서리 활용", "한 칸 옆으로", "꺾어서 도착", "넓어진 실험실", "경로 훈련 완료",
  "가짜 정지점", "먼저 멀어지기", "다른 벽 고르기", "네 번의 판단", "선택 훈련 완료",
  "열린 문", "위험한 출구", "안전한 벽", "경계 피하기", "생존 훈련 완료",
  "출발 전 점검", "우주 항로 예행", "긴 직선 시험", "최종 모의 탐사", "지구 훈련 수료",
];

const targets = [
  1, 1, 2, 2, 2,
  2, 2, 3, 3, 3,
  3, 3, 3, 4, 4,
  4, 4, 4, 4, 5,
  4, 4, 5, 5, 5,
  5, 5, 5, 6, 6,
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

const key = (cell) => `${cell.col},${cell.row}`;
const same = (a, b) => a.col === b.col && a.row === b.row;

function shuffle(values, random) {
  const next = [...values];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

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

  const interior = [];
  for (let row = TOP + 1; row < BOTTOM; row += 1) {
    for (let col = LEFT + 1; col < RIGHT; col += 1) {
      interior.push({ col, row });
    }
  }

  const group = Math.floor(stageIndex / 5);
  const obstacleTarget = group === 0 ? 2 + stageIndex : 6 + group * 2 + (stageIndex % 3);
  shuffle(interior, random).slice(0, obstacleTarget).forEach((cell) => {
    rows[cell.row][cell.col] = "#";
  });

  if (group >= 4) {
    const exits = [
      { col: LEFT + 2 + Math.floor(random() * (RIGHT - LEFT - 3)), row: TOP },
      { col: RIGHT, row: TOP + 2 + Math.floor(random() * (BOTTOM - TOP - 3)) },
    ];
    exits.slice(0, group === 4 ? 1 : 2).forEach((cell) => {
      rows[cell.row][cell.col] = ".";
    });
  }

  return rows;
}

function slide(rows, from, direction, goal) {
  const vector = VECTOR[direction];
  let current = { ...from };
  let distance = 0;
  while (true) {
    const next = { col: current.col + vector.col, row: current.row + vector.row };
    if (next.col < 0 || next.col >= GRID_COLS || next.row < 0 || next.row >= GRID_ROWS) {
      return { outcome: "death", distance };
    }
    if (rows[next.row][next.col] === "#") {
      return distance === 0
        ? { outcome: "blocked", distance }
        : { outcome: "stop", destination: current, distance };
    }
    current = next;
    distance += 1;
    if (same(current, goal)) return { outcome: "goal", destination: current, distance };
  }
}

function solve(rows, start, goal) {
  const queue = [{ cell: start, path: [], distances: [] }];
  const visited = new Set([key(start)]);
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    for (const direction of DIRECTIONS) {
      const move = slide(rows, current.cell, direction, goal);
      if (move.outcome === "goal") {
        return {
          path: [...current.path, direction],
          distances: [...current.distances, move.distance],
        };
      }
      if (move.outcome !== "stop") continue;
      const nextKey = key(move.destination);
      if (visited.has(nextKey)) continue;
      visited.add(nextKey);
      queue.push({
        cell: move.destination,
        path: [...current.path, direction],
        distances: [...current.distances, move.distance],
      });
    }
  }
  return null;
}

function createStage(stageIndex) {
  const target = targets[stageIndex];
  const random = rng(20260727 + stageIndex * 7919);
  for (let attempt = 0; attempt < 12000; attempt += 1) {
    const rows = makeLab(random, stageIndex);
    const open = [];
    for (let row = TOP + 1; row < BOTTOM; row += 1) {
      for (let col = LEFT + 1; col < RIGHT; col += 1) {
        if (rows[row][col] === ".") open.push({ col, row });
      }
    }
    const [start, goal] = shuffle(open, random);
    if (!start || !goal) continue;
    const solved = solve(rows, start, goal);
    if (!solved || solved.path.length !== target) continue;
    const average =
      solved.distances.reduce((sum, distance) => sum + distance, 0) / solved.distances.length;
    if (average < 2.4 || new Set(solved.path).size < Math.min(2, target)) continue;

    rows[start.row][start.col] = "S";
    rows[goal.row][goal.col] = "G";
    return {
      id: stageIndex + 1,
      name: names[stageIndex],
      rows: rows.map((row) => row.join("")),
      expectedPar: target,
    };
  }
  throw new Error(`Could not generate training stage ${stageIndex + 1}`);
}

const stages = Array.from({ length: 30 }, (_, index) => createStage(index));
const output =
  "// scripts/generate-training.mjs로 생성한 지구 연구실 초보 훈련 맵입니다.\n" +
  "export const TRAINING_ROWS = " +
  JSON.stringify(stages, null, 2) +
  ";\n";

writeFileSync(new URL("../app/training-data.ts", import.meta.url), output);
console.log(
  stages.map((stage) => `${String(stage.id).padStart(2, "0")}: ${stage.expectedPar} ${stage.name}`).join("\n"),
);
