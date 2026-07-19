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
  PLAYER_RATIO,
  PLAYER_SIZE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  boundaryTarget,
  cellCenter,
  slide,
  type Cell,
  type Direction,
  type Point,
  type RunState,
} from "./game-engine";

type Screen = "menu" | "playing" | "won";
type Pixel = string | null;
type ActiveMove = {
  target: Point;
  outcome: "stop" | "goal" | "death" | "portal" | "switch" | "break";
  destination?: Cell;
  nextState: RunState;
};

const AVATAR_GRID = 10;
const AVATAR_STORAGE_KEY = "straight-line-avatar-v2";
const UNLOCK_STORAGE_KEY = "straight-line-unlocked-v3";
const BEST_STORAGE_KEY = "straight-line-bests-v3";
const LEGACY_UNLOCK_STORAGE_KEY = "straight-line-unlocked-v2";
const LEGACY_BEST_STORAGE_KEY = "straight-line-bests-v2";
const MOVE_SPEED = 680;

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
  const avatarRef = useRef<Pixel[]>([...AVATAR_PRESETS[0].pixels]);
  const particlesRef = useRef<
    Array<Point & { vx: number; vy: number; life: number; color: string }>
  >([]);

  const [screen, setScreen] = useState<Screen>("menu");
  const [stageIndex, setStageIndex] = useState(0);
  const [selectedStage, setSelectedStage] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [moves, setMoves] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [runState, setRunState] = useState<RunState>({ ...INITIAL_RUN_STATE });
  const [unlocked, setUnlocked] = useState(1);
  const [stageBests, setStageBests] = useState<Array<number | null>>(
    Array(LEVELS.length).fill(null),
  );
  const [showHelp, setShowHelp] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [bump, setBump] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [newBest, setNewBest] = useState(false);
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

      const currentUnlocked = window.localStorage.getItem(UNLOCK_STORAGE_KEY);
      const legacyUnlocked = Number(
        window.localStorage.getItem(LEGACY_UNLOCK_STORAGE_KEY) ?? "1",
      );
      const legacyBests = JSON.parse(
        window.localStorage.getItem(LEGACY_BEST_STORAGE_KEY) ?? "null",
      );
      let unlockedValue = Number(currentUnlocked ?? legacyUnlocked ?? 1) || 1;
      if (
        currentUnlocked === null &&
        legacyUnlocked >= 5 &&
        Array.isArray(legacyBests) &&
        typeof legacyBests[4] === "number"
      ) {
        unlockedValue = 6;
      }
      const safeUnlocked = Math.max(1, Math.min(LEVELS.length, unlockedValue));
      setUnlocked(safeUnlocked);
      setSelectedStage(safeUnlocked - 1);
      setSelectedChapter(Math.floor((safeUnlocked - 1) / 5));
      window.localStorage.setItem(UNLOCK_STORAGE_KEY, String(safeUnlocked));

      const storedBests = JSON.parse(window.localStorage.getItem(BEST_STORAGE_KEY) ?? "null");
      if (Array.isArray(storedBests) && storedBests.length === LEVELS.length) {
        setStageBests(storedBests.map((best) => (typeof best === "number" ? best : null)));
      } else if (Array.isArray(legacyBests)) {
        const migratedBests = Array<number | null>(LEVELS.length).fill(null);
        legacyBests.slice(0, 5).forEach((best, index) => {
          if (typeof best === "number") migratedBests[index] = best;
        });
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
      trailRef.current = [];
      particlesRef.current = [];
      movesRef.current = 0;
      setStageIndex(safeIndex);
      setSelectedStage(safeIndex);
      setSelectedChapter(Math.floor(safeIndex / 5));
      setMoves(0);
      setDeaths(0);
      setRunState({ ...INITIAL_RUN_STATE });
      setIsDead(false);
      setNewBest(false);
      setBump(false);
      setGameScreen("playing");
      window.setTimeout(() => gamePanelRef.current?.focus(), 0);
    },
    [setGameScreen],
  );

  const restartAfterDeath = useCallback(() => {
    const level = levelRef.current;
    runStateRef.current = { ...INITIAL_RUN_STATE };
    cellRef.current = { ...level.start };
    positionRef.current = cellCenter(level.start);
    activeMoveRef.current = null;
    movingRef.current = false;
    dyingRef.current = false;
    trailRef.current = [];
    movesRef.current = 0;
    setMoves(0);
    setRunState({ ...INITIAL_RUN_STATE });
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

    if (index < LEVELS.length - 1) {
      setUnlocked((previous) => {
        const next = Math.max(previous, index + 2);
        window.localStorage.setItem(UNLOCK_STORAGE_KEY, String(next));
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

      const target =
        plan.outcome === "death"
          ? boundaryTarget(plan.edgeCell, plan.direction)
          : cellCenter(plan.outcome === "portal" ? plan.entry : plan.destination);

      activeMoveRef.current = {
        target,
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

      const direction = KEY_TO_DIRECTION[event.key];
      if (direction) {
        event.preventDefault();
        moveCommandRef.current(direction);
        return;
      }

      if (event.key === "r" || event.key === "R") {
        if (screenRef.current !== "menu") startStage(stageIndexRef.current);
      }
      if (event.key === "Escape") returnToMenu();
      if (event.key === "Enter") {
        if (screenRef.current === "menu") startStage(selectedStage);
        else if (screenRef.current === "won") {
          const next = stageIndexRef.current + 1;
          startStage(next < LEVELS.length ? next : 0);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [returnToMenu, selectedStage, showEditor, showHelp, startStage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const drawBlock = (cell: Cell, alpha = 1) => {
      const x = cell.col * CELL_SIZE;
      const y = cell.row * CELL_SIZE;
      const size = CELL_SIZE;
      context.save();
      context.globalAlpha = alpha;
      context.fillStyle = "rgba(0, 0, 0, 0.7)";
      context.fillRect(x + 3, y + 4, size - 2, size - 2);
      context.fillStyle = "#9f233b";
      context.fillRect(x, y, size, size);
      context.fillStyle = "#d83d58";
      context.fillRect(x + 2, y + 2, size - 4, size - 4);
      context.fillStyle = "#ffbdc8";
      context.fillRect(x + 1, y + 1, size - 2, 2);
      context.fillRect(x + 1, y + size - 3, size - 2, 2);
      for (let row = 9; row < size; row += 9) {
        context.fillRect(x + 1, y + row, size - 2, 2);
      }
      context.fillStyle = "#ff91a5";
      for (let row = 0; row < 4; row += 1) {
        const offset = row % 2 === 0 ? 9 : 18;
        context.fillRect(x + offset, y + row * 9 + 2, 2, 7);
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

    const drawBoundary = (alpha = 1) => {
      context.save();
      context.globalAlpha = alpha;
      context.strokeStyle = "#ff5d78";
      context.lineWidth = 4;
      context.shadowColor = "rgba(255, 93, 120, 0.55)";
      context.shadowBlur = 10;
      context.strokeRect(2, 2, WORLD_WIDTH - 4, WORLD_HEIGHT - 4);
      context.shadowBlur = 0;
      context.strokeStyle = "rgba(255, 160, 176, 0.5)";
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
        const deltaX = activeMove.target.x - positionRef.current.x;
        const deltaY = activeMove.target.y - positionRef.current.y;
        const distance = Math.hypot(deltaX, deltaY);
        const travel = MOVE_SPEED * rawDelta;

        if (distance <= travel || distance < 0.5) {
          const landedPosition =
            activeMove.outcome === "portal" && activeMove.destination
              ? cellCenter(activeMove.destination)
              : activeMove.target;
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
          if (activeMove.outcome === "break") {
            setBump(true);
            playTone(92, 0.11, "sawtooth");
            window.setTimeout(() => setBump(false), 150);
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

      context.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      context.fillStyle = "#050508";
      context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      const glow = context.createRadialGradient(
        WORLD_WIDTH * 0.5,
        WORLD_HEIGHT * 0.46,
        0,
        WORLD_WIDTH * 0.5,
        WORLD_HEIGHT * 0.46,
        WORLD_WIDTH * 0.72,
      );
      glow.addColorStop(0, "rgba(27, 46, 44, 0.32)");
      glow.addColorStop(1, "rgba(4, 4, 8, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      context.fillStyle = "rgba(148, 255, 223, 0.055)";
      for (let col = 0; col < GRID_COLS; col += 1) {
        for (let row = 0; row < GRID_ROWS; row += 1) {
          context.fillRect(col * CELL_SIZE + CELL_SIZE / 2, row * CELL_SIZE + CELL_SIZE / 2, 1, 1);
        }
      }

      const sceneLevel = screenRef.current === "menu" ? LEVELS[selectedStage] : levelRef.current;
      const sceneRunState =
        screenRef.current === "menu" ? INITIAL_RUN_STATE : runStateRef.current;
      const sceneAlpha = screenRef.current === "menu" ? 0.13 : 1;
      drawBoundary(screenRef.current === "menu" ? 0.18 : 0.78);
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
      sceneLevel.blockCells.forEach((block) => drawBlock(block, sceneAlpha));

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

      animationFrame = window.requestAnimationFrame(render);
    };

    animationFrame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [finishStage, isDead, killPlayer, playTone, selectedStage]);

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
  const selectedChapterMeta = CHAPTERS[selectedChapter];
  const currentChapterMeta = CHAPTERS[currentLevel.chapter];
  const visibleLevels = LEVELS.slice(selectedChapter * 5, selectedChapter * 5 + 5);
  const currentChapterLevels = LEVELS.slice(
    currentLevel.chapter * 5,
    currentLevel.chapter * 5 + 5,
  );
  const isFinalStage = stageIndex === LEVELS.length - 1;

  const chooseChapter = (chapterIndex: number) => {
    const firstStage = chapterIndex * 5;
    if (firstStage >= unlocked) return;
    const latestUnlocked = Math.min(firstStage + 4, unlocked - 1);
    setSelectedChapter(chapterIndex);
    setSelectedStage(Math.max(firstStage, latestUnlocked));
  };

  return (
    <main className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <button className="wordmark" type="button" onClick={returnToMenu}>
          <span className="wordmark-dot" aria-hidden="true" />
          STRAIGHT LINE
        </button>
        <div className="topbar-actions">
          <span className="build-label">30 STAGES · 6 ZONES</span>
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

      <section className="game-wrap" aria-label="직선 게임">
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
            aria-label={`${screen === "menu" ? selectedLevel.name : currentLevel.name} 스테이지의 격자 미로`}
            role="img"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          />

          {screen === "menu" && (
            <div className="menu-layer screen-layer">
              <div className="menu-layout">
                <div className="menu-intro">
                  <p className="game-kicker">SLIDE · STOP · SURVIVE</p>
                  <h1>직선 게임</h1>
                  <p className="menu-copy">
                    더 넓어진 30개 맵에서 벽을 이용해 멈추고, 위험한 경계와 단계별
                    기믹을 돌파하세요.
                  </p>
                  <div className="menu-actions">
                    <button className="primary-button" type="button" onClick={() => startStage(selectedStage)}>
                      <span>스테이지 시작</span>
                      <span aria-hidden="true">→</span>
                    </button>
                    <button className="secondary-button" type="button" onClick={() => setShowHelp(true)}>
                      게임 정보
                    </button>
                  </div>
                  <div className="menu-meta" aria-label="선택한 스테이지 정보">
                    <span>STAGE {String(selectedStage + 1).padStart(2, "0")}</span>
                    <span className="meta-line" />
                    <span>PAR {selectedLevel.par}</span>
                    <span className="meta-line" />
                    <span>{selectedChapterMeta.code} · {selectedLevel.name}</span>
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

              <div className="stage-selector" aria-label="스테이지 선택">
                <div className="stage-selector-heading">
                  <strong>CAMPAIGN SELECT</strong>
                  <span>{unlocked}/{LEVELS.length} OPEN</span>
                </div>
                <div className="chapter-tabs" role="tablist" aria-label="난이도 구역 선택">
                  {CHAPTERS.map((chapter, chapterIndex) => {
                    const isUnlocked = chapterIndex * 5 < unlocked;
                    return (
                      <button
                        key={chapter.id}
                        type="button"
                        role="tab"
                        disabled={!isUnlocked}
                        aria-selected={selectedChapter === chapterIndex}
                        className={selectedChapter === chapterIndex ? "is-selected" : ""}
                        onClick={() => chooseChapter(chapterIndex)}
                      >
                        <span>{String(chapter.id).padStart(2, "0")}</span>
                        <strong>{isUnlocked ? chapter.code : "LOCKED"}</strong>
                      </button>
                    );
                  })}
                </div>
                <div className="chapter-summary">
                  <div>
                    <span>ZONE {String(selectedChapterMeta.id).padStart(2, "0")}</span>
                    <strong>{selectedChapterMeta.name}</strong>
                  </div>
                  <p>{selectedChapterMeta.description}</p>
                  <div className="mechanic-tags" aria-label="이 구역의 규칙">
                    {selectedChapterMeta.mechanics.map((mechanic) => (
                      <span key={mechanic}>{mechanic}</span>
                    ))}
                  </div>
                </div>
                <div className="stage-list">
                  {visibleLevels.map((level) => {
                    const index = level.id - 1;
                    const isUnlocked = index < unlocked;
                    return (
                      <button
                        key={level.id}
                        type="button"
                        disabled={!isUnlocked}
                        className={selectedStage === index ? "is-selected" : ""}
                        aria-label={
                          isUnlocked
                            ? `${level.id}단계 ${level.name}, 기준 ${level.par}회`
                            : `${level.id}단계 잠김`
                        }
                        onClick={() => setSelectedStage(index)}
                      >
                        <span className="stage-number">{String(level.id).padStart(2, "0")}</span>
                        <span className="stage-name">{isUnlocked ? level.name : "LOCKED"}</span>
                        <span className="stage-best">
                          {isUnlocked
                            ? stageBests[index] === null
                              ? `PAR ${level.par}`
                              : `BEST ${stageBests[index]}`
                            : "×"}
                        </span>
                        <span className="difficulty-pips" aria-hidden="true">
                          {Array.from({ length: 5 }, (_, pip) => (
                            <i key={pip} className={pip <= index % 5 ? "is-on" : ""} />
                          ))}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {screen !== "menu" && (
            <>
              <div className="game-hud" aria-live="polite">
                <div>
                  <span className="hud-label">STAGE</span>
                  <strong>{String(stageIndex + 1).padStart(2, "0")}</strong>
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
              </div>

              <div className="chapter-status" aria-label={`${currentChapterMeta.name} 진행 중`}>
                <strong>{currentChapterMeta.code}</strong>
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
                <button type="button" onClick={() => startStage(stageIndexRef.current)} aria-label="현재 단계 다시 시작">
                  ↻
                </button>
                <button type="button" onClick={returnToMenu} aria-label="메뉴로 돌아가기">
                  ×
                </button>
              </div>
            </>
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
                    ? "ALL 30 STAGES CLEAR"
                    : (stageIndex + 1) % 5 === 0
                      ? "ZONE COMPLETE"
                      : "STAGE CLEAR"}
                </span>
                <h2>{isFinalStage ? "완주!" : "클리어!"}</h2>
                <p className="cleared-stage-name">
                  {String(stageIndex + 1).padStart(2, "0")} · {currentLevel.name}
                </p>
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
                    onClick={() => startStage(isFinalStage ? 0 : stageIndex + 1)}
                  >
                    {isFinalStage ? "1단계부터" : "다음 스테이지"}
                  </button>
                  <button className="secondary-button" type="button" onClick={returnToMenu}>
                    스테이지 선택
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`play-footer ${screen === "menu" ? "is-menu" : ""}`}>
          <p className="keyboard-hint">
            <span className="key">↑</span>
            <span className="key">↓</span>
            <span className="key">←</span>
            <span className="key">→</span>
            <span>또는 WASD로 이동</span>
          </p>

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
        <span>23×15 GRID · 0.95 PLAYER · 30 VERIFIED MAPS</span>
        <span>5단계마다 새로운 규칙이 추가됩니다</span>
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
                  <h3>벽돌로 멈추세요</h3>
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
                  <h3>새 타일의 색을 기억하세요</h3>
                  <p>파랑은 일방통행, 보라는 워프, 주황은 스위치와 문, 금이 간 분홍 블록은 한 번 부딪혀 부술 수 있습니다.</p>
                </div>
              </article>
              <article>
                <span>05</span>
                <div>
                  <h3>30단계를 차례로 완주하세요</h3>
                  <p>5단계마다 새 구역이 열립니다. 모든 맵은 최단 8~34회 경로와 필수 기믹 사용을 자동 검증했습니다.</p>
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
