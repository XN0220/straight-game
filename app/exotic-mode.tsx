"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { starsFor } from "./game-engine";
import {
  EXOTIC_STAGES,
  EXOTIC_WORLDS,
  exoticStep,
  gridCellKey,
  initialExoticState,
  type ExoticAction,
  type ExoticRunState,
  type ExoticStage,
  type ExoticWorldId,
  type GridCell,
  type GridDirection,
} from "./exotic-engine";

type ModeScreen = "select" | "playing" | "won";
type HistoryItem = { state: ExoticRunState; moves: number };

const KEY_DIRECTION: Record<string, GridDirection | undefined> = {
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowDown: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
};

const DIRECTION_LABEL: Record<GridDirection, string> = {
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
};

function cloneRunState(state: ExoticRunState): ExoticRunState {
  return {
    ...state,
    player: { ...state.player },
    echo: state.echo ? { ...state.echo } : null,
    blocks: state.blocks.map((cell) => ({ ...cell })),
  };
}

function storageKey(worldId: ExoticWorldId) {
  return `straight-line-${worldId}-bests-v1`;
}

export function exoticTotalStars(worldId: ExoticWorldId) {
  if (typeof window === "undefined") return 0;
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey(worldId)) ?? "null");
    if (!Array.isArray(stored)) return 0;
    return EXOTIC_STAGES[worldId].reduce(
      (sum, stage, index) =>
        sum + starsFor(typeof stored[index] === "number" ? stored[index] : null, stage.par),
      0,
    );
  } catch {
    return 0;
  }
}

function sameCell(a: GridCell | null, b: GridCell) {
  return a !== null && a.col === b.col && a.row === b.row;
}

function activeWalls(stage: ExoticStage, state: ExoticRunState) {
  if (stage.worldId === "overlay_dimension" && state.dimension === 1) {
    return new Set(stage.altWalls.map(gridCellKey));
  }
  const walls = new Set(stage.walls.map(gridCellKey));
  if (stage.worldId === "eclipse_planet" && state.phase === 1) {
    stage.phaseWalls.forEach((cell) => walls.add(gridCellKey(cell)));
    walls.delete(gridCellKey(state.player));
  }
  return walls;
}

function stageSubtitle(stage: ExoticStage) {
  if (stage.id <= 5) return "고유 규칙 소개 · 작은 맵";
  if (stage.id <= 10) return stage.id === 10 ? "첫 번째 보스 · 기초 종합" : "고유 규칙 기초 응용";
  if (stage.id <= 15) return "중간 크기 맵 적응 · 열쇠와 문";
  if (stage.id <= 20) return stage.id === 20 ? "두 번째 보스 · 순서와 재방문" : "상태 조합과 이동 순서";
  if (stage.id <= 25) return "고급 우회와 상태 재활용";
  if (stage.id < 30) return "최종 도전 · 판단 밀도 강화";
  return "최종 보스 · 세 구역 종합";
}

function statusText(stage: ExoticStage, state: ExoticRunState) {
  switch (stage.worldId) {
    case "overlay_dimension":
      return state.dimension === 0 ? "현재 차원 · 현실" : "현재 차원 · 이면";
    case "echo_galaxy":
      return `직전 입력 · ${state.previous ? DIRECTION_LABEL[state.previous] : "대기"}`;
    case "eclipse_planet":
      return `${state.phase === 0 ? "☀ 낮" : "☾ 밤"} · 다음 이동 후 ${state.phase === 0 ? "밤" : "낮"}`;
    case "gravity_core":
      return `이동 블록 ${state.blocks.length}개 · 동시 이동`;
    case "mobius_corridor":
      return stage.verticalWrap ? "좌우·상하 반전 연결" : "좌우 세로 반전 연결";
  }
}

function Avatar({
  pixels,
  ghost = false,
}: {
  pixels: Array<string | null>;
  ghost?: boolean;
}) {
  return (
    <span className={`exotic-avatar ${ghost ? "is-ghost" : ""}`}>
      {pixels.map((color, index) =>
        color ? (
          <i
            key={index}
            style={{
              background: color,
              gridColumn: (index % 10) + 1,
              gridRow: Math.floor(index / 10) + 1,
            }}
          />
        ) : null,
      )}
    </span>
  );
}

function MiniPreview({
  stage,
  dimension,
}: {
  stage: ExoticStage;
  dimension: 0 | 1;
}) {
  const walls = dimension === 0 ? stage.walls : stage.altWalls;
  const wallKeys = new Set(walls.map(gridCellKey));
  return (
    <div
      className="exotic-preview-grid"
      style={{
        gridTemplateColumns: `repeat(${stage.cols}, 1fr)`,
        gridTemplateRows: `repeat(${stage.rows}, 1fr)`,
      }}
      aria-label={dimension === 0 ? "현실 차원 미리보기" : "이면 차원 미리보기"}
    >
      {Array.from({ length: stage.cols * stage.rows }, (_, index) => {
        const cell = { col: index % stage.cols, row: Math.floor(index / stage.cols) };
        return <i key={gridCellKey(cell)} className={wallKeys.has(gridCellKey(cell)) ? "is-wall" : ""} />;
      })}
    </div>
  );
}

function Board({
  stage,
  state,
  avatarPixels,
}: {
  stage: ExoticStage;
  state: ExoticRunState;
  avatarPixels: Array<string | null>;
}) {
  const walls = activeWalls(stage, state);
  const baseWallKeys = new Set(stage.walls.map(gridCellKey));
  const phaseWallKeys = new Set(stage.phaseWalls.map(gridCellKey));
  const shiftKeys = new Set(stage.shiftCells.map(gridCellKey));
  const blockKeys = new Set(state.blocks.map(gridCellKey));
  const cells = Array.from({ length: stage.cols * stage.rows }, (_, index) => ({
    col: index % stage.cols,
    row: Math.floor(index / stage.cols),
  }));
  const boardStyle = {
    "--exotic-cols": stage.cols,
    "--exotic-rows": stage.rows,
    gridTemplateColumns: `repeat(${stage.cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${stage.rows}, minmax(0, 1fr))`,
  } as CSSProperties;

  return (
    <div
      className={`exotic-board world-${stage.worldId} phase-${state.phase}`}
      style={boardStyle}
      role="img"
      aria-label={`${stage.id}단계 ${stage.cols}×${stage.rows} 퍼즐 맵`}
    >
      {cells.map((cell) => {
        const key = gridCellKey(cell);
        const classes = [
          "exotic-tile",
          walls.has(key) ? "is-wall" : "",
          phaseWallKeys.has(key) && !baseWallKeys.has(key) ? "is-phase-wall" : "",
          shiftKeys.has(key) ? "is-shift" : "",
          blockKeys.has(key) ? "is-gravity-block" : "",
          sameCell(stage.keyCell, cell) && !state.hasKey ? "is-key" : "",
          sameCell(stage.goal, cell) ? "is-goal" : "",
          sameCell(stage.goal, cell) && stage.keyCell !== null && !state.hasKey ? "is-locked" : "",
          sameCell(stage.echoGoal, cell) ? "is-echo-goal" : "",
        ].filter(Boolean).join(" ");
        return (
          <span key={key} className={classes}>
            {sameCell(stage.keyCell, cell) && !state.hasKey && <b>◆</b>}
            {sameCell(stage.goal, cell) && <b>{state.hasKey || !stage.keyCell ? "◎" : "▥"}</b>}
            {sameCell(stage.echoGoal, cell) && <b>◇</b>}
            {shiftKeys.has(key) && <b>⇄</b>}
            {blockKeys.has(key) && <b>■</b>}
          </span>
        );
      })}
      {stage.worldId === "mobius_corridor" && (
        <>
          <span className="mobius-edge mobius-edge-left">↕</span>
          <span className="mobius-edge mobius-edge-right">↕</span>
          {stage.verticalWrap && (
            <>
              <span className="mobius-edge mobius-edge-top">↔</span>
              <span className="mobius-edge mobius-edge-bottom">↔</span>
            </>
          )}
        </>
      )}
      <span
        className="exotic-player"
        style={{ gridColumn: state.player.col + 1, gridRow: state.player.row + 1 }}
      >
        <Avatar pixels={avatarPixels} />
      </span>
      {state.echo && (
        <span
          className={`exotic-player exotic-echo ${state.echoDone ? "is-done" : ""}`}
          style={{ gridColumn: state.echo.col + 1, gridRow: state.echo.row + 1 }}
        >
          <Avatar pixels={avatarPixels} ghost />
        </span>
      )}
    </div>
  );
}

export function ExoticMode({
  worldId,
  onClose,
  avatarPixels,
}: {
  worldId: ExoticWorldId;
  onClose: () => void;
  avatarPixels: Array<string | null>;
}) {
  const world = EXOTIC_WORLDS.find((item) => item.id === worldId)!;
  const stages = EXOTIC_STAGES[worldId];
  const [screen, setScreen] = useState<ModeScreen>("select");
  const [stageIndex, setStageIndex] = useState(0);
  const [state, setState] = useState<ExoticRunState>(() => initialExoticState(stages[0]));
  const [moves, setMoves] = useState(0);
  const [moving, setMoving] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [bests, setBests] = useState<Array<number | null>>(
    Array(stages.length).fill(null),
  );
  const timerRef = useRef<number | null>(null);
  const stage = stages[stageIndex];

  useEffect(() => {
    const restoreFrame = window.requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(window.localStorage.getItem(storageKey(worldId)) ?? "null");
        if (Array.isArray(stored)) {
          const restored = Array<number | null>(stages.length).fill(null);
          stored.slice(0, stages.length).forEach((value, index) => {
            restored[index] = typeof value === "number" ? value : null;
          });
          setBests(restored);
        }
      } catch {
        // 손상된 기록만 이 세계의 기본값으로 복원합니다.
      }
    });
    return () => {
      window.cancelAnimationFrame(restoreFrame);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [stages.length, worldId]);

  const start = useCallback(
    (index: number) => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      setStageIndex(index);
      setState(initialExoticState(stages[index]));
      setMoves(0);
      setMoving(false);
      setHistory([]);
      setShowHelp(stages[index].id === 1);
      setScreen("playing");
    },
    [stages],
  );

  const undo = useCallback(() => {
    if (moving || screen !== "playing") return;
    setHistory((previous) => {
      const snapshot = previous.at(-1);
      if (!snapshot) return previous;
      setState(cloneRunState(snapshot.state));
      setMoves(snapshot.moves);
      return previous.slice(0, -1);
    });
  }, [moving, screen]);

  const act = useCallback(
    (action: ExoticAction) => {
      if (moving || screen !== "playing") return;
      const result = exoticStep(stage, state, action);
      if (!result.changed) return;
      const resultMoves = moves + 1;
      setHistory((previous) => [
        ...previous,
        { state: cloneRunState(state), moves },
      ]);
      setState(cloneRunState(result.state));
      setMoves(resultMoves);
      setMoving(true);
      timerRef.current = window.setTimeout(() => {
        setMoving(false);
        if (!result.complete) return;
        setBests((previous) => {
          const next = [...previous];
          if (next[stageIndex] === null || resultMoves < (next[stageIndex] as number)) {
            next[stageIndex] = resultMoves;
            window.localStorage.setItem(storageKey(worldId), JSON.stringify(next));
          }
          return next;
        });
        setScreen("won");
      }, 190);
    },
    [moves, moving, screen, stage, stageIndex, state, worldId],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (screen === "select") onClose();
        else setScreen("select");
        return;
      }
      if ((event.ctrlKey && event.key.toLowerCase() === "z") || event.key.toLowerCase() === "u") {
        event.preventDefault();
        undo();
        return;
      }
      if (event.key === " " && worldId === "overlay_dimension") {
        event.preventDefault();
        act("shift");
        return;
      }
      const direction = KEY_DIRECTION[event.key];
      if (direction) {
        event.preventDefault();
        act(direction);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [act, onClose, screen, undo, worldId]);

  const totalStars = useMemo(
    () =>
      bests.reduce<number>(
        (sum, best, index) => sum + starsFor(best, stages[index].par),
        0,
      ),
    [bests, stages],
  );

  const currentStatus = statusText(stage, state);
  const style = { "--exotic-accent": world.accent } as CSSProperties;

  return (
    <div
      className={`wormhole-mode exotic-mode world-${worldId} ${screen === "select" ? "is-selecting" : "is-playing"}`}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-label={`${world.name} 퍼즐`}
    >
      <header className="wormhole-header exotic-header">
        <div>
          <span>{world.english} · 30 MAPS</span>
          <strong>{world.name}</strong>
        </div>
        <button type="button" onClick={screen === "select" ? onClose : () => setScreen("select")}>
          {screen === "select" ? "실험 구역 선택" : "맵 선택"}
        </button>
      </header>

      {screen === "select" ? (
        <main className="exotic-select">
          <section className="exotic-select-heading">
            <span className="exotic-world-icon" aria-hidden="true">{world.icon}</span>
            <div>
              <span className="beta-chip">독립 규칙 · 턴 기반 · 30단계</span>
              <h2>{world.name}</h2>
              <p>{world.description}</p>
            </div>
          </section>
          <div className="wormhole-stage-legend">
            <span>01–05 규칙 소개</span>
            <span>06–10 기초 응용</span>
            <span>11–20 상태 조합</span>
            <span>21–30 고급 퍼즐</span>
          </div>
          <div className="wormhole-stage-grid exotic-stage-grid" aria-label={`${world.name} 30단계 선택`}>
            {stages.map((item, index) => {
              const stars = starsFor(bests[index], item.par);
              const boss = item.id === 10 || item.id === 20 || item.id === 30;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={boss ? "is-exotic-boss" : item.id >= 21 ? "is-master" : ""}
                  aria-label={`${item.id}번${boss ? " 보스" : ""}, 별 ${stars}개`}
                  onClick={() => start(index)}
                >
                  <span>{String(item.id).padStart(2, "0")}{boss && <b> ♛</b>}</span>
                  <em aria-hidden="true">{"★".repeat(stars)}{"☆".repeat(3 - stars)}</em>
                </button>
              );
            })}
          </div>
          <p className="wormhole-total">WORLD STAR {totalStars}/90 · 세계 ID별 독립 저장</p>
        </main>
      ) : (
        <main className="exotic-play">
          <section className="exotic-side">
            <div className="exotic-stage-title">
              <span className="beta-chip">
                MAP {String(stage.id).padStart(2, "0")}
                {(stage.id === 10 || stage.id === 20 || stage.id === 30) && " · BOSS"}
              </span>
              <strong>{stageSubtitle(stage)}</strong>
            </div>
            <div className="wormhole-score">
              <span>MOVE <strong>{moves}</strong></span>
              <span>PAR <strong>{stage.par}</strong></span>
              <span>STAR <strong>{starsFor(bests[stageIndex], stage.par)}</strong></span>
            </div>
            <div className="exotic-status">
              <span>{currentStatus}</span>
              {stage.keyCell && <span>{state.hasKey ? "◆ 문 개방 유지" : "◇ 열쇠 필요"}</span>}
            </div>
            {stage.worldId === "overlay_dimension" && (
              <div className="overlay-preview">
                <small>{state.dimension === 0 ? "이면 미리보기" : "현실 미리보기"}</small>
                <MiniPreview stage={stage} dimension={state.dimension === 0 ? 1 : 0} />
              </div>
            )}
            {showHelp && <p className="exotic-help">{world.tutorial}</p>}
            <div className="exotic-tools">
              <button type="button" disabled={history.length === 0 || moving} onClick={undo}>↶ 되돌리기</button>
              <button type="button" onClick={() => start(stageIndex)}>↻ 다시 시작</button>
              <button type="button" onClick={() => setShowHelp((value) => !value)}>?</button>
            </div>
          </section>

          <section className={`exotic-board-area ${moving ? "is-moving" : ""}`}>
            <Board stage={stage} state={state} avatarPixels={avatarPixels} />
            {stage.worldId === "overlay_dimension" && (
              <button
                className="dimension-shift-button"
                type="button"
                onClick={() => act("shift")}
                disabled={!stage.shiftCells.some((cell) => sameCell(cell, state.player)) || moving}
              >
                ⇄ 차원 전환 <small>SPACE</small>
              </button>
            )}
            <div className="exotic-dpad" aria-label="방향 조작">
              <button className="exotic-up" type="button" onClick={() => act("up")}>↑</button>
              <button className="exotic-left" type="button" onClick={() => act("left")}>←</button>
              <span aria-hidden="true" />
              <button className="exotic-right" type="button" onClick={() => act("right")}>→</button>
              <button className="exotic-down" type="button" onClick={() => act("down")}>↓</button>
            </div>
          </section>

          {screen === "won" && (
            <div className="wormhole-win exotic-win">
              <span>WORLD RULE STABLE</span>
              <h2>{world.name} {stage.id}단계 클리어!</h2>
              <div>{"★".repeat(starsFor(moves, stage.par))}{"☆".repeat(3 - starsFor(moves, stage.par))}</div>
              <p>{moves}번 조작 · 최소 {stage.par}</p>
              <div>
                {stageIndex < stages.length - 1 && (
                  <button type="button" onClick={() => start(stageIndex + 1)}>다음 단계</button>
                )}
                <button type="button" onClick={() => setScreen("select")}>맵 선택</button>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
