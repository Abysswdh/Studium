"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const VIEW_META: Record<string, { label: string; desc: string }> = {
  dashboard: { label: "Dashboard", desc: "Your daily snapshot: routine, quests, streaks, and widgets." },
  routine: { label: "Routine", desc: "Now / Next / Later — turn deadlines into concrete steps." },
  quest: { label: "Quest", desc: "Pick quests, set difficulty, earn XP & streaks." },
  schedules: { label: "Schedule", desc: "Agenda + deadlines that feed your routine." },
  notes: { label: "Notes", desc: "Capture quick notes tied to your quests and sessions." },
  study: { label: "Study Room", desc: "Start a session: focus, review, and capture." },
  pomodoro: { label: "Pomodoro", desc: "Timer + co-op focus sessions linked to tasks." },
  battle: { label: "Battle", desc: "1v1 quizzes from a question bank. Win, rank up, repeat." },
  guild: { label: "Guild", desc: "Group study rooms, co-focus, chat, accountability." },
  match: { label: "Options", desc: "Settings, preferences, and app options." },
};

function viewFromPath(pathname: string) {
  const seg = pathname.split("?")[0].split("#")[0].split("/").filter(Boolean)[0] || "dashboard";
  return VIEW_META[seg] ? seg : "dashboard";
}

export default function RouteBridge() {
  const pathname = usePathname() || "/dashboard";
  const router = useRouter();

  useEffect(() => {
    (window as any).studiumRoutePush = (view: string) => {
      const nextView = VIEW_META[view] ? view : "dashboard";
      router.push(`/${nextView}`);
    };

    const view = viewFromPath(pathname);
    const meta = VIEW_META[view];

    document.body.dataset.view = view;

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

    // Re-bind grid/page focus listeners after route swaps content.
    if (typeof (window as any).studiumReinitContent === "function") {
      (window as any).studiumReinitContent();
    }
  }, [pathname, router]);

  return null;
}
