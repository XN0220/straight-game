import assert from "node:assert/strict";
import {
  EXOTIC_STAGES,
  EXOTIC_WORLDS,
  exoticStageBand,
  exoticStep,
  gridCellKey,
  initialExoticState,
  solveExoticStage,
} from "../app/exotic-engine.ts";

assert.equal(EXOTIC_WORLDS.length, 4, "중력핵을 제외한 신규 세계는 4개여야 합니다.");

function sharesCell(left, right) {
  const rightKeys = new Set(right.map(gridCellKey));
  return left.some((cell) => rightKeys.has(gridCellKey(cell)));
}

function baseStage(worldId, overrides = {}) {
  return {
    id: 1,
    worldId,
    cols: 5,
    rows: 5,
    start: { col: 1, row: 2 },
    echoStart: null,
    goal: { col: 4, row: 4 },
    echoGoal: null,
    walls: [],
    altWalls: [],
    shiftCells: [],
    dayWalls: [],
    nightWalls: [],
    keyCell: null,
    startPhase: 0,
    goalDimension: null,
    goalPhase: null,
    verticalWrap: false,
    par: 1,
    auxiliaryMechanics: [],
    ...overrides,
  };
}

// 공통 규칙: 빈 칸이 이어지면 중간에 멈추지 않고 장애물 직전까지 이동합니다.
{
  const stage = baseStage("overlay_dimension", {
    walls: [{ col: 4, row: 2 }],
    altWalls: [{ col: 4, row: 2 }],
  });
  const step = exoticStep(stage, initialExoticState(stage), "right");
  assert.deepEqual(step.playerPath, [
    { col: 2, row: 2 },
    { col: 3, row: 2 },
  ]);
  assert.deepEqual(step.state.player, { col: 3, row: 2 });
}

// 중첩차원: 전환 직후 같은 자리에서 다음 방향 입력이 즉시 정상 이동합니다.
{
  const stage = baseStage("overlay_dimension", {
    start: { col: 1, row: 2 },
    shiftCells: [{ col: 1, row: 2 }],
    altWalls: [{ col: 4, row: 2 }],
    goalDimension: 1,
  });
  const shifted = exoticStep(stage, initialExoticState(stage), "shift");
  const moved = exoticStep(stage, shifted.state, "right");
  assert.equal(shifted.dimensionChanged, true);
  assert.equal(shifted.state.dimension, 1);
  assert.equal(moved.dead, false);
  assert.equal(moved.playerPath.length, 2);
  assert.deepEqual(moved.state.player, { col: 3, row: 2 });
}

// 잔상은 본체의 실제 이동 여부가 아니라 직전 입력 방향을 한 턴 늦게 수행합니다.
{
  const stage = baseStage("echo_galaxy", {
    start: { col: 1, row: 1 },
    echoStart: { col: 0, row: 3 },
    echoGoal: { col: 3, row: 3 },
    walls: [
      { col: 2, row: 1 },
      { col: 1, row: 4 },
      { col: 4, row: 3 },
    ],
  });
  const first = exoticStep(stage, initialExoticState(stage), "right");
  const second = exoticStep(stage, first.state, "down");
  assert.equal(first.playerPath.length, 0);
  assert.equal(first.state.previous, "right");
  assert.deepEqual(second.echoPath, [
    { col: 1, row: 3 },
    { col: 2, row: 3 },
    { col: 3, row: 3 },
  ]);
}

// 뫼비우스의 좌우 경계는 반전 연결되고, 연결되지 않은 위아래 경계는 벽처럼 멈춥니다.
{
  const stage = baseStage("mobius_corridor", {
    start: { col: 0, row: 1 },
    walls: [{ col: 3, row: 3 }],
  });
  const wrapped = exoticStep(stage, initialExoticState(stage), "left");
  assert.equal(wrapped.playerWrapped, true);
  assert.deepEqual(wrapped.playerPath, [{ col: 4, row: 3 }]);
  assert.deepEqual(wrapped.state.player, { col: 4, row: 3 });

  const topStage = baseStage("mobius_corridor", {
    start: { col: 1, row: 1 },
  });
  const top = exoticStep(topStage, initialExoticState(topStage), "up");
  assert.equal(top.dead, false);
  assert.deepEqual(top.playerPath, [{ col: 1, row: 0 }]);
}

for (const world of EXOTIC_WORLDS) {
  const stages = EXOTIC_STAGES[world.id];
  assert.equal(stages.length, 30, `${world.name}은 30단계여야 합니다.`);

  for (const stage of stages) {
    const band = exoticStageBand(stage.id);
    assert.equal(stage.worldId, world.id);
    assert.equal("gravityBlocks" in stage, false, `${world.name} ${stage.id}단계에 이동 블록이 남아 있습니다.`);
    assert.ok(stage.par >= band.min && stage.par <= band.max);
    assert.equal(stage.keyCell === null, stage.id < 11);
    assert.equal(sharesCell(stage.dayWalls, stage.nightWalls), false);

    const stageBefore = JSON.stringify(stage);
    const solution = solveExoticStage(stage, stage.par);
    assert.ok(solution, `${world.name} ${stage.id}단계를 풀 수 없습니다.`);
    assert.equal(solution.path.length, stage.par);
    assert.equal(solution.usesCoreRule, true);

    let state = initialExoticState(stage);
    let complete = false;
    let shifts = 0;
    let wraps = 0;
    let echoTurns = 0;
    let phaseChanges = 0;
    let longestVisibleSlide = 0;
    for (const action of solution.path) {
      const step = exoticStep(stage, state, action);
      assert.equal(step.dead, false, `${world.name} ${stage.id}단계의 검증 경로가 경계를 벗어납니다.`);
      longestVisibleSlide = Math.max(
        longestVisibleSlide,
        step.playerPath.length,
        step.echoPath.length,
      );
      if (step.dimensionChanged) shifts += 1;
      if (step.playerWrapped || step.echoWrapped) wraps += 1;
      if (state.previous !== null && stage.worldId === "echo_galaxy") echoTurns += 1;
      if (step.phaseChanged) {
        phaseChanges += 1;
        const activeWalls = step.state.phase === 0 ? stage.dayWalls : stage.nightWalls;
        assert.equal(
          activeWalls.some(
            (cell) => gridCellKey(cell) === gridCellKey(step.state.player),
          ),
          false,
          `${world.name} ${stage.id}단계 전환 후 캐릭터와 벽이 겹칩니다.`,
        );
      }
      state = step.state;
      complete = step.complete;
    }
    assert.equal(complete, true);
    assert.ok(longestVisibleSlide >= 1);
    if (stage.id >= 11) assert.equal(state.hasKey, true);
    if (stage.worldId === "overlay_dimension") {
      assert.ok(shifts >= (stage.id <= 10 ? 1 : stage.id <= 20 ? 2 : 3));
      assert.notEqual(stage.goalDimension, null);
      assert.equal(sharesCell(stage.shiftCells, stage.walls), false);
      assert.equal(sharesCell(stage.shiftCells, stage.altWalls), false);
    }
    if (stage.worldId === "echo_galaxy") assert.ok(echoTurns >= 1);
    if (stage.worldId === "eclipse_planet") {
      assert.ok(stage.dayWalls.length >= 1);
      assert.ok(stage.nightWalls.length >= 1);
      assert.ok(phaseChanges >= 1);
      assert.notEqual(stage.goalPhase, stage.startPhase);
    }
    if (stage.worldId === "mobius_corridor") assert.ok(wraps >= 1);
    assert.equal(JSON.stringify(stage), stageBefore, `${world.name} ${stage.id}단계의 고정 블록이 변했습니다.`);
  }
}

for (const world of EXOTIC_WORLDS) {
  assert.ok(EXOTIC_STAGES[world.id][9].par >= 6);
  assert.ok(EXOTIC_STAGES[world.id][19].par >= 10);
  assert.ok(EXOTIC_STAGES[world.id][29].par >= 18);
}

process.stdout.write(
  "신규 웜홀 4개 세계 · 120단계 연속 직진/차원 전환/잔상 지연/낮밤 전환/뫼비우스 연결/BFS 검증 통과\n",
);
