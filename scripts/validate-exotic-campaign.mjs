import assert from "node:assert/strict";
import {
  EXOTIC_STAGES,
  EXOTIC_WORLDS,
  exoticStageBand,
  exoticStep,
  initialExoticState,
  solveExoticStage,
} from "../app/exotic-engine.ts";

assert.equal(EXOTIC_WORLDS.length, 4, "중력핵을 제외한 신규 세계는 4개여야 합니다.");

for (const world of EXOTIC_WORLDS) {
  const stages = EXOTIC_STAGES[world.id];
  assert.equal(stages.length, 30, `${world.name}은 30단계여야 합니다.`);

  for (const stage of stages) {
    const band = exoticStageBand(stage.id);
    assert.equal(stage.worldId, world.id);
    assert.equal("gravityBlocks" in stage, false, `${world.name} ${stage.id}단계에 이동 블록이 남아 있습니다.`);
    assert.ok(stage.par >= band.min && stage.par <= band.max);
    assert.equal(stage.keyCell === null, stage.id < 11);

    const stageBefore = JSON.stringify(stage);
    const solution = solveExoticStage(stage, stage.par);
    assert.ok(solution, `${world.name} ${stage.id}단계를 풀 수 없습니다.`);
    assert.equal(solution.path.length, stage.par);
    assert.equal(solution.usesCoreRule, true);

    let state = initialExoticState(stage);
    let complete = false;
    for (const action of solution.path) {
      const step = exoticStep(stage, state, action);
      assert.equal(step.dead, false, `${world.name} ${stage.id}단계의 검증 경로가 경계를 벗어납니다.`);
      state = step.state;
      complete = step.complete;
    }
    assert.equal(complete, true);
    if (stage.id >= 11) assert.equal(state.hasKey, true);
    assert.equal(JSON.stringify(stage), stageBefore, `${world.name} ${stage.id}단계의 고정 블록이 변했습니다.`);
  }
}

for (const world of EXOTIC_WORLDS) {
  assert.ok(EXOTIC_STAGES[world.id][9].par >= 6);
  assert.ok(EXOTIC_STAGES[world.id][19].par >= 10);
  assert.ok(EXOTIC_STAGES[world.id][29].par >= 18);
}

process.stdout.write("신규 웜홀 4개 세계 · 120단계 고정 블록/경계 충돌/BFS 검증 통과\n");
