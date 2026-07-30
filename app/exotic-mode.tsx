"use client";

import {
  Fragment,
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
const EXOTIC_CELL_MS = 64;

function cloneRunState(state: ExoticRunState): ExoticRunState {
  return {
    ...state,
    player: { ...state.player },
    echo: state.echo ? { ...state.echo } : null,
  };
}

function storageKey(worldId: ExoticWorldId) {
  return `straight-line-${worldId}-bests-v2`;
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
  if (stage.worldId === "eclipse_planet") {
    const phaseWalls = state.phase === 0 ? stage.dayWalls : stage.nightWalls;
    phaseWalls.forEach((cell) => walls.add(gridCellKey(cell)));
    walls.delete(gridCellKey(state.player));
  }
  return walls;
}

function statusText(stage: ExoticStage, state: ExoticRunState) {
  switch (stage.worldId) {
    case "overlay_dimension":
      return state.dimension === 0 ? "현실 차원 · 파란 벽 활성" : "이면 차원 · 보라 벽 활성";
    case "echo_galaxy":
      return `잔상의 다음 방향 · ${state.previous ? DIRECTION_LABEL[state.previous] : "첫 입력은 대기"}`;
    case "eclipse_planet":
      return `${state.phase === 0 ? "☀ 낮 · 해 벽 활성" : "☾ 밤 · 달 벽 활성"} → 다음은 ${state.phase === 0 ? "밤" : "낮"}`;
    case "mobius_corridor":
      return stage.verticalWrap ? "같은 색 가장자리끼리 반전 연결" : "좌우 가장자리 · 위아래 뒤집힘";
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
  playerTrail,
  echoTrail,
  dimensionPulse,
  phasePulse,
  wrapPulse,
}: {
  stage: ExoticStage;
  state: ExoticRunState;
  avatarPixels: Array<string | null>;
  playerTrail: GridCell[];
  echoTrail: GridCell[];
  dimensionPulse: boolean;
  phasePulse: boolean;
  wrapPulse: boolean;
}) {
  const walls = activeWalls(stage, state);
  const baseWallKeys = new Set(stage.walls.map(gridCellKey));
  const dayWallKeys = new Set(stage.dayWalls.map(gridCellKey));
  const nightWallKeys = new Set(stage.nightWalls.map(gridCellKey));
  const shiftKeys = new Set(stage.shiftCells.map(gridCellKey));
  const playerTrailKeys = new Set(playerTrail.map(gridCellKey));
  const echoTrailKeys = new Set(echoTrail.map(gridCellKey));
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
  const goalStateActive =
    (stage.goalDimension === null || stage.goalDimension === state.dimension) &&
    (stage.goalPhase === null || stage.goalPhase === state.phase);
  const goalLocked =
    (stage.keyCell !== null && !state.hasKey) || !goalStateActive;
  const goalSymbol =
    stage.worldId === "eclipse_planet"
      ? stage.goalPhase === 0
        ? "☀"
        : "☾"
      : "◎";
  const edgeColors = ["#ff8ecb", "#ffd166", "#74efc2", "#7ec8ff", "#d0a4ff", "#ff9b71", "#b6f06f", "#f3f5ff"];

  return (
    <div
      className={[
        "exotic-board",
        `world-${stage.worldId}`,
        `phase-${state.phase}`,
        `dimension-${state.dimension}`,
        dimensionPulse ? "is-dimension-changing" : "",
        phasePulse ? "is-phase-changing" : "",
        wrapPulse ? "is-wrapping" : "",
      ].filter(Boolean).join(" ")}
      style={boardStyle}
      role="img"
      aria-label={`${stage.id}단계 ${stage.cols}×${stage.rows} 퍼즐 맵. ${statusText(stage, state)}`}
    >
      {cells.map((cell) => {
        const key = gridCellKey(cell);
        const isDayWall = dayWallKeys.has(key);
        const isNightWall = nightWallKeys.has(key);
        const classes = [
          "exotic-tile",
          walls.has(key) ? "is-wall" : "",
          baseWallKeys.has(key) ? "is-fixed-wall" : "",
          isDayWall ? "is-day-wall" : "",
          isNightWall ? "is-night-wall" : "",
          (isDayWall || isNightWall) && !walls.has(key) ? "is-inactive-wall" : "",
          shiftKeys.has(key) ? "is-shift" : "",
          sameCell(stage.keyCell, cell) && !state.hasKey ? "is-key" : "",
          sameCell(stage.goal, cell) ? "is-goal" : "",
          sameCell(stage.goal, cell) && goalLocked ? "is-locked" : "",
          sameCell(stage.echoGoal, cell) ? "is-echo-goal" : "",
          playerTrailKeys.has(key) ? "is-player-trail" : "",
          echoTrailKeys.has(key) ? "is-echo-trail" : "",
        ].filter(Boolean).join(" ");
        return (
          <span key={key} className={classes}>
            {isDayWall && <b className="phase-wall-mark" aria-hidden="true">☀</b>}
            {isNightWall && <b className="phase-wall-mark" aria-hidden="true">☾</b>}
            {sameCell(stage.keyCell, cell) && !state.hasKey && <b>◆</b>}
            {sameCell(stage.goal, cell) && <b>{goalLocked ? "▥" : goalSymbol}</b>}
            {sameCell(stage.echoGoal, cell) && <b>◇</b>}
            {shiftKeys.has(key) && <b>⇄</b>}
          </span>
        );
      })}
      {stage.worldId === "mobius_corridor" && (
        <>
          {Array.from({ length: stage.rows }, (_, index) => {
            const color = edgeColors[index % edgeColors.length];
            const sharedStyle = {
              "--mobius-color": color,
            } as CSSProperties;
            return (
              <Fragment key={`horizontal-${index}`}>
                <i
                  className="mobius-edge-mark is-left"
                  style={{
                    ...sharedStyle,
                    "--mobius-position": (index + 0.5) / stage.rows,
                  } as CSSProperties}
                />
                <i
                  className="mobius-edge-mark is-right"
                  style={{
                    ...sharedStyle,
                    "--mobius-position": (stage.rows - index - 0.5) / stage.rows,
                  } as CSSProperties}
                />
              </Fragment>
            );
          })}
          {stage.verticalWrap && (
            Array.from({ length: stage.cols }, (_, index) => {
              const color = edgeColors[index % edgeColors.length];
              const sharedStyle = {
                "--mobius-color": color,
              } as CSSProperties;
              return (
                <Fragment key={`vertical-${index}`}>
                  <i
                    className="mobius-edge-mark is-top"
                    style={{
                      ...sharedStyle,
                      "--mobius-position": (index + 0.5) / stage.cols,
                    } as CSSProperties}
                  />
                  <i
                    className="mobius-edge-mark is-bottom"
                    style={{
                      ...sharedStyle,
                      "--mobius-position": (stage.cols - index - 0.5) / stage.cols,
                    } as CSSProperties}
                  />
                </Fragment>
              );
            })
          )}
          <span className="mobius-wrap-label" aria-hidden="true">반전 연결</span>
        </>
      )}
      {stage.worldId === "eclipse_planet" && (
        <span className="eclipse-state-mark" aria-hidden="true">
          {state.phase === 0 ? "☀ 낮" : "☾ 밤"}
        </span>
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
  const [visualState, setVisualState] = useState<ExoticRunState>(() =>
    initialExoticState(stages[0]),
  );
  const [moves, setMoves] = useState(0);
  const [moving, setMoving] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [playerTrail, setPlayerTrail] = useState<GridCell[]>([]);
  const [echoTrail, setEchoTrail] = useState<GridCell[]>([]);
  const [dimensionPulse, setDimensionPulse] = useState(false);
  const [phasePulse, setPhasePulse] = useState(false);
  const [wrapPulse, setWrapPulse] = useState(false);
  const [motionText, setMotionText] = useState("");
  const [bests, setBests] = useState<Array<number | null>>(
    Array(stages.length).fill(null),
  );
  const timersRef = useRef<number[]>([]);
  const stage = stages[stageIndex];

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((item) => item !== timer);
      callback();
    }, delay);
    timersRef.current.push(timer);
  }, []);

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
      clearTimers();
    };
  }, [clearTimers, stages.length, worldId]);

  const start = useCallback(
    (index: number) => {
      clearTimers();
      const initial = initialExoticState(stages[index]);
      setStageIndex(index);
      setState(initial);
      setVisualState(cloneRunState(initial));
      setMoves(0);
      setMoving(false);
      setIsDead(false);
      setHistory([]);
      setPlayerTrail([]);
      setEchoTrail([]);
      setDimensionPulse(false);
      setPhasePulse(false);
      setWrapPulse(false);
      setMotionText("");
      setShowHelp(stages[index].id === 1);
      setScreen("playing");
    },
    [clearTimers, stages],
  );

  const leaveStage = useCallback(() => {
    clearTimers();
    setMoving(false);
    setIsDead(false);
    setPlayerTrail([]);
    setEchoTrail([]);
    setDimensionPulse(false);
    setPhasePulse(false);
    setWrapPulse(false);
    setMotionText("");
    setScreen("select");
  }, [clearTimers]);

  const undo = useCallback(() => {
    if (moving || screen !== "playing") return;
    setHistory((previous) => {
      const snapshot = previous.at(-1);
      if (!snapshot) return previous;
      const restored = cloneRunState(snapshot.state);
      setState(restored);
      setVisualState(cloneRunState(restored));
      setMoves(snapshot.moves);
      setPlayerTrail([]);
      setEchoTrail([]);
      setMotionText("이전 정지 위치로 되돌렸습니다");
      return previous.slice(0, -1);
    });
  }, [moving, screen]);

  const finishStage = useCallback(
    (resultMoves: number) => {
      setBests((previous) => {
        const next = [...previous];
        if (next[stageIndex] === null || resultMoves < (next[stageIndex] as number)) {
          next[stageIndex] = resultMoves;
          window.localStorage.setItem(storageKey(worldId), JSON.stringify(next));
        }
        return next;
      });
      setScreen("won");
    },
    [stageIndex, worldId],
  );

  const act = useCallback(
    (action: ExoticAction) => {
      if (moving || isDead || screen !== "playing") return;
      const result = exoticStep(stage, state, action);
      if (!result.changed) return;
      const resultMoves = moves + 1;

      if (action === "shift") {
        clearTimers();
        setDimensionPulse(false);
        setPhasePulse(false);
        setWrapPulse(false);
        setPlayerTrail([]);
        setEchoTrail([]);
        const nextState = cloneRunState(result.state);
        setHistory((previous) => [
          ...previous,
          { state: cloneRunState(state), moves },
        ]);
        setState(nextState);
        setVisualState(cloneRunState(nextState));
        setMoves(resultMoves);
        setDimensionPulse(true);
        setMotionText(
          nextState.dimension === 0
            ? "현실 차원으로 전환 · 바로 이동할 수 있습니다"
            : "이면 차원으로 전환 · 바로 이동할 수 있습니다",
        );
        schedule(() => setDimensionPulse(false), 190);
        if (result.complete) finishStage(resultMoves);
        return;
      }

      clearTimers();
      setDimensionPulse(false);
      setPhasePulse(false);
      setWrapPulse(false);
      setMoving(true);
      setPlayerTrail([{ ...state.player }]);
      setEchoTrail(state.echo ? [{ ...state.echo }] : []);
      setMotionText(
        result.dead
          ? "경계까지 직진 중"
          : `본체 ${result.playerPath.length}칸${state.echo ? ` · 잔상 ${result.echoPath.length}칸` : ""} 직진`,
      );

      if (!result.dead) {
        setHistory((previous) => [
          ...previous,
          { state: cloneRunState(state), moves },
        ]);
        setMoves(resultMoves);
      }

      const frameCount = Math.max(result.playerPath.length, result.echoPath.length, 1);
      let previousPlayer = { ...state.player };
      let previousEcho = state.echo ? { ...state.echo } : null;

      for (let index = 0; index < frameCount; index += 1) {
        const playerCell =
          result.playerPath[Math.min(index, result.playerPath.length - 1)] ?? previousPlayer;
        const echoCell =
          result.echoPath[Math.min(index, result.echoPath.length - 1)] ?? previousEcho;
        const playerWrap =
          result.playerPath.length > index &&
          (Math.abs(playerCell.col - previousPlayer.col) > 1 ||
            Math.abs(playerCell.row - previousPlayer.row) > 1);
        const echoWrap =
          echoCell !== null &&
          previousEcho !== null &&
          result.echoPath.length > index &&
          (Math.abs(echoCell.col - previousEcho.col) > 1 ||
            Math.abs(echoCell.row - previousEcho.row) > 1);
        const nextPlayer = { ...playerCell };
        const nextEcho = echoCell ? { ...echoCell } : null;

        schedule(() => {
          setVisualState((current) => ({
            ...current,
            player: nextPlayer,
            echo: nextEcho,
          }));
          if (result.playerPath.length > index) {
            setPlayerTrail((trail) => [...trail, nextPlayer]);
          }
          if (nextEcho && result.echoPath.length > index) {
            setEchoTrail((trail) => [...trail, nextEcho]);
          }
          if (playerWrap || echoWrap) {
            setWrapPulse(true);
            setMotionText("뫼비우스 가장자리 통과 · 반전된 위치로 연결");
            schedule(() => setWrapPulse(false), EXOTIC_CELL_MS * 2);
          }
        }, EXOTIC_CELL_MS * (index + 1));

        previousPlayer = nextPlayer;
        previousEcho = nextEcho;
      }

      const animationDuration = EXOTIC_CELL_MS * frameCount + 24;
      if (result.dead) {
        schedule(() => {
          setIsDead(true);
          setMotionText("경계를 벗어나 시작 위치로 돌아갑니다");
        }, animationDuration);
        schedule(() => {
          const initial = initialExoticState(stage);
          setState(initial);
          setVisualState(cloneRunState(initial));
          setMoves(0);
          setHistory([]);
          setPlayerTrail([]);
          setEchoTrail([]);
          setMoving(false);
          setIsDead(false);
          setWrapPulse(false);
          setMotionText("");
        }, animationDuration + 340);
        return;
      }

      schedule(() => {
        const nextState = cloneRunState(result.state);
        setState(nextState);
        setVisualState(cloneRunState(nextState));
        setMoving(false);
        if (result.phaseChanged) {
          setPhasePulse(true);
          setMotionText(
            nextState.phase === 0
              ? "이동 완료 · 낮으로 전환"
              : "이동 완료 · 밤으로 전환",
          );
          schedule(() => setPhasePulse(false), 210);
        } else {
          setMotionText("장애물 또는 목표에서 정지");
        }
        schedule(() => {
          setPlayerTrail([]);
          setEchoTrail([]);
        }, 170);
        if (result.complete) finishStage(resultMoves);
      }, animationDuration);
    },
    [
      clearTimers,
      finishStage,
      isDead,
      moves,
      moving,
      schedule,
      screen,
      stage,
      state,
    ],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (screen === "select") onClose();
        else leaveStage();
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
  }, [act, leaveStage, onClose, screen, undo, worldId]);

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
        <button type="button" onClick={screen === "select" ? onClose : leaveStage}>
          {screen === "select" ? "실험 구역 선택" : "맵 선택"}
        </button>
      </header>

      {screen === "select" ? (
        <main className="exotic-select">
          <section className="exotic-select-heading">
            <span className="exotic-world-icon" aria-hidden="true">{world.icon}</span>
            <div>
              <h2>{world.name}</h2>
              <p>{world.description}</p>
            </div>
          </section>
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
          <p className="wormhole-total">WORLD STAR {totalStars}/90</p>
        </main>
      ) : (
        <main className={`exotic-play ${isDead ? "is-dead" : ""}`}>
          <section className="exotic-side">
            <div className="exotic-stage-title">
              <span className="beta-chip">
                MAP {String(stage.id).padStart(2, "0")}
                {(stage.id === 10 || stage.id === 20 || stage.id === 30) && " · BOSS"}
              </span>
            </div>
            <div className="wormhole-score">
              <span>MOVE <strong>{moves}</strong></span>
              <span>PAR <strong>{stage.par}</strong></span>
            </div>
            <div className="exotic-status">
              <span>{currentStatus}</span>
              {stage.keyCell && <span>{state.hasKey ? "◆ 문 개방 유지" : "◇ 열쇠 필요"}</span>}
              {stage.goalDimension !== null && (
                <span>목표 차원 · {stage.goalDimension === 0 ? "현실" : "이면"}</span>
              )}
              {stage.goalPhase !== null && (
                <span>목표 상태 · {stage.goalPhase === 0 ? "☀ 낮" : "☾ 밤"}</span>
              )}
            </div>
            <p className="exotic-motion-text" role="status" aria-live="polite">
              {motionText || "방향을 정하면 장애물이나 목표까지 직진합니다"}
            </p>
            {stage.worldId === "overlay_dimension" && (
              <div className="overlay-preview">
                <small>{state.dimension === 0 ? "이면 미리보기" : "현실 미리보기"}</small>
                <MiniPreview stage={stage} dimension={state.dimension === 0 ? 1 : 0} />
              </div>
            )}
            {showHelp && <p className="exotic-help">{world.tutorial}</p>}
            <div className="exotic-tools">
              <button
                type="button"
                disabled={history.length === 0 || moving}
                onClick={undo}
                aria-label="한 수 되돌리기"
              >
                <span aria-hidden="true">↶</span><em>되돌리기</em>
              </button>
              <button type="button" onClick={() => start(stageIndex)} aria-label="다시 시작">
                <span aria-hidden="true">↻</span><em>다시 시작</em>
              </button>
              <button
                type="button"
                onClick={() => setShowHelp((value) => !value)}
                aria-label={showHelp ? "규칙 설명 닫기" : "규칙 설명 보기"}
              >
                ?
              </button>
            </div>
          </section>

          <section className={`exotic-board-area ${moving ? "is-moving" : ""}`}>
            <Board
              stage={stage}
              state={visualState}
              avatarPixels={avatarPixels}
              playerTrail={playerTrail}
              echoTrail={echoTrail}
              dimensionPulse={dimensionPulse}
              phasePulse={phasePulse}
              wrapPulse={wrapPulse}
            />
            {isDead && (
              <div className="exotic-death" role="status" aria-live="assertive">
                <strong>경계 충돌</strong>
                <span>시작 위치로 돌아갑니다</span>
              </div>
            )}
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
              <button className="exotic-up" type="button" disabled={moving || isDead} onClick={() => act("up")}>↑</button>
              <button className="exotic-left" type="button" disabled={moving || isDead} onClick={() => act("left")}>←</button>
              <span aria-hidden="true" />
              <button className="exotic-right" type="button" disabled={moving || isDead} onClick={() => act("right")}>→</button>
              <button className="exotic-down" type="button" disabled={moving || isDead} onClick={() => act("down")}>↓</button>
            </div>
          </section>

          {screen === "won" && (
            <div className="wormhole-win exotic-win">
              <span>CLEAR</span>
              <h2>{world.name} {stage.id}단계 클리어!</h2>
              <div>{"★".repeat(starsFor(moves, stage.par))}{"☆".repeat(3 - starsFor(moves, stage.par))}</div>
              <p>{moves}번 조작 · 최소 {stage.par}</p>
              <div>
                {stageIndex < stages.length - 1 && (
                  <button type="button" onClick={() => start(stageIndex + 1)}>다음 단계</button>
                )}
                <button type="button" onClick={leaveStage}>맵 선택</button>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
