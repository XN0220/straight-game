"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { starsFor } from "./game-engine";
import { SpeedControl, type MoveSpeed } from "./speed-control";
import {
  HEX_STAGES,
  INITIAL_HEX_STATE,
  hexCellKey,
  hexSlide,
  type HexCell,
  type HexDirection,
  type HexState,
} from "./hex-engine";

export const HEX_BEST_KEY = "straight-line-hex-bests-v1";

const CENTER_X = 320;
const CENTER_Y = 280;
const KEY_DIRECTION: Record<string, HexDirection | undefined> = {
  q: "nw",
  Q: "nw",
  "7": "nw",
  e: "ne",
  E: "ne",
  "9": "ne",
  a: "w",
  A: "w",
  "4": "w",
  d: "e",
  D: "e",
  "6": "e",
  z: "sw",
  Z: "sw",
  "1": "sw",
  c: "se",
  C: "se",
  "3": "se",
};

type ModeScreen = "select" | "playing" | "won";
type Snapshot = { cell: HexCell; moves: number; state: HexState };

function tileSize(radius: number) {
  if (radius <= 2) return 67;
  if (radius === 3) return 50;
  return 39;
}

function cellPoint(cell: HexCell, radius: number) {
  const size = tileSize(radius);
  return {
    x: CENTER_X + Math.sqrt(3) * size * (cell.q + cell.r / 2),
    y: CENTER_Y + 1.5 * size * cell.r,
  };
}

function hexPoints(cell: HexCell, radius: number, inset = 3) {
  const center = cellPoint(cell, radius);
  const size = tileSize(radius) - inset;
  return Array.from({ length: 6 }, (_, index) => {
    const angle = ((60 * index - 90) * Math.PI) / 180;
    return `${center.x + size * Math.cos(angle)},${center.y + size * Math.sin(angle)}`;
  }).join(" ");
}

function tracePoints(path: HexCell[], radius: number) {
  return path
    .map((item) => {
      const point = cellPoint(item, radius);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

export function HexMode({
  onClose,
  avatarPixels,
}: {
  onClose: () => void;
  avatarPixels: Array<string | null>;
}) {
  const [screen, setScreen] = useState<ModeScreen>("select");
  const [stageIndex, setStageIndex] = useState(0);
  const [cell, setCell] = useState<HexCell>({ ...HEX_STAGES[0].start });
  const [runState, setRunState] = useState<HexState>({ ...INITIAL_HEX_STATE });
  const [moves, setMoves] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [moving, setMoving] = useState(false);
  const [moveSpeed, setMoveSpeed] = useState<MoveSpeed>(1);
  const [trace, setTrace] = useState<HexCell[]>([]);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [bests, setBests] = useState<Array<number | null>>(
    Array(HEX_STAGES.length).fill(null),
  );
  const timerRef = useRef<number | null>(null);
  const stage = HEX_STAGES[stageIndex];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(window.localStorage.getItem(HEX_BEST_KEY) ?? "null");
        if (!Array.isArray(stored)) return;
        const restored = Array<number | null>(HEX_STAGES.length).fill(null);
        stored.slice(0, HEX_STAGES.length).forEach((value, index) => {
          restored[index] = typeof value === "number" ? value : null;
        });
        setBests(restored);
      } catch {
        // 손상된 실험 기록은 헥사리움 기본값으로 대체합니다.
      }
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const start = useCallback((index: number) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    const next = HEX_STAGES[index];
    setStageIndex(index);
    setCell({ ...next.start });
    setRunState({ ...INITIAL_HEX_STATE });
    setMoves(0);
    setDeaths(0);
    setMoving(false);
    setTrace([]);
    setHistory([]);
    setScreen("playing");
  }, []);

  const undo = useCallback(() => {
    if (moving || screen !== "playing") return;
    setHistory((previous) => {
      const snapshot = previous.at(-1);
      if (!snapshot) return previous;
      setCell({ ...snapshot.cell });
      setMoves(snapshot.moves);
      setRunState({ ...snapshot.state });
      setTrace([]);
      return previous.slice(0, -1);
    });
  }, [moving, screen]);

  const move = useCallback(
    (direction: HexDirection) => {
      if (screen !== "playing" || moving) return;
      const plan = hexSlide(stage, cell, direction, runState);
      if (plan.outcome === "blocked") return;

      setHistory((previous) => [
        ...previous,
        { cell: { ...cell }, moves, state: { ...runState } },
      ]);
      setMoves((value) => value + 1);
      setMoving(true);
      setTrace([{ ...cell }, ...plan.path]);

      timerRef.current = window.setTimeout(() => {
        setMoving(false);
        setTrace([]);
        if (plan.outcome === "goal") {
          const result = moves + 1;
          setCell({ ...plan.destination });
          setRunState({ ...plan.state });
          setBests((previous) => {
            const next = [...previous];
            if (next[stageIndex] === null || result < (next[stageIndex] as number)) {
              next[stageIndex] = result;
            }
            window.localStorage.setItem(HEX_BEST_KEY, JSON.stringify(next));
            return next;
          });
          setScreen("won");
          return;
        }
        if (plan.outcome === "death" || plan.outcome === "loop") {
          setDeaths((value) => value + 1);
          setCell({ ...stage.start });
          setRunState({ ...INITIAL_HEX_STATE });
          setMoves(0);
          setHistory([]);
          return;
        }
        setCell({ ...plan.destination });
        setRunState({ ...plan.state });
      }, 320 / moveSpeed);
    },
    [cell, moveSpeed, moves, moving, runState, screen, stage, stageIndex],
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
        (sum, best, index) => sum + starsFor(best, HEX_STAGES[index].par),
        0,
      ),
    [bests],
  );
  const playerPoint = cellPoint(cell, stage.radius);

  return (
    <div
      className={`wormhole-mode hex-mode speed-${String(moveSpeed).replace(".", "-")} ${screen === "select" ? "is-selecting" : "is-playing"}`}
      role="dialog"
      aria-modal="true"
      aria-label="육각 성운 헥사리움"
    >
      <header className="wormhole-header hex-header">
        <div>
          <span>WORMHOLE TEST LAB · HEX GRID</span>
          <strong>육각 성운 헥사리움</strong>
        </div>
        <button type="button" onClick={screen === "select" ? onClose : () => setScreen("select")}>
          {screen === "select" ? "실험 구역 선택" : "헥사 맵 선택"}
        </button>
      </header>

      {screen === "select" ? (
        <div className="wormhole-select hex-select">
          <div className="wormhole-hero hex-hero">
            <div className="hex-cluster" aria-hidden="true">
              {Array.from({ length: 7 }, (_, index) => <span key={index} />)}
            </div>
            <div>
              <span className="beta-chip">신규 실험 · 30 MAPS</span>
              <h2>직진 방향이 네 개에서 여섯 개로</h2>
              <p>
                육각형의 여섯 면을 따라 미끄러집니다. 초반에는 큰 타일로 방향을 익히고,
                후반에는 포탈과 위상 스위치를 함께 사용합니다.
              </p>
            </div>
          </div>
          <div className="wormhole-stage-grid hex-stage-grid" aria-label="헥사리움 30단계 선택">
            {HEX_STAGES.map((item, index) => {
              const stars = starsFor(bests[index], item.par);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={item.id >= 26 ? "is-master" : item.id >= 21 ? "has-portal" : ""}
                  aria-label={`${item.id}번, 별 ${stars}개`}
                  onClick={() => start(index)}
                >
                  <span>{String(item.id).padStart(2, "0")}</span>
                  <em aria-hidden="true">{"★".repeat(stars)}{"☆".repeat(3 - stars)}</em>
                </button>
              );
            })}
          </div>
          <p className="wormhole-total">HEXA STAR {totalStars}/90</p>
        </div>
      ) : (
        <div className="wormhole-play hex-play">
          <div className="wormhole-side">
            <span className="beta-chip">HEXA MAP {String(stage.id).padStart(2, "0")}</span>
            <div className="wormhole-score">
              <span>MOVE <strong>{moves}</strong></span>
              <span>PAR <strong>{stage.par}</strong></span>
              <span>RETRY <strong>{deaths}</strong></span>
            </div>
            {stage.id >= 21 && (
              <div className="wormhole-mechanic-state">
                <span><i className="portal-dot" /> 같은 번호 포탈 사이로 순간이동</span>
                {stage.id >= 26 && (
                  <span>
                    <i className={runState.gatesOn ? "toggle-dot is-on" : "toggle-dot"} />
                    위상 블록 {runState.gatesOn ? "ON" : "OFF"}
                  </span>
                )}
              </div>
            )}
            <div className="wormhole-tools">
              <button type="button" disabled={history.length === 0 || moving} onClick={undo}>
                ↶ 한 수 되돌리기
              </button>
              <button type="button" onClick={() => start(stageIndex)}>↻ 다시 시작</button>
              <SpeedControl speed={moveSpeed} onChange={setMoveSpeed} />
            </div>
            <p className="wormhole-rule hex-key-rule">
              PC: Q·E / A·D / Z·C · 숫자패드 7·9 / 4·6 / 1·3
            </p>
          </div>

          <div className="radial-board hex-board">
            <svg viewBox="0 0 640 560" role="img" aria-label={`${stage.id}번 육각형 퍼즐 맵`}>
              <defs>
                <linearGradient id="hexTile" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#152f35" />
                  <stop offset="1" stopColor="#081316" />
                </linearGradient>
                <linearGradient id="hexBlock" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#187f8d" />
                  <stop offset="1" stopColor="#0a3d47" />
                </linearGradient>
              </defs>
              <circle className="hex-aura" cx={CENTER_X} cy={CENTER_Y} r="268" />
              {stage.cells.map((tile) => {
                const key = hexCellKey(tile);
                const isBlock = stage.blocks.has(key);
                return (
                  <polygon
                    key={key}
                    className={isBlock ? "hex-tile is-block" : "hex-tile"}
                    points={hexPoints(tile, stage.radius)}
                  />
                );
              })}
              {stage.toggleBlockCells.map((tile) => (
                <polygon
                  key={`toggle-${hexCellKey(tile)}`}
                  className={`hex-toggle-block ${runState.gatesOn ? "is-on" : "is-off"}`}
                  points={hexPoints(tile, stage.radius, 7)}
                />
              ))}
              {stage.portals.map((portal, index) => {
                const point = cellPoint(portal, stage.radius);
                return (
                  <g
                    key={`portal-${hexCellKey(portal)}`}
                    className="hex-portal-cell"
                    transform={`translate(${point.x} ${point.y})`}
                  >
                    <polygon points="0,-18 16,-9 16,9 0,18 -16,9 -16,-9" />
                    <circle r="9" />
                    <text y="4">{index + 1}</text>
                  </g>
                );
              })}
              {stage.switchCells.map((switchCell) => {
                const point = cellPoint(switchCell, stage.radius);
                return (
                  <g
                    key={`switch-${hexCellKey(switchCell)}`}
                    className="hex-switch-cell"
                    transform={`translate(${point.x} ${point.y})`}
                  >
                    <polygon points="0,-17 15,-8.5 15,8.5 0,17 -15,8.5 -15,-8.5" />
                    <text y="3">Φ</text>
                  </g>
                );
              })}
              <polygon
                className="hex-goal"
                points={hexPoints(stage.goal, stage.radius, 8)}
              />
              {trace.length > 1 && (
                <polyline
                  className="radial-trace hex-trace"
                  points={tracePoints(trace, stage.radius)}
                />
              )}
              <g
                className={`radial-player hex-player ${moving ? "is-moving" : ""}`}
                transform={`translate(${playerPoint.x} ${playerPoint.y})`}
              >
                <polygon
                  className="radial-player-backdrop"
                  points="0,-22 19,-11 19,11 0,22 -19,11 -19,-11"
                />
                {avatarPixels.map((color, index) => {
                  if (!color) return null;
                  const col = index % 10;
                  const row = Math.floor(index / 10);
                  return (
                    <rect
                      key={index}
                      className="radial-player-pixel"
                      x={-15 + col * 3}
                      y={-15 + row * 3}
                      width="3.2"
                      height="3.2"
                      fill={color}
                    />
                  );
                })}
              </g>
            </svg>

            <div className="hex-dpad" aria-label="헥사리움 6방향 조작">
              <button className="hex-nw" type="button" aria-label="왼쪽 위로 이동" onClick={() => move("nw")}>↖<kbd>Q</kbd></button>
              <button className="hex-ne" type="button" aria-label="오른쪽 위로 이동" onClick={() => move("ne")}>↗<kbd>E</kbd></button>
              <button className="hex-w" type="button" aria-label="왼쪽으로 이동" onClick={() => move("w")}>←<kbd>A</kbd></button>
              <button className="hex-e" type="button" aria-label="오른쪽으로 이동" onClick={() => move("e")}>→<kbd>D</kbd></button>
              <button className="hex-sw" type="button" aria-label="왼쪽 아래로 이동" onClick={() => move("sw")}>↙<kbd>Z</kbd></button>
              <button className="hex-se" type="button" aria-label="오른쪽 아래로 이동" onClick={() => move("se")}>↘<kbd>C</kbd></button>
            </div>
          </div>

          {screen === "won" && (
            <div className="wormhole-win hex-win">
              <span>HEXA MAP {String(stage.id).padStart(2, "0")} COMPLETE</span>
              <h2>육각 경로 해독</h2>
              <div aria-label={`별 ${starsFor(moves, stage.par)}개`}>
                {"★".repeat(starsFor(moves, stage.par))}
                {"☆".repeat(3 - starsFor(moves, stage.par))}
              </div>
              <p>{moves}회 이동 · 최단 {stage.par}회</p>
              <div>
                <button type="button" onClick={() => setScreen("select")}>맵 선택</button>
                {stageIndex < HEX_STAGES.length - 1 && (
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
