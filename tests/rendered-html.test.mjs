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

test("renders the Earth training and three-planet campaign shell", async () => {
  const html = await renderHome();
  assert.match(html, /직진 게임/);
  assert.doesNotMatch(html, /직선 게임|직진게임/);
  assert.match(html, /EARTH TRAINING \+ 3 PLANETS/);
  assert.match(html, /120 VERIFIED MAPS/);
  assert.match(html, /지구 궤도 연구실/);
  assert.match(html, /쉬움/);
  assert.match(html, /보통/);
  assert.doesNotMatch(html, /잠긴 행성/);
  assert.match(html, /아르코/);
  assert.match(html, /기어라/);
  assert.match(html, /프리즘/);
  assert.doesNotMatch(html, /기록 공유/);
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
  assert.match(globalCssSource, /\.planet-2\s*\{[^}]*--mint:\s*#ff5d78/s);
  assert.match(globalCssSource, /\.planet-key-2\s*\{\s*--key-accent:\s*#ff5d78/);
  assert.match(globalCssSource, /\.planet-4\s*\{[^}]*--mint:\s*#a987ff/s);
  assert.match(globalCssSource, /\.planet-key-4\s*\{\s*--key-accent:\s*#a987ff/);
  assert.match(globalCssSource, /@media \(max-width: 720px\)[\s\S]*?\.planet-keypad-tabs\s*\{[^}]*grid-template-columns:\s*repeat\(2,/);
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
  assert.match(wormholeSource, /Array\.from\(\{ length: 30 \}/);
  assert.match(wormholeSource, /stage\.id >= 16 && !solution\.features\.has\("portal"\)/);
  assert.match(wormholeSource, /stage\.id >= 21 && !solution\.features\.has\("toggle"\)/);
  assert.match(wormholeModeSource, /실험 버전 · 30 MAPS/);
  assert.match(wormholeModeSource, /육각 성운 헥사리움/);
  assert.match(wormholeModeSource, /330 \/ moveSpeed/);
  assert.match(wormholeModeSource, /3 EXPERIMENTS · 90 MAPS/);
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
  assert.match(globalCssSource, /\.wormhole-mode\.is-playing\s*\{[^}]*overflow-y:\s*auto/s);
  assert.doesNotMatch(globalCssSource, /\.wormhole-mode\.is-playing\s*\{[^}]*overflow:\s*hidden/s);
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
  assert.match(twinModeSource, /공명 스위치 · 반대 행성 게이트 개방/);
  assert.match(twinModeSource, /21–30 15~25 MOVE · 공명 게이트/);
  assert.match(twinModeSource, /initialTwinState/);
  assert.match(twinModeSource, /ARRIVE/);
  assert.match(globalCssSource, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(globalCssSource, /\.twin-gimmick-state/);
});
