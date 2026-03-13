function readViewMarker() {
  const marker = document.querySelector('[data-view-marker="1"]');
  if (!marker) return null;
  const view = marker.getAttribute("data-view");
  const label = marker.getAttribute("data-label");
  const desc = marker.getAttribute("data-desc");
  return { view, label, desc };
}

function setView(view) {
  if (!view) return;
  document.body.dataset.view = view;
}

(function syncInitialView() {
  const m = readViewMarker();
  if (m?.view) setView(m.view);
})();

function isTypingTarget(el) {
  if (!el) return false;
  const tag = String(el.tagName || "").toLowerCase();
  return tag === "input" || tag === "textarea" || el.isContentEditable;
}

function setMode(mode) {
  document.body.classList.toggle("nav-mode", mode === "nav");
  document.body.classList.toggle("grid-mode", mode === "grid");
}

(function initWallpapers() {
  const videoA = document.getElementById("bgVideoA");
  const videoB = document.getElementById("bgVideoB");
  if (!videoA || !videoB) return;

  const LOOP_SECONDS = 22;
  const USE_HUE_ROTATE = false;

  const wallpaperByView = {
    dashboard: "/bg/blue - dashboard.mp4",
    routine: "/bg/brown -.mp4",
    quest: "/bg/green - .mp4",
    schedules: "/bg/aqua - .mp4",
    notes: "/bg/white - notes.mp4",
    study: "/bg/orange -.mp4",
    pomodoro: "/bg/purple - focus.mp4",
    battle: "/bg/red - Battle.mp4",
    guild: "/bg/yellow - guild.mp4",
    match: "/bg/black - settings.mp4",
  };

  const hueByView = {
    dashboard: "0deg",
    routine: "0deg",
    quest: "0deg",
    schedules: "0deg",
    notes: "0deg",
    study: "0deg",
    pomodoro: "0deg",
    battle: "0deg",
    guild: "0deg",
    match: "0deg",
  };

  const fallbackSrcs = [
    "/bg/blue - dashboard.mp4",
    "/bg/purple - focus.mp4",
    "/bg/red - Battle.mp4",
    "/bg.mp4",
    "/bg2.mp4",
    "/bg3.mp4",
  ].filter(Boolean);

  let active = videoA;
  let standby = videoB;
  let currentView = null;
  let latestToken = 0;

  const showVideo = () => document.body.classList.remove("no-video");
  const hideVideo = () => document.body.classList.add("no-video");

  const safePlay = (video) => {
    try {
      const p = video.play();
      if (p && typeof p.then === "function") p.catch(() => {});
    } catch {
      // ignore autoplay errors
    }
  };

  const setHue = (view) => {
    const hue = USE_HUE_ROTATE ? hueByView[view] ?? "0deg" : "0deg";
    document.body.style.setProperty("--bg-hue", hue);
  };

  const getOffsetSeconds = () => {
    if (!active || Number.isNaN(active.currentTime) || active.readyState < 1) {
      return (Date.now() / 1000) % LOOP_SECONDS;
    }
    return active.currentTime % LOOP_SECONDS;
  };

  function loadSyncPlay(video, src, offsetSeconds) {
    return new Promise((resolve, reject) => {
      let settled = false;

      const cleanup = () => {
        video.removeEventListener("loadedmetadata", onMeta);
        video.removeEventListener("canplay", onCanPlay);
        video.removeEventListener("error", onError);
      };

      const finish = (ok, err) => {
        if (settled) return;
        settled = true;
        cleanup();
        ok ? resolve() : reject(err);
      };

      const onMeta = () => {
        try {
          video.currentTime = offsetSeconds;
        } catch {
          // ignore
        }
      };

      const onCanPlay = () => {
        showVideo();
        safePlay(video);
        finish(true);
      };

      const onError = () => {
        hideVideo();
        finish(false, new Error(`Failed to load wallpaper: ${src}`));
      };

      video.addEventListener("loadedmetadata", onMeta, { once: true });
      video.addEventListener("canplay", onCanPlay, { once: true });
      video.addEventListener("error", onError, { once: true });

      video.src = encodeURI(src);
      try {
        video.load();
      } catch {
        // ignore
      }
    });
  }

  async function primeWallpaper(view) {
    if (!view) return;
    currentView = view;
    const token = ++latestToken;

    const offset = getOffsetSeconds();
    const preferredSrc = wallpaperByView[view] || fallbackSrcs[0] || "";

    setHue(view);

    const srcCandidates = [preferredSrc, ...fallbackSrcs].filter(Boolean);
    for (const src of srcCandidates) {
      try {
        await loadSyncPlay(active, src, offset);
        if (token !== latestToken) return;
        break;
      } catch {
        // try next
      }
    }

    if (token !== latestToken) return;
    active.classList.add("bg__video--active");
    standby.classList.remove("bg__video--active");
  }

  async function switchWallpaper(view) {
    if (!view) return;
    if (view === currentView) {
      setHue(view);
      return;
    }

    currentView = view;
    const token = ++latestToken;

    const offset = getOffsetSeconds();
    const preferredSrc = wallpaperByView[view] || fallbackSrcs[0] || "";

    setHue(view);

    const srcCandidates = [preferredSrc, ...fallbackSrcs].filter(Boolean);
    for (const src of srcCandidates) {
      try {
        await loadSyncPlay(standby, src, offset);
        if (token !== latestToken) return;
        break;
      } catch {
        // try next
      }
    }

    if (token !== latestToken) return;

    standby.classList.add("bg__video--active");
    active.classList.remove("bg__video--active");

    const prev = active;
    active = standby;
    standby = prev;
  }

  window.setWallpaperForView = (view) => switchWallpaper(view);

  const initialView = document.body.dataset.view || "dashboard";
  primeWallpaper(initialView);
})();

const SFX = (() => {
  const boot = new Audio("/sound/boot.mp3");
  const sw = new Audio("/sound/switch.mp3");
  const grid = new Audio("/sound/switch.mp3");
  const header = new Audio("/sound/switch.mp3");

  const BOOT_VOL = 0.7;
  const SW_VOL = 0.55;
  const GRID_VOL = 0.55;
  const HEADER_VOL = 0.55;

  boot.preload = "auto";
  sw.preload = "auto";
  grid.preload = "auto";
  header.preload = "auto";

  grid.playbackRate = 0.82;
  header.playbackRate = 0.66;
  try {
    grid.preservesPitch = false;
    grid.mozPreservesPitch = false;
    grid.webkitPreservesPitch = false;
    header.preservesPitch = false;
    header.mozPreservesPitch = false;
    header.webkitPreservesPitch = false;
  } catch {
    // ignore
  }

  let unlocked = false;
  let pendingBoot = false;
  let lastBootAt = 0;
  let muted = false;

  const applyMute = () => {
    const m = muted ? 0 : 1;
    boot.volume = BOOT_VOL * m;
    sw.volume = SW_VOL * m;
    grid.volume = GRID_VOL * m;
    header.volume = HEADER_VOL * m;
  };
  applyMute();

  const tryPlay = (audio) => {
    try {
      audio.currentTime = 0;
    } catch {
      // ignore
    }

    try {
      const p = audio.play();
      if (p && typeof p.then === "function") p.catch(() => {});
    } catch {
      // ignore
    }
  };

  const unlock = () => {
    unlocked = true;
    if (pendingBoot) {
      pendingBoot = false;
      lastBootAt = Date.now();
      tryPlay(boot);
    }
  };

  document.addEventListener("pointerdown", unlock, { once: true, capture: true });
  document.addEventListener("keydown", unlock, { once: true, capture: true });

  return {
    isMuted: () => muted,
    setMuted: (next) => {
      muted = !!next;
      applyMute();
    },
    playBoot: () => {
      if (!unlocked) pendingBoot = true;
      lastBootAt = Date.now();
      tryPlay(boot);
    },
    playSwitch: () => {
      if (!unlocked) return;
      tryPlay(sw);
    },
    playGridMove: () => {
      if (!unlocked) return;
      tryPlay(grid);
    },
    playHeaderMove: () => {
      if (!unlocked) return;
      tryPlay(header);
    },
  };
})();

(function initBootSequence() {
  const overlay = document.getElementById("bootOverlay");
  const logo = document.getElementById("bootLogo");
  if (!overlay || !logo) return;

  document.body.classList.add("booting");
  SFX.playBoot();

  requestAnimationFrame(() => overlay.classList.add("bootOverlay--reveal"));

  // After 1s reveal, show the title for ~5s
  setTimeout(() => logo.classList.add("bootLogo--show"), 1000);

  setTimeout(() => {
    overlay.classList.add("bootOverlay--hide");
    document.body.classList.remove("booting");

    // Default highlight/focus starts on the active nav item.
    setTimeout(() => {
      if (document.body.classList.contains("drawer-open")) return;
      const ae = document.activeElement;
      const isBlank = ae === document.body || ae === document.documentElement;
      if (isBlank && typeof window.focusNavMenu === "function") window.focusNavMenu();
    }, 60);

    setTimeout(() => {
      try {
        overlay.remove();
      } catch {
        // ignore
      }
    }, 650);
  }, 6000);
})();

(function initClock() {
  const el = document.getElementById("clock");
  if (!el) return;

  const tick = () => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    el.textContent = `${h}:${m}`;
  };

  tick();
  setInterval(tick, 1000);
})();

(function initHeaderInteractions() {
  const viewBtn = document.getElementById("viewLabel");
  const viewInfo = document.getElementById("viewInfo");
  const viewInfoTitle = document.getElementById("viewInfoTitle");
  const viewInfoDesc = document.getElementById("viewInfoDesc");

  const userBtn = document.getElementById("userMenuBtn");
  const dashboardTopCard = () => document.getElementById("grid-leftTop");
  const overlay = document.getElementById("profileOverlay");
  const drawer = document.getElementById("profileDrawer");
  const closeBtn = document.getElementById("profileCloseBtn");
  const toggleSfxBtn = document.getElementById("toggleSfxBtn");

  if (!viewBtn && !userBtn) return;

  const defaultDesc = {
    dashboard: "Your daily snapshot: routine, quests, streaks, and widgets.",
    routine: "Now / Next / Later \u2014 turn deadlines into concrete steps.",
    quest: "Pick quests, set difficulty, earn XP & streaks.",
    schedules: "Agenda + deadlines that feed your routine.",
    notes: "Capture quick notes tied to your quests and sessions.",
    study: "Start a session: focus, review, and capture.",
    pomodoro: "Timer + co-op focus sessions linked to tasks.",
    battle: "1v1 quizzes from a question bank. Win, rank up, repeat.",
    guild: "Group study rooms, co-focus, chat, accountability.",
    match: "Modes like guild vs guild, tournaments, and events.",
  };

  const enterHeaderMode = () => {
    setMode("grid");
    if (typeof window.clearNavFocus === "function") window.clearNavFocus();
  };

  const focusNav = () => {
    if (typeof window.focusNavMenu === "function") window.focusNavMenu();
  };

  const focusGridTop = () => {
    const target = document.getElementById("grid-streak") || dashboardTopCard() || document.querySelector(".gridCard");
    if (!target) return;
    try {
      target.focus({ preventScroll: true });
    } catch {
      target.focus();
    }
  };

  let infoTimer = null;
  const hideViewInfo = () => {
    if (!viewInfo) return;
    viewInfo.classList.remove("viewInfo--show");
    if (infoTimer) clearTimeout(infoTimer);
    infoTimer = null;
    setTimeout(() => {
      if (!viewInfo.classList.contains("viewInfo--show")) viewInfo.hidden = true;
    }, 260);
  };

  const showViewInfo = () => {
    if (!viewInfo || !viewInfoTitle || !viewInfoDesc || !viewBtn) return;

    enterHeaderMode();

    const view = document.body.dataset.view || "dashboard";
    const m = readViewMarker();
    const desc = m?.desc;

    viewInfoTitle.textContent = viewBtn.textContent?.trim() || "Info";
    viewInfoDesc.textContent = desc || defaultDesc[view] || " ";

    viewInfo.hidden = false;
    requestAnimationFrame(() => viewInfo.classList.add("viewInfo--show"));

    if (infoTimer) clearTimeout(infoTimer);
    infoTimer = setTimeout(hideViewInfo, 2800);
  };

  const syncSfxLabel = () => {
    if (!toggleSfxBtn) return;
    const on = typeof SFX?.isMuted === "function" ? !SFX.isMuted() : true;
    toggleSfxBtn.textContent = `SFX: ${on ? "On" : "Off"}`;
  };

  let closeTimer = null;
  const openDrawer = () => {
    if (!drawer || !overlay) return;
    enterHeaderMode();
    if (typeof SFX?.playHeaderMove === "function") SFX.playHeaderMove();
    hideViewInfo();
    syncSfxLabel();

    if (closeTimer) clearTimeout(closeTimer);
    overlay.hidden = false;
    drawer.hidden = false;
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");

    setTimeout(() => {
      try {
        (closeBtn || drawer).focus({ preventScroll: true });
      } catch {
        (closeBtn || drawer).focus();
      }
    }, 20);
  };

  const closeDrawer = () => {
    if (!drawer || !overlay) return;
    document.body.classList.remove("drawer-open");
    drawer.setAttribute("aria-hidden", "true");

    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      overlay.hidden = true;
      drawer.hidden = true;
    }, 340);
  };

  if (viewBtn) {
    viewBtn.addEventListener("click", showViewInfo);
    viewBtn.addEventListener("pointerdown", () => {
      if (typeof SFX?.playHeaderMove === "function") SFX.playHeaderMove();
    });
    viewBtn.addEventListener("focus", () => enterHeaderMode());
  }

  if (toggleSfxBtn) {
    toggleSfxBtn.addEventListener("click", () => {
      if (typeof SFX?.isMuted !== "function" || typeof SFX?.setMuted !== "function") return;
      SFX.setMuted(!SFX.isMuted());
      syncSfxLabel();
    });
  }

  if (userBtn) {
    userBtn.addEventListener("click", openDrawer);
    userBtn.addEventListener("focus", () => enterHeaderMode());
  }

  if (overlay)
    overlay.addEventListener("click", () => {
      if (typeof SFX?.playSwitch === "function") SFX.playSwitch();
      closeDrawer();
    });
  if (closeBtn)
    closeBtn.addEventListener("click", () => {
      if (typeof SFX?.playSwitch === "function") SFX.playSwitch();
      closeDrawer();
    });

  const drawerFocusables = () => {
    if (!drawer) return [];
    const els = Array.from(drawer.querySelectorAll("button,[tabindex='0']"));
    return els.filter((el) => {
      if (el.hasAttribute("disabled")) return false;
      if (el.getAttribute("aria-hidden") === "true") return false;
      return true;
    });
  };

  const moveDrawerFocus = (dir) => {
    const list = drawerFocusables();
    if (list.length === 0) return;

    const idx = Math.max(0, list.indexOf(document.activeElement));
    const next = (idx + dir + list.length) % list.length;
    try {
      list[next].focus({ preventScroll: true });
    } catch {
      list[next].focus();
    }
  };

  window.profileDrawerApi = {
    open: openDrawer,
    close: closeDrawer,
    isOpen: () => document.body.classList.contains("drawer-open"),
    focusables: drawerFocusables,
  };
})();

(function initNavbar() {
  const carousel = document.getElementById("carousel");
  const items = Array.from(document.querySelectorAll(".navItem"));
  if (!carousel || items.length === 0) return;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const safeFocus = (el) => {
    try {
      el.focus({ preventScroll: true });
    } catch {
      el.focus();
    }
  };

  const initialView = document.body.dataset.view || "dashboard";
  let activeIndex = items.findIndex((i) => i.dataset.page === initialView);
  if (activeIndex < 0) activeIndex = 0;
  let focusedIndex = activeIndex;
  let lastSfxView = initialView;

  function setFocused(nextIndex, { focus = true, scroll = true } = {}) {
    focusedIndex = clamp(nextIndex, 0, items.length - 1);

    setMode("nav");

    items.forEach((i) => i.classList.remove("focused"));
    const el = items[focusedIndex];
    el.classList.add("focused");

    if (scroll) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    if (focus) safeFocus(el);
  }

  function setActive(nextIndex, { navigate = true } = {}) {
    activeIndex = clamp(nextIndex, 0, items.length - 1);

    items.forEach((i) => {
      i.classList.remove("active");
      i.setAttribute("aria-selected", "false");
    });

    const el = items[activeIndex];
    el.classList.add("active");
    el.setAttribute("aria-selected", "true");

    const pageName = el.dataset.page;
    if (pageName) setView(pageName);

    if (!document.body.classList.contains("booting") && pageName && lastSfxView && pageName !== lastSfxView) {
      SFX.playSwitch();
    }
    if (pageName) lastSfxView = pageName;

    const label = el.querySelector("span")?.textContent?.trim();
    if (label) document.title = `Studium \u2014 ${label}`;

    const viewInfo = document.getElementById("viewInfo");
    if (viewInfo) {
      viewInfo.classList.remove("viewInfo--show");
      viewInfo.hidden = true;
    }

    if (pageName && typeof window.setWallpaperForView === "function") window.setWallpaperForView(pageName);

    if (navigate && pageName) {
      if (typeof window.studiumRoutePush === "function") window.studiumRoutePush(pageName);
      else window.location.assign(`/${pageName}`);
    }
  }

  window.navApi = {
    focus: (idx) => {
      setMode("nav");
      setFocused(idx, { focus: true, scroll: true });
      setActive(focusedIndex, { navigate: true });
    },
    move: (dir) => {
      setMode("nav");
      setFocused(focusedIndex + dir, { focus: true, scroll: true });
      setActive(focusedIndex, { navigate: true });
    },
    focusCurrent: () => setFocused(focusedIndex ?? activeIndex, { focus: true, scroll: true }),
  };

  items.forEach((item, idx) => {
    item.addEventListener("click", () => {
      if (document.body.classList.contains("booting")) return;
      setMode("nav");
      setFocused(idx, { focus: true, scroll: true });
      setActive(idx, { navigate: true });
    });
    item.addEventListener("focus", () => setFocused(idx, { focus: false, scroll: true }));
  });

  carousel.addEventListener(
    "wheel",
    (e) => {
      if (document.body.classList.contains("booting")) return;
      if (Math.abs(e.deltaY) < 2 && Math.abs(e.deltaX) < 2) return;
      e.preventDefault();

      const dir = e.deltaY !== 0 ? Math.sign(e.deltaY) : Math.sign(e.deltaX);
      setFocused(focusedIndex + dir, { focus: true, scroll: true });
      setActive(focusedIndex, { navigate: true });
    },
    { passive: false }
  );

  // Keyboard navigation is handled by initKeyboardRouterV2().

  window.clearNavFocus = () => items.forEach((i) => i.classList.remove("focused"));
  window.focusNavMenu = () => {
    if (document.body.classList.contains("booting")) return;
    setFocused(focusedIndex ?? activeIndex, { focus: true, scroll: true });
  };

  setActive(activeIndex, { navigate: false });
  setFocused(activeIndex, { focus: false, scroll: true });
})();

(function initContentBindings() {
  const nextByKey = {
    "grid-leftTop": { up: "userMenuBtn", down: "grid-streak", right: "grid-quest1" },
    "grid-streak": { up: "userMenuBtn", right: "grid-quick" },
    "grid-quick": { up: "userMenuBtn", left: "grid-streak", right: "grid-quest3" },
    "grid-quest1": { up: "userMenuBtn", left: "grid-leftTop", right: "grid-widget", down: "grid-quest2" },
    "grid-quest2": { up: "userMenuBtn", left: "grid-quick", right: "grid-widget", down: "grid-quest3" },
    "grid-quest3": { up: "userMenuBtn", left: "grid-quick", right: "grid-widget", down: "grid-quest4" },
    "grid-quest4": { up: "userMenuBtn", left: "grid-quick", right: "grid-widget" },
    "grid-widget": { up: "viewLabel", left: "grid-quest1" },
  };

  const ids = Object.keys(nextByKey);
  let lastGridId = "grid-streak";

  const enterContentMode = () => {
    setMode("grid");
    if (typeof window.clearNavFocus === "function") window.clearNavFocus();
  };

  function bindGrid(items) {
    if (items.length === 0) {
      window.dashboardGridApi = null;
      return;
    }

    if (!items.some((el) => el.id === lastGridId)) {
      lastGridId = items.find((el) => el.id === "grid-streak")?.id || items[0].id;
    }

    items.forEach((el) => {
      if (el.dataset.studiumBound === "grid") return;
      el.dataset.studiumBound = "grid";

      el.addEventListener("focus", () => {
        lastGridId = el.id;
        enterContentMode();
      });
      el.addEventListener("pointerdown", () => {
        if (typeof SFX?.playGridMove === "function") SFX.playGridMove();
        enterContentMode();
      });
    });

    const focusGrid = (id) => {
      const el = document.getElementById(id) || document.getElementById(lastGridId) || items[0];
      if (!el) return false;
      enterContentMode();
      try {
        el.focus({ preventScroll: true });
      } catch {
        el.focus();
      }
      return true;
    };

    window.dashboardGridApi = {
      focus: focusGrid,
      focusEntry: () => focusGrid("grid-streak"),
      map: nextByKey,
    };
  }

  function bindPageFocus(shells) {
    if (shells.length === 0) {
      window.pageFocusApi = null;
      return;
    }

    shells.forEach((el) => {
      if (el.dataset.studiumBound === "pageFocus") return;
      el.dataset.studiumBound = "pageFocus";

      el.addEventListener("focus", () => {
        enterContentMode();
      });
      el.addEventListener("pointerdown", () => {
        if (typeof SFX?.playGridMove === "function") SFX.playGridMove();
        enterContentMode();
      });
    });

    window.pageFocusApi = {
      focusCurrent: () => {
        const shell = document.querySelector(".pageFocus");
        if (!shell) return false;
        enterContentMode();
        try {
          shell.focus({ preventScroll: true });
        } catch {
          shell.focus();
        }
        return true;
      },
    };
  }

  window.studiumReinitContent = () => {
    const gridItems = ids.map((id) => document.getElementById(id)).filter(Boolean);
    bindGrid(gridItems);
    const shells = Array.from(document.querySelectorAll(".pageFocus"));
    bindPageFocus(shells);
  };

  window.studiumReinitContent();
})();

(function initKeyboardRouterV2() {
  const focusEl = (el) => {
    if (!el) return false;
    try {
      el.focus({ preventScroll: true });
    } catch {
      el.focus();
    }
    return true;
  };

  const focusById = (id) => focusEl(document.getElementById(id));

  const focusNav = () => {
    setMode("nav");
    if (typeof window.focusNavMenu === "function") return window.focusNavMenu();
    return focusEl(document.querySelector(".navItem.active"));
  };

  const focusContentEntry = () => {
    const api = window.dashboardGridApi;
    if (api?.focusEntry) return api.focusEntry();

    if (window.pageFocusApi?.focusCurrent) return window.pageFocusApi.focusCurrent();
    const shell = document.querySelector(".pageFocus");
    if (!shell) return false;
    setMode("grid");
    if (typeof window.clearNavFocus === "function") window.clearNavFocus();
    return focusEl(shell);
  };

  const navMove = (dir) => {
    if (window.navApi?.move) return window.navApi.move(dir);

    const items = Array.from(document.querySelectorAll(".navItem"));
    if (items.length === 0) return;
    let cur = items.findIndex((i) => i.classList.contains("focused"));
    if (cur < 0) cur = items.findIndex((i) => i.classList.contains("active"));
    if (cur < 0) cur = 0;
    const next = Math.max(0, Math.min(items.length - 1, cur + dir));
    items[next].click();
  };

  const getZone = () => {
    if (document.body.classList.contains("drawer-open")) return "drawer";
    const ae = document.activeElement;
    if (ae?.closest?.("#profileDrawer")) return "drawer";
    if (ae?.id === "userMenuBtn" || ae?.id === "viewLabel") return "header";
    if (ae?.classList?.contains("gridCard")) return "grid";
    if (ae?.classList?.contains("pageFocus")) return "page";
    return "nav";
  };

  const drawerMove = (dir) => {
    const api = window.profileDrawerApi;
    const focusables = api?.focusables?.() || [];
    if (focusables.length === 0) return;
    const idx = focusables.indexOf(document.activeElement);
    const cur = idx >= 0 ? idx : 0;
    const next = (cur + dir + focusables.length) % focusables.length;
    focusEl(focusables[next]);
  };

  const gridMove = (key) => {
    const api = window.dashboardGridApi;
    const map = api?.map;
    const id = document.activeElement?.id;
    if (!map || !id || !id.startsWith("grid-")) return false;

    const next = map[id]?.[key];
    if (!next) return false;

    if (next === "userMenuBtn" || next === "viewLabel") {
      if (typeof SFX?.playHeaderMove === "function") SFX.playHeaderMove();
      setMode("grid");
      if (typeof window.clearNavFocus === "function") window.clearNavFocus();
      return focusById(next);
    }

    if (typeof SFX?.playGridMove === "function") SFX.playGridMove();
    return api.focus(next);
  };

  document.addEventListener(
    "keydown",
    (e) => {
      if (document.body.classList.contains("booting")) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (isTypingTarget(document.activeElement)) return;

      const key = e.key;
      const isArrow =
        key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown" || key === "Escape";
      if (!isArrow) return;

      const zone = getZone();

      // Drawer
      if (zone === "drawer") {
        e.preventDefault();
        e.stopPropagation();

        if (key === "Escape") {
          if (typeof SFX?.playHeaderMove === "function") SFX.playHeaderMove();
          window.profileDrawerApi?.close?.();
          focusById("userMenuBtn");
          return;
        }

        if (typeof SFX?.playHeaderMove === "function") SFX.playHeaderMove();
        if (key === "ArrowDown" || key === "ArrowRight") drawerMove(1);
        else if (key === "ArrowUp" || key === "ArrowLeft") drawerMove(-1);
        return;
      }

      // Header
      if (zone === "header") {
        e.preventDefault();
        e.stopPropagation();

        if (key === "Escape") {
          if (typeof SFX?.playSwitch === "function") SFX.playSwitch();
          focusNav();
          return;
        }

        if (key === "ArrowDown") {
          if (typeof SFX?.playGridMove === "function") SFX.playGridMove();
          focusContentEntry();
          return;
        }

        if (key === "ArrowLeft" || key === "ArrowRight") {
          if (typeof SFX?.playHeaderMove === "function") SFX.playHeaderMove();
          const cur = document.activeElement?.id;
          if (cur === "userMenuBtn") focusById("viewLabel");
          else focusById("userMenuBtn");
          return;
        }

        return;
      }

      // Dashboard grid
      if (zone === "grid") {
        e.preventDefault();
        e.stopPropagation();

        if (key === "Escape") {
          if (typeof SFX?.playSwitch === "function") SFX.playSwitch();
          focusNav();
          return;
        }

        if (key === "ArrowDown") {
          const moved = gridMove("down");
          if (!moved) {
            if (typeof SFX?.playSwitch === "function") SFX.playSwitch();
            focusNav();
          }
          return;
        }

        if (key === "ArrowUp") return void gridMove("up");
        if (key === "ArrowLeft") return void gridMove("left");
        if (key === "ArrowRight") return void gridMove("right");
        return;
      }

      // Page content (non-dashboard)
      if (zone === "page") {
        e.preventDefault();
        e.stopPropagation();

        if (key === "ArrowUp") {
          if (typeof SFX?.playHeaderMove === "function") SFX.playHeaderMove();
          focusById("userMenuBtn");
          return;
        }

        if (key === "ArrowDown" || key === "Escape") {
          if (typeof SFX?.playSwitch === "function") SFX.playSwitch();
          focusNav();
          return;
        }

        return;
      }

      // Nav (default)
      if (zone === "nav") {
        if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp") {
          e.preventDefault();
          e.stopPropagation();
        } else {
          return;
        }

        if (key === "ArrowLeft") navMove(-1);
        else if (key === "ArrowRight") navMove(1);
        else if (key === "ArrowUp") {
          if (typeof SFX?.playGridMove === "function") SFX.playGridMove();
          focusContentEntry();
        }
      }
    },
    true
  );
})();
