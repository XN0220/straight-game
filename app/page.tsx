"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  CELL_SIZE,
  CHAPTERS,
  GRID_COLS,
  GRID_ROWS,
  INITIAL_RUN_STATE,
  LEVELS,
  MAPS_PER_PLANET,
  MAPS_PER_ZONE,
  PLANETS,
  PLAYER_RATIO,
  PLAYER_SIZE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  boundaryTarget,
  cellCenter,
  slide,
  starsFor,
  type Cell,
  type Direction,
  type Point,
  type RunState,
} from "./game-engine";
import { SpeedControl, type MoveSpeed } from "./speed-control";
import { WormholeMode } from "./wormhole-mode";

type Screen = "menu" | "playing" | "won";
type Pixel = string | null;
type ActiveMove = {
  targets: Point[];
  targetIndex: number;
  outcome: "stop" | "goal" | "death" | "portal" | "switch" | "phase" | "break";
  destination?: Cell;
  nextState: RunState;
};
type MoveSnapshot = {
  cell: Cell;
  position: Point;
  runState: RunState;
  moves: number;
};

const AVATAR_GRID = 10;
const AVATAR_STORAGE_KEY = "straight-line-avatar-v2";
const UNLOCK_STORAGE_KEY = "straight-line-unlocked-v7";
const BEST_STORAGE_KEY = "straight-line-bests-v7";
const LAST_STAGE_STORAGE_KEY = "straight-line-last-stage-v7";
const PREVIOUS_UNLOCK_STORAGE_KEY = "straight-line-unlocked-v6";
const PREVIOUS_BEST_STORAGE_KEY = "straight-line-bests-v6";
const OLDER_UNLOCK_STORAGE_KEY = "straight-line-unlocked-v5";
const OLDER_BEST_STORAGE_KEY = "straight-line-bests-v5";
const LEGACY_UNLOCK_STORAGE_KEY = "straight-line-unlocked-v2";
const LEGACY_BEST_STORAGE_KEY = "straight-line-bests-v2";
const MOVE_SPEED = 680;
const TRAINING_SCENE_SCALE = 1.5;

function solutionCheckpoint(level: (typeof LEVELS)[number]) {
  const targetMove = Math.max(1, Math.ceil(level.solution.length / 2));
  let cell = { ...level.start };
  let state = { ...INITIAL_RUN_STATE };

  for (const direction of level.solution.slice(0, targetMove)) {
    const plan = slide(level, cell, direction, state);
    if (plan.outcome === "blocked" || plan.outcome === "death") break;
    cell = { ...plan.destination };
    state = { ...plan.state };
  }

  return { cell, targetMove };
}

const KEY_TO_DIRECTION: Record<string, Direction | undefined> = {
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

function patternToPixels(pattern: string[], palette: Record<string, string>): Pixel[] {
  return pattern.flatMap((row) =>
    [...row].map((symbol) => (symbol === "." ? null : palette[symbol] ?? null)),
  );
}

const AVATAR_PRESETS = [
  {
    id: "mint",
    name: "민트 큐브",
    pixels: patternToPixels(
      [
        "..MMMMMM..",
        ".MMMMMMMM.",
        "MMMMMMMMMM",
        "MMWWMMWWMM",
        "MMKKMMKKMM",
        "MMMMMMMMMM",
        "MMMMKKMMMM",
        "MMMKKKKMMM",
        ".MMMMMMMM.",
        "..mm..mm..",
      ],
      { M: "#74efc2", m: "#239b7b", W: "#f8fffd", K: "#102b2c" },
    ),
  },
  {
    id: "berry",
    name: "딸기 봇",
    pixels: patternToPixels(
      [
        "...GGGG...",
        "..GGRRGG..",
        ".RRRRRRRR.",
        "RRWWRRWWRR",
        "RRKKRRKKRR",
        "RRRRRRRRRR",
        "RRRRKKRRRR",
        ".RRKKKKRR.",
        "..RRRRRR..",
        "...R..R...",
      ],
      { R: "#ff5d78", G: "#63d16f", W: "#fff8f9", K: "#31151d" },
    ),
  },
  {
    id: "chick",
    name: "병아리",
    pixels: patternToPixels(
      [
        "...YYYY...",
        ".YYYYYYYY.",
        "YYYYYYYYYY",
        "YYWWYYWWYY",
        "YYKKYYKKYY",
        "YYYYOOYYYY",
        "YYYYYYYYYY",
        ".YYYYYYYY.",
        "..YYYYYY..",
        "..Y....Y..",
      ],
      { Y: "#ffd166", O: "#f28b3c", W: "#fffdf4", K: "#2b281d" },
    ),
  },
  {
    id: "space",
    name: "우주 유령",
    pixels: patternToPixels(
      [
        "..PPPPPP..",
        ".PBBBBBBP.",
        "PBBBBBBBBP",
        "PBCCBBCCBP",
        "PBKKBBKKBP",
        "PBBBBBBBBP",
        "PBBBKKBBBP",
        ".PBBBBBBP.",
        "..PPPPPP..",
        ".P......P.",
      ],
      { P: "#9b7bff", B: "#384a9f", C: "#d9e7ff", K: "#0d1534" },
    ),
  },
  {
    id: "luna",
    name: "루나 토끼",
    pixels: patternToPixels(
      [
        "..P....P..",
        ".PPP..PPP.",
        ".WWWWWWWW.",
        "WWWWWWWWWW",
        "WWKKWWKKWW",
        "WWWWPPWWWW",
        "WWPPPPPPWW",
        ".WWWWWWWW.",
        "..WWWWWW..",
        "..W....W..",
      ],
      { P: "#9b7bff", W: "#f8fffd", K: "#231b35" },
    ),
  },
  {
    id: "cat",
    name: "네온 고양이",
    pixels: patternToPixels(
      [
        "BB......BB",
        "BBB....BBB",
        "BBBBBBBBBB",
        "BBYYBBYYBB",
        "BBKKBBKKBB",
        "BBBBBBBBBB",
        "BBBBPPBBBB",
        "BBBPPPPBBB",
        ".BBBBBBBB.",
        "..B....B..",
      ],
      { B: "#273044", Y: "#ffd166", K: "#050508", P: "#ff5d78" },
    ),
  },
  {
    id: "slime",
    name: "초록 슬라임",
    pixels: patternToPixels(
      [
        "..........",
        "...GGGG...",
        ".GGGGGGGG.",
        "GGGGGGGGGG",
        "GGWWGGWWGG",
        "GGKKGGKKGG",
        "GGGGGGGGGG",
        "GGBGGGGBGG",
        ".GGGGGGGG.",
        "..G.GG.G..",
      ],
      { G: "#63d16f", W: "#f8fffd", K: "#132816", B: "#2c8c58" },
    ),
  },
  {
    id: "penguin",
    name: "빙하 펭귄",
    pixels: patternToPixels(
      [
        "..BBBBBB..",
        ".BBBBBBBB.",
        "BBBBBBBBBB",
        "BBWWBBWWBB",
        "BBKKBBKKBB",
        "BBWWWWWWBB",
        "BBBBOOBBBB",
        ".BBWWWWBB.",
        "..BBBBBB..",
        "..O....O..",
      ],
      { B: "#263755", W: "#f8fffd", K: "#080b12", O: "#ffd166" },
    ),
  },
  {
    id: "rocket",
    name: "로켓 봇",
    pixels: patternToPixels(
      [
        "...RRRR...",
        "..RWWWWR..",
        ".RBBBBBBR.",
        "RRCCRRCCRR",
        "RRKKRRKKRR",
        "RRBBBBBBRR",
        ".RROOORR..",
        "..ORRRO...",
        "...OOO....",
        "...O.O....",
      ],
      { R: "#ff5d78", W: "#f8fffd", B: "#384a9f", C: "#d9e7ff", K: "#11151b", O: "#ffd166" },
    ),
  },
  {
    id: "cactus",
    name: "우주 선인장",
    pixels: patternToPixels(
      [
        "...GGGG...",
        "..GGGGGG..",
        ".GGYGGYGG.",
        "GGGKGGKGGG",
        "GGGGGGGGGG",
        "..GGGGGG..",
        "G.GGGGGG.G",
        "GGGGGGGGGG",
        "...GGGG...",
        "...B..B...",
      ],
      { G: "#35b779", Y: "#ffd166", K: "#123e2c", B: "#9b5132" },
    ),
  },
  {
    id: "snow",
    name: "설원 탐사대",
    pixels: patternToPixels(
      [
        "...CCCC...",
        "..CCCCCC..",
        ".CCKCCKCC.",
        ".CCCCCCCC.",
        "..CCOOCC..",
        "...CCCC...",
        "..CCCCCC..",
        ".CCCCCCCC.",
        "..CCCCCC..",
        "..B....B..",
      ],
      { C: "#d9f3ff", K: "#182b3b", O: "#ff8b59", B: "#4f7cff" },
    ),
  },
  {
    id: "fox",
    name: "별빛 여우",
    pixels: patternToPixels(
      [
        "OOO....OOO",
        "OOOO..OOOO",
        "OOOOOOOOOO",
        "OOWWOOWWOO",
        "OOKKOOKKOO",
        "OOOOWWOOOO",
        "OOOWWWWOOO",
        ".OOOOOOOO.",
        "..OOOOOO..",
        "..OO..OO..",
      ],
      { O: "#f28b3c", W: "#fff4df", K: "#29160d" },
    ),
  },
] as const;

const PAINT_COLORS: Array<{ name: string; value: Pixel }> = [
  { name: "지우개", value: null },
  { name: "검정", value: "#11151b" },
  { name: "흰색", value: "#f8fffd" },
  { name: "민트", value: "#74efc2" },
  { name: "분홍", value: "#ff5d78" },
  { name: "노랑", value: "#ffd166" },
  { name: "파랑", value: "#4f7cff" },
  { name: "보라", value: "#9b7bff" },
  { name: "갈색", value: "#9b5132" },
];

function PixelAvatar({ pixels, className = "" }: { pixels: Pixel[]; className?: string }) {
  return (
    <div className={`pixel-avatar ${className}`} aria-hidden="true">
      {pixels.map((color, index) => (
        <span key={index} style={{ backgroundColor: color ?? "transparent" }} />
      ))}
    </div>
  );
}

function AvatarEditor({
  pixels,
  setPixels,
  onClose,
  onSave,
}: {
  pixels: Pixel[];
  setPixels: (pixels: Pixel[]) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const [paintColor, setPaintColor] = useState<Pixel>("#74efc2");
  const paintingRef = useRef(false);

  useEffect(() => {
    const stopPainting = () => {
      paintingRef.current = false;
    };
    window.addEventListener("pointerup", stopPainting);
    return () => window.removeEventListener("pointerup", stopPainting);
  }, []);

  const paintPixel = (index: number) => {
    const next = [...pixels];
    next[index] = paintColor;
    setPixels(next);
  };

  return (
    <div className="modal-backdrop editor-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="avatar-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-editor-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" aria-label="캐릭터 편집기 닫기" onClick={onClose}>
          ×
        </button>

        <div className="editor-heading">
          <span className="modal-index">PIXEL MAKER</span>
          <h2 id="avatar-editor-title">내 캐릭터 만들기</h2>
          <p>색을 고른 뒤 10×10 칸을 눌러 직접 그려보세요. 빈칸도 사용할 수 있어요.</p>
        </div>

        <div className="editor-layout">
          <div className="drawing-area">
            <div className="pixel-board" onPointerLeave={() => (paintingRef.current = false)}>
              {pixels.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`${Math.floor(index / AVATAR_GRID) + 1}행 ${(index % AVATAR_GRID) + 1}열 픽셀`}
                  className={color ? "is-painted" : ""}
                  style={{ backgroundColor: color ?? "transparent" }}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    paintingRef.current = true;
                    paintPixel(index);
                  }}
                  onPointerEnter={(event) => {
                    if (paintingRef.current && event.buttons === 1) paintPixel(index);
                  }}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    const next = [...pixels];
                    next[index] = null;
                    setPixels(next);
                  }}
                />
              ))}
            </div>

            <div className="paint-palette" aria-label="그리기 색상">
              {PAINT_COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  className={paintColor === color.value ? "is-selected" : ""}
                  aria-label={color.name}
                  aria-pressed={paintColor === color.value}
                  onClick={() => setPaintColor(color.value)}
                >
                  <span
                    className={color.value === null ? "eraser-swatch" : ""}
                    style={{ backgroundColor: color.value ?? "transparent" }}
                  />
                </button>
              ))}
            </div>
          </div>

          <aside className="preset-panel">
            <div className="editor-preview-card">
              <span>현재 모습</span>
              <PixelAvatar pixels={pixels} className="editor-preview" />
            </div>
            <div className="preset-heading">
              <strong>바로 쓰는 캐릭터</strong>
              <span>마음에 드는 예시를 골라도 됩니다.</span>
            </div>
            <div className="preset-list">
              {AVATAR_PRESETS.map((preset) => (
                <button key={preset.id} type="button" onClick={() => setPixels([...preset.pixels])}>
                  <PixelAvatar pixels={[...preset.pixels]} className="preset-avatar" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </aside>
        </div>

        <div className="editor-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() => setPixels(Array(AVATAR_GRID * AVATAR_GRID).fill(null))}
          >
            모두 지우기
          </button>
          <button className="primary-button" type="button" onClick={onSave}>
            이 캐릭터 사용
          </button>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gamePanelRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef<Point>(cellCenter(LEVELS[0].start));
  const cellRef = useRef<Cell>({ ...LEVELS[0].start });
  const stageIndexRef = useRef(0);
  const levelRef = useRef(LEVELS[0]);
  const runStateRef = useRef<RunState>({ ...INITIAL_RUN_STATE });
  const activeMoveRef = useRef<ActiveMove | null>(null);
  const movingRef = useRef(false);
  const dyingRef = useRef(false);
  const screenRef = useRef<Screen>("menu");
  const movesRef = useRef(0);
  const lastTimeRef = useRef(0);
  const touchStartRef = useRef<Point | null>(null);
  const trailRef = useRef<Array<Point & { life: number }>>([]);
  const lastTrailRef = useRef(0);
  const moveCommandRef = useRef<(direction: Direction) => void>(() => {});
  const deathTimerRef = useRef<number | null>(null);
  const moveHistoryRef = useRef<MoveSnapshot[]>([]);
  const avatarRef = useRef<Pixel[]>([...AVATAR_PRESETS[0].pixels]);
  const moveSpeedRef = useRef<MoveSpeed>(1);
  const particlesRef = useRef<
    Array<Point & { vx: number; vy: number; life: number; color: string }>
  >([]);

  const [screen, setScreen] = useState<Screen>("menu");
  const [stageIndex, setStageIndex] = useState(0);
  const [selectedStage, setSelectedStage] = useState(0);
  const [selectedPlanet, setSelectedPlanet] = useState(0);
  const [lastPlayedStage, setLastPlayedStage] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [runState, setRunState] = useState<RunState>({ ...INITIAL_RUN_STATE });
  const [planetUnlocks, setPlanetUnlocks] = useState<number[]>(
    PLANETS.map(() => 1),
  );
  const [stageBests, setStageBests] = useState<Array<number | null>>(
    Array(LEVELS.length).fill(null),
  );
  const [showHelp, setShowHelp] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [moveSpeed, setMoveSpeed] = useState<MoveSpeed>(1);
  const [bump, setBump] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [wormholeOpen, setWormholeOpen] = useState(false);
  const [mapSelectOpen, setMapSelectOpen] = useState(false);
  const [avatarPixels, setAvatarPixels] = useState<Pixel[]>([...AVATAR_PRESETS[0].pixels]);
  const [draftPixels, setDraftPixels] = useState<Pixel[]>([...AVATAR_PRESETS[0].pixels]);

  const setGameScreen = useCallback((next: Screen) => {
    screenRef.current = next;
    setScreen(next);
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect -- 저장된 캠페인 진행도를 첫 클라이언트 렌더 뒤 복원합니다. */
  useEffect(() => {
    try {
      const storedAvatar = JSON.parse(window.localStorage.getItem(AVATAR_STORAGE_KEY) ?? "null");
      if (
        Array.isArray(storedAvatar) &&
        storedAvatar.length === AVATAR_GRID * AVATAR_GRID &&
        storedAvatar.every((pixel) => pixel === null || typeof pixel === "string")
      ) {
        setAvatarPixels(storedAvatar);
        setDraftPixels(storedAvatar);
      }

      const currentUnlocks = JSON.parse(
        window.localStorage.getItem(UNLOCK_STORAGE_KEY) ?? "null",
      );
      const previousUnlocked = window.localStorage.getItem(PREVIOUS_UNLOCK_STORAGE_KEY);
      const olderUnlocked = window.localStorage.getItem(OLDER_UNLOCK_STORAGE_KEY);
      const legacyUnlocked = Number(
        window.localStorage.getItem(LEGACY_UNLOCK_STORAGE_KEY) ?? "1",
      );
      const legacyBests = JSON.parse(
        window.localStorage.getItem(LEGACY_BEST_STORAGE_KEY) ?? "null",
      );
      let unlockedValue = 1;
      if (previousUnlocked !== null) {
        unlockedValue = Number(previousUnlocked) || 1;
      } else if (olderUnlocked !== null) {
        unlockedValue = MAPS_PER_PLANET + (Number(olderUnlocked) || 1);
      } else if (legacyUnlocked > 1) {
        unlockedValue = MAPS_PER_PLANET + legacyUnlocked;
      }
      if (
        previousUnlocked === null &&
        olderUnlocked === null &&
        legacyUnlocked >= 5 &&
        Array.isArray(legacyBests) &&
        typeof legacyBests[4] === "number"
      ) {
        unlockedValue = MAPS_PER_PLANET + 6;
      }
      const safeUnlocks =
        Array.isArray(currentUnlocks) &&
        currentUnlocks.length === PLANETS.length &&
        currentUnlocks.every((value) => typeof value === "number")
          ? currentUnlocks.map((value) =>
              Math.max(1, Math.min(MAPS_PER_PLANET, Math.floor(value))),
            )
          : PLANETS.map((_, planetIndex) =>
              Math.max(
                1,
                Math.min(MAPS_PER_PLANET, unlockedValue - planetIndex * MAPS_PER_PLANET),
              ),
            );
      setPlanetUnlocks(safeUnlocks);
      window.localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(safeUnlocks));

      const storedLastStage = Number(
        window.localStorage.getItem(LAST_STAGE_STORAGE_KEY) ?? "-1",
      );
      const lastStagePlanet = Math.floor(storedLastStage / MAPS_PER_PLANET);
      const lastStageLocal = storedLastStage % MAPS_PER_PLANET;
      const canRestoreLastStage =
        storedLastStage >= 0 &&
        storedLastStage < LEVELS.length &&
        lastStageLocal < (safeUnlocks[lastStagePlanet] ?? 1);
      setLastPlayedStage(canRestoreLastStage ? storedLastStage : null);
      // 첫 화면의 선택은 항상 지구 연구실 1번입니다. 최근 맵은 이어하기에서만 사용합니다.
      setSelectedStage(0);
      setSelectedPlanet(0);

      const storedBests = JSON.parse(window.localStorage.getItem(BEST_STORAGE_KEY) ?? "null");
      const previousBests = JSON.parse(
        window.localStorage.getItem(PREVIOUS_BEST_STORAGE_KEY) ?? "null",
      );
      const olderBests = JSON.parse(
        window.localStorage.getItem(OLDER_BEST_STORAGE_KEY) ?? "null",
      );
      if (Array.isArray(storedBests) && storedBests.length === LEVELS.length) {
        setStageBests(storedBests.map((best) => (typeof best === "number" ? best : null)));
      } else {
        const migratedBests = Array<number | null>(LEVELS.length).fill(null);
        if (Array.isArray(previousBests) && previousBests.length === LEVELS.length) {
          previousBests
            .slice(MAPS_PER_PLANET)
            .forEach((best, index) => {
              if (typeof best === "number") {
                migratedBests[index + MAPS_PER_PLANET] = best;
              }
            });
        } else {
          const sourceBests = Array.isArray(olderBests)
            ? olderBests
            : Array.isArray(legacyBests)
              ? legacyBests
              : [];
          sourceBests.slice(0, MAPS_PER_PLANET * 3).forEach((best, index) => {
            if (typeof best === "number") migratedBests[index + MAPS_PER_PLANET] = best;
          });
        }
        setStageBests(migratedBests);
        window.localStorage.setItem(BEST_STORAGE_KEY, JSON.stringify(migratedBests));
      }
    } catch {
      // 손상된 로컬 저장값은 기본값으로 안전하게 대체합니다.
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    avatarRef.current = avatarPixels;
  }, [avatarPixels]);

  useEffect(
    () => () => {
      if (deathTimerRef.current !== null) window.clearTimeout(deathTimerRef.current);
    },
    [],
  );

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "square") => {
      if (!soundOn) return;
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return;

      const audio = new AudioContextClass();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
      gain.gain.setValueAtTime(0.032, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + duration);
      oscillator.addEventListener("ended", () => audio.close());
    },
    [soundOn],
  );

  const startStage = useCallback(
    (index: number) => {
      const safeIndex = Math.max(0, Math.min(LEVELS.length - 1, index));
      const level = LEVELS[safeIndex];
      if (deathTimerRef.current !== null) window.clearTimeout(deathTimerRef.current);
      deathTimerRef.current = null;
      stageIndexRef.current = safeIndex;
      levelRef.current = level;
      runStateRef.current = { ...INITIAL_RUN_STATE };
      cellRef.current = { ...level.start };
      positionRef.current = cellCenter(level.start);
      activeMoveRef.current = null;
      movingRef.current = false;
      dyingRef.current = false;
      moveHistoryRef.current = [];
      trailRef.current = [];
      particlesRef.current = [];
      movesRef.current = 0;
      setStageIndex(safeIndex);
      setSelectedStage(safeIndex);
      setSelectedPlanet(Math.floor(safeIndex / MAPS_PER_PLANET));
      window.localStorage.setItem(LAST_STAGE_STORAGE_KEY, String(safeIndex));
      setLastPlayedStage(safeIndex);
      setMoves(0);
      setDeaths(0);
      setRunState({ ...INITIAL_RUN_STATE });
      setIsDead(false);
      setNewBest(false);
      setHintVisible(false);
      setCanUndo(false);
      setBump(false);
      setGameScreen("playing");
      window.setTimeout(() => gamePanelRef.current?.focus(), 0);
    },
    [setGameScreen],
  );

  const startNextStage = useCallback(() => {
    const next = stageIndexRef.current + 1;
    startStage(next < LEVELS.length ? next : 0);
  }, [startStage]);

  const restartAfterDeath = useCallback(() => {
    const level = levelRef.current;
    runStateRef.current = { ...INITIAL_RUN_STATE };
    cellRef.current = { ...level.start };
    positionRef.current = cellCenter(level.start);
    activeMoveRef.current = null;
    movingRef.current = false;
    dyingRef.current = false;
    moveHistoryRef.current = [];
    trailRef.current = [];
    movesRef.current = 0;
    setMoves(0);
    setRunState({ ...INITIAL_RUN_STATE });
    setCanUndo(false);
    setIsDead(false);
    window.setTimeout(() => gamePanelRef.current?.focus(), 0);
  }, []);

  const returnToMenu = useCallback(() => {
    if (deathTimerRef.current !== null) window.clearTimeout(deathTimerRef.current);
    deathTimerRef.current = null;
    activeMoveRef.current = null;
    movingRef.current = false;
    dyingRef.current = false;
    setIsDead(false);
    setShowHelp(false);
    setShowEditor(false);
    setGameScreen("menu");
  }, [setGameScreen]);

  const killPlayer = useCallback(() => {
    if (dyingRef.current) return;
    dyingRef.current = true;
    movingRef.current = false;
    activeMoveRef.current = null;
    setIsDead(true);
    setDeaths((value) => value + 1);
    playTone(135, 0.16, "sawtooth");
    window.setTimeout(() => playTone(82, 0.22, "square"), 120);
    window.navigator.vibrate?.([55, 35, 80]);
    deathTimerRef.current = window.setTimeout(restartAfterDeath, 760);
  }, [playTone, restartAfterDeath]);

  const finishStage = useCallback(() => {
    movingRef.current = false;
    activeMoveRef.current = null;
    const result = movesRef.current;
    const index = stageIndexRef.current;

    setStageBests((previous) => {
      const next = [...previous];
      const isRecord = next[index] === null || result < (next[index] as number);
      if (isRecord) {
        next[index] = result;
        setNewBest(true);
      }
      window.localStorage.setItem(BEST_STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    const clearedLevel = LEVELS[index];
    if (clearedLevel.localId < MAPS_PER_PLANET) {
      setPlanetUnlocks((previous) => {
        const next = [...previous];
        next[clearedLevel.planet] = Math.max(
          next[clearedLevel.planet] ?? 1,
          clearedLevel.localId + 1,
        );
        window.localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }

    const colors = ["#70f0c1", "#ff5d78", "#ffd166", "#f8fbff", "#9b7bff"];
    const center = { ...positionRef.current };
    particlesRef.current = Array.from({ length: 44 }, (_, particleIndex) => {
      const angle = (Math.PI * 2 * particleIndex) / 44 + Math.random() * 0.14;
      const speed = 75 + Math.random() * 185;
      return {
        ...center,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.9 + Math.random() * 0.55,
        color: colors[particleIndex % colors.length],
      };
    });

    playTone(523, 0.12);
    window.setTimeout(() => playTone(659, 0.14), 100);
    window.setTimeout(() => playTone(784, 0.22), 210);
    window.navigator.vibrate?.(70);
    setGameScreen("won");
  }, [playTone, setGameScreen]);

  const undoMove = useCallback(() => {
    if (
      screenRef.current !== "playing" ||
      movingRef.current ||
      dyingRef.current
    ) {
      return;
    }
    const snapshot = moveHistoryRef.current.pop();
    if (!snapshot) return;

    cellRef.current = { ...snapshot.cell };
    positionRef.current = { ...snapshot.position };
    runStateRef.current = { ...snapshot.runState };
    movesRef.current = snapshot.moves;
    activeMoveRef.current = null;
    trailRef.current = [];
    setMoves(snapshot.moves);
    setRunState({ ...snapshot.runState });
    setCanUndo(moveHistoryRef.current.length > 0);
    setHintVisible(false);
    playTone(196, 0.07, "triangle");
  }, [playTone]);

  const commandMove = useCallback(
    (direction: Direction) => {
      if (screenRef.current !== "playing" || movingRef.current || dyingRef.current) return;

      const plan = slide(levelRef.current, cellRef.current, direction, runStateRef.current);
      if (plan.outcome === "blocked") {
        setBump(true);
        playTone(108, 0.075, "sawtooth");
        window.setTimeout(() => setBump(false), 130);
        return;
      }

      const targets = plan.waypoints.map(cellCenter);
      if (plan.outcome === "death") {
        targets.push(boundaryTarget(plan.edgeCell, plan.direction));
      }
      if (targets.length === 0 && plan.outcome !== "death") {
        targets.push(cellCenter(plan.destination));
      }

      moveHistoryRef.current.push({
        cell: { ...cellRef.current },
        position: { ...positionRef.current },
        runState: { ...runStateRef.current },
        moves: movesRef.current,
      });
      setCanUndo(true);
      activeMoveRef.current = {
        targets,
        targetIndex: 0,
        outcome: plan.outcome,
        destination: plan.outcome === "death" ? undefined : plan.destination,
        nextState: { ...plan.state },
      };
      movesRef.current += 1;
      setMoves(movesRef.current);
      movingRef.current = true;
      playTone(228, 0.05);
    },
    [playTone],
  );

  useEffect(() => {
    moveCommandRef.current = commandMove;
  }, [commandMove]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (showHelp || showEditor) {
        if (event.key === "Escape") {
          setShowHelp(false);
          setShowEditor(false);
        }
        return;
      }
      if (wormholeOpen) return;

      const direction = KEY_TO_DIRECTION[event.key];
      if (direction) {
        event.preventDefault();
        moveCommandRef.current(direction);
        return;
      }

      if (event.key === "r" || event.key === "R") {
        if (screenRef.current !== "menu") startStage(stageIndexRef.current);
      }
      if (
        event.key === "u" ||
        event.key === "U" ||
        (event.ctrlKey && event.key.toLowerCase() === "z")
      ) {
        event.preventDefault();
        undoMove();
      }
      if (event.key === "Escape") returnToMenu();
      if (event.key === "Enter") {
        if (screenRef.current === "menu") startStage(selectedStage);
        else if (screenRef.current === "won") startNextStage();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    returnToMenu,
    selectedStage,
    showEditor,
    showHelp,
    startNextStage,
    startStage,
    undoMove,
    wormholeOpen,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const drawBlock = (cell: Cell, planet: number, alpha = 1) => {
      const x = cell.col * CELL_SIZE;
      const y = cell.row * CELL_SIZE;
      const size = CELL_SIZE;
      context.save();
      context.globalAlpha = alpha;
      context.fillStyle = "rgba(0, 0, 0, 0.7)";
      context.fillRect(x + 3, y + 4, size - 2, size - 2);
      if (planet === 0) {
        context.fillStyle = "#174f86";
        context.fillRect(x, y, size, size);
        context.fillStyle = "#2f83c8";
        context.fillRect(x + 2, y + 2, size - 4, size - 4);
        context.fillStyle = "#d9f3ff";
        context.fillRect(x + 4, y + 4, size - 8, 4);
        context.fillStyle = "#155077";
        context.fillRect(x + 8, y + 13, size - 16, size - 19);
        context.strokeStyle = "rgba(255,255,255,0.62)";
        context.lineWidth = 1;
        context.strokeRect(x + 5, y + 5, size - 10, size - 10);
      } else if (planet === 1) {
        context.fillStyle = "#35141c";
        context.fillRect(x, y, size, size);
        context.fillStyle = "#672131";
        context.fillRect(x + 2, y + 2, size - 4, size - 4);
        context.fillStyle = "#9f3040";
        context.beginPath();
        context.moveTo(x + 4, y + 4);
        context.lineTo(x + size - 7, y + 6);
        context.lineTo(x + size - 4, y + 17);
        context.lineTo(x + size - 10, y + size - 5);
        context.lineTo(x + 8, y + size - 3);
        context.lineTo(x + 3, y + 22);
        context.closePath();
        context.fill();
        context.strokeStyle = "#ff5d78";
        context.lineWidth = 2;
        context.shadowColor = "#ff5d78";
        context.shadowBlur = 5;
        context.beginPath();
        context.moveTo(x + 6, y + 8);
        context.lineTo(x + 15, y + 14);
        context.lineTo(x + 12, y + 23);
        context.lineTo(x + 23, y + 31);
        context.moveTo(x + 15, y + 14);
        context.lineTo(x + 28, y + 8);
        context.moveTo(x + 12, y + 23);
        context.lineTo(x + 5, y + 30);
        context.stroke();
        context.shadowBlur = 0;
        context.fillStyle = "#ff9b61";
        context.fillRect(x + 13, y + 14, 3, 3);
        context.fillRect(x + 21, y + 29, 3, 3);
      } else if (planet === 2) {
        context.fillStyle = "#2b343b";
        context.fillRect(x, y, size, size);
        context.fillStyle = "#53616b";
        context.fillRect(x + 3, y + 3, size - 6, size - 6);
        context.fillStyle = "#74838d";
        context.fillRect(x + 5, y + 5, size - 10, 3);
        context.fillStyle = "#1b2227";
        context.fillRect(x + 8, y + 12, size - 16, size - 20);
        context.fillStyle = "#ffd166";
        [[6, 6], [size - 8, 6], [6, size - 8], [size - 8, size - 8]].forEach(
          ([offsetX, offsetY]) => context.fillRect(x + offsetX, y + offsetY, 3, 3),
        );
      } else {
        context.fillStyle = "#271d4b";
        context.fillRect(x, y, size, size);
        context.fillStyle = "#593b91";
        context.beginPath();
        context.moveTo(x + 2, y + 2);
        context.lineTo(x + size - 3, y + 7);
        context.lineTo(x + size - 8, y + size - 3);
        context.lineTo(x + 8, y + size - 5);
        context.closePath();
        context.fill();
        context.fillStyle = "#a987ff";
        context.beginPath();
        context.moveTo(x + 5, y + 5);
        context.lineTo(x + size - 8, y + 9);
        context.lineTo(x + 13, y + size - 8);
        context.closePath();
        context.fill();
        context.fillStyle = "rgba(212, 248, 255, 0.82)";
        context.fillRect(x + 8, y + 7, 3, size - 17);
      }
      context.restore();
    };

    const drawOneWay = (cell: Cell & { direction: Direction }, alpha = 1) => {
      const center = cellCenter(cell);
      const rotation = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 }[
        cell.direction
      ];
      context.save();
      context.globalAlpha = alpha;
      context.translate(center.x, center.y);
      context.fillStyle = "rgba(91, 211, 255, 0.12)";
      context.strokeStyle = "rgba(91, 211, 255, 0.42)";
      context.lineWidth = 1.5;
      context.fillRect(-CELL_SIZE / 2 + 3, -CELL_SIZE / 2 + 3, CELL_SIZE - 6, CELL_SIZE - 6);
      context.strokeRect(-CELL_SIZE / 2 + 4, -CELL_SIZE / 2 + 4, CELL_SIZE - 8, CELL_SIZE - 8);
      context.rotate(rotation);
      context.fillStyle = "#5bd3ff";
      context.beginPath();
      context.moveTo(0, -10);
      context.lineTo(8, 0);
      context.lineTo(3, 0);
      context.lineTo(3, 10);
      context.lineTo(-3, 10);
      context.lineTo(-3, 0);
      context.lineTo(-8, 0);
      context.closePath();
      context.fill();
      context.restore();
    };

    const drawPortal = (cell: Cell, portalIndex: number, alpha = 1) => {
      const center = cellCenter(cell);
      const pulse = 0.82 + Math.sin(performance.now() / 170 + portalIndex * Math.PI) * 0.18;
      context.save();
      context.globalAlpha = alpha;
      context.translate(center.x, center.y);
      context.strokeStyle = `rgba(155, 123, 255, ${0.48 + pulse * 0.4})`;
      context.fillStyle = "rgba(83, 56, 176, 0.2)";
      context.lineWidth = 3;
      context.beginPath();
      context.arc(0, 0, 11 + pulse * 3, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.rotate(performance.now() / 850);
      context.fillStyle = "#c8b9ff";
      context.fillRect(-3, -15, 6, 6);
      context.fillRect(-3, 9, 6, 6);
      context.fillRect(-15, -3, 6, 6);
      context.fillRect(9, -3, 6, 6);
      context.restore();
    };

    const drawSwitch = (cell: Cell, isOn: boolean, alpha = 1) => {
      const x = cell.col * CELL_SIZE;
      const y = cell.row * CELL_SIZE;
      context.save();
      context.globalAlpha = alpha;
      context.fillStyle = isOn ? "rgba(116, 239, 194, 0.22)" : "rgba(255, 178, 89, 0.16)";
      context.fillRect(x + 5, y + 5, CELL_SIZE - 10, CELL_SIZE - 10);
      context.strokeStyle = isOn ? "#74efc2" : "#ffb259";
      context.lineWidth = 2;
      context.strokeRect(x + 7, y + 7, CELL_SIZE - 14, CELL_SIZE - 14);
      context.fillStyle = isOn ? "#74efc2" : "#ffb259";
      context.fillRect(x + 13, y + 13, CELL_SIZE - 26, CELL_SIZE - 26);
      context.restore();
    };

    const drawGate = (cell: Cell, isOpen: boolean, alpha = 1) => {
      const x = cell.col * CELL_SIZE;
      const y = cell.row * CELL_SIZE;
      context.save();
      context.globalAlpha = alpha;
      context.strokeStyle = isOpen ? "rgba(116, 239, 194, 0.45)" : "#ffb259";
      context.fillStyle = isOpen ? "rgba(116, 239, 194, 0.035)" : "rgba(110, 55, 15, 0.78)";
      context.lineWidth = 2;
      context.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      context.strokeRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6);
      if (isOpen) {
        context.setLineDash([3, 4]);
        context.strokeRect(x + 8, y + 8, CELL_SIZE - 16, CELL_SIZE - 16);
      } else {
        context.fillStyle = "#ffb259";
        for (let bar = 7; bar < CELL_SIZE - 4; bar += 7) {
          context.fillRect(x + bar, y + 5, 3, CELL_SIZE - 10);
        }
      }
      context.restore();
    };

    const drawFragile = (cell: Cell, isBroken: boolean, alpha = 1) => {
      const x = cell.col * CELL_SIZE;
      const y = cell.row * CELL_SIZE;
      context.save();
      context.globalAlpha = isBroken ? alpha * 0.25 : alpha;
      context.fillStyle = isBroken ? "rgba(255, 93, 120, 0.08)" : "#8b3146";
      context.strokeStyle = isBroken ? "#6f3845" : "#ff8aa0";
      context.lineWidth = 2;
      if (!isBroken) context.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      context.beginPath();
      context.moveTo(x + 7, y + 4);
      context.lineTo(x + 16, y + 14);
      context.lineTo(x + 11, y + 21);
      context.lineTo(x + 24, y + 31);
      context.moveTo(x + 16, y + 14);
      context.lineTo(x + 29, y + 9);
      context.moveTo(x + 11, y + 21);
      context.lineTo(x + 5, y + 30);
      context.stroke();
      context.restore();
    };

    const drawRotator = (cell: Cell, alpha = 1) => {
      const center = cellCenter(cell);
      const pulse = 0.85 + Math.sin(performance.now() / 160) * 0.15;
      context.save();
      context.globalAlpha = alpha;
      context.translate(center.x, center.y);
      context.fillStyle = "rgba(255, 209, 102, 0.16)";
      context.strokeStyle = "#ffd166";
      context.lineWidth = 2;
      context.fillRect(-14, -14, 28, 28);
      context.strokeRect(-13, -13, 26, 26);
      context.rotate(performance.now() / 1400);
      context.beginPath();
      context.arc(0, 0, 8 + pulse, -Math.PI * 0.25, Math.PI * 1.2);
      context.stroke();
      context.fillStyle = "#ffd166";
      context.beginPath();
      context.moveTo(9, -8);
      context.lineTo(14, -3);
      context.lineTo(7, -2);
      context.closePath();
      context.fill();
      context.fillRect(-3, -3, 6, 6);
      context.restore();
    };

    const drawPhaseSwitch = (cell: Cell, phase: 0 | 1, alpha = 1) => {
      const x = cell.col * CELL_SIZE;
      const y = cell.row * CELL_SIZE;
      const color = phase === 0 ? "#55f2df" : "#a987ff";
      context.save();
      context.globalAlpha = alpha;
      context.fillStyle = phase === 0 ? "rgba(85, 242, 223, 0.17)" : "rgba(169, 135, 255, 0.18)";
      context.fillRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.strokeRect(x + 6, y + 6, CELL_SIZE - 12, CELL_SIZE - 12);
      context.fillStyle = color;
      context.fillRect(x + 10, y + 15, 7, 7);
      context.fillRect(x + 20, y + 15, 7, 7);
      context.restore();
    };

    const drawPhaseWall = (
      cell: Cell,
      kind: 0 | 1,
      phase: 0 | 1,
      alpha = 1,
    ) => {
      const x = cell.col * CELL_SIZE;
      const y = cell.row * CELL_SIZE;
      const solid = kind === phase;
      const color = kind === 0 ? "#55f2df" : "#a987ff";
      context.save();
      context.globalAlpha = alpha * (solid ? 0.92 : 0.26);
      context.fillStyle = solid
        ? kind === 0
          ? "rgba(23, 118, 110, 0.88)"
          : "rgba(82, 56, 150, 0.9)"
        : "rgba(18, 22, 31, 0.22)";
      context.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      context.strokeStyle = color;
      context.lineWidth = solid ? 3 : 1.5;
      if (!solid) context.setLineDash([4, 4]);
      context.strokeRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8);
      if (solid) {
        context.fillStyle = color;
        for (let offset = 8; offset < CELL_SIZE - 4; offset += 8) {
          context.fillRect(x + offset, y + 6, 2, CELL_SIZE - 12);
        }
      }
      context.restore();
    };

    const drawGoal = (cell: Cell, alpha = 1) => {
      const center = cellCenter(cell);
      const pulse = 0.84 + Math.sin(performance.now() / 180) * 0.16;
      context.save();
      context.globalAlpha = alpha;
      context.fillStyle = `rgba(255, 178, 89, ${0.16 * pulse})`;
      context.beginPath();
      context.arc(center.x, center.y, CELL_SIZE * 0.7, 0, Math.PI * 2);
      context.fill();
      context.translate(center.x, center.y);
      context.rotate(Math.PI / 4);
      context.fillStyle = "#5a2b21";
      context.fillRect(-11, -11, 22, 22);
      context.fillStyle = "#c67846";
      context.fillRect(-8, -8, 16, 16);
      context.fillStyle = "#ffd19a";
      context.fillRect(-5, -5, 6, 6);
      context.restore();
    };

    const drawAvatar = (position: Point, alpha = 1) => {
      const size = PLAYER_SIZE;
      const pixelSize = size / AVATAR_GRID;
      const left = position.x - size / 2;
      const top = position.y - size / 2;
      context.save();
      context.globalAlpha = alpha;
      context.fillStyle = "rgba(116, 239, 194, 0.1)";
      context.fillRect(left - 3, top - 3, size + 6, size + 6);
      context.strokeStyle = "rgba(116, 239, 194, 0.34)";
      context.lineWidth = 1;
      context.strokeRect(left - 1, top - 1, size + 2, size + 2);
      avatarRef.current.forEach((color, index) => {
        if (!color) return;
        const col = index % AVATAR_GRID;
        const row = Math.floor(index / AVATAR_GRID);
        context.fillStyle = color;
        context.fillRect(
          Math.floor(left + col * pixelSize),
          Math.floor(top + row * pixelSize),
          Math.ceil(pixelSize + 0.4),
          Math.ceil(pixelSize + 0.4),
        );
      });
      context.restore();
    };

    const drawBoundary = (planet: number, alpha = 1) => {
      context.save();
      context.globalAlpha = alpha;
      context.strokeStyle = planet === 0 ? "#ef9b3f" : "#ff5d78";
      context.lineWidth = 4;
      context.shadowColor =
        planet === 0 ? "rgba(239, 155, 63, 0.4)" : "rgba(255, 93, 120, 0.55)";
      context.shadowBlur = 10;
      context.strokeRect(2, 2, WORLD_WIDTH - 4, WORLD_HEIGHT - 4);
      context.shadowBlur = 0;
      context.strokeStyle =
        planet === 0 ? "rgba(180, 104, 28, 0.42)" : "rgba(255, 160, 176, 0.5)";
      context.lineWidth = 2;
      context.setLineDash([9, 13]);
      context.strokeRect(7, 7, WORLD_WIDTH - 14, WORLD_HEIGHT - 14);
      context.restore();
    };

    let animationFrame = 0;
    const render = (time: number) => {
      const rawDelta = Math.min((time - lastTimeRef.current) / 1000 || 0, 2);
      const effectDelta = Math.min(rawDelta, 0.055);
      lastTimeRef.current = time;

      if (screenRef.current === "playing" && movingRef.current && activeMoveRef.current) {
        const activeMove = activeMoveRef.current;
        const target = activeMove.targets[activeMove.targetIndex];
        const deltaX = target.x - positionRef.current.x;
        const deltaY = target.y - positionRef.current.y;
        const distance = Math.hypot(deltaX, deltaY);
        const travel = MOVE_SPEED * moveSpeedRef.current * rawDelta;

        if (distance <= travel || distance < 0.5) {
          positionRef.current = { ...target };
          if (activeMove.targetIndex < activeMove.targets.length - 1) {
            activeMove.targetIndex += 1;
            playTone(330, 0.045, "triangle");
          } else {
            const landedPosition =
              activeMove.outcome === "portal" && activeMove.destination
                ? cellCenter(activeMove.destination)
                : target;
            positionRef.current = { ...landedPosition };
            movingRef.current = false;
            activeMoveRef.current = null;
            if (activeMove.destination) cellRef.current = { ...activeMove.destination };
            runStateRef.current = { ...activeMove.nextState };
            setRunState({ ...activeMove.nextState });
            if (activeMove.outcome === "goal") finishStage();
            if (activeMove.outcome === "death") killPlayer();
            if (activeMove.outcome === "stop") playTone(148, 0.042);
            if (activeMove.outcome === "portal") {
              trailRef.current = [];
              playTone(880, 0.09, "sine");
              window.setTimeout(() => playTone(1175, 0.08, "sine"), 55);
            }
            if (activeMove.outcome === "switch") {
              playTone(392, 0.08);
              window.setTimeout(() => playTone(784, 0.12), 70);
            }
            if (activeMove.outcome === "phase") {
              playTone(activeMove.nextState.phase === 1 ? 740 : 440, 0.11, "sine");
              window.setTimeout(
                () => playTone(activeMove.nextState.phase === 1 ? 980 : 330, 0.12, "triangle"),
                70,
              );
            }
            if (activeMove.outcome === "break") {
              setBump(true);
              playTone(92, 0.11, "sawtooth");
              window.setTimeout(() => setBump(false), 150);
            }
          }
        } else {
          positionRef.current = {
            x: positionRef.current.x + (deltaX / distance) * travel,
            y: positionRef.current.y + (deltaY / distance) * travel,
          };
        }

        if (time - lastTrailRef.current > 46) {
          trailRef.current.push({ ...positionRef.current, life: 0.22 });
          if (trailRef.current.length > 8) trailRef.current.shift();
          lastTrailRef.current = time;
        }
      }

      trailRef.current = trailRef.current
        .map((trail) => ({ ...trail, life: trail.life - effectDelta }))
        .filter((trail) => trail.life > 0);

      particlesRef.current = particlesRef.current
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx * effectDelta,
          y: particle.y + particle.vy * effectDelta,
          vy: particle.vy + 180 * effectDelta,
          life: particle.life - effectDelta,
        }))
        .filter((particle) => particle.life > 0);

      const sceneLevel = screenRef.current === "menu" ? LEVELS[selectedStage] : levelRef.current;
      const sceneRunState =
        screenRef.current === "menu" ? INITIAL_RUN_STATE : runStateRef.current;
      const sceneAlpha = screenRef.current === "menu" ? 0.13 : 1;
      const planetBackground = ["#f7fbfd", "#050508", "#071014", "#0b0717"][sceneLevel.planet];
      const planetGlow = [
        "rgba(151, 220, 235, 0.28)",
        "rgba(27, 46, 44, 0.32)",
        "rgba(32, 68, 79, 0.38)",
        "rgba(82, 48, 135, 0.42)",
      ][sceneLevel.planet];
      const gridColor = [
        "rgba(24, 94, 123, 0.13)",
        "rgba(148, 255, 223, 0.055)",
        "rgba(91, 211, 255, 0.07)",
        "rgba(186, 160, 255, 0.075)",
      ][sceneLevel.planet];

      context.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      context.fillStyle = planetBackground;
      context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      const glow = context.createRadialGradient(
        WORLD_WIDTH * 0.5,
        WORLD_HEIGHT * 0.46,
        0,
        WORLD_WIDTH * 0.5,
        WORLD_HEIGHT * 0.46,
        WORLD_WIDTH * 0.72,
      );
      glow.addColorStop(0, planetGlow);
      glow.addColorStop(1, "rgba(4, 4, 8, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      drawBoundary(sceneLevel.planet, screenRef.current === "menu" ? 0.18 : 0.78);

      context.save();
      if (sceneLevel.planet === 0) {
        context.translate(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
        context.scale(TRAINING_SCENE_SCALE, TRAINING_SCENE_SCALE);
        context.translate(-WORLD_WIDTH / 2, -WORLD_HEIGHT / 2);
      }

      context.fillStyle = gridColor;
      for (let col = 0; col < GRID_COLS; col += 1) {
        for (let row = 0; row < GRID_ROWS; row += 1) {
          context.fillRect(col * CELL_SIZE + CELL_SIZE / 2, row * CELL_SIZE + CELL_SIZE / 2, 1, 1);
        }
      }

      drawGoal(sceneLevel.goal, sceneAlpha);
      sceneLevel.oneWayCells.forEach((cell) => drawOneWay(cell, sceneAlpha));
      sceneLevel.portals.forEach((cell, index) => drawPortal(cell, index, sceneAlpha));
      sceneLevel.switchCells.forEach((cell) =>
        drawSwitch(cell, sceneRunState.gateOpen, sceneAlpha),
      );
      sceneLevel.gateCells.forEach((cell) =>
        drawGate(cell, sceneRunState.gateOpen, sceneAlpha),
      );
      sceneLevel.fragileCells.forEach((cell, index) =>
        drawFragile(cell, (sceneRunState.brokenMask & (1 << index)) !== 0, sceneAlpha),
      );
      sceneLevel.rotatorCells.forEach((cell) => drawRotator(cell, sceneAlpha));
      sceneLevel.phaseSwitchCells.forEach((cell) =>
        drawPhaseSwitch(cell, sceneRunState.phase, sceneAlpha),
      );
      sceneLevel.phaseACells.forEach((cell) =>
        drawPhaseWall(cell, 0, sceneRunState.phase, sceneAlpha),
      );
      sceneLevel.phaseBCells.forEach((cell) =>
        drawPhaseWall(cell, 1, sceneRunState.phase, sceneAlpha),
      );
      sceneLevel.blockCells.forEach((block) => drawBlock(block, sceneLevel.planet, sceneAlpha));

      if (hintVisible && screenRef.current === "playing") {
        const checkpoint = solutionCheckpoint(sceneLevel);
        const hintTarget = cellCenter(checkpoint.cell);
        const pulse = 13 + Math.sin(performance.now() / 120) * 4;
        context.save();
        context.strokeStyle = PLANETS[sceneLevel.planet].secondary;
        context.lineWidth = 4;
        context.shadowColor = PLANETS[sceneLevel.planet].secondary;
        context.shadowBlur = 18;
        context.beginPath();
        context.arc(hintTarget.x, hintTarget.y, pulse, 0, Math.PI * 2);
        context.stroke();
        context.fillStyle = PLANETS[sceneLevel.planet].secondary;
        context.font = '900 10px "Courier New", monospace';
        context.textAlign = "center";
        context.fillText("MID", hintTarget.x, hintTarget.y - 21);
        context.restore();
      }

      if (screenRef.current !== "menu") {
        trailRef.current.forEach((trail) => drawAvatar(trail, Math.max(0, trail.life * 0.4)));
        drawAvatar(positionRef.current, isDead ? 0.3 : 1);
      }

      particlesRef.current.forEach((particle) => {
        context.save();
        context.globalAlpha = Math.min(1, particle.life * 1.4);
        context.fillStyle = particle.color;
        context.fillRect(particle.x, particle.y, 6, 6);
        context.restore();
      });
      context.restore();

      animationFrame = window.requestAnimationFrame(render);
    };

    animationFrame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [finishStage, hintVisible, isDead, killPlayer, playTone, selectedStage]);

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    touchStartRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || screenRef.current !== "playing") return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 22) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      commandMove(deltaX > 0 ? "right" : "left");
    } else {
      commandMove(deltaY > 0 ? "down" : "up");
    }
  };

  const saveAvatar = () => {
    const safePixels = draftPixels.some(Boolean) ? [...draftPixels] : [...AVATAR_PRESETS[0].pixels];
    setAvatarPixels(safePixels);
    window.localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(safePixels));
    setShowEditor(false);
  };

  const currentLevel = LEVELS[stageIndex];
  const selectedLevel = LEVELS[selectedStage];
  const currentChapterMeta = CHAPTERS[currentLevel.chapter];
  const selectedPlanetMeta = PLANETS[selectedPlanet];
  const currentPlanetMeta = PLANETS[currentLevel.planet];
  const continueLevel =
    lastPlayedStage === null ? null : LEVELS[lastPlayedStage];
  const currentHintCheckpoint = solutionCheckpoint(currentLevel);
  const visibleLevels = LEVELS.slice(
    selectedPlanet * MAPS_PER_PLANET,
    selectedPlanet * MAPS_PER_PLANET + MAPS_PER_PLANET,
  );
  const currentChapterLevels = LEVELS.slice(
    currentLevel.chapter * MAPS_PER_ZONE,
    currentLevel.chapter * MAPS_PER_ZONE + MAPS_PER_ZONE,
  );
  const isFinalStage = stageIndex === LEVELS.length - 1;
  const isPlanetFinalStage = currentLevel.localId === MAPS_PER_PLANET;
  const totalStars = stageBests.reduce<number>(
    (sum, best, index) => sum + starsFor(best, LEVELS[index].par),
    0,
  );
  const selectedPlanetStars = stageBests
    .slice(selectedPlanet * MAPS_PER_PLANET, (selectedPlanet + 1) * MAPS_PER_PLANET)
    .reduce<number>(
      (sum, best, index) =>
        sum +
        starsFor(best, LEVELS[selectedPlanet * MAPS_PER_PLANET + index].par),
      0,
    );
  const selectedPlanetOpenCount = planetUnlocks[selectedPlanet] ?? 1;
  const isStageUnlocked = (index: number) => {
    const planetIndex = Math.floor(index / MAPS_PER_PLANET);
    const localIndex = index % MAPS_PER_PLANET;
    return localIndex < (planetUnlocks[planetIndex] ?? 1);
  };

  const choosePlanet = (planetIndex: number) => {
    const firstStage = planetIndex * MAPS_PER_PLANET;
    const openCount = planetUnlocks[planetIndex] ?? 1;
    const nextStage = firstStage + Math.max(0, openCount - 1);
    setSelectedPlanet(planetIndex);
    setSelectedStage(nextStage);
  };

  const revealHint = () => {
    setHintVisible(true);
    playTone(660, 0.08, "sine");
    window.setTimeout(() => playTone(880, 0.1, "sine"), 70);
  };

  return (
    <main
      className={
        "site-shell planet-" +
        (screen === "menu" ? selectedPlanet + 1 : currentLevel.planet + 1)
      }
    >
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <button className="wordmark" type="button" onClick={returnToMenu}>
          <span className="wordmark-dot" aria-hidden="true" />
          직진 게임
        </button>
        <div className="topbar-actions">
          <span className="build-label">EARTH TRAINING + 3 PLANETS · 120 MAPS · ★ {totalStars}/360</span>
          <button
            className="icon-button"
            type="button"
            aria-label={soundOn ? "소리 끄기" : "소리 켜기"}
            aria-pressed={soundOn}
            onClick={() => setSoundOn((value) => !value)}
          >
            {soundOn ? "♪" : "×"}
          </button>
          <button className="text-button" type="button" onClick={() => setShowHelp(true)}>
            게임 방법
          </button>
        </div>
      </header>

      <section className="game-wrap" aria-label="직진 게임">
        {screen !== "menu" && (
          <div className="play-status-bar">
            <div className="game-hud" aria-live="polite">
              <div>
                <span className="hud-label">MAP</span>
                <strong>{String(currentLevel.localId).padStart(2, "0")}</strong>
              </div>
              <div className="hud-divider" />
              <div>
                <span className="hud-label">MOVE</span>
                <strong>{String(moves).padStart(2, "0")}</strong>
              </div>
              <div className="hud-divider" />
              <div>
                <span className="hud-label">PAR</span>
                <strong>{currentLevel.par}</strong>
              </div>
              <div className="hud-divider hud-death-divider" />
              <div className="death-count">
                <span className="hud-label">RETRY</span>
                <strong>{deaths}</strong>
              </div>
              {currentLevel.mechanics.includes("switch") && (
                <>
                  <div className="hud-divider hud-gate-divider" />
                  <div className={`gate-state ${runState.gateOpen ? "is-open" : ""}`}>
                    <span className="hud-label">GATE</span>
                    <strong>{runState.gateOpen ? "ON" : "OFF"}</strong>
                  </div>
                </>
              )}
              {currentLevel.mechanics.includes("phase") && (
                <>
                  <div className="hud-divider hud-phase-divider" />
                  <div className={"phase-state phase-" + runState.phase}>
                    <span className="hud-label">PHASE</span>
                    <strong>{runState.phase === 0 ? "A" : "B"}</strong>
                  </div>
                </>
              )}
            </div>

            <div className="chapter-status" aria-label={currentChapterMeta.name + " 진행 중"}>
              <strong>{currentPlanetMeta.code} · {currentChapterMeta.code}</strong>
              <div className="stage-progress">
                {currentChapterLevels.map((level) => (
                  <span
                    key={level.id}
                    className={level.id <= stageIndex + 1 ? "is-active" : ""}
                  />
                ))}
              </div>
            </div>

            <div className="game-tools">
              {deaths >= 3 && (
                <button
                  className={"hint-tool " + (hintVisible ? "is-active" : "")}
                  type="button"
                  onClick={revealHint}
                  aria-label="최적 경로 중간 지점 힌트 보기"
                  title="최적 경로 중간 지점"
                >
                  ?
                </button>
              )}
              <button
                type="button"
                disabled={!canUndo}
                onClick={undoMove}
                aria-label="한 수 되돌리기"
                title="한 수 되돌리기 (U 또는 Ctrl+Z)"
              >
                ↶
              </button>
              <button type="button" onClick={() => startStage(stageIndexRef.current)} aria-label="현재 단계 다시 시작">
                ↻
              </button>
              <SpeedControl
                speed={moveSpeed}
                onChange={(nextSpeed) => {
                  moveSpeedRef.current = nextSpeed;
                  setMoveSpeed(nextSpeed);
                }}
              />
              <button type="button" onClick={returnToMenu} aria-label="메뉴로 돌아가기">
                ×
              </button>
            </div>
          </div>
        )}

        <div
          ref={gamePanelRef}
          className={`game-panel screen-${screen} ${bump ? "is-bumping" : ""}`}
          tabIndex={-1}
        >
          <canvas
            ref={canvasRef}
            className="game-canvas"
            width={WORLD_WIDTH}
            height={WORLD_HEIGHT}
            aria-label={`${screen === "menu" ? selectedLevel.name : currentLevel.name} 스테이지의 직선 퍼즐 보드`}
            role="img"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          />

          {screen === "menu" && (
            <div className="menu-layer screen-layer">
              <div className="menu-layout">
                <div className="menu-intro">
                  <p className="game-kicker">SLIDE · STOP · SURVIVE</p>
                  <h1>직진 게임</h1>
                  <p className="menu-copy">
                    지구 연구실에서 조종 훈련을 마친 뒤 세 행성을 탐사하세요.
                    쉬움 30개와 보통 90개, 총 120개 맵이 이어집니다.
                  </p>
                  <div className="menu-actions">
                    <button
                      className="primary-button"
                      type="button"
                      aria-label="맵 선택: 쉬움 지구 궤도 연구실, 보통 아르코·기어라·프리즘"
                      onClick={() => setMapSelectOpen(true)}
                    >
                      <span>맵 선택</span>
                      <span aria-hidden="true">→</span>
                    </button>
                    <div className="continue-action">
                      <button
                        className="secondary-button"
                        type="button"
                        disabled={continueLevel === null}
                        onClick={() => {
                          if (lastPlayedStage !== null) startStage(lastPlayedStage);
                        }}
                      >
                        이어하기
                      </button>
                      <small>
                        {continueLevel
                          ? `${PLANETS[continueLevel.planet].shortName} ${continueLevel.localId}번 맵`
                          : "아직 플레이 기록 없음"}
                      </small>
                    </div>
                    <button className="secondary-button" type="button" onClick={() => setShowHelp(true)}>
                      게임 정보
                    </button>
                  </div>
                  <button
                    className="wormhole-entry"
                    type="button"
                    onClick={() => setWormholeOpen(true)}
                  >
                    <span className="mini-wormhole" aria-hidden="true" />
                    <span>
                      <small>TEST LAB · BETA</small>
                      <strong>웜홀 : 미지의 구역</strong>
                    </span>
                    <em>진입 →</em>
                  </button>
                  <div className="menu-meta" aria-label="선택한 스테이지 정보">
                    <span>{selectedPlanetMeta.code} · MAP {String(selectedLevel.localId).padStart(2, "0")}</span>
                    <span className="meta-line" />
                    <span>PAR {selectedLevel.par}</span>
                    <span className="meta-line" />
                    <span>★ {selectedPlanetStars}/90 · {selectedLevel.name}</span>
                  </div>
                </div>

                <aside className="avatar-card">
                  <span className="avatar-card-label">MY PIXEL</span>
                  <div className="avatar-display">
                    <PixelAvatar pixels={avatarPixels} className="menu-avatar" />
                    <span className="ratio-badge">BLOCK 1 : PLAYER {PLAYER_RATIO}</span>
                  </div>
                  <strong>내 캐릭터</strong>
                  <p>예시를 고르거나 픽셀을 직접 찍어 만들 수 있어요.</p>
                  <button
                    className="avatar-edit-button"
                    type="button"
                    onClick={() => {
                      setDraftPixels([...avatarPixels]);
                      setShowEditor(true);
                    }}
                  >
                    픽셀 캐릭터 만들기
                  </button>
                </aside>
              </div>

              {mapSelectOpen && (
                <div className="map-select-modal" role="dialog" aria-modal="true" aria-label="행성과 맵 선택">
                  <div className="map-select-header">
                    <div>
                      <span>PLANET &amp; MAP SELECT</span>
                      <strong>행성을 고른 뒤 번호를 선택하세요</strong>
                    </div>
                    <button type="button" onClick={() => setMapSelectOpen(false)} aria-label="맵 선택 닫기">×</button>
                  </div>
                  <div className="planet-keypad-tabs" role="tablist" aria-label="행성 선택">
                    {PLANETS.map((planet, planetIndex) => {
                      const firstStage = planetIndex * MAPS_PER_PLANET;
                      const planetStars = stageBests
                        .slice(firstStage, firstStage + MAPS_PER_PLANET)
                        .reduce<number>(
                          (sum, best, mapIndex) =>
                            sum + starsFor(best, LEVELS[firstStage + mapIndex].par),
                          0,
                        );
                      return (
                        <button
                          key={planet.id}
                          type="button"
                          role="tab"
                          aria-selected={selectedPlanet === planetIndex}
                          className={`planet-key planet-key-${planetIndex + 1} ${selectedPlanet === planetIndex ? "is-selected" : ""}`}
                          onClick={() => choosePlanet(planetIndex)}
                        >
                          <span className="planet-image" aria-hidden="true" />
                          <small>{planet.location === "훈련 시설" ? "쉬움" : "보통"}</small>
                          <strong>{planet.name}</strong>
                          <em>★ {planetStars}/90</em>
                        </button>
                      );
                    })}
                  </div>
                  <div className="map-keypad-heading">
                    <div>
                      <strong>{selectedPlanetMeta.name}</strong>
                      <span>{selectedPlanetMeta.difficulty} · {selectedPlanetOpenCount}/30 OPEN</span>
                    </div>
                    <span>숫자를 누르면 바로 시작합니다</span>
                  </div>
                  <div className="stage-keypad" aria-label={`${selectedPlanetMeta.shortName} 30단계`}>
                    {visibleLevels.map((level) => {
                      const index = level.id - 1;
                      const isUnlocked = isStageUnlocked(index);
                      const stars = starsFor(stageBests[index], level.par);
                      return (
                        <button
                          key={level.id}
                          type="button"
                          disabled={!isUnlocked}
                          aria-label={
                            isUnlocked
                              ? `${level.localId}번 ${level.name}, PAR ${level.par}, 별 ${stars}개`
                              : `${level.localId}번 맵 잠김`
                          }
                          onClick={() => {
                            setSelectedStage(index);
                            setMapSelectOpen(false);
                            startStage(index);
                          }}
                        >
                          <strong>{String(level.localId).padStart(2, "0")}</strong>
                          <span>{"★".repeat(stars)}{"☆".repeat(3 - stars)}</span>
                          <small>{isUnlocked ? `PAR ${level.par}` : "LOCK"}</small>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {wormholeOpen && (
            <WormholeMode
              avatarPixels={avatarPixels}
              onClose={() => setWormholeOpen(false)}
            />
          )}

          {isDead && (
            <div className="death-layer" role="status" aria-live="assertive">
              <span className="death-icon">×</span>
              <strong>경계 충돌!</strong>
              <small>현재 스테이지를 다시 시작합니다</small>
            </div>
          )}

          {screen === "won" && (
            <div className="win-layer screen-layer" role="dialog" aria-modal="true">
              <div className="win-card">
                <span className="win-badge">
                  {isFinalStage
                    ? "ALL 120 MAPS CLEAR"
                    : isPlanetFinalStage
                      ? currentLevel.planet === 0
                        ? "EARTH TRAINING COMPLETE"
                        : currentPlanetMeta.code + " PLANET COMPLETE"
                      : currentLevel.localId % MAPS_PER_ZONE === 0
                      ? "ZONE COMPLETE"
                      : "MAP CLEAR"}
                </span>
                <h2>{isFinalStage ? "완주!" : "클리어!"}</h2>
                <p className="cleared-stage-name">
                  {currentPlanetMeta.name} · MAP {String(currentLevel.localId).padStart(2, "0")} · {currentLevel.name}
                </p>
                <div className="win-stars" aria-label={starsFor(moves, currentLevel.par) + "개 별"}>
                  {Array.from({ length: 3 }, (_, star) => (
                    <span key={star} className={star < starsFor(moves, currentLevel.par) ? "is-on" : ""}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="win-score">
                  <strong>{moves}</strong>
                  <span>번 만에 도착 · PAR {currentLevel.par}</span>
                </p>
                <p className="win-message">
                  {newBest
                    ? "새로운 최고 기록이에요!"
                    : moves <= currentLevel.par
                      ? "검증된 최단 경로로 통과했어요."
                      : "다음에는 더 짧은 길도 찾아보세요."}
                </p>
                <div className="win-actions">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={startNextStage}
                  >
                    {isFinalStage ? "1단계부터" : "다음 스테이지"}
                  </button>
                  <button className="secondary-button" type="button" onClick={returnToMenu}>
                    맵 선택
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`play-footer ${screen === "menu" ? "is-menu" : screen === "won" ? "is-won" : ""}`}>
          <p className="keyboard-hint">
            <span className="key">↑</span>
            <span className="key">↓</span>
            <span className="key">←</span>
            <span className="key">→</span>
            <span>또는 WASD로 이동</span>
          </p>

          {screen === "playing" && hintVisible && (
            <p className="footer-hint" role="status">
              <span>MID CHECKPOINT</span>
              <strong>
                최적 경로 {currentHintCheckpoint.targetMove}/{currentLevel.par}수 지점
              </strong>
              <small>빛나는 위치를 중간 목표로 삼으세요</small>
            </p>
          )}

          {screen === "playing" && (
            <div className="d-pad" aria-label="방향 조작 버튼">
              <button type="button" aria-label="위로 이동" onClick={() => commandMove("up")}>↑</button>
              <button type="button" aria-label="왼쪽으로 이동" onClick={() => commandMove("left")}>←</button>
              <span aria-hidden="true" />
              <button type="button" aria-label="오른쪽으로 이동" onClick={() => commandMove("right")}>→</button>
              <button type="button" aria-label="아래로 이동" onClick={() => commandMove("down")}>↓</button>
            </div>
          )}

          <p className="swipe-hint">모바일에서는 게임 화면을 밀어 방향을 정하세요.</p>
        </div>
      </section>

      <footer className="site-footer">
        <span>EARTH LAB + 3 PLANETS · 0.95 PLAYER · 120 VERIFIED MAPS</span>
        <span>쉬움 30개 · 보통 90개 · 맵마다 별 3개</span>
      </footer>

      {showHelp && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowHelp(false)}>
          <section
            className="help-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" aria-label="닫기" onClick={() => setShowHelp(false)}>
              ×
            </button>
            <span className="modal-index">HOW TO PLAY</span>
            <h2 id="help-title">벽에서는 멈추고, 경계에서는 죽습니다</h2>
            <div className="rule-list">
              <article>
                <span>01</span>
                <div>
                  <h3>한 번 정하면 끝까지 직진</h3>
                  <p>방향키·WASD를 누르거나 화면을 상하좌우로 밀어 방향을 정하세요.</p>
                </div>
              </article>
              <article>
                <span>02</span>
                <div>
                  <h3>행성 블록으로 멈추세요</h3>
                  <p>캐릭터는 블록의 95% 크기로 격자 중심에 정렬되어 한 칸 통로를 정확히 통과합니다.</p>
                </div>
              </article>
              <article>
                <span>03</span>
                <div>
                  <h3>분홍 경계를 피하세요</h3>
                  <p>바깥 테두리에 닿으면 사망하며 현재 스테이지의 시작점으로 돌아갑니다.</p>
                </div>
              </article>
              <article>
                <span>04</span>
                <div>
                  <h3>지구에서 기믹을 연습하고 행성을 골라 탐사하세요</h3>
                  <p>연구실 30개 맵에서 일방통행·워프·게이트·회전·위상을 익힐 수 있고, 보통 난이도의 세 행성은 1번 맵부터 자유롭게 시작할 수 있습니다.</p>
                </div>
              </article>
              <article>
                <span>05</span>
                <div>
                  <h3>기록을 줄여 별 3개를 모으세요</h3>
                  <p>최단 이동은 별 3개, 최단보다 10회 이내는 별 2개, 그보다 많으면 별 1개를 받습니다.</p>
                </div>
              </article>
              <article>
                <span>06</span>
                <div>
                  <h3>되돌리거나 중간 지점을 확인하세요</h3>
                  <p>↶ 버튼·U·Ctrl+Z로 한 수를 되돌릴 수 있습니다. 같은 맵에서 경계에 3번 부딪히면 ? 버튼이 최적 경로의 절반 지점을 표시합니다.</p>
                </div>
              </article>
              <article>
                <span>07</span>
                <div>
                  <h3>공식 120맵과 웜홀 실험 60맵</h3>
                  <p>공식 맵은 최단 경로와 필수 기믹을 자동 검증합니다. 웜홀에서는 휘어진 원형 맵 30개와 여섯 방향으로 움직이는 육각형 맵 30개를 별도로 플레이할 수 있습니다.</p>
                </div>
              </article>
            </div>
            <button
              className="primary-button modal-start"
              type="button"
              onClick={() => {
                setShowHelp(false);
                startStage(selectedStage);
              }}
            >
              선택한 스테이지 시작
            </button>
          </section>
        </div>
      )}

      {showEditor && (
        <AvatarEditor
          pixels={draftPixels}
          setPixels={setDraftPixels}
          onClose={() => setShowEditor(false)}
          onSave={saveAvatar}
        />
      )}
    </main>
  );
}
