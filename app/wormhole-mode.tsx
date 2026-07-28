"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { starsFor } from "./game-engine";
import { HEX_STAGES } from "./hex-engine";
import { HEX_BEST_KEY, HexMode } from "./hex-mode";
import {
  INITIAL_RADIAL_STATE,
  RADIAL_SECTORS,
  WORMHOLE_STAGES,
  radialCellKey,
  radialSlide,
  type RadialCell,
  type RadialDirection,
  type RadialState,
} from "./wormhole-engine";

const BEST_KEY = "straight-line-wormhole-bests-v1";
const INNER_RADIUS = 52;
const RING_SIZE = 31;
const CENTER = 300;

type ModeScreen = "select" | "playing" | "won";
type LabCampaign = "hub" | "radial" | "hex";

const KEY_DIRECTION: Record<string, RadialDirection | undefined> = {
  ArrowUp: "out",
  w: "out",
  W: "out",
  ArrowDown: "in",
  s: "in",
  S: "in",
  ArrowLeft: "ccw",
  a: "ccw",
  A: "ccw",
  ArrowRight: "cw",
  d: "cw",
  D: "cw",
};

function polar(radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + Math.cos(radians) * radius,
    y: CENTER + Math.sin(radians) * radius,
  };
}

function cellPoint(cell: RadialCell) {
  return polar(
    INNER_RADIUS + (cell.ring + 0.5) * RING_SIZE,
    (cell.sector + 0.5) * (360 / RADIAL_SECTORS),
  );
}

function wedgePath(cell: RadialCell, gap = 1.2) {
  const startAngle = cell.sector * (360 / RADIAL_SECTORS) + gap;
  const endAngle = (cell.sector + 1) * (360 / RADIAL_SECTORS) - gap;
  const inner = INNER_RADIUS + cell.ring * RING_SIZE + 2;
  const outer = INNER_RADIUS + (cell.ring + 1) * RING_SIZE - 2;
  const a = polar(inner, startAngle);
  const b = polar(outer, startAngle);
  const c = polar(outer, endAngle);
  const d = polar(inner, endAngle);
  return [
    `M ${a.x} ${a.y}`,
    `L ${b.x} ${b.y}`,
    `A ${outer} ${outer} 0 0 1 ${c.x} ${c.y}`,
    `L ${d.x} ${d.y}`,
    `A ${inner} ${inner} 0 0 0 ${a.x} ${a.y}`,
    "Z",
  ].join(" ");
}

function tracePath(path: RadialCell[]) {
  if (path.length < 2) return "";
  const first = cellPoint(path[0]);
  return path.slice(1).reduce((value, cell, index) => {
    const previous = path[index];
    const point = cellPoint(cell);
    if (cell.ring !== previous.ring) {
      return `${value} L ${point.x} ${point.y}`;
    }
    const radius = INNER_RADIUS + (cell.ring + 0.5) * RING_SIZE;
    const clockwise =
      cell.sector === (previous.sector + 1) % RADIAL_SECTORS;
    return `${value} A ${radius} ${radius} 0 0 ${clockwise ? 1 : 0} ${point.x} ${point.y}`;
  }, `M ${first.x} ${first.y}`);
}

export function WormholeMode({
  onClose,
  avatarPixels,
}: {
  onClose: () => void;
  avatarPixels: Array<string | null>;
}) {
  const [labCampaign, setLabCampaign] = useState<LabCampaign>("hub");
  const [screen, setScreen] = useState<ModeScreen>("select");
  const [stageIndex, setStageIndex] = useState(0);
  const [cell, setCell] = useState<RadialCell>({ ...WORMHOLE_STAGES[0].start });
  const [runState, setRunState] = useState<RadialState>({ ...INITIAL_RADIAL_STATE });
  const [moves, setMoves] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [moving, setMoving] = useState(false);
  const [trace, setTrace] = useState<RadialCell[]>([]);
  const [history, setHistory] = useState<
    Array<{ cell: RadialCell; moves: number; runState: RadialState }>
  >([]);
  const [bests, setBests] = useState<Array<number | null>>(
    Array(WORMHOLE_STAGES.length).fill(null),
  );
  const [hexBests, setHexBests] = useState<Array<number | null>>(
    Array(HEX_STAGES.length).fill(null),
  );
  const timerRef = useRef<number | null>(null);
  const stage = WORMHOLE_STAGES[stageIndex];

  useEffect(() => {
    const restoreFrame = window.requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(window.localStorage.getItem(BEST_KEY) ?? "null");
        if (Array.isArray(stored)) {
          const restored = Array<number | null>(WORMHOLE_STAGES.length).fill(null);
          stored.slice(0, WORMHOLE_STAGES.length).forEach((value, index) => {
            restored[index] = typeof value === "number" ? value : null;
          });
          setBests(restored);
        }
        const storedHex = JSON.parse(window.localStorage.getItem(HEX_BEST_KEY) ?? "null");
        if (Array.isArray(storedHex)) {
          const restoredHex = Array<number | null>(HEX_STAGES.length).fill(null);
          storedHex.slice(0, HEX_STAGES.length).forEach((value, index) => {
            restoredHex[index] = typeof value === "number" ? value : null;
          });
          setHexBests(restoredHex);
        }
      } catch {
        // 손상된 베타 기록은 공식 캠페인과 분리된 기본값으로 대체합니다.
      }
    });
    return () => {
      window.cancelAnimationFrame(restoreFrame);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const start = useCallback((index: number) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    const next = WORMHOLE_STAGES[index];
    setStageIndex(index);
    setCell({ ...next.start });
    setRunState({ ...INITIAL_RADIAL_STATE });
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
      setRunState({ ...snapshot.runState });
      setTrace([]);
      return previous.slice(0, -1);
    });
  }, [moving, screen]);

  const move = useCallback(
    (direction: RadialDirection) => {
      if (screen !== "playing" || moving) return;
      const plan = radialSlide(stage, cell, direction, runState);
      if (plan.outcome === "blocked") return;

      setHistory((previous) => [
        ...previous,
        { cell: { ...cell }, moves, runState: { ...runState } },
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
            window.localStorage.setItem(BEST_KEY, JSON.stringify(next));
            return next;
          });
          setScreen("won");
          return;
        }
        if (plan.outcome === "death" || plan.outcome === "loop") {
          setDeaths((value) => value + 1);
          setCell({ ...stage.start });
          setRunState({ ...INITIAL_RADIAL_STATE });
          setMoves(0);
          setHistory([]);
          return;
        }
        setCell({ ...plan.destination });
        setRunState({ ...plan.state });
      }, 330);
    },
    [cell, moves, moving, runState, screen, stage, stageIndex],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (labCampaign !== "radial") return;
      event.stopImmediatePropagation();
      if (event.key === "Escape") {
        if (screen === "select") setLabCampaign("hub");
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
  }, [labCampaign, move, screen, undo]);

  const totalStars = useMemo(
    () =>
      bests.reduce<number>(
        (sum, best, index) => sum + starsFor(best, WORMHOLE_STAGES[index].par),
        0,
      ),
    [bests],
  );
  const totalHexStars = useMemo(
    () =>
      hexBests.reduce<number>(
        (sum, best, index) => sum + starsFor(best, HEX_STAGES[index].par),
        0,
      ),
    [hexBests],
  );
  const playerPoint = cellPoint(cell);

  if (labCampaign === "hex") {
    return (
      <HexMode
        avatarPixels={avatarPixels}
        onClose={() => {
          try {
            const storedHex = JSON.parse(window.localStorage.getItem(HEX_BEST_KEY) ?? "null");
            if (Array.isArray(storedHex)) {
              const restoredHex = Array<number | null>(HEX_STAGES.length).fill(null);
              storedHex.slice(0, HEX_STAGES.length).forEach((value, index) => {
                restoredHex[index] = typeof value === "number" ? value : null;
              });
              setHexBests(restoredHex);
            }
          } catch {
            // 손상된 실험 기록은 카드의 기본값으로 대체합니다.
          }
          setLabCampaign("hub");
        }}
      />
    );
  }

  if (labCampaign === "hub") {
    return (
      <div
        className="wormhole-mode lab-hub"
        role="dialog"
        aria-modal="true"
        aria-label="웜홀 테스트 랩"
      >
        <header className="wormhole-header">
          <div>
            <span>WORMHOLE TEST LAB · BETA</span>
            <strong>실험 구역을 선택하세요</strong>
          </div>
          <button type="button" onClick={onClose}>공식 스테이지로</button>
        </header>
        <div className="lab-hub-content">
          <div className="lab-hub-heading">
            <span className="beta-chip">2 EXPERIMENTS · 60 MAPS</span>
            <h2>사각형 밖의 직진 규칙</h2>
            <p>모양과 이동 축이 완전히 다른 실험 스테이지입니다. 구역을 고른 뒤 기존 맵 선택과 같은 방식으로 번호를 선택하세요.</p>
          </div>
          <div className="lab-campaign-grid">
            <button
              className="lab-campaign-card radial-campaign-card"
              type="button"
              onClick={() => {
                setScreen("select");
                setLabCampaign("radial");
              }}
            >
              <span className="lab-planet-image radial-lab-image" aria-hidden="true">
                <i /><i /><i />
              </span>
              <span className="lab-card-copy">
                <small>CURVED GRID · 30 MAPS</small>
                <strong>곡률 행성 에테르</strong>
                <em>중심과 원주를 따라 휘어지는 원형 직진</em>
              </span>
              <span className="lab-card-score">★ {totalStars}/90</span>
            </button>
            <button
              className="lab-campaign-card hex-campaign-card"
              type="button"
              onClick={() => setLabCampaign("hex")}
            >
              <span className="lab-planet-image hex-lab-image" aria-hidden="true">
                {Array.from({ length: 7 }, (_, index) => <i key={index} />)}
              </span>
              <span className="lab-card-copy">
                <small>HEX GRID · 30 MAPS</small>
                <strong>육각 성운 헥사리움</strong>
                <em>여섯 갈래 직진과 빛나는 벌집형 경로</em>
              </span>
              <span className="lab-card-score">★ {totalHexStars}/90</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`wormhole-mode ${screen === "select" ? "is-selecting" : "is-playing"}`}
      role="dialog"
      aria-modal="true"
      aria-label="웜홀 베타 스테이지"
    >
      <header className="wormhole-header">
        <div>
          <span>WORMHOLE TEST LAB · BETA</span>
          <strong>곡률 행성 에테르</strong>
        </div>
        <button type="button" onClick={screen === "select" ? () => setLabCampaign("hub") : () => setScreen("select")}>
          {screen === "select" ? "실험 구역 선택" : "베타 맵 선택"}
        </button>
      </header>

      {screen === "select" ? (
        <div className="wormhole-select">
          <div className="wormhole-hero">
            <div className="wormhole-portal" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div>
              <span className="beta-chip">실험 버전 · 30 MAPS</span>
              <h2>사각형 밖으로 휘어진 세계</h2>
              <p>
                위·아래는 중심의 바깥·안쪽으로, 좌·우는 원주를 따라 회전합니다.
                끝없이 도는 궤도는 붕괴하므로 부채꼴 블록에서 멈춰야 합니다.
              </p>
            </div>
          </div>
          <div className="wormhole-stage-legend" aria-label="웜홀 난이도 구성">
            <span>01–10 작은 맵 · 쉬움</span>
            <span>11–15 확장 맵</span>
            <span>16–20 포탈</span>
            <span>21–30 포탈 + 온오프</span>
          </div>
          <div className="wormhole-stage-grid" aria-label="웜홀 30단계 선택">
            {WORMHOLE_STAGES.map((item, index) => {
              const stars = starsFor(bests[index], item.par);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={
                    item.id >= 21 ? "is-master" : item.id >= 16 ? "has-portal" : ""
                  }
                  aria-label={`${item.id}번, 별 ${stars}개`}
                  onClick={() => start(index)}
                >
                  <span>{String(item.id).padStart(2, "0")}</span>
                  <em aria-hidden="true">{"★".repeat(stars)}{"☆".repeat(3 - stars)}</em>
                </button>
              );
            })}
          </div>
          <p className="wormhole-total">BETA STAR {totalStars}/90 · 공식 캠페인 기록과 별도 저장</p>
        </div>
      ) : (
        <div className="wormhole-play">
          <div className="wormhole-side">
            <span className="beta-chip">BETA MAP {String(stage.id).padStart(2, "0")}</span>
            <p>{stage.subtitle}</p>
            <div className="wormhole-score">
              <span>MOVE <strong>{moves}</strong></span>
              <span>PAR <strong>{stage.par}</strong></span>
              <span>RETRY <strong>{deaths}</strong></span>
            </div>
            {stage.id >= 16 && (
              <div className="wormhole-mechanic-state">
                <span><i className="portal-dot" /> 같은 색 포탈 사이로 순간이동</span>
                {stage.id >= 21 && (
                  <span>
                    <i className={runState.blocksOn ? "toggle-dot is-on" : "toggle-dot"} />
                    온오프 블록 {runState.blocksOn ? "ON" : "OFF"}
                  </span>
                )}
              </div>
            )}
            <div className="wormhole-tools">
              <button type="button" disabled={history.length === 0 || moving} onClick={undo}>
                ↶ 한 수 되돌리기
              </button>
              <button type="button" onClick={() => start(stageIndex)}>↻ 다시 시작</button>
            </div>
            <p className="wormhole-rule">
              ↑ 바깥 · ↓ 중심 · → 시계 · ← 반시계
            </p>
          </div>

          <div className="radial-board">
            <svg viewBox="0 0 600 600" role="img" aria-label={`${stage.id}번 원형 퍼즐 맵`}>
              <defs>
                <radialGradient id="wormholeCore">
                  <stop offset="0" stopColor="#050312" />
                  <stop offset="0.62" stopColor="#32135f" />
                  <stop offset="1" stopColor="#8a47ff" />
                </radialGradient>
              </defs>
              <circle className="radial-aura" cx={CENTER} cy={CENTER} r="285" />
              {Array.from({ length: stage.ringCount + 1 }, (_, ring) => (
                <circle
                  key={ring}
                  className="radial-grid-line"
                  cx={CENTER}
                  cy={CENTER}
                  r={INNER_RADIUS + ring * RING_SIZE}
                />
              ))}
              {Array.from({ length: RADIAL_SECTORS }, (_, sector) => {
                const start = polar(INNER_RADIUS, sector * (360 / RADIAL_SECTORS));
                const end = polar(
                  INNER_RADIUS + stage.ringCount * RING_SIZE,
                  sector * (360 / RADIAL_SECTORS),
                );
                return (
                  <line
                    key={sector}
                    className="radial-grid-line"
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                  />
                );
              })}
              <circle cx={CENTER} cy={CENTER} r={INNER_RADIUS - 8} fill="url(#wormholeCore)" />
              <circle className="radial-core-ring" cx={CENTER} cy={CENTER} r={INNER_RADIUS - 3} />
              {stage.blockCells.map((block) => (
                <path
                  key={radialCellKey(block)}
                  className="radial-block"
                  d={wedgePath(block)}
                />
              ))}
              {stage.toggleBlockCells.map((block) => (
                <path
                  key={`toggle-${radialCellKey(block)}`}
                  className={`radial-toggle-block ${runState.blocksOn ? "is-on" : "is-off"}`}
                  d={wedgePath(block)}
                />
              ))}
              {stage.portals.map((portal, index) => (
                <g
                  key={`portal-${radialCellKey(portal)}`}
                  className="radial-portal-cell"
                  transform={`translate(${cellPoint(portal).x} ${cellPoint(portal).y})`}
                >
                  <circle r="12" />
                  <circle r="7" />
                  <text y="3">{index + 1}</text>
                </g>
              ))}
              {stage.switchCells.map((switchCell) => (
                <g
                  key={`switch-${radialCellKey(switchCell)}`}
                  className="radial-switch-cell"
                  transform={`translate(${cellPoint(switchCell).x} ${cellPoint(switchCell).y})`}
                >
                  <rect x="-11" y="-11" width="22" height="22" rx="4" />
                  <text y="4">ON</text>
                </g>
              ))}
              <path className="radial-goal" d={wedgePath(stage.goal, 3.4)} />
              {trace.length > 1 && (
                <path className="radial-trace" d={tracePath(trace)} />
              )}
              <g
                className={"radial-player " + (moving ? "is-moving" : "")}
                transform={`translate(${playerPoint.x} ${playerPoint.y})`}
              >
                <rect className="radial-player-backdrop" x="-17" y="-17" width="34" height="34" rx="5" />
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

            <div className="radial-dpad" aria-label="웜홀 방향 조작">
              <button className="radial-up" type="button" aria-label="중심 바깥 방향으로 이동" onClick={() => move("out")}>↑</button>
              <button className="radial-left" type="button" aria-label="반시계 방향으로 이동" onClick={() => move("ccw")}>←</button>
              <span aria-hidden="true" />
              <button className="radial-right" type="button" aria-label="시계 방향으로 이동" onClick={() => move("cw")}>→</button>
              <button className="radial-down" type="button" aria-label="원 중심 방향으로 이동" onClick={() => move("in")}>↓</button>
            </div>
          </div>

          {screen === "won" && (
            <div className="wormhole-win">
              <span>CURVATURE STABLE</span>
              <h2>베타 맵 클리어!</h2>
              <div>{"★".repeat(starsFor(moves, stage.par))}{"☆".repeat(3 - starsFor(moves, stage.par))}</div>
              <p>{moves}번 이동 · PAR {stage.par}</p>
              <div>
                {stageIndex < WORMHOLE_STAGES.length - 1 && (
                  <button type="button" onClick={() => start(stageIndex + 1)}>다음 베타 맵</button>
                )}
                <button type="button" onClick={() => setScreen("select")}>맵 선택</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
