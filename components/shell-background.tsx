"use client";

import { useEffect, useState } from "react";

import FloatingLines from "./FloatingLines";

function readGlassTint() {
  if (typeof window === "undefined") return "255 255 255";
  const value = window.getComputedStyle(document.body).getPropertyValue("--glass-tint").trim();
  return value || "255 255 255";
}

function readGlassAlphaStrong() {
  if (typeof window === "undefined") return 0.36;
  const raw = window.getComputedStyle(document.body).getPropertyValue("--glass-alpha-strong").trim();
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0.36;
}

function readView() {
  if (typeof document === "undefined") return "dashboard";
  return document.body?.dataset?.view || "dashboard";
}

export default function ShellBackground() {
  const [glassTint, setGlassTint] = useState(() => readGlassTint());
  const [glassAlphaStrong, setGlassAlphaStrong] = useState(() => readGlassAlphaStrong());
  const [view, setView] = useState(() => readView());

  useEffect(() => {
    const update = () => {
      setGlassTint(readGlassTint());
      setGlassAlphaStrong(readGlassAlphaStrong());
      setView(readView());
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-view", "class", "style"]
    });

    return () => observer.disconnect();
  }, []);

  const backgroundStrength = Math.min(0.32, Math.max(0.16, glassAlphaStrong * 0.9));

  return (
    <div className="bg__floating-lines" aria-hidden="true">
      <FloatingLines
        key={view}
        linesGradient={["#ffffff", "#ffffff"]}
        topWavePosition={undefined}
        middleWavePosition={undefined}
        animationSpeed={1}
        interactive
        bendRadius={5}
        bendStrength={-0.5}
        mouseDamping={0.05}
        parallax
        parallaxStrength={0.2}
        mixBlendMode="normal"
        backgroundColor={glassTint}
        backgroundStrength={backgroundStrength}
        lineBrightness={0.1}
      />
    </div>
  );
}
