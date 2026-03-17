"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { bootstrapPlannerFromServer } from "./grids/planner-storage";
import { appData } from "@/lib/app-data";

const VIEW_META = appData.views;

const PLANNER_VIEWS = new Set(["dashboard", "routine", "quest", "schedules"]);

function viewFromPath(pathname: string) {
  const seg = pathname.split("?")[0].split("#")[0].split("/").filter(Boolean)[0] || "dashboard";
  if (seg === "study-room") return "study";
  return VIEW_META[seg] ? seg : "dashboard";
}

export default function RouteBridge() {
  const pathname = usePathname() || "/dashboard";
  const router = useRouter();
  const didMountRef = useRef(false);

  useEffect(() => {
    (window as any).studiumRoutePush = (view: string) => {
      const nextView = VIEW_META[view] ? view : "dashboard";
      const href = appData.navigation.items.find((x) => x.id === nextView)?.href || `/${nextView}`;
      const anyDoc = document as any;
      const currentView = document.body?.dataset?.view || "";
      const wantsScheduleTransition = nextView === "schedules" || currentView === "schedules";

      if (wantsScheduleTransition && typeof anyDoc?.startViewTransition === "function") {
        document.documentElement.classList.add("vt-schedules");
        const vt = anyDoc.startViewTransition(() => {
          router.push(href);
        });
        const cleanup = () => document.documentElement.classList.remove("vt-schedules");
        try {
          vt.finished.then(cleanup, cleanup);
        } catch {
          cleanup();
        }
        return;
      }

      router.push(href);
    };

    const view = viewFromPath(pathname);
    const meta = VIEW_META[view];
    const isFirst = !didMountRef.current;
    didMountRef.current = true;

    document.body.dataset.view = view;
    if (pathname.startsWith("/battle/arena")) document.body.dataset.subview = "battle-arena";
    else if (pathname.startsWith("/notes/new")) document.body.dataset.subview = "notes-editor";
    else if (pathname.startsWith("/study-room")) document.body.dataset.subview = "study-room";
    else document.body.removeAttribute("data-subview");

    try {
      const dock = document.getElementById("arenaDock");
      if (dock) dock.hidden = !(pathname.startsWith("/battle/arena"));
    } catch {
      // ignore
    }
    if (view === "quest" && typeof (window as any).setMode === "function") {
      try {
        sessionStorage.setItem("studium:nav_lock_until", String(Date.now() + 650));
      } catch {
        // ignore
      }

      const focusNav = () => {
        try {
          const ae = document.activeElement as HTMLElement | null;
          if (ae?.closest?.("#routeOutlet")) ae.blur?.();
          (window as any).setMode("nav");
          (window as any).focusNavMenu?.();
        } catch {
          // ignore
        }
      };

      focusNav();
      requestAnimationFrame(focusNav);
      setTimeout(focusNav, 60);
      setTimeout(focusNav, 380);
    }
    const root = document.querySelector<HTMLElement>(".shellRoot");
    if (root?.dataset?.userId) document.body.dataset.userId = root.dataset.userId;
    if (PLANNER_VIEWS.has(view)) void bootstrapPlannerFromServer();
    if (typeof (window as any).applyStudiumDensity === "function") (window as any).applyStudiumDensity();
    if (typeof (window as any).applyViewTint === "function") (window as any).applyViewTint(view);

    const viewLabel = document.getElementById("viewLabel");
    if (viewLabel) viewLabel.textContent = meta.label;

    const viewInfoTitle = document.getElementById("viewInfoTitle");
    if (viewInfoTitle) viewInfoTitle.textContent = meta.label;

    const viewInfoDesc = document.getElementById("viewInfoDesc");
    if (viewInfoDesc) viewInfoDesc.textContent = meta.desc;

    const navItems = Array.from(document.querySelectorAll<HTMLElement>(".navItem"));
    navItems.forEach((el) => {
      const isActive = el.dataset.page === view;
      el.classList.toggle("active", isActive);
      el.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    if (typeof (window as any).setWallpaperForView === "function") {
      (window as any).setWallpaperForView(view);
    }

    const requestBoot = (opts: any) => {
      const w = window as any;
      if (typeof w.studiumBoot === "function") {
        w.studiumBoot(opts);
        return;
      }
      if (!Array.isArray(w.__studiumBootQueue)) w.__studiumBootQueue = [];
      w.__studiumBootQueue.push(opts);
    };

    // Boot animation on Focus Mode entry (every time the shell mounts).
    try {
      if (isFirst) requestBoot({ mode: "enter", showWelcome: true, playSound: true });
    } catch {
      // ignore
    }

    // Optional "boot" transition when switching pages within Focus Mode.
    try {
      if (!isFirst) {
        const key = "studium:pref_boot_on_nav";
        const stored = localStorage.getItem(key);
        // Default OFF: the nav boot overlay can feel like a page fade.
        const enabled = stored === "1";
        if (enabled) requestBoot({ mode: "nav", showWelcome: false, playSound: false });
      }
    } catch {
      // ignore
    }

    // Re-bind grid/page focus listeners after route swaps content.
    if (typeof (window as any).studiumReinitContent === "function") {
      (window as any).studiumReinitContent();
    }

    // If something set a pending focus target (e.g. Quick Settings shortcut),
    // focus it once the new route content exists.
    try {
      const pending = sessionStorage.getItem("studium:pending_focus") || "";
      if (pending) {
        sessionStorage.removeItem("studium:pending_focus");
        requestAnimationFrame(() => (window as any).studiumGridApi?.focusByKey?.(pending));
      }
    } catch {
      // ignore
    }
  }, [pathname, router]);

  return null;
}
