import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

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

test("renders the Earth training and three-planet campaign shell", async () => {
  const html = await renderHome();
  assert.match(html, /직진 게임/);
  assert.doesNotMatch(html, /직선 게임|직진게임/);
  assert.match(html, /EARTH TRAINING \+ 3 PLANETS/);
  assert.match(html, /120 VERIFIED MAPS/);
  assert.match(html, /지구 궤도 연구실/);
  assert.match(html, /쉬움/);
  assert.match(html, /보통/);
  assert.match(html, /잠긴 행성/);
  assert.doesNotMatch(html, /기록 공유/);
});
