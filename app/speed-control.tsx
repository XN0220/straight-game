"use client";

export type MoveSpeed = 1 | 1.5 | 2;

export function nextMoveSpeed(speed: MoveSpeed): MoveSpeed {
  if (speed === 1) return 1.5;
  if (speed === 1.5) return 2;
  return 1;
}

export function SpeedControl({
  speed,
  onChange,
}: {
  speed: MoveSpeed;
  onChange: (speed: MoveSpeed) => void;
}) {
  const active = speed !== 1;
  const label = speed === 2 ? "X2" : "X1.5";

  return (
    <button
      className={`speed-control ${active ? "is-active" : ""}`}
      type="button"
      aria-label={`이동 배속 ${speed}배. 누르면 다음 배속으로 변경`}
      aria-pressed={active}
      title={`이동 속도 ${speed}배`}
      onClick={() => onChange(nextMoveSpeed(speed))}
    >
      <span className="speed-control-label">{label}</span>
      <span className="speed-control-icon" aria-hidden="true">
        <i />
        <i />
      </span>
    </button>
  );
}
