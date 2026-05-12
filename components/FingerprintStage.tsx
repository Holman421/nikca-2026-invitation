"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { copy } from "@/lib/copy";

const RING_RADIUS = 120;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function FingerprintGraphic() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-fingerprint-pattern-icon lucide-fingerprint-pattern"
    >
      <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
      <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
      <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
      <path d="M2 12a10 10 0 0 1 18-6" />
      <path d="M2 16h.01" />
      <path d="M21.8 16c.2-2 .131-5.354 0-6" />
      <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
      <path d="M8.65 22c.21-.66.45-1.32.57-2" />
      <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
    </svg>
  );
}

interface FingerprintStageProps {
  isHolding: boolean;
  holdProgress: number;
  onBeginPress: () => void;
  onEndPress: () => void;
}

function FingerprintStage({
  isHolding,
  holdProgress,
  onBeginPress,
  onEndPress,
}: FingerprintStageProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const scannerShellRef = useRef<HTMLDivElement | null>(null);
  const scannerMoverRef = useRef<HTMLDivElement | null>(null);
  const scannerTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    setIsTouchDevice(navigator.maxTouchPoints > 0);
  }, []);

  useGSAP(() => {
    if (!scannerMoverRef.current || !scannerShellRef.current) return;

    const shellHeight = scannerShellRef.current.offsetHeight;
    scannerTweenRef.current = gsap.fromTo(
      scannerMoverRef.current,
      { y: 0 },
      {
        y: shellHeight,
        duration: 1.8,
        ease: "none",
        repeat: -1,
        yoyo: true,
      },
    );

    return () => {
      scannerTweenRef.current?.kill();
      scannerTweenRef.current = null;
    };
  }, []);

  useGSAP(() => {
    if (!scannerTweenRef.current) return;
    scannerTweenRef.current.timeScale(isHolding ? 1.71 : 1);
  }, [isHolding]);

  const ringDashOffset = RING_CIRCUMFERENCE * (1 - holdProgress);

  return (
    <section
      className="flex w-full flex-col items-center gap-8 text-center py-12 rounded-xl px-4"
      style={{ backgroundColor: "rgb(var(--surface-panel-rgb) / 0.86)" }}
    >
      <p
        className="text-lg tracking-[0.32em]"
        style={{ color: "rgb(var(--brass-rgb))" }}
      >
        {copy.intro.database}
      </p>
      <h1 className="text-2xl tracking-[0.12em] sm:text-3xl">
        {copy.intro.title}
      </h1>

      <button
        className="group relative size-26 select-none rounded-full border p-5 outline-none cursor-pointer overflow-hidden"
        style={{
          borderColor: "rgb(var(--brass-rgb) / 0.45)",
          backgroundColor: "rgb(var(--surface-scanner-rgb) / 0.8)",
        }}
        onPointerDown={onBeginPress}
        onPointerUp={onEndPress}
        onPointerLeave={onEndPress}
        onPointerCancel={onEndPress}
        aria-label="Long press to scan fingerprint"
      >
        <div
          className={`pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-150 ${
            isHolding ? "opacity-100" : "opacity-0"
          }`}
        >
          <svg
            className="h-full w-full -rotate-90"
            viewBox="0 0 240 240"
            aria-hidden="true"
          >
            <circle
              cx="120"
              cy="120"
              r={RING_RADIUS}
              fill="none"
              stroke="rgb(var(--brass-rgb) / 0.22)"
              strokeWidth="8"
            />
            <circle
              cx="120"
              cy="120"
              r={RING_RADIUS}
              fill="none"
              stroke={
                isHolding
                  ? "rgb(var(--signal-ready-rgb))"
                  : "rgb(var(--uv-rgb))"
              }
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringDashOffset}
            />
          </svg>
        </div>

        <div
          ref={scannerShellRef}
          className="pointer-events-none absolute inset-0"
        >
          <div
            ref={scannerMoverRef}
            className="absolute inset-x-0 top-0 will-change-transform"
          >
            <div
              className="absolute inset-x-0 top-0 h-0.5 -translate-y-1/2 transition-colors duration-150"
              style={{
                backgroundColor: isHolding
                  ? "rgb(var(--signal-ready-rgb))"
                  : "rgb(var(--uv-rgb))",
              }}
            />
            <div
              className="absolute inset-x-0 top-0 h-5 -translate-y-1/2 blur-md transition-colors duration-150"
              style={{
                backgroundColor: isHolding
                  ? "rgb(var(--signal-ready-rgb) / 0.7)"
                  : "rgb(var(--uv-rgb) / 0.7)",
              }}
            />
          </div>
        </div>

        <div className="relative flex h-full w-full items-center justify-center opacity-95 transition-opacity group-hover:opacity-100">
          <FingerprintGraphic />
        </div>
      </button>

      <p className="text-sm" style={{ color: "rgb(var(--parchment-dim-rgb))" }}>
        {isHolding
          ? copy.intro.holdingMessage
          : isTouchDevice
            ? copy.intro.defaultMessageMobile
            : copy.intro.defaultMessageDesktop}
      </p>
    </section>
  );
}

export default FingerprintStage;
