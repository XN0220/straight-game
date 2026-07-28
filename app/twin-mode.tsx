"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { starsFor } from "./game-engine";
import { SpeedControl, type MoveSpeed } from "./speed-control";
import {
  TWIN_STAGES,
  initialTwinState,
  twinCellKey,
  twinStageComplete,
  twinStep,
  type TwinBoard,
  type TwinCell,
  type TwinDirection,
  type TwinRunState,
} from "./twin-engine";

export const TWIN_BEST_KEY = "straight-line-twin-bests-v1";

type ModeScreen = "select" | "playing" | "won";
type HistoryItem = { state: TwinRunState; moves: number };
type MotionState = { left: number; right: number };

const KEY_DIRECTION: Record<string, TwinDirection | undefined> = {
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

function cloneRunState(state: TwinRunState): TwinRunState {
  return {
    left: { ...state.left },
    right: { ...state.right },
    leftDone: state.leftDone,
    rightDone: state.rightDone,
    gateOpen: state.gateOpen,
    gateCrossed: state.gateCrossed,
  };
}

function pointFor(board: TwinBoard, cell: TwinCell) {
  const cellSize = Math.min(320 / board.cols, 320 / board.rows);
  const width = cellSize * board.cols;
  const height = cellSize * board.rows;
  return {
    x: 210 - width / 2 + (cell.col + 0.5) * cellSize,
    y: 200 - height / 2 + (cell.row + 0.5) * cellSize,
    cellSize,
  };
}

function tracePoints(board: TwinBoard, trace: TwinCell[]) {
  return trace
    .map((cell) => {
      const point = pointFor(board, cell);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

function TwinBoardView({
  label,
  board,
  cell,
  done,
  trace,
  duration,
  moving,
  avatarPixels,
  side,
  gateOpen,
}: {
  label: string;
  board: TwinBoard;
  cell: TwinCell;
  done: boolean;
  trace: TwinCell[];
  duration: number;
  moving: boolean;
  avatarPixels: Array<string | null>;
  side: "left" | "right";
  gateOpen: boolean;
}) {
  const playerPoint = pointFor(board, cell);
  const cellSize = playerPoint.cellSize;
  const width = cellSize * board.cols;
  const height = cellSize * board.rows;
  const offsetX = 210 - width / 2;
  const offsetY = 200 - height / 2;
  const cells = Array.from({ length: board.cols * board.rows }, (_, index) => ({
    col: index % board.cols,
    row: Math.floor(index / board.cols),
  }));
  const avatarScale = Math.max(2.1, Math.min(3.7, cellSize / 15));

  return (
    <section className={`twin-world twin-world-${side} ${done ? "is-done" : ""}`}>
      <header>
        <span>{side === "left" ? "α" : "β"}</span>
        <strong>{label}</strong>
        <em>{done ? "도착 완료" : "이동 중"}</em>
      </header>
      <svg viewBox="0 0 420 400" role="img" aria-label={`${label} 퍼즐 맵`}>
        <defs>
          <linearGradient id={`twinFloor-${side}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={side === "left" ? "#11343f" : "#3c1836"} />
            <stop offset="1" stopColor="#090e16" />
          </linearGradient>
          <linearGradient id={`twinBlock-${side}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={side === "left" ? "#36cbd0" : "#ff79c8"} />
            <stop offset="1" stopColor={side === "left" ? "#126b83" : "#8c2f72"} />
          </linearGradient>
        </defs>
        <rect
          className="twin-board-aura"
          x={offsetX - 12}
          y={offsetY - 12}
          width={width + 24}
          height={height + 24}
          rx="18"
        />
        {cells.map((tile) => {
          const key = twinCellKey(tile);
          const x = offsetX + tile.col * cellSize;
          const y = offsetY + tile.row * cellSize;
          const isBlock = board.blocks.has(key);
          const isSwitch =
            board.switchCell !== null &&
            twinCellKey(board.switchCell) === key;
          const isGate =
            board.gateCell !== null &&
            twinCellKey(board.gateCell) === key;
          const tileClass = [
            "twin-tile",
            isBlock ? "is-block" : "",
            isSwitch ? "is-switch" : "",
            isGate ? "is-gate" : "",
            isGate && gateOpen ? "is-open" : "",
          ].filter(Boolean).join(" ");
          return (
            <rect
              key={key}
              className={tileClass}
              x={x + 2}
              y={y + 2}
              width={cellSize - 4}
              height={cellSize - 4}
              rx={Math.max(4, cellSize * 0.1)}
              fill={isBlock ? `url(#twinBlock-${side})` : `url(#twinFloor-${side})`}
            />
          );
        })}
        {board.switchCell !== null && (() => {
          const point = pointFor(board, board.switchCell);
          return (
            <g
              className={`twin-switch ${gateOpen ? "is-active" : ""}`}
              transform={`translate(${point.x} ${point.y})`}
            >
              <rect
                x={-cellSize * 0.31}
                y={-cellSize * 0.31}
                width={cellSize * 0.62}
                height={cellSize * 0.62}
                rx={cellSize * 0.13}
              />
              <circle r={cellSize * 0.12} />
            </g>
          );
        })()}
        {board.gateCell !== null && (() => {
          const point = pointFor(board, board.gateCell);
          return (
            <g
              className={`twin-gate ${gateOpen ? "is-open" : ""}`}
              transform={`translate(${point.x} ${point.y})`}
            >
              <rect
                x={-cellSize * 0.32}
                y={-cellSize * 0.32}
                width={cellSize * 0.64}
                height={cellSize * 0.64}
                rx={cellSize * 0.08}
              />
              <path d={`M ${-cellSize * 0.14} ${-cellSize * 0.22} V ${cellSize * 0.22} M 0 ${-cellSize * 0.22} V ${cellSize * 0.22} M ${cellSize * 0.14} ${-cellSize * 0.22} V ${cellSize * 0.22}`} />
            </g>
          );
        })()}
        {(() => {
          const goal = pointFor(board, board.goal);
          return (
            <g className="twin-goal" transform={`translate(${goal.x} ${goal.y})`}>
              <rect
                x={-cellSize * 0.31}
                y={-cellSize * 0.31}
                width={cellSize * 0.62}
                height={cellSize * 0.62}
                rx={cellSize * 0.14}
              />
              <circle r={cellSize * 0.13} />
            </g>
          );
        })()}
        {trace.length > 1 && (
          <polyline
            className="twin-trace"
            points={tracePoints(board, trace)}
          />
        )}
        <g
          className={`twin-player ${moving ? "is-moving" : ""} ${done ? "is-locked" : ""}`}
          style={{
            transform: `translate(${playerPoint.x}px, ${playerPoint.y}px)`,
            transitionDuration: `${duration}ms`,
          }}
        >
          <rect
            className="twin-player-backdrop"
            x={-cellSize * 0.29}
            y={-cellSize * 0.29}
            width={cellSize * 0.58}
            height={cellSize * 0.58}
            rx={cellSize * 0.12}
          />
          {avatarPixels.map((color, index) => {
            if (!color) return null;
            const col = index % 10;
            const row = Math.floor(index / 10);
            return (
              <rect
                key={index}
                x={-avatarScale * 5 + col * avatarScale}
                y={-avatarScale * 5 + row * avatarScale}
                width={avatarScale + 0.2}
                height={avatarScale + 0.2}
                fill={color}
              />
            );
          })}
        </g>
      </svg>
    </section>
  );
}

export function TwinMode({
  onClose,
  avatarPixels,
}: {
  onClose: () => void;
  avatarPixels: Array<string | null>;
}) {
  const [screen, setScreen] = useState<ModeScreen>("select");
  const [stageIndex, setStageIndex] = useState(0);
  const [runState, setRunState] = useState<TwinRunState>(() =>
    initialTwinState(TWIN_STAGES[0]),
  );
  const [moves, setMoves] = useState(0);
  const [moving, setMoving] = useState(false);
  const [moveSpeed, setMoveSpeed] = useState<MoveSpeed>(1);
  const [trace, setTrace] = useState<{ left: TwinCell[]; right: TwinCell[] }>({
    left: [],
    right: [],
  });
  const [motion, setMotion] = useState<MotionState>({ left: 0, right: 0 });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bests, setBests] = useState<Array<number | null>>(
    Array(TWIN_STAGES.length).fill(null),
  );
  const timerRef = useRef<number | null>(null);
  const stage = TWIN_STAGES[stageIndex];

  useEffect(() => {
    const restoreFrame = window.requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(window.localStorage.getItem(TWIN_BEST_KEY) ?? "null");
        if (Array.isArray(stored)) {
          const restored = Array<number | null>(TWIN_STAGES.length).fill(null);
          stored.slice(0, TWIN_STAGES.length).forEach((value, index) => {
            restored[index] = typeof value === "number" ? value : null;
          });
          setBests(restored);
        }
      } catch {
        // 손상된 실험 기록은 제미니아 기본 기록으로 대체합니다.
      }
    });
    return () => {
      window.cancelAnimationFrame(restoreFrame);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const start = useCallback((index: number) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setStageIndex(index);
    setRunState(initialTwinState(TWIN_STAGES[index]));
    setMoves(0);
    setMoving(false);
    setTrace({ left: [], right: [] });
    setMotion({ left: 0, right: 0 });
    setHistory([]);
    setScreen("playing");
  }, []);

  const undo = useCallback(() => {
    if (moving || screen !== "playing") return;
    setHistory((previous) => {
      const snapshot = previous.at(-1);
      if (!snapshot) return previous;
      setMotion({ left: 0, right: 0 });
      setTrace({ left: [], right: [] });
      setRunState(cloneRunState(snapshot.state));
      setMoves(snapshot.moves);
      return previous.slice(0, -1);
    });
  }, [moving, screen]);

  const move = useCallback(
    (direction: TwinDirection) => {
      if (screen !== "playing" || moving) return;
      const step = twinStep(stage, runState, direction);
      if (!step.changed) return;

      const leftDuration = step.left.path.length * 68 / moveSpeed;
      const rightDuration = step.right.path.length * 68 / moveSpeed;
      const waitDuration = Math.max(180 / moveSpeed, leftDuration, rightDuration);
      const resultMoves = moves + 1;

      setHistory((previous) => [
        ...previous,
        { state: cloneRunState(runState), moves },
      ]);
      setMoves(resultMoves);
      setMoving(true);
      setTrace({
        left: [{ ...runState.left }, ...step.left.path],
        right: [{ ...runState.right }, ...step.right.path],
      });
      setMotion({ left: leftDuration, right: rightDuration });
      setRunState(cloneRunState(step.state));

      timerRef.current = window.setTimeout(() => {
        setMoving(false);
        setTrace({ left: [], right: [] });
        setMotion({ left: 0, right: 0 });
        if (!twinStageComplete(stage, step.state)) return;

        setBests((previous) => {
          const next = [...previous];
          if (next[stageIndex] === null || resultMoves < (next[stageIndex] as number)) {
            next[stageIndex] = resultMoves;
          }
          window.localStorage.setItem(TWIN_BEST_KEY, JSON.stringify(next));
          return next;
        });
        setScreen("won");
      }, waitDuration);
    },
    [moveSpeed, moves, moving, runState, screen, stage, stageIndex],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      event.stopImmediatePropagation();
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
      const direction = KEY_DIRECTION[event.key];
      if (direction) {
        event.preventDefault();
        move(direction);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [move, onClose, screen, undo]);

  const totalStars = useMemo(
    () =>
      bests.reduce<number>(
        (sum, best, index) => sum + starsFor(best, TWIN_STAGES[index].par),
        0,
      ),
    [bests],
  );
  const completed = Number(runState.leftDone) + Number(runState.rightDone);

  return (
    <div
      className={`wormhole-mode twin-mode speed-${String(moveSpeed).replace(".", "-")} ${screen === "select" ? "is-selecting" : "is-playing"}`}
      role="dialog"
      aria-modal="true"
      aria-label="쌍성계 제미니아"
    >
      <header className="wormhole-header twin-header">
        <div>
          <span>WORMHOLE TEST LAB · TWIN WORLDS</span>
          <strong>쌍성계 제미니아</strong>
        </div>
        <button type="button" onClick={screen === "select" ? onClose : () => setScreen("select")}>
          {screen === "select" ? "실험 구역 선택" : "제미니아 맵 선택"}
        </button>
      </header>

      {screen === "select" ? (
        <div className="wormhole-select twin-select">
          <div className="wormhole-hero twin-hero">
            <div className="twin-orbit-emblem" aria-hidden="true">
              <span className="twin-orbit-line" />
              <i className="twin-planet-alpha" />
              <i className="twin-planet-beta" />
              <b />
            </div>
            <div>
              <span className="beta-chip">공유 입력 실험 · 30 MAPS</span>
              <h2>한 번의 입력, 서로 다른 두 경로</h2>
              <p>
                같은 방향을 입력해도 두 캐릭터는 각 행성의 벽에 따라 따로 움직입니다.
                먼저 도착한 캐릭터는 고정되고, 남은 캐릭터만 계속 이동합니다.
              </p>
            </div>
          </div>
          <div className="wormhole-stage-legend" aria-label="제미니아 난이도 구성">
            <span>01–05 1~3 MOVE</span>
            <span>06–10 5~9 MOVE</span>
            <span>11–15 7~14 MOVE</span>
            <span>16–20 12~19 MOVE</span>
            <span>21–30 15~25 MOVE · 공명 게이트</span>
          </div>
          <div className="wormhole-stage-grid twin-stage-grid" aria-label="제미니아 30단계 선택">
            {TWIN_STAGES.map((item, index) => {
              const stars = starsFor(bests[index], item.par);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={item.id >= 21 ? "is-master" : item.id >= 16 ? "is-advanced" : ""}
                  aria-label={`${item.id}번, 별 ${stars}개`}
                  onClick={() => start(index)}
                >
                  <span>{String(item.id).padStart(2, "0")}</span>
                  <em aria-hidden="true">{"★".repeat(stars)}{"☆".repeat(3 - stars)}</em>
                </button>
              );
            })}
          </div>
          <p className="wormhole-total">GEMINIA STAR {totalStars}/90 · 다른 실험 구역과 별도 저장</p>
        </div>
      ) : (
        <div className="wormhole-play twin-play">
          <div className="wormhole-side twin-side">
            <span className="beta-chip">TWIN MAP {String(stage.id).padStart(2, "0")}</span>
            <p>
              {stage.id <= 5
                ? "큰 블록 · 공유 이동 입문"
                : stage.id <= 15
                  ? "비대칭 행성 · 경로 분리"
                  : stage.id <= 20
                    ? "고난도 · 두 행성 동시 계산"
                    : "공명 스위치 · 반대 행성 게이트 개방"}
            </p>
            <div className="wormhole-score">
              <span>MOVE <strong>{moves}</strong></span>
              <span>PAR <strong>{stage.par}</strong></span>
              <span>ARRIVE <strong>{completed}/2</strong></span>
            </div>
            <div className="twin-status" aria-label="두 캐릭터 도착 상태">
              <span className={runState.leftDone ? "is-done" : ""}>α {runState.leftDone ? "고정" : "이동"}</span>
              <span className={runState.rightDone ? "is-done" : ""}>β {runState.rightDone ? "고정" : "이동"}</span>
            </div>
            {stage.gimmick === "resonance-gate" && (
              <div className="twin-gimmick-state" aria-label="공명 게이트 상태">
                <span className={runState.gateOpen ? "is-active" : ""}>
                  <i aria-hidden="true" />
                  {runState.gateOpen ? "공명 게이트 열림" : "반대 행성의 스위치를 먼저 밟으세요"}
                </span>
              </div>
            )}
            <div className="wormhole-tools">
              <button type="button" disabled={history.length === 0 || moving} onClick={undo}>
                ↶ 한 수 되돌리기
              </button>
              <button type="button" onClick={() => start(stageIndex)}>↻ 다시 시작</button>
              <SpeedControl speed={moveSpeed} onChange={setMoveSpeed} />
            </div>
            <p className="wormhole-rule twin-key-rule">
              방향키 또는 WASD · 두 캐릭터가 모두 멈춘 뒤 다음 입력
            </p>
          </div>

          <div className="twin-board-area">
            <div className="twin-worlds">
              <TwinBoardView
                label="청람 행성"
                board={stage.left}
                cell={runState.left}
                done={runState.leftDone}
                trace={trace.left}
                duration={motion.left}
                moving={moving}
                avatarPixels={avatarPixels}
                side="left"
                gateOpen={runState.gateOpen}
              />
              <TwinBoardView
                label="홍련 행성"
                board={stage.right}
                cell={runState.right}
                done={runState.rightDone}
                trace={trace.right}
                duration={motion.right}
                moving={moving}
                avatarPixels={avatarPixels}
                side="right"
                gateOpen={runState.gateOpen}
              />
            </div>
            <div className="radial-dpad twin-dpad" aria-label="제미니아 공유 방향 조작">
              <button className="radial-up" type="button" aria-label="두 캐릭터 위로 이동" onClick={() => move("up")}>↑</button>
              <button className="radial-left" type="button" aria-label="두 캐릭터 왼쪽으로 이동" onClick={() => move("left")}>←</button>
              <span aria-hidden="true">∞</span>
              <button className="radial-right" type="button" aria-label="두 캐릭터 오른쪽으로 이동" onClick={() => move("right")}>→</button>
              <button className="radial-down" type="button" aria-label="두 캐릭터 아래로 이동" onClick={() => move("down")}>↓</button>
            </div>
          </div>

          {screen === "won" && (
            <div className="wormhole-win twin-win">
              <span>TWIN MAP {String(stage.id).padStart(2, "0")} COMPLETE</span>
              <h2>쌍성 동기화 완료</h2>
              <div aria-label={`별 ${starsFor(moves, stage.par)}개`}>
                {"★".repeat(starsFor(moves, stage.par))}
                {"☆".repeat(3 - starsFor(moves, stage.par))}
              </div>
              <p>{moves}회 이동 · 최단 {stage.par}회</p>
              <div>
                <button type="button" onClick={() => setScreen("select")}>맵 선택</button>
                {stageIndex < TWIN_STAGES.length - 1 && (
                  <button type="button" onClick={() => start(stageIndex + 1)}>다음 맵</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
