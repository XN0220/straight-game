import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;
const socialPreviewUrl =
  "https://xn0220.github.io/straight-game/social-preview.jpg";

async function renderHome() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  return response.text();
}

test("renders development preview metadata", async () => {
  assert.match(await renderHome(), developmentPreviewMeta);
});

test("disables stale development caches without deleting game progress", async () => {
  const html = await renderHome();
  assert.match(
    html,
    /http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"/i,
  );
  assert.match(html, /http-equiv="Pragma" content="no-cache"/i);
  assert.match(html, /data-development-cache-reset="straight-game"/);
  assert.match(html, /navigator\.serviceWorker\.getRegistrations/);
  assert.match(html, /cache\.delete\(request\)/);
  assert.doesNotMatch(html, /localStorage\.clear/);
});

test("renders share preview metadata", async () => {
  const html = await renderHome();
  assert.match(html, /property="og:title" content="직진 게임"/);
  assert.match(html, /property="og:type" content="website"/);
  assert.match(
    html,
    new RegExp(
      `property="og:image" content="${socialPreviewUrl.replaceAll(".", "\\.")}"`,
    ),
  );
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /rel="canonical" href="https:\/\/xn0220\.github\.io\/straight-game\/"/);
});

test("renders the Earth training and seven-planet campaign shell", async () => {
  const html = await renderHome();
  assert.match(html, /직진 게임/);
  assert.doesNotMatch(html, /직선 게임|직진게임/);
  assert.match(html, /7개 행성 240개 맵/);
  assert.doesNotMatch(html, /잠긴 행성/);
  assert.doesNotMatch(html, /기록 공유/);

  const engineSource = await readFile(new URL("../app/game-engine.ts", import.meta.url), "utf8");
  assert.match(engineSource, /지구 궤도 연구실/);
  for (const planet of ["아르코", "에어론", "넥서스", "볼테라", "샤디아", "기어라", "프리즘"]) {
    assert.match(engineSource, new RegExp(planet));
  }
});

test("keeps planet map colors aligned and provides twelve ready-made avatars", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const engineSource = await readFile(new URL("../app/game-engine.ts", import.meta.url), "utf8");
  const globalCssSource = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.equal((pageSource.match(/\bid:\s*"(?:mint|berry|chick|space|luna|cat|slime|penguin|rocket|cactus|snow|fox)"/g) ?? []).length, 12);
  assert.match(pageSource, /네온 고양이/);
  assert.match(pageSource, /별빛 여우/);
  assert.match(engineSource, /화산 행성 아르코/);
  assert.doesNotMatch(engineSource, /벽돌 행성 아르코|붉은 벽돌 행성/);
  assert.match(pageSource, /<strong>\{planet\.name\}<\/strong>/);
  const normalPlanetColors = [
    "#ff4d5f", "#29c5f6", "#8d65ff", "#ff8a2b", "#27d49b", "#f4c542", "#ec6fe7",
  ];
  assert.equal(new Set(normalPlanetColors).size, 7);
  normalPlanetColors.forEach((color, index) => {
    const planetNumber = index + 2;
    assert.match(
      globalCssSource,
      new RegExp(`\\.planet-${planetNumber}\\s*\\{[^}]*--mint:\\s*${color}`, "s"),
    );
    assert.match(
      globalCssSource,
      new RegExp(`\\.planet-key-${planetNumber}\\s*\\{\\s*--key-accent:\\s*${color}`),
    );
    assert.match(
      globalCssSource,
      new RegExp(`\\.planet-key-${planetNumber} \\.planet-image\\s*\\{`),
    );
  });
  assert.match(globalCssSource, /@media \(max-width: 720px\)[\s\S]*?\.planet-keypad-tabs\s*\{[^}]*grid-template-columns:\s*repeat\(2,/);
});

test("keeps all 210 normal maps inside the requested progression and verification rules", async () => {
  const dataSource = await readFile(
    new URL("../app/normal-campaign-data.ts", import.meta.url),
    "utf8",
  );
  const json = dataSource
    .replace(/^.*?=\s*/s, "")
    .replace(/;\s*$/, "");
  const stages = JSON.parse(json);
  const primaryMechanics = [null, "oneWay", "portal", "switch", "fragile", "rotator", "phase"];

  assert.equal(stages.length, 210);
  for (let planet = 0; planet < 7; planet += 1) {
    const planetStages = stages.slice(planet * 30, planet * 30 + 30);
    assert.equal(planetStages.length, 30);
    planetStages.forEach((stage, index) => {
      assert.equal(stage.id, planet * 30 + index + 1);
      assert.ok(stage.shortestPaths >= 1 && stage.shortestPaths <= 4);
      assert.ok(stage.expectedMechanics.length <= 2);
      assert.equal(
        stage.mapSize,
        index < 10 ? "small" : index < 20 ? "medium" : "full",
      );
      if (index < 10) assert.ok(stage.expectedMechanics.length <= 1);
      if (planet === 0) assert.equal(stage.expectedMechanics.length, 0);
      if (planet > 0) assert.ok(stage.expectedMechanics.includes(primaryMechanics[planet]));
      if (index >= 25) assert.ok(stage.expectedPar >= 20);
    });
    assert.deepEqual(
      planetStages.slice(25).map((stage) => stage.expectedPar),
      [20, 22, 24, 26, 30],
    );
  }

  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(pageSource, /isBossStage\(level\.localId\) \? "is-boss"/);
  assert.match(pageSource, /MAP 01 · NEW MECHANIC/);
  assert.match(pageSource, /설명을 닫지 않아도 바로 이동/);
});

test("renders undo, continue, midpoint hint, and wormhole beta entry points", async () => {
  const html = await renderHome();
  assert.match(html, /맵 선택/);
  assert.match(html, /이어하기/);
  assert.match(html, /게임 정보/);
  assert.match(html, /웜홀 : 미지의 구역/);

  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const speedControlSource = await readFile(
    new URL("../app/speed-control.tsx", import.meta.url),
    "utf8",
  );
  assert.match(pageSource, /한 수 되돌리기/);
  assert.match(pageSource, /MOVE_SPEED \* moveSpeedRef\.current/);
  assert.match(speedControlSource, /X1\.5/);
  assert.match(speedControlSource, /X2/);
  assert.match(speedControlSource, /nextMoveSpeed/);
  assert.match(pageSource, /최적 경로의 절반 지점/);
  assert.match(pageSource, /최단보다 10회 이내/);
});

test("defines the three 30-map wormhole campaigns and keypad map selectors", async () => {
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const wormholeSource = await readFile(
    new URL("../app/wormhole-engine.ts", import.meta.url),
    "utf8",
  );
  const wormholeModeSource = await readFile(
    new URL("../app/wormhole-mode.tsx", import.meta.url),
    "utf8",
  );
  const hexSource = await readFile(new URL("../app/hex-engine.ts", import.meta.url), "utf8");
  const hexModeSource = await readFile(new URL("../app/hex-mode.tsx", import.meta.url), "utf8");
  const twinSource = await readFile(new URL("../app/twin-engine.ts", import.meta.url), "utf8");
  const twinModeSource = await readFile(new URL("../app/twin-mode.tsx", import.meta.url), "utf8");
  const globalCssSource = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(pageSource, /planet-keypad-tabs/);
  assert.match(pageSource, /stage-keypad/);
  assert.doesNotMatch(pageSource, /wormhole-planet-key/);
  assert.match(pageSource, /className="wormhole-entry"/);
  assert.match(pageSource, /avatarPixels=\{avatarPixels\}/);
  assert.match(pageSource, /lazy\(\(\) =>/);
  assert.match(pageSource, /import\("\.\/wormhole-mode"\)/);
  assert.match(wormholeSource, /Array\.from\(\{ length: 30 \}/);
  assert.match(wormholeSource, /stage\.id >= 16 && !solution\.features\.has\("portal"\)/);
  assert.match(wormholeSource, /stage\.id >= 21 && !solution\.features\.has\("toggle"\)/);
  assert.match(wormholeModeSource, /실험 버전 · 30 MAPS/);
  assert.match(wormholeModeSource, /육각 성운 헥사리움/);
  assert.match(wormholeModeSource, /330 \/ moveSpeed/);
  assert.match(wormholeModeSource, /7 EXPERIMENTS · 210 MAPS/);
  assert.match(wormholeModeSource, /쌍성계 제미니아/);
  assert.match(wormholeModeSource, /radial-player-pixel/);
  assert.match(wormholeModeSource, /className="radial-up"/);
  assert.match(wormholeModeSource, /className="radial-left"/);
  assert.match(wormholeModeSource, /className="radial-right"/);
  assert.match(wormholeModeSource, /className="radial-down"/);
  assert.doesNotMatch(wormholeModeSource, /<small>바깥<\/small>|<small>반시계<\/small>/);
  assert.doesNotMatch(wormholeModeSource, /<h2>\{stage\.name\}<\/h2>/);
  assert.doesNotMatch(wormholeModeSource, /<em>PAR \{item\.par\}/);
  assert.match(wormholeModeSource, /aria-label=\{`\$\{item\.id\}번, 별 \$\{stars\}개`\}/);
  assert.match(wormholeModeSource, /wormhole-mode speed-\$\{String\(moveSpeed\)/);
  assert.match(wormholeModeSource, /\$\{screen === "select" \? "is-selecting" : "is-playing"\}/);
  assert.match(globalCssSource, /\.wormhole-mode\.is-playing\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(globalCssSource, /\.site-shell\.screen-playing[\s\S]*?height:\s*100svh/);
  assert.match(wormholeModeSource, /stored\.slice\(0, WORMHOLE_STAGES\.length\)/);
  assert.match(hexSource, /Array\.from\(\{ length: 30 \}/);
  assert.match(hexSource, /stage\.id >= 21 && !solution\.features\.has\("portal"\)/);
  assert.match(hexSource, /stage\.id >= 26 && !solution\.features\.has\("switch"\)/);
  assert.match(hexModeSource, /Q·E \/ A·D \/ Z·C/);
  assert.match(hexModeSource, /320 \/ moveSpeed/);
  assert.match(hexModeSource, /className="hex-nw"/);
  assert.match(hexModeSource, /className="hex-ne"/);
  assert.match(hexModeSource, /className="hex-w"/);
  assert.match(hexModeSource, /className="hex-e"/);
  assert.match(hexModeSource, /className="hex-sw"/);
  assert.match(hexModeSource, /className="hex-se"/);
  assert.match(twinSource, /Array\.from\(\{ length: 30 \}/);
  assert.match(twinSource, /stage\.par - HEX_STAGES\[stage\.id - 1\]\.par/);
  assert.match(twinSource, /offset < 2 \|\| offset > 4/);
  assert.doesNotMatch(twinSource, /portal|wormhole/i);
  assert.match(twinModeSource, /두 캐릭터가 모두 멈춘 뒤 다음 입력/);
  assert.match(twinSource, /state\.leftDone \|\| left\.outcome === "goal"/);
  assert.match(twinSource, /stage\.par < 15 \|\| stage\.par > 25/);
  assert.match(twinSource, /gimmick: "resonance-gate" \| null/);
  assert.match(twinSource, /!state\.gateOpen \|\| !state\.gateCrossed/);
  assert.match(twinModeSource, /공명 게이트 열림/);
  assert.doesNotMatch(twinModeSource, /wormhole-stage-legend/);
  assert.match(twinModeSource, /initialTwinState/);
  assert.match(twinModeSource, /ARRIVE/);
  assert.match(globalCssSource, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(globalCssSource, /\.twin-gimmick-state/);
});

test("keeps four fixed-block 30-map wormhole worlds after removing gravity core", async () => {
  const engineSource = await readFile(
    new URL("../app/exotic-engine.ts", import.meta.url),
    "utf8",
  );
  const modeSource = await readFile(
    new URL("../app/exotic-mode.tsx", import.meta.url),
    "utf8",
  );
  const hubSource = await readFile(
    new URL("../app/wormhole-mode.tsx", import.meta.url),
    "utf8",
  );
  const cssSource = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );

  for (const world of [
    "overlay_dimension",
    "echo_galaxy",
    "eclipse_planet",
    "mobius_corridor",
  ]) {
    assert.match(engineSource, new RegExp(`"${world}"`));
  }
  for (const name of ["중첩차원", "잔상은하", "일식행성", "뫼비우스 회랑"]) {
    assert.match(engineSource, new RegExp(name));
  }
  assert.doesNotMatch(engineSource, /gravity_core|중력핵|gravityBlocks|settleGravityLine/);

  assert.match(engineSource, /Array\.from\(\{ length: 30 \}/);
  assert.match(engineSource, /solveExoticStage/);
  assert.match(engineSource, /PRESET_ATTEMPTS/);
  assert.match(engineSource, /PRESET_PARS/);
  assert.match(engineSource, /stage\.par = PRESET_PARS/);
  assert.doesNotMatch(engineSource, /Object\.values\(EXOTIC_STAGES\).*forEach/s);
  assert.match(engineSource, /state\.previous/);
  assert.match(engineSource, /dead:\s*true/);
  assert.match(engineSource, /!inside\(stage, candidate\.next\)/);
  assert.match(engineSource, /next\.row = stage\.rows - 1 - cell\.row/);
  assert.match(engineSource, /state\.phase === 0 \? 1 : 0/);
  assert.match(engineSource, /state\.dimension === 0 \? 1 : 0/);

  assert.doesNotMatch(modeSource, /계산 최소 조작|최단 입력|탐색 상태|>검증</);
  assert.doesNotMatch(cssSource, /\.exotic-debug/);
  assert.match(modeSource, /item\.id === 10 \|\| item\.id === 20 \|\| item\.id === 30/);
  assert.match(modeSource, /straight-line-\$\{worldId\}-bests-v1/);
  assert.match(hubSource, /7 EXPERIMENTS · 210 MAPS/);
  assert.match(hubSource, /EXOTIC_WORLDS\.map/);
  assert.doesNotMatch(hubSource, /wormhole-stage-legend/);
  assert.doesNotMatch(modeSource, /wormhole-stage-legend|단계 구성/);
  assert.match(cssSource, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(cssSource, /\.exotic-stage-grid button\.is-exotic-boss/);
  assert.match(cssSource, /\.exotic-tile\s*\{[\s\S]*?border:\s*1px solid transparent[\s\S]*?background:\s*transparent/s);
  assert.match(cssSource, /\.lab-campaign-card\s*\{[\s\S]*?overflow:\s*hidden/s);
  assert.match(cssSource, /\.screen-playing \.chapter-status\s*\{[^}]*display:\s*none/s);
  assert.match(cssSource, /\.exotic-mode\.is-playing\s*\{[^}]*overflow:\s*hidden/s);
  assert.doesNotMatch(cssSource, /is-gravity-block|world-gravity_core/);
});
