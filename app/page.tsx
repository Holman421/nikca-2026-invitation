
"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useEffect, useMemo, useRef, useState } from "react";
import FingerprintStage from "@/components/FingerprintStage";
import AuthStage from "@/components/AuthStage";
import RevealStage from "@/components/RevealStage";

type Stage = "intro" | "auth" | "reveal";
type AuthHighlightTone = "blue" | "red" | "green";

type UvPoint = {
  x: number;
  y: number;
};

const HOLD_DURATION_SECONDS = 1.9;
const TARGET_AUTH_DATE = {
  day: 23,
  month: 5,
  year: 2000,
};

function Home() {
  const days = useMemo(() => Array.from({ length: 31 }, (_, index) => index + 1), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => index + 1), []);
  const years = useMemo(() => Array.from({ length: 2026 - 1995 + 1 }, (_, index) => 1995 + index), []);

  const [stage, setStage] = useState<Stage>("intro");
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [dayIndex, setDayIndex] = useState(() => Math.floor(Math.random() * days.length));
  const [monthIndex, setMonthIndex] = useState(() => Math.floor(Math.random() * months.length));
  const [yearIndex, setYearIndex] = useState(() => Math.floor(Math.random() * years.length));
  const [authHighlightTone, setAuthHighlightTone] = useState<AuthHighlightTone>("blue");
  const [uvPosition, setUvPosition] = useState<UvPoint>({ x: -400, y: -400 });

  const stagePanelRef = useRef<HTMLDivElement | null>(null);
  const holdTweenRef = useRef<gsap.core.Tween | null>(null);
  const authShellRef = useRef<HTMLDivElement | null>(null);
  const folderRef = useRef<HTMLDivElement | null>(null);
  const flapRef = useRef<HTMLDivElement | null>(null);
  const casePaperRef = useRef<HTMLDivElement | null>(null);

  const { contextSafe } = useGSAP({ scope: stagePanelRef });

  // Animate stage panel entry
  useGSAP(() => {
    if (!stagePanelRef.current) return;

    gsap.fromTo(
      stagePanelRef.current,
      { autoAlpha: 0, y: 28 },
      { autoAlpha: 1, y: 0, duration: 0.62, ease: "power2.out" },
    );
  }, { dependencies: [stage] });

  // Animate reveal stage
  useGSAP(() => {
    if (stage !== "reveal" || !folderRef.current || !flapRef.current || !casePaperRef.current) return;

    const folderElement = folderRef.current;
    const flapElement = flapRef.current;
    const casePaperElement = casePaperRef.current;

    const timeline = gsap.timeline();
    timeline
      .fromTo(
        folderElement,
        { autoAlpha: 0, scale: 0.84, y: 44, rotateX: -26, transformPerspective: 1200 },
        { autoAlpha: 1, scale: 1, y: 0, rotateX: 0, duration: 0.72, ease: "power3.out" },
      )
      .to(flapElement, {
        rotateX: -148,
        transformOrigin: "top center",
        duration: 1,
        ease: "expo.out",
      })
      .fromTo(
        casePaperElement,
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" },
        "-=0.28",
      )
      .add(() => {
        // Clear residual transforms after entrance to keep UV reveal coordinates aligned.
        gsap.set([folderElement, casePaperElement], { clearProps: "transform" });
      });
  }, { dependencies: [stage] });

  // Update UV cursor position (non-GSAP effect)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--uv-x", `${uvPosition.x}px`);
    root.style.setProperty("--uv-y", `${uvPosition.y}px`);

    if (!stagePanelRef.current) {
      return;
    }

    const panelBounds = stagePanelRef.current.getBoundingClientRect();
    root.style.setProperty("--uv-local-x", `${uvPosition.x - panelBounds.left}px`);
    root.style.setProperty("--uv-local-y", `${uvPosition.y - panelBounds.top}px`);
  }, [uvPosition]);

  useEffect(() => {
    if (stage !== "reveal") {
      return;
    }

    function handleWindowPointerMove(event: MouseEvent) {
      setUvPosition({ x: event.clientX, y: event.clientY });
    }

    function handleWindowPointerLeave() {
      setUvPosition({ x: -500, y: -500 });
    }

    window.addEventListener("mousemove", handleWindowPointerMove);
    window.addEventListener("mouseout", handleWindowPointerLeave);

    return () => {
      window.removeEventListener("mousemove", handleWindowPointerMove);
      window.removeEventListener("mouseout", handleWindowPointerLeave);
    };
  }, [stage]);

  const cancelLongPress = contextSafe(() => {
    setIsHolding(false);
    holdTweenRef.current?.kill();
    holdTweenRef.current = null;

    gsap.to(
      { value: holdProgress },
      {
        value: 0,
        duration: 0.25,
        ease: "power2.out",
        onUpdate() {
          setHoldProgress(this.targets()[0].value);
        },
      },
    );
  });

  const beginLongPress = contextSafe(() => {
    if (stage !== "intro") return;

    setIsHolding(true);
    const progress = { value: holdProgress };

    holdTweenRef.current = gsap.to(progress, {
      value: 1,
      duration: HOLD_DURATION_SECONDS,
      ease: "linear",
      onUpdate() {
        setHoldProgress(progress.value);
      },
      onComplete() {
        setIsHolding(false);
        setHoldProgress(0);
        setStage("auth");
      },
    });
  });

  function wrapIndex(index: number, total: number) {
    if (index < 0) {
      return total - 1;
    }

    if (index >= total) {
      return 0;
    }

    return index;
  }

  function spinCipher(column: "day" | "month" | "year", direction: number) {
    setAuthHighlightTone("blue");

    if (column === "day") {
      setDayIndex((previous) => wrapIndex(previous + direction, days.length));
      return;
    }

    if (column === "month") {
      setMonthIndex((previous) => wrapIndex(previous + direction, months.length));
      return;
    }

    setYearIndex((previous) => wrapIndex(previous + direction, years.length));
  }

  const decryptDate = contextSafe(() => {
    const isCorrect =
      days[dayIndex] === TARGET_AUTH_DATE.day &&
      months[monthIndex] === TARGET_AUTH_DATE.month &&
      years[yearIndex] === TARGET_AUTH_DATE.year;
    if (isCorrect) {
      setAuthHighlightTone("green");
      gsap.delayedCall(0.75, () => setStage("reveal"));
      return;
    }

    setAuthHighlightTone("red");
    gsap.delayedCall(0.65, () => setAuthHighlightTone("blue"));
  });

  function handleBackClick() {
    if (stage === "auth") {
      setStage("intro");
      setHoldProgress(0);
      setIsHolding(false);
      setAuthHighlightTone("blue");
    } else if (stage === "reveal") {
      setStage("auth");
      setAuthHighlightTone("blue");
    }
  }

  function moveUvCursor(event: React.MouseEvent<HTMLDivElement>) {
    if (stage !== "reveal") {
      return;
    }
    setUvPosition({ x: event.clientX, y: event.clientY });
  }

  function moveUvCursorByTouch(event: React.TouchEvent<HTMLDivElement>) {
    if (stage !== "reveal") {
      return;
    }

    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    setUvPosition({ x: touch.clientX, y: touch.clientY });
  }

  return (
    <div
      className="paper-texture flex flex-1 items-center justify-center px-6 py-10"
      onMouseMove={moveUvCursor}
      onMouseLeave={() => setUvPosition({ x: -500, y: -500 })}
      onTouchStart={moveUvCursorByTouch}
      onTouchMove={moveUvCursorByTouch}
      onTouchEnd={() => setUvPosition({ x: -500, y: -500 })}
      onTouchCancel={() => setUvPosition({ x: -500, y: -500 })}
    >
      <div
        ref={stagePanelRef}
        className="flex w-full max-w-4xl flex-col items-center"
      >
        {stage === "intro" && (
          <FingerprintStage
            isHolding={isHolding}
            holdProgress={holdProgress}
            onBeginPress={beginLongPress}
            onEndPress={cancelLongPress}
          />
        )}

        {stage === "auth" && (
          <AuthStage
            ref={authShellRef}
            dayIndex={dayIndex}
            monthIndex={monthIndex}
            yearIndex={yearIndex}
            authHighlightTone={authHighlightTone}
            onSpinCipher={spinCipher}
            onDecryptDate={decryptDate}
            onBackClick={handleBackClick}
          />
        )}

        {stage === "reveal" && (
          <RevealStage uvPosition={uvPosition} folderRef={folderRef} flapRef={flapRef} casePaperRef={casePaperRef} onBackClick={handleBackClick} />
        )}
      </div>

      {stage === "reveal" && (
        <>
          <div className="uv-glow" aria-hidden="true" />
          <img
            src="/flashlight.png"
            alt=""
            className="pointer-events-none fixed z-65 size-60! rotate-90 select-none object-fill opacity-95 sm:h-20 sm:w-20"
            style={{
              left: `${uvPosition.x}px`,
              top: `${uvPosition.y}px`,
              transform: "translate(0px, 0px) rotate(-18deg)",
              filter: "drop-shadow(0 4px 8px rgb(var(--ink-rgb) / 0.45))",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none fixed z-70 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              left: `${uvPosition.x}px`,
              top: `${uvPosition.y}px`,
              borderColor: "rgb(var(--wand-core-rgb) / 0.45)",
              backgroundColor: "rgb(var(--wand-rgb) / 0.24)",
              boxShadow:
                "0 0 16px rgb(var(--wand-core-rgb) / 0.78), 0 0 36px rgb(var(--wand-rgb) / 0.72), inset 0 0 8px rgb(var(--wand-core-rgb) / 0.3)",
            }}
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
}

export default Home;
