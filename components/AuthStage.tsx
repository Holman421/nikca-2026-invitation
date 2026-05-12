"use client";

import Image from "next/image";
import { useEffect, useRef, useState, forwardRef } from "react";
import { createPortal } from "react-dom";
import { copy } from "@/lib/copy";

type AuthHighlightTone = "blue" | "red" | "green";

interface AuthStageProps {
  dayIndex: number;
  monthIndex: number;
  yearIndex: number;
  authHighlightTone: AuthHighlightTone;
  onSpinCipher: (column: "day" | "month" | "year", direction: number) => void;
  onDecryptDate: () => void;
  onBackClick: () => void;
}

const WHEEL_ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 3;
const WRAP_BUFFER_ITEMS = 2;

type ScrollHint = {
  id: number;
  caseImageSrc: string;
  caseImageAlt: string;
};

type ScrollPlacement = {
  rotate: number;
  row: "top" | "bottom";
  indexInRow: number;
};

type PositionedScrollHint = {
  id: number;
  caseImageSrc: string;
  caseImageAlt: string;
  rotate: number;
  row: "top" | "bottom";
  indexInRow: number;
};

const SCROLL_HINTS: ScrollHint[] = [
  { id: 2, caseImageSrc: "/case-2.jpg", caseImageAlt: "Case 2 scroll detail" },
  { id: 3, caseImageSrc: "/case-3.jpg", caseImageAlt: "Case 3 scroll detail" },
  { id: 1, caseImageSrc: "/case-1.jpg", caseImageAlt: "Case 1 scroll detail" },
  { id: 4, caseImageSrc: "/case-4.jpg", caseImageAlt: "Case 4 scroll detail" },
  { id: 5, caseImageSrc: "/case-5.jpg", caseImageAlt: "Case 5 scroll detail" },
  { id: 6, caseImageSrc: "/case-6.jpg", caseImageAlt: "Case 6 scroll detail" },
];

const SCROLL_PLACEMENT_SLOTS: ScrollPlacement[] = [
  { row: "top", indexInRow: 0, rotate: -14 },
  { row: "top", indexInRow: 1, rotate: 8 },
  { row: "top", indexInRow: 2, rotate: 14 },
  { row: "bottom", indexInRow: 0, rotate: -10 },
  { row: "bottom", indexInRow: 1, rotate: 6 },
  { row: "bottom", indexInRow: 2, rotate: 11 },
];

function RotatingWheel({
  values,
  currentIndex,
  highlightTone,
  isYearWheel,
  onSpinUp,
  onSpinDown,
  label,
}: {
  values: number[];
  currentIndex: number;
  highlightTone: AuthHighlightTone;
  isYearWheel?: boolean;
  onSpinUp: () => void;
  onSpinDown: () => void;
  label: string;
}) {
  const lastWheelSpinRef = useRef(0);
  const mobileWheelRef = useRef<HTMLDivElement | null>(null);
  const desktopWheelRef = useRef<HTMLDivElement | null>(null);
  const mobileItemSize = isYearWheel ? 72 : WHEEL_ITEM_HEIGHT;
  const mobileViewportWidth = mobileItemSize * VISIBLE_ITEMS;
  const desktopHighlightSize = isYearWheel ? 72 : WHEEL_ITEM_HEIGHT;
  const displayValues = [...values].reverse();
  const selectedDisplayIndex = values.length - 1 - currentIndex;
  const selectedIndex = selectedDisplayIndex + WRAP_BUFFER_ITEMS;
  const translateY = -(selectedIndex - 1) * WHEEL_ITEM_HEIGHT;
  const currentValue = values[currentIndex] ?? values[0];

  function spinByDelta(delta: number) {
    const now = Date.now();
    if (now - lastWheelSpinRef.current < 130) {
      return;
    }
    lastWheelSpinRef.current = now;

    if (delta > 0) {
      onSpinDown();
    } else if (delta < 0) {
      onSpinUp();
    }
  }

  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      spinByDelta(dominantDelta);
    }

    const mobileElement = mobileWheelRef.current;
    const desktopElement = desktopWheelRef.current;

    mobileElement?.addEventListener("wheel", handleWheel, { passive: false });
    desktopElement?.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      mobileElement?.removeEventListener("wheel", handleWheel);
      desktopElement?.removeEventListener("wheel", handleWheel);
    };
  }, [onSpinDown, onSpinUp]);

  const extendedValues = [
    ...displayValues.slice(-WRAP_BUFFER_ITEMS),
    ...displayValues,
    ...displayValues.slice(0, WRAP_BUFFER_ITEMS),
  ];

  const highlightRgbByTone: Record<AuthHighlightTone, string> = {
    blue: "var(--uv-rgb)",
    red: "255 88 88",
    green: "79 170 120",
  };
  const activeHighlightRgb = highlightRgbByTone[highlightTone];

  return (
    <div
      className="flex flex-col items-center rounded-lg border p-4"
      style={{
        borderColor: "rgb(var(--brass-rgb) / 0.32)",
        backgroundColor: "rgb(var(--surface-shell-rgb) / 0.9)",
      }}
    >
      <p className="mb-3 text-xs tracking-[0.28em]" style={{ color: "rgb(var(--brass-rgb))" }}>
        {label}
      </p>

      <button
        type="button"
        className="mb-3 hidden cursor-pointer rounded border px-3 py-1 text-sm transition hover:bg-[rgb(var(--brass-rgb)/0.1)] sm:block"
        style={{ borderColor: "rgb(var(--brass-rgb) / 0.45)" }}
        onClick={onSpinUp}
      >
        ▲
      </button>

      <div className="flex w-full items-center justify-center gap-2 sm:hidden">
        <button
          type="button"
          className="cursor-pointer rounded border px-3 py-2 text-sm transition hover:bg-[rgb(var(--brass-rgb)/0.1)]"
          style={{ borderColor: "rgb(var(--brass-rgb) / 0.45)" }}
          onClick={onSpinDown}
          aria-label={`Previous ${label}`}
        >
          ◀
        </button>

        <div
          ref={mobileWheelRef}
          className="relative overflow-hidden rounded-md border"
          style={{
            width: mobileViewportWidth,
            borderColor: "rgb(var(--brass-rgb) / 0.26)",
            backgroundColor: "rgb(var(--surface-wheel-rgb))",
            height: WHEEL_ITEM_HEIGHT,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 z-10 border"
            style={{
              borderColor: `rgb(${activeHighlightRgb} / 0.42)`,
              backgroundColor: `rgb(${activeHighlightRgb} / 0.1)`,
              transition: "border-color 0.35s ease, background-color 0.35s ease",
            }}
          />

          <div className="relative flex h-full items-center justify-center px-3">
            <div
              className="text-center text-2xl font-bold tabular-nums"
              style={{ color: `rgb(${activeHighlightRgb})` }}
            >
              {String(currentValue).padStart(2, "0")}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(var(--surface-shell-rgb)) 0%, transparent 30%, transparent 70%, rgb(var(--surface-shell-rgb)) 100%)",
            }}
          />
        </div>

        <button
          type="button"
          className="cursor-pointer rounded border px-3 py-2 text-sm transition hover:bg-[rgb(var(--brass-rgb)/0.1)]"
          style={{ borderColor: "rgb(var(--brass-rgb) / 0.45)" }}
          onClick={onSpinUp}
          aria-label={`Next ${label}`}
        >
          ▶
        </button>
      </div>

      <div
        ref={desktopWheelRef}
        className="relative hidden w-full overflow-hidden rounded-md border sm:block"
        style={{
          borderColor: "rgb(var(--brass-rgb) / 0.26)",
          backgroundColor: "rgb(var(--surface-wheel-rgb))",
          perspective: "1200px",
          height: WHEEL_ITEM_HEIGHT * VISIBLE_ITEMS,
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 z-10 border-y"
          style={{
            borderColor: `rgb(${activeHighlightRgb} / 0.42)`,
            backgroundColor: `rgb(${activeHighlightRgb} / 0.1)`,
            top: `calc(50% - ${desktopHighlightSize / 2}px)`,
            height: desktopHighlightSize,
            transition: "border-color 0.35s ease, background-color 0.35s ease",
          }}
        />

        <div
          className="relative w-full"
          style={{
            transformStyle: "preserve-3d",
            transform: `translateY(${translateY}px)`,
            transition: "transform 0.6s cubic-bezier(0.35, 0.27, 0.27, 0.92)",
            willChange: "transform",
          }}
        >
          {extendedValues.map((value, idx) => {
            const distance = idx - selectedIndex;
            const isCenter = distance === 0;

            return (
              <div
                key={`${label}-${idx}`}
                className={`flex w-full items-center justify-center text-center font-bold tabular-nums transition-all ${isCenter ? "text-2xl scale-110" : "text-lg"}`}
                style={{
                  color: isCenter ? `rgb(${activeHighlightRgb})` : "rgb(var(--brass-rgb) / 0.6)",
                  height: WHEEL_ITEM_HEIGHT,
                  transformStyle: "preserve-3d",
                  transform: `rotateX(${distance * -16}deg) translateZ(${140 - Math.min(Math.abs(distance), 4) * 24}px)`,
                  opacity: Math.abs(distance) > 1 ? 0.3 : 1,
                  transition: "color 0.35s ease, opacity 0.35s ease, transform 0.35s ease",
                }}
              >
                {String(value).padStart(2, "0")}
              </div>
            );
          })}
        </div>

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgb(var(--surface-shell-rgb)) 0%, transparent 50%, rgb(var(--surface-shell-rgb)) 100%)",
          }}
        />
      </div>

      <button
        type="button"
        className="mt-3 hidden cursor-pointer rounded border px-3 py-1 text-sm transition hover:bg-[rgb(var(--brass-rgb)/0.1)] sm:block"
        style={{ borderColor: "rgb(var(--brass-rgb) / 0.45)" }}
        onClick={onSpinDown}
      >
        ▼
      </button>
    </div>
  );
}

const AuthStage = forwardRef<HTMLDivElement, AuthStageProps>(function AuthStage(
  {
    dayIndex,
    monthIndex,
    yearIndex,
    authHighlightTone,
    onSpinCipher,
    onDecryptDate,
    onBackClick,
  },
  ref
) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 2026 - 1995 + 1 }, (_, i) => 1995 + i);

  const [openedScrollId, setOpenedScrollId] = useState<number | null>(null);

  const positionedScrollHints: PositionedScrollHint[] = SCROLL_HINTS.map((scrollHint, index) => {
    const placement = SCROLL_PLACEMENT_SLOTS[index % SCROLL_PLACEMENT_SLOTS.length];
    return {
      ...scrollHint,
      rotate: placement.rotate,
      row: placement.row,
      indexInRow: placement.indexInRow,
    };
  });
  const allScrollHints = positionedScrollHints;
  const activeScroll = SCROLL_HINTS.find((item) => item.id === openedScrollId) ?? null;

  function closeScrollModal() {
    setOpenedScrollId(null);
  }

  function handleOpenScroll(scrollId: number) {
    setOpenedScrollId(scrollId);
  }

  function handleModalBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }
    closeScrollModal();
  }

  return (
    <>
      <section
        ref={ref}
        className="z-30 flex w-full max-w-5xl flex-col items-center gap-6 p-0"
      >
        <div
          className="flex w-full relative max-w-3xl flex-col items-center gap-7 rounded-xl p-6 sm:p-8"
          style={{ backgroundColor: "rgb(var(--surface-panel-rgb) / 0.86)" }}
        >
          <button
            onClick={onBackClick}
            className="absolute left-3 top-3 rounded cursor-pointer border px-3 py-1 text-sm transition hover:bg-[rgb(var(--brass-rgb)/0.1)]"
            style={{ borderColor: "rgb(var(--brass-rgb) / 0.45)" }}
            aria-label="Zpět na ověření otisků prstů"
          >
            {copy.auth.backButton}
          </button>

          <h2 className="text-xl tracking-widest sm:text-2xl md:mt-0 mt-10 text-center">
            Šifra Mistra <span className="line-through decoration-2">Leonarda</span> Nikoly
          </h2>
          <p className="-mt-4 text-center text-sm" style={{ color: "rgb(var(--parchment-dim-rgb))" }}>
            {copy.auth.description}
          </p>

          <div className="mt-4 grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
            <RotatingWheel
              values={days}
              currentIndex={dayIndex}
              highlightTone={authHighlightTone}
              isYearWheel={false}
              label={copy.auth.dayLabel}
              onSpinUp={() => onSpinCipher("day", 1)}
              onSpinDown={() => onSpinCipher("day", -1)}
            />
            <RotatingWheel
              values={months}
              currentIndex={monthIndex}
              highlightTone={authHighlightTone}
              isYearWheel={false}
              label={copy.auth.monthLabel}
              onSpinUp={() => onSpinCipher("month", 1)}
              onSpinDown={() => onSpinCipher("month", -1)}
            />
            <RotatingWheel
              values={years}
              currentIndex={yearIndex}
              highlightTone={authHighlightTone}
              isYearWheel
              label={copy.auth.yearLabel}
              onSpinUp={() => onSpinCipher("year", 1)}
              onSpinDown={() => onSpinCipher("year", -1)}
            />
          </div>

          <button
            className="rounded border px-8 py-2 cursor-pointer text-sm tracking-[0.18em] transition hover:bg-[rgb(var(--brass-rgb)/0.32)]"
            style={{
              borderColor: "rgb(var(--brass-rgb) / 0.8)",
              backgroundColor: "rgb(var(--brass-rgb) / 0.16)",
            }}
            onClick={onDecryptDate}
          >
            {copy.auth.decryptButton}
          </button>
        </div>

        <div className="grid w-full grid-cols-3 place-items-center gap-3 sm:grid-cols-6 sm:gap-6">
          {allScrollHints.map((scrollHint) => {
            return (
              <button
                key={scrollHint.id}
                type="button"
                onClick={() => handleOpenScroll(scrollHint.id)}
                className="cursor-pointer transition-all duration-300 hover:scale-105"
                style={{
                  transform: `rotate(${scrollHint.rotate}deg)`,
                  filter: "drop-shadow(0 14px 18px rgb(var(--ink-rgb) / 0.55))",
                }}
                aria-label="Open hidden scroll"
              >
                <Image
                  src="/scroll-closed.png"
                  alt="Closed scroll"
                  width={98}
                  height={98}
                  className="h-19.5 w-19.5 sm:h-24 sm:w-24 select-none"
                />
              </button>
            );
          })}
        </div>
      </section>

      {activeScroll &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className=""
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2147483647,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgb(0 0 0 / 0.72)",
            }}
            onClick={handleModalBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-label="Secret scroll"
          >
            <div className="relative w-full md:max-w-[80vw]">
              <button
                type="button"
                onClick={closeScrollModal}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-300"
                aria-label="Close scroll"
              >
                <div className="absolute h-0.5 w-4 rotate-45 bg-[rgb(var(--ink-rgb))]" />
                <div className="absolute h-0.5 w-4 -rotate-45 bg-[rgb(var(--ink-rgb))]" />
              </button>

              <Image
                src={activeScroll.caseImageSrc}
                alt={activeScroll.caseImageAlt}
                width={780}
                height={470}
                className="h-auto w-full object-contain"
                priority
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
});

export default AuthStage;
