"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import styles from "./schedules-grid.module.css";
import type { PlannerEvent, QuestPriority } from "./planner-storage";
import { addEvent, deleteEvent, loadEvents, onPlannerUpdated } from "./planner-storage";

function dateKey(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function formatMonth(d: Date) {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function eventDayKey(e: PlannerEvent) {
  const d = new Date(e.startAt);
  if (Number.isNaN(d.getTime())) return "";
  return dateKey(d);
}

function formatTime(dt: string) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function scrollNearest(el: HTMLElement | null) {
  if (!el) return;
  try {
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
  } catch {
    // ignore
  }
}

export default function SchedulesGrid() {
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => dateKey(new Date()));
  const [filter, setFilter] = useState<"all" | "quest" | "personal" | "high" | "medium" | "low">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<QuestPriority>("medium");
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const sync = () => setEvents(loadEvents());
    sync();
    return onPlannerUpdated(sync);
  }, []);

  useEffect(() => {
    setPortalRoot(document.getElementById("routeOutlet") || document.body);
  }, []);

  useEffect(() => {
    if (!addOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAddOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [addOpen]);

  useEffect(() => {
    if (!addOpen) return;
    document.body.classList.add("modal-open");
    const api = { close: () => setAddOpen(false) };
    (window as any).studiumModalApi = api;

    const raf = requestAnimationFrame(() => titleRef.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("modal-open");
      if ((window as any).studiumModalApi === api) delete (window as any).studiumModalApi;
    };
  }, [addOpen]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, PlannerEvent[]>();
    for (const e of events) {
      const k = eventDayKey(e);
      if (!k) continue;
      const list = map.get(k) ?? [];
      list.push(e);
      map.set(k, list);
    }
    for (const [k, list] of map) {
      list.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
      map.set(k, list);
    }
    return map;
  }, [events]);

  const selectedEvents = eventsByDay.get(selected) ?? [];
  const filteredSelectedEvents = useMemo(() => {
    if (filter === "all") return selectedEvents;
    if (filter === "quest") return selectedEvents.filter((e) => Boolean(e.questId));
    if (filter === "personal") return selectedEvents.filter((e) => !e.questId);
    return selectedEvents.filter((e) => (e.priority || "medium") === filter);
  }, [filter, selectedEvents]);

  const monthDays = useMemo(() => {
    const first = startOfMonth(month);
    const startDow = (first.getDay() + 6) % 7; // Monday=0
    const gridStart = addDays(first, -startDow);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [month]);

  const submitEvent = () => {
    if (!title.trim()) return;
    const start = new Date(`${selected}T${time || "09:00"}:00`);
    const startAt = Number.isNaN(start.getTime()) ? new Date().toISOString() : start.toISOString();
    addEvent({ title: title.trim(), startAt, notes: notes.trim() || undefined, durationMin: 60, priority });
    setTitle("");
    setNotes("");
    setPriority("medium");
    setAddOpen(false);
  };

  return (
    <div className={styles.page} aria-label="Schedule page">
      <div className={styles.topBar}>
        <div>
          <div className={styles.title}>Schedule</div>
          <div className={styles.sub}>Calendar + day plan. Quest milestones appear here automatically.</div>
        </div>
        <button className={styles.actionBtn} type="button" onClick={() => setAddOpen(true)} aria-label="Add event" data-focus="schedules.add">
          <i className="fa-solid fa-plus" aria-hidden="true"></i>
          Add event
        </button>
      </div>

      <div className={styles.body}>
        <section className={styles.left} aria-label="Calendar">
          <div className={styles.cardHead}>
            <div className={styles.cardTitle}>{formatMonth(month)}</div>
            <div className={styles.monthBtns}>
              <button
                className={styles.iconBtn}
                type="button"
                onClick={() => setMonth((m) => startOfMonth(addDays(m, -1)))}
                aria-label="Previous month"
                data-focus="schedules.prevMonth"
              >
                <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
              </button>
              <button className={styles.ghostBtn} type="button" onClick={() => setMonth(startOfMonth(new Date()))} aria-label="Today" data-focus="schedules.today">
                Today
              </button>
              <button
                className={styles.iconBtn}
                type="button"
                onClick={() => setMonth((m) => startOfMonth(addDays(m, 32)))}
                aria-label="Next month"
                data-focus="schedules.nextMonth"
              >
                <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div className={styles.calendar} aria-label="Month calendar">
            <div className={styles.calGrid} aria-hidden="true">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className={styles.dow}>
                  {d}
                </div>
              ))}
            </div>
            <div className={styles.calGrid}>
              {monthDays.map((d) => {
                const inMonth = d.getMonth() === month.getMonth();
                const key = dateKey(d);
                const count = (eventsByDay.get(key) ?? []).length;
                const active = key === selected;
                const isToday = sameDay(d, new Date());
                const focusKey = active ? "schedules.agenda" : `schedules.day.${key}`;
                return (
                  <button
                    key={key}
                    className={[styles.day, !inMonth ? styles.dayMuted : "", active ? styles.dayActive : "", isToday ? styles.dayToday : ""].join(" ")}
                    type="button"
                    onClick={() => setSelected(key)}
                    onFocus={(e) => {
                      setSelected(key);
                      scrollNearest(e.currentTarget);
                    }}
                    aria-label={`Select ${d.toDateString()}`}
                    data-focus={focusKey}
                  >
                    <div className={styles.dayTop}>
                      <div className={styles.dayNum}>{d.getDate()}</div>
                      <div className={styles.dots} aria-hidden="true">
                        {count > 0 ? Array.from({ length: Math.min(3, count) }).map((_, i) => <span key={i} className={styles.dot} />) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.right} aria-label="Day details">
          <div className={styles.cardHead}>
            <div>
              <div className={styles.cardTitle}>{selected}</div>
              <div className={styles.cardSub}>
                {filteredSelectedEvents.length ? `${filteredSelectedEvents.length} event(s)` : "No events yet."}
                {filter !== "all" ? " | filtered" : ""}
              </div>
            </div>
            <select
              className={styles.filterSelect}
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              aria-label="Filter events"
              data-focus="schedules.filter"
            >
              <option value="all">All</option>
              <option value="quest">Quest milestones</option>
              <option value="personal">Personal</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
          </div>

          <div className={styles.events} aria-label="Events list">
            {filteredSelectedEvents.length === 0 ? <div className={styles.empty}>No events for this day.</div> : null}
            {filteredSelectedEvents.map((e) => (
              <div
                key={e.id}
                className={styles.event}
                data-priority={e.priority || "medium"}
                tabIndex={0}
                data-focus={`schedules.event.${e.id}`}
                onFocus={(ev) => scrollNearest(ev.currentTarget)}
              >
                <div className={styles.eventMain}>
                  <div className={styles.eventTitle}>{e.title}</div>
                  <div className={styles.eventMeta}>
                    {formatTime(e.startAt)}
                    {e.durationMin ? ` | ${e.durationMin}m` : ""}
                    {e.questId ? " | Quest" : ""}
                  </div>
                  {e.notes ? <div className={styles.eventNotes}>{e.notes}</div> : null}
                </div>
                <button
                  className={styles.iconBtn}
                  type="button"
                  onClick={() => deleteEvent(e.id)}
                  aria-label="Delete event"
                  data-focus={`schedules.event.delete.${e.id}`}
                >
                  <i className="fa-solid fa-trash" aria-hidden="true"></i>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {addOpen
        ? createPortal(
            <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Add event" onClick={() => setAddOpen(false)}>
              <div className={`${styles.modal} studiumModal`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHead}>
                  <div>
                    <div className={styles.modalTitle}>Add event</div>
                    <div className={styles.modalSub}>Saved events appear on the selected date.</div>
                  </div>
                  <button className={styles.iconBtn} type="button" onClick={() => setAddOpen(false)} aria-label="Close add event">
                    <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                  </button>
                </div>

                <div className={styles.form}>
                  <div className={styles.field}>
                    <div className={styles.label}>Title</div>
                    <input
                      ref={titleRef}
                      className={styles.control}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          submitEvent();
                        }
                      }}
                      placeholder="e.g. Review chapter 3"
                      aria-label="Event title"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <div className={styles.label}>Time</div>
                      <input className={styles.control} type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Event time" />
                    </div>
                    <div className={styles.field}>
                      <div className={styles.label}>Priority</div>
                      <select className={styles.control} value={priority} onChange={(e) => setPriority(e.target.value as QuestPriority)} aria-label="Event priority">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.field}>
                    <div className={styles.label}>Notes</div>
                    <textarea className={styles.textarea} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" />
                  </div>
                  <div className={styles.modalActions}>
                    <button className={styles.actionBtn} type="button" onClick={submitEvent} aria-label="Save event">
                      Save
                    </button>
                    <button className={styles.ghostBtn} type="button" onClick={() => setAddOpen(false)} aria-label="Cancel add event">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            portalRoot ?? document.body
          )
        : null}
    </div>
  );
}
