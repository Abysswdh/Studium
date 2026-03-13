"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type NowPlayingState = {
  provider: "spotify" | "ytmusic" | "unknown";
  title: string;
  artist?: string;
  artworkUrl?: string;
  isPlaying?: boolean;
  volume?: number; // 0..1
  updatedAt?: number;
};

type ExtMessage =
  | { __studium_ext: 1; type: "STATE"; state: NowPlayingState }
  | { __studium_ext: 1; type: "PONG"; ok: true };

type PageMessage =
  | { __studium: 1; type: "PING" }
  | { __studium: 1; type: "GET_STATE" }
  | { __studium: 1; type: "CMD"; cmd: "playpause" | "next" | "prev" | "setVolume"; value?: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ExternalNowPlaying() {
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState<NowPlayingState | null>(null);
  const [volume, setVolume] = useState<number>(0.6);
  const lastStateAtRef = useRef<number>(0);

  const label = useMemo(() => {
    if (!state?.title) return connected ? "No media detected" : "Extension not connected";
    const by = state.artist ? ` • ${state.artist}` : "";
    return `${state.title}${by}`;
  }, [state, connected]);

  const post = (msg: PageMessage) => {
    try {
      window.postMessage(msg, window.location.origin);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (ev.source !== window) return;
      if (ev.origin !== window.location.origin) return;
      const data = ev.data as ExtMessage | undefined;
      if (!data || (data as any).__studium_ext !== 1) return;

      if (data.type === "PONG") {
        setConnected(true);
        return;
      }

      if (data.type === "STATE") {
        setConnected(true);
        setState(data.state);
        if (typeof data.state.volume === "number") setVolume(clamp(data.state.volume, 0, 1));
        lastStateAtRef.current = Date.now();
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    // Probe for extension bridge + request initial state.
    post({ __studium: 1, type: "PING" });
    post({ __studium: 1, type: "GET_STATE" });

    const t = window.setInterval(() => {
      post({ __studium: 1, type: "PING" });
      post({ __studium: 1, type: "GET_STATE" });

      // If we haven't received anything in a while, mark disconnected.
      const ago = Date.now() - (lastStateAtRef.current || 0);
      if (connected && ago > 9000) setConnected(false);
    }, 4000);

    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const cmd = (c: PageMessage) => post(c);

  return (
    <div className="panelItem mx-2 flex w-[420px] max-w-[34vw] flex-col gap-2 rounded-2xl px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-[900] tracking-[0.18em] text-white/55">NOW PLAYING</div>
          <div className="truncate text-sm font-[900] text-white/90" title={label}>
            {label}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => cmd({ __studium: 1, type: "CMD", cmd: "prev" })}
            className="headerAction grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-black/25 text-white/85 transition hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-white/35"
            aria-label="Previous"
            disabled={!connected}
          >
            <i className="fa-solid fa-backward-step" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            onClick={() => cmd({ __studium: 1, type: "CMD", cmd: "playpause" })}
            className="headerAction grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-black/25 text-white/85 transition hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-white/35"
            aria-label="Play/Pause"
            disabled={!connected}
          >
            <i className={state?.isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play"} aria-hidden="true"></i>
          </button>
          <button
            type="button"
            onClick={() => cmd({ __studium: 1, type: "CMD", cmd: "next" })}
            className="headerAction grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-black/25 text-white/85 transition hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-white/35"
            aria-label="Next"
            disabled={!connected}
          >
            <i className="fa-solid fa-forward-step" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-[900] text-white/55">{connected ? (state?.provider ? state.provider.toUpperCase() : "EXT") : "EXTENSION"}</div>
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-volume-high text-white/70" aria-hidden="true"></i>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            disabled={!connected}
            onChange={(e) => {
              const v = clamp(Number(e.target.value) / 100, 0, 1);
              setVolume(v);
              cmd({ __studium: 1, type: "CMD", cmd: "setVolume", value: v });
            }}
            className="h-2 w-40 accent-white"
            aria-label="External volume"
          />
          <div className="w-10 text-right text-xs font-[900] text-white/60">{Math.round(volume * 100)}</div>
        </div>
      </div>

      {!connected ? (
        <div className="text-xs font-[800] text-white/55">
          Install the Chrome extension (local) to read/control Spotify Web Player or YouTube Music.
        </div>
      ) : null}
    </div>
  );
}

