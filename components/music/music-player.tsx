"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PlaylistTrack } from "../../lib/music/playlist";

type Props = {
  tracks: PlaylistTrack[];
};

const LS_KEY_VOL = "studium:music_volume";
const LS_KEY_IDX = "studium:music_index";
const LS_KEY_ON = "studium:music_on";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function safeLocalGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export default function MusicPlayer({ tracks }: Props) {
  const list = useMemo(() => (tracks?.length ? tracks : []), [tracks]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.55);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const freqRef = useRef<Uint8Array | null>(null);

  const orbRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const beatRef = useRef({ ema: 0, pulse: 0 });

  const current = list[index] ?? null;

  useEffect(() => {
    const v = Number(safeLocalGet(LS_KEY_VOL));
    if (!Number.isNaN(v) && v >= 0 && v <= 1) setVolume(v);
    const idx = Number(safeLocalGet(LS_KEY_IDX));
    if (!Number.isNaN(idx) && idx >= 0) setIndex(Math.floor(idx));
    const on = safeLocalGet(LS_KEY_ON);
    if (on === "0") setEnabled(false);
  }, []);

  useEffect(() => {
    safeLocalSet(LS_KEY_VOL, String(volume));
  }, [volume]);

  useEffect(() => {
    if (!list.length) return;
    const next = clamp(index, 0, list.length - 1);
    if (next !== index) setIndex(next);
    safeLocalSet(LS_KEY_IDX, String(next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, list.length]);

  const ensureAudioGraph = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (ctxRef.current && analyserRef.current && gainRef.current) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    try {
      if (ctx.state === "suspended") await ctx.resume();
    } catch {
      // ignore
    }

    const gain = ctx.createGain();
    gain.gain.value = enabled ? volume : 0;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.82;

    const source = ctx.createMediaElementSource(audio);
    source.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);

    ctxRef.current = ctx;
    gainRef.current = gain;
    analyserRef.current = analyser;
    sourceRef.current = source;
    freqRef.current = new Uint8Array(analyser.frequencyBinCount);
  };

  const applyGain = () => {
    const g = gainRef.current;
    if (!g) return;
    g.gain.value = enabled ? volume : 0;
  };

  useEffect(() => {
    applyGain();
    safeLocalSet(LS_KEY_ON, enabled ? "1" : "0");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => next();

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, list.length]);

  useEffect(() => {
    const tick = () => {
      const analyser = analyserRef.current;
      const arr = freqRef.current;
      const orb = orbRef.current;
      const canvas = canvasRef.current;
      const ctx2d = canvas?.getContext?.("2d") ?? null;

      if (analyser && arr && orb) {
        analyser.getByteFrequencyData(arr as any);

        // Bass energy (roughly first ~12 bins)
        const bins = Math.min(14, arr.length);
        let sum = 0;
        for (let i = 0; i < bins; i++) sum += arr[i];
        const energy = (sum / bins) / 255;

        const s = beatRef.current;
        s.ema = s.ema * 0.93 + energy * 0.07;
        const threshold = s.ema * 1.35;
        if (energy > threshold && energy > 0.06) s.pulse = Math.max(s.pulse, clamp((energy - threshold) * 2.3, 0, 1));

        s.pulse *= 0.88;
        const beat = clamp(s.pulse, 0, 1);
        orb.style.setProperty("--beat", beat.toFixed(3));

        if (ctx2d && canvas) {
          const w = canvas.width;
          const h = canvas.height;
          ctx2d.clearRect(0, 0, w, h);

          const bars = 18;
          const step = Math.max(1, Math.floor(arr.length / 64));
          const barW = w / bars;

          for (let i = 0; i < bars; i++) {
            const v = arr[i * step] / 255;
            const bh = Math.max(2, v * h);
            const x = i * barW;
            const y = h - bh;
            ctx2d.fillStyle = `rgba(255,255,255,${0.08 + v * 0.26})`;
            ctx2d.fillRect(x + 1, y, Math.max(2, barW - 2), bh);
          }
        }
      } else if (orb) {
        orb.style.setProperty("--beat", "0");
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  const loadCurrent = async (autoplay = false) => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    audio.src = current.src;
    audio.load();
    if (autoplay) {
      await play();
    }
  };

  useEffect(() => {
    void loadCurrent(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, current?.src]);

  const play = async () => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    await ensureAudioGraph();
    applyGain();
    try {
      const p = audio.play();
      if (p && typeof (p as any).catch === "function") (p as any).catch(() => {});
    } catch {
      // ignore
    }
  };

  const pause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.pause();
    } catch {
      // ignore
    }
  };

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!current) return;
    if (audio.paused) await play();
    else pause();
  };

  const next = () => {
    if (!list.length) return;
    setIndex((i) => (i + 1) % list.length);
  };

  const prev = () => {
    const audio = audioRef.current;
    if (!list.length) return;
    if (audio && audio.currentTime > 2.5) {
      audio.currentTime = 0;
      return;
    }
    setIndex((i) => (i - 1 + list.length) % list.length);
  };

  const label = current?.title ?? "No playlist";

  return (
    <div className="panelItem mx-4 flex w-[520px] max-w-[44vw] flex-col gap-3 rounded-2xl px-4 py-3">
      <audio ref={audioRef} preload="metadata" />

      <div className="flex items-center gap-3">
        <div
          ref={orbRef}
          className="relative grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/25"
          aria-hidden="true"
          style={{
            transform: "scale(calc(1 + var(--beat, 0) * 0.16))",
            transition: "transform 60ms linear",
            boxShadow: "0 10px 45px rgba(0,0,0,0.35)",
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: "0 0 0 2px rgba(255,255,255,0.12), 0 0 40px rgba(255,255,255,0.10)",
              opacity: 0.8,
            }}
          />
          <div className="text-[11px] font-[900] tracking-[0.18em] text-white/85">S</div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-[900] tracking-[0.18em] text-white/55">MUSIC</div>
          <div className="truncate text-sm font-[900] text-white/90" title={label}>
            {label}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prev}
            className="headerAction grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-black/25 text-white/85 transition hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-white/35"
            aria-label="Previous track"
          >
            <i className="fa-solid fa-backward-step" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            onClick={() => void toggle()}
            className="headerAction grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-black/25 text-white/85 transition hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-white/35"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <i className={isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play"} aria-hidden="true"></i>
          </button>
          <button
            type="button"
            onClick={next}
            className="headerAction grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-black/25 text-white/85 transition hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-white/35"
            aria-label="Next track"
          >
            <i className="fa-solid fa-forward-step" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEnabled((v) => !v)}
            className="headerAction inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-[900] text-white/80 transition hover:bg-black/30 focus:outline-none focus:ring-2 focus:ring-white/35"
            aria-label="Toggle music output"
          >
            <i className={enabled ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark"} aria-hidden="true"></i>
            <span>{enabled ? "On" : "Off"}</span>
          </button>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume(clamp(Number(e.target.value) / 100, 0, 1))}
              className="h-2 w-28 accent-white"
              aria-label="Volume"
            />
            <div className="w-10 text-right text-xs font-[900] text-white/60">{Math.round(volume * 100)}</div>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={200}
          height={34}
          className="rounded-xl border border-white/10 bg-black/20"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
