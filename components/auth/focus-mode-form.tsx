"use client";

import { type FormHTMLAttributes } from "react";

type FocusModeFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "action"> & {
  action: (formData: FormData) => void | Promise<void>;
};

function requestFullscreenPref() {
  try {
    const muteAll = localStorage.getItem("studium:qs_mute_all") === "1";
    if (!muteAll) {
      const savedVol = Number(localStorage.getItem("studium:qs_sfx_volume"));
      const v = Number.isFinite(savedVol) ? Math.max(0, Math.min(100, savedVol)) / 100 : 0.55;
      const a = new Audio("/sound/boot.mp3");
      a.volume = 0.7 * v;
      a.preload = "auto";
      const p = a.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  } catch {
    // ignore
  }

  try {
    localStorage.setItem("studium:pref_fullscreen", "1");
  } catch {
    // ignore
  }

  try {
    const el = document.documentElement as any;
    const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (!document.fullscreenElement && typeof fn === "function") {
      const p = fn.call(el);
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  } catch {
    // ignore
  }
}

export default function FocusModeForm({ action, onSubmit, ...props }: FocusModeFormProps) {
  return (
    <form
      {...props}
      action={action}
      onSubmit={(e) => {
        requestFullscreenPref();
        onSubmit?.(e);
      }}
    />
  );
}

