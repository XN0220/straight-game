import {
  EXOTIC_WORLDS,
  exoticStep,
  exoticStageBand,
  gridCellKey,
  initialExoticState,
  makeExoticCandidate,
  solveExoticStage,
} from "../app/exotic-engine.ts";

const MAX_ATTEMPTS = 120_000;
const selectedWorlds = new Set(process.argv.slice(2));

function actionVariety(path) {
  return new Set(path.filter((action) => action !== "shift")).size;
}

function hasEnoughCurriculumDepth(worldId, id, path) {
  if (actionVariety(path) < (id <= 10 ? 2 : 3)) return false;
  if (worldId !== "overlay_dimension") return true;
  const shifts = path.filter((action) => action === "shift").length;
  if (id <= 10) return shifts >= 1;
  if (id <= 20) return shifts >= 2;
  return shifts >= 3;
}

function hasSafeEclipseTransitions(stage, path) {
  if (stage.worldId !== "eclipse_planet") return true;
  let state = initialExoticState(stage);
  for (const action of path) {
    const step = exoticStep(stage, state, action);
    state = step.state;
    if (!step.phaseChanged) continue;
    const activeWalls = state.phase === 0 ? stage.dayWalls : stage.nightWalls;
    if (activeWalls.some((cell) => gridCellKey(cell) === gridCellKey(state.player))) {
      return false;
    }
  }
  return true;
}

const attemptsByWorld = {};
const parsByWorld = {};

for (const world of EXOTIC_WORLDS.filter(
  (item) => selectedWorlds.size === 0 || selectedWorlds.has(item.id),
)) {
  const attempts = [];
  const pars = [];

  for (let id = 1; id <= 30; id += 1) {
    const band = exoticStageBand(id);
    let found = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const stage = makeExoticCandidate(world.id, id, attempt);
      const solution = solveExoticStage(stage, band.max);
      if (!solution) continue;
      if (solution.path.length < band.min || solution.path.length > band.max) continue;
      if (!solution.usesCoreRule) continue;
      if (!hasEnoughCurriculumDepth(world.id, id, solution.path)) continue;
      if (!hasSafeEclipseTransitions(stage, solution.path)) continue;
      found = { attempt, par: solution.path.length, explored: solution.exploredStates };
      break;
    }

    if (!found) {
      throw new Error(`${world.id} ${id}단계 후보를 ${MAX_ATTEMPTS}회 안에 찾지 못했습니다.`);
    }

    attempts.push(found.attempt);
    pars.push(found.par);
    process.stderr.write(
      `${world.id.padEnd(18)} ${String(id).padStart(2, "0")} · attempt ${String(found.attempt).padStart(6)} · PAR ${String(found.par).padStart(2)} · states ${found.explored}\n`,
    );
  }

  attemptsByWorld[world.id] = attempts;
  parsByWorld[world.id] = pars;
}

process.stdout.write(`${JSON.stringify({ attemptsByWorld, parsByWorld }, null, 2)}\n`);
