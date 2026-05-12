"use client";

import { useEffect, useRef } from "react";
import { copy } from "@/lib/copy";

interface RevealStageProps {
  uvPosition: { x: number; y: number };
  folderRef: React.RefObject<HTMLDivElement | null>;
  flapRef: React.RefObject<HTMLDivElement | null>;
  casePaperRef: React.RefObject<HTMLDivElement | null>;
  onBackClick: () => void;
}

function RevealStage({ uvPosition, folderRef, flapRef, casePaperRef, onBackClick }: RevealStageProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }

    const secretElements = sectionRef.current.querySelectorAll<HTMLElement>(".uv-secret");
    secretElements.forEach((element) => {
      const bounds = element.getBoundingClientRect();
      element.style.setProperty("--uv-secret-x", `${uvPosition.x - bounds.left}px`);
      element.style.setProperty("--uv-secret-y", `${uvPosition.y - bounds.top}px`);
    });
  }, [uvPosition]);

  return (
    <section ref={sectionRef} className="relative flex w-full touch-none items-center justify-center py-3 cursor-none">
      <button
        onClick={onBackClick}
        className="absolute left-2! md:left-10! top-6 md:top-2 z-50 rounded cursor-pointer border px-3 py-1 text-sm transition hover:bg-[rgb(var(--brass-rgb)/0.1)] sm:left-6 sm:top-6"
        style={{ borderColor: "rgb(var(--brass-rgb) / 0.45)" }}
        aria-label="Zpět na dešifrování"
      >
        {copy.auth.backButton}
      </button>

      <div
        ref={folderRef}
        className="relative w-full max-w-3xl rounded-md border p-4"
        style={{
          borderColor: "rgb(var(--copper-mid-rgb))",
          backgroundColor: "rgb(var(--copper-rgb))",
          boxShadow: "0 20px 50px rgb(var(--ink-rgb) / 0.45)",
        }}
      >
        <div
          ref={flapRef}
          className="absolute left-0 top-0 h-18 w-full origin-top rounded-t-md border-b"
          style={{
            borderColor: "rgb(var(--brass-rgb) / 0.5)",
            backgroundColor: "rgb(var(--copper-light-rgb))",
          }}
        />

        <div
          className="pointer-events-none absolute left-0 top-0 h-10 w-full opacity-50"
          style={{
            background:
              "linear-gradient(to bottom, rgb(var(--ink-rgb) / 0.36) 0%, rgb(var(--ink-rgb) / 0.2) 45%, rgb(var(--ink-rgb) / 0) 100%)",
          }}
          aria-hidden="true"
        />
        
        <div
          className="pointer-events-none absolute left-0 -top-16 h-16 w-full opacity-75"
          style={{
            background:
              "linear-gradient(to top, rgb(var(--ink-rgb) / 0.36) 0%, rgb(var(--ink-rgb) / 0.2) 45%, rgb(var(--ink-rgb) / 0) 100%)",
          }}
          aria-hidden="true"
        />

        <div
          ref={casePaperRef}
          className="relative mt-10 rounded-sm border p-6 shadow-inner sm:p-8"
          style={{
            borderColor: "rgb(var(--copper-mid-rgb))",
            backgroundColor: "rgb(var(--parchment-rgb))",
            color: "rgb(var(--ink-paper-rgb))",
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-8"
            style={{
              background:
                "linear-gradient(to bottom, rgb(var(--ink-rgb) / 0.12) 0%, rgb(var(--ink-rgb) / 0.06) 58%, rgb(var(--ink-rgb) / 0) 100%)",
            }}
            aria-hidden="true"
          />

          <p className="text-xs tracking-[0.28em]" style={{ color: "rgb(var(--umber-rgb))" }}>
            {copy.reveal.caseLabel}
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-[0.08em]" style={{ color: "rgb(var(--ink-paper-deep-rgb))" }}>
            {copy.reveal.title}
          </h3>
          <div className="mt-6 space-y-3 text-base leading-relaxed">
            <p>
              {copy.reveal.organizer} <span className="uv-secret uv-secret-value font-bold tracking-[0.08em]">{copy.reveal.organizerValue}</span>
            </p>
            <p>
              {copy.reveal.place} <span className="uv-secret uv-secret-value font-bold tracking-[0.08em]">{copy.reveal.placeValue}</span>
            </p>
            <p>
              {copy.reveal.date} <span className="uv-secret uv-secret-value font-bold tracking-[0.08em]">{copy.reveal.dateValue}</span>
            </p>
            <p>
              {copy.reveal.time} <span className="uv-secret uv-secret-value font-bold tracking-[0.08em]">{copy.reveal.timeValue}</span>
            </p>
            <p>
              {copy.reveal.dressCode}
              <span className="uv-secret uv-secret-value mt-1 block font-bold tracking-[0.08em]">{copy.reveal.dressCodeValue}</span>
            </p>
            <p>
              {copy.reveal.celebrationTheme} <span className="uv-secret uv-secret-value font-bold tracking-[0.08em]">{copy.reveal.celebrationThemeValue}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RevealStage;
