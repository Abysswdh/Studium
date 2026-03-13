"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import styles from "./quest-grid.module.css";
import type { Quest, QuestPriority, QuestType } from "./planner-storage";
import type { PlannerEvent } from "./planner-storage";
import { addQuest, createQuest, deleteQuest, loadEvents, loadQuests, onPlannerUpdated, toggleStageDone } from "./planner-storage";

function formatShort(dt?: string) {
  if (!dt) return "—";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "2-digit" });
}

function normalizePriority(p?: QuestPriority): QuestPriority {
  return p ?? "medium";
}

function priorityLabel(p: QuestPriority) {
  if (p === "high") return "High";
  if (p === "low") return "Low";
  return "Medium";
}

function typeLabel(t: QuestType) {
  if (t === "assignment") return "Assignment";
  if (t === "exam") return "Exam";
  return "Routine";
}

function rankFrom(type: QuestType, priority: QuestPriority) {
  const base = type === "exam" ? 2 : type === "assignment" ? 1 : 0; // C,B,A,S -> 0..3
  const delta = priority === "high" ? 1 : priority === "low" ? -1 : 0;
  const idx = Math.max(0, Math.min(3, base + delta));
  return (["C", "B", "A", "S"] as const)[idx];
}

function xpPotential(type: QuestType, priority: QuestPriority, stagesCount: number) {
  const base = type === "exam" ? 220 : type === "assignment" ? 180 : 120;
  const mult = priority === "high" ? 1.2 : priority === "low" ? 0.9 : 1.0;
  const raw = base * mult + Math.max(0, stagesCount) * 10;
  return Math.round(raw / 5) * 5;
}

function questProgress(q: Quest) {
  const total = q.stages.length || 1;
  const done = q.stages.filter((s) => s.done).length;
  return Math.round((done / total) * 100);
}

function scrollNearest(el: HTMLElement | null) {
  if (!el) return;
  try {
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
  } catch {
    // ignore
  }
}

type QuestView = "hub" | "detail";

export default function QuestGrid() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<QuestView>("hub");

  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [type, setType] = useState<QuestType>("assignment");
  const [priority, setPriority] = useState<QuestPriority>("medium");
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [dueAt, setDueAt] = useState("");

  useEffect(() => {
    const sync = () => {
      const q = loadQuests();
      const e = loadEvents();
      setQuests(q);
      setEvents(e);
      setSelectedId((prev) => {
        if (!prev && q[0]) return q[0].id;
        if (prev && !q.some((x) => x.id === prev)) return q[0]?.id ?? null;
        return prev;
      });
    };
    sync();
    return onPlannerUpdated(sync);
  }, []);

  const selected = useMemo(() => quests.find((q) => q.id === selectedId) ?? null, [quests, selectedId]);

  const selectedMeta = useMemo(() => {
    if (!selected) return null;
    const p = normalizePriority(selected.priority);
    const progress = questProgress(selected);
    const potential = xpPotential(selected.type, p, selected.stages.length);
    const earned = Math.round((potential * progress) / 100);
    return { p, progress, rank: rankFrom(selected.type, p), potential, earned };
  }, [selected]);

  useEffect(() => {
    if (view === "detail") document.body.classList.add("quest-detail");
    else document.body.classList.remove("quest-detail");
    return () => document.body.classList.remove("quest-detail");
  }, [view]);

  useEffect(() => {
    (window as any).questDetailApi = (window as any).questDetailApi || {};
    if (view === "detail") {
      (window as any).questDetailApi.back = () => setView("hub");
    } else if ((window as any).questDetailApi?.back) {
      delete (window as any).questDetailApi.back;
    }
    return () => {
      if ((window as any).questDetailApi?.back) delete (window as any).questDetailApi.back;
    };
  }, [view]);

  useEffect(() => {
    if (!generatorOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGeneratorOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [generatorOpen]);

  const submit = () => {
    const { quest, events } = createQuest({ type, priority, title, context, dueAt: dueAt || undefined });
    addQuest(quest, events);
    setSelectedId(quest.id);
    setTitle("");
    setContext("");
    setDueAt("");
    setPriority("medium");
    setGeneratorOpen(false);
  };

  const openDetail = () => {
    if (!selected) return;
    setView("detail");
  };

  const completed = selected ? selected.stages.every((s) => s.done) : false;
  const questEvents = useMemo(() => {
    if (!selected) return [];
    return events
      .filter((e) => e.questId === selected.id)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [events, selected]);

  const nextMilestones = useMemo(() => {
    if (!selected) return [];
    return selected.stages
      .filter((s) => !s.done)
      .sort((a, b) => new Date(a.dueAt || 0).getTime() - new Date(b.dueAt || 0).getTime())
      .slice(0, 3);
  }, [selected]);

  const activeStages = useMemo(() => (selected ? selected.stages.filter((s) => !s.done) : []), [selected]);
  const doneStages = useMemo(() => (selected ? selected.stages.filter((s) => s.done) : []), [selected]);
  const stageXp = selected && selectedMeta ? Math.max(10, Math.round(selectedMeta.potential / Math.max(1, selected.stages.length))) : 10;

  return (
    <div className={[styles.page, view === "detail" ? styles.pageDetail : ""].join(" ")} aria-label="Quest page">
      {view === "hub" ? (
        <div className={styles.hub} aria-label="Quest hub">
          <div className={styles.topBar}>
            <div className={styles.brand}>
              <div className={styles.brandTitle}>Quest</div>
              <div className={styles.brandSub}>Pick a mission, set priority, then execute.</div>
            </div>
            <button
              className={styles.actionBtn}
              type="button"
              onClick={() => setGeneratorOpen(true)}
              aria-label="Generate quest"
              data-focus="quest.generate"
            >
              <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i>
              Generate quest
            </button>
          </div>

          <div className={styles.hubBody}>
            <section className={styles.left} aria-label="Mission list">
              <div className={styles.sectionHead}>
                <div className={styles.sectionTitle}>Missions</div>
                <div className={styles.sectionMeta}>{quests.length} total</div>
              </div>
              <div className={styles.missionList}>
                {quests.length === 0 ? (
                  <div className={styles.emptyCard}>
                    <div className={styles.emptyTitle}>No missions yet</div>
                    <div className={styles.emptySub}>Generate a quest to get auto objectives + schedule milestones.</div>
                    <button className={styles.actionBtn} type="button" onClick={() => setGeneratorOpen(true)} data-focus="quest.slot1">
                      Generate quest
                    </button>
                  </div>
                ) : null}

                {quests.map((q, idx) => {
                  const p = normalizePriority(q.priority);
                  const progress = questProgress(q);
                  const rank = rankFrom(q.type, p);
                  const isSelected = q.id === selectedId;
                  const isDone = q.stages.every((s) => s.done);
                  const focusKey = idx === 0 ? "quest.slot1" : `quest.mission${idx + 1}`;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      className={styles.mission}
                      data-type={q.type}
                      data-selected={isSelected ? "1" : "0"}
                      data-done={isDone ? "1" : "0"}
                      onClick={() => setSelectedId(q.id)}
                      onFocus={(e) => {
                        setSelectedId(q.id);
                        scrollNearest(e.currentTarget);
                      }}
                      data-focus={focusKey}
                      aria-label={`Select mission ${q.title}`}
                    >
                      <div className={styles.missionMain}>
                        <div className={styles.missionTitle}>{q.title}</div>
                        <div className={styles.missionMeta}>
                          <span className={styles.pill} data-rank={rank}>
                            Rank {rank}
                          </span>
                          <span className={styles.pill} data-priority={p}>
                            {priorityLabel(p)}
                          </span>
                          <span className={styles.pill}>Due {formatShort(q.dueAt)}</span>
                          {isDone ? <span className={styles.pill} data-done="1">Completed</span> : null}
                        </div>
                      </div>
                      <div className={styles.missionProgress} aria-hidden="true">
                        <div className={styles.rail}>
                          <div className={styles.fill} style={{ width: `${progress}%` }} />
                        </div>
                        <div className={styles.pct}>{progress}%</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={styles.right} aria-label="Selected mission">
              {selected && selectedMeta ? (
                <div className={styles.focusCard} data-type={selected.type} data-priority={selectedMeta.p}>
                  <div className={styles.focusTop}>
                    <div>
                      <div className={styles.focusKicker}>Selected mission</div>
                      <div className={styles.focusTitle}>{selected.title}</div>
                      <div className={styles.focusSub}>
                        {typeLabel(selected.type)} • Rank {selectedMeta.rank} • {priorityLabel(selectedMeta.p)} priority
                      </div>
                    </div>
                    <button
                      className={styles.primaryBtn}
                      type="button"
                      onClick={openDetail}
                      aria-label="Open mission details"
                      data-focus="quest.open"
                    >
                      Open
                      <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                    </button>
                  </div>

                  <div className={styles.focusStats} aria-hidden="true">
                    <div className={styles.stat}>
                      <div className={styles.statLabel}>Progress</div>
                      <div className={styles.statValue}>{selectedMeta.progress}%</div>
                    </div>
                    <div className={styles.stat}>
                      <div className={styles.statLabel}>XP</div>
                      <div className={styles.statValue}>
                        {selectedMeta.earned}/{selectedMeta.potential}
                      </div>
                    </div>
                    <div className={styles.stat}>
                      <div className={styles.statLabel}>Due</div>
                      <div className={styles.statValue}>{formatShort(selected.dueAt)}</div>
                    </div>
                  </div>

                  <div className={styles.focusBar} aria-hidden="true">
                    <div className={styles.rail}>
                      <div className={styles.fill} style={{ width: `${selectedMeta.progress}%` }} />
                    </div>
                  </div>

                  <div className={styles.peek}>
                    <div className={styles.peekHead}>
                      <div className={styles.peekTitle}>Objectives</div>
                      <div className={styles.peekMeta}>{selected.stages.filter((s) => s.done).length}/{selected.stages.length}</div>
                    </div>
                    <div className={styles.peekList}>
                      {selected.stages.slice(0, 5).map((s) => (
                        <div key={s.id} className={styles.peekItem} data-done={s.done ? "1" : "0"}>
                          <span className={styles.peekDot} aria-hidden="true" />
                          <span className={styles.peekText}>{s.title}</span>
                        </div>
                      ))}
                      {selected.stages.length > 5 ? <div className={styles.peekMore}>+{selected.stages.length - 5} more…</div> : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyCard}>
                  <div className={styles.emptyTitle}>Select a mission</div>
                  <div className={styles.emptySub}>Choose a mission on the left to see details.</div>
                </div>
              )}
            </section>
          </div>
        </div>
      ) : (
        <div className={styles.detail} aria-label="Mission details page">
          <div className={styles.detailTopBar}>
            <button className={styles.backBtn} type="button" onClick={() => setView("hub")} aria-label="Back to quest hub" data-focus="quest.back">
              <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
              Back
            </button>
            <div className={styles.detailTitleWrap}>
              <div className={styles.detailKicker}>Mission details</div>
              <div className={styles.detailTitle}>{selected?.title || "Mission"}</div>
            </div>
            <div />
          </div>

          {selected && selectedMeta ? (
            <div className={styles.detailBody}>
              <div className={styles.detailLeft} aria-label="Mission overview and completed">
                <div className={styles.detailSummary} data-type={selected.type} data-priority={selectedMeta.p}>
                  <div className={styles.summaryRow}>
                    <span className={styles.pill} data-rank={selectedMeta.rank}>
                      Rank {selectedMeta.rank}
                    </span>
                    <span className={styles.pill} data-priority={selectedMeta.p}>
                      {priorityLabel(selectedMeta.p)}
                    </span>
                    <span className={styles.pill}>Due {formatShort(selected.dueAt)}</span>
                    <span className={styles.pill}>
                      XP {selectedMeta.earned}/{selectedMeta.potential}
                    </span>
                    {completed ? (
                      <span className={styles.pill} data-done="1">
                        Completed
                      </span>
                    ) : null}
                  </div>

                  {selected.context ? <div className={styles.noteBox}>{selected.context}</div> : null}

                  <div className={styles.bigProgress} aria-hidden="true">
                    <div className={styles.bigPct}>{selectedMeta.progress}%</div>
                    <div className={styles.rail}>
                      <div className={styles.fill} style={{ width: `${selectedMeta.progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className={styles.completedCard} aria-label="Completed objectives" data-type={selected.type} data-priority={selectedMeta.p}>
                  <div className={styles.objectivesHead}>
                    <div className={styles.objectivesTitle}>Completed</div>
                    <div className={styles.objectivesMeta}>{doneStages.length}/{selected.stages.length}</div>
                  </div>
                  <div className={styles.objectivesList}>
                    {doneStages.length === 0 ? <div className={styles.completedEmpty}>No completed objectives yet.</div> : null}
                    {doneStages.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        className={styles.objectiveBtn}
                        data-done="1"
                        role="checkbox"
                        aria-checked={true}
                        onClick={() => toggleStageDone(selected.id, s.id)}
                        aria-label={`Mark ${s.title} as not done`}
                        data-focus={`quest.done${idx + 1}`}
                        onFocus={(e) => scrollNearest(e.currentTarget)}
                      >
                        <span className={styles.checkMark} aria-hidden="true">
                          <i className="fa-solid fa-check"></i>
                        </span>
                        <span className={styles.objectiveText}>
                          <span className={styles.objectiveTitle}>{s.title}</span>
                          <span className={styles.objectiveMeta}>Target {formatShort(s.dueAt)}</span>
                        </span>
                        <span className={styles.objectiveXp} aria-hidden="true">
                          +{stageXp} XP
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.objectives} aria-label="Active objectives list" data-type={selected.type} data-priority={selectedMeta.p}>
                <div className={styles.objectivesHead}>
                  <div className={styles.objectivesTitle}>Objectives</div>
                  <div className={styles.objectivesMeta}>Finish to clear Schedule milestones</div>
                </div>
                <div className={styles.objectivesList}>
                  {activeStages.length === 0 ? <div className={styles.completedEmpty}>All objectives complete.</div> : null}
                  {activeStages.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        className={styles.objectiveBtn}
                        data-done="0"
                        role="checkbox"
                        aria-checked={false}
                        onClick={() => toggleStageDone(selected.id, s.id)}
                        aria-label={`Mark ${s.title} as done`}
                        data-focus={`quest.obj${idx + 1}`}
                        onFocus={(e) => scrollNearest(e.currentTarget)}
                      >
                      <span className={styles.checkMark} aria-hidden="true" data-state="off">
                        <span className={styles.checkInner} />
                      </span>
                      <span className={styles.objectiveText}>
                        <span className={styles.objectiveTitle}>{s.title}</span>
                        <span className={styles.objectiveMeta}>Target {formatShort(s.dueAt)}</span>
                      </span>
                      <span className={styles.objectiveXp} aria-hidden="true">
                        +{stageXp} XP
                      </span>
                    </button>
                  ))}
                </div>

                <div className={styles.detailActions}>
                  <button className={styles.dangerBtn} type="button" onClick={() => deleteQuest(selected.id)} aria-label="Delete mission" data-focus="quest.delete">
                    <i className="fa-solid fa-trash" aria-hidden="true"></i>
                    Delete mission
                  </button>
                </div>
              </div>

              <aside className={styles.detailSide} aria-label="Mission intel">
                <div className={styles.sideCard}>
                  <div className={styles.sideTitle}>Mission intel</div>
                  <div className={styles.sideRows}>
                    <div className={styles.sideRow}>
                      <span className={styles.sideLabel}>Type</span>
                      <span className={styles.sideValue}>{typeLabel(selected.type)}</span>
                    </div>
                    <div className={styles.sideRow}>
                      <span className={styles.sideLabel}>Priority</span>
                      <span className={styles.sideValue}>{priorityLabel(selectedMeta.p)}</span>
                    </div>
                    <div className={styles.sideRow}>
                      <span className={styles.sideLabel}>Created</span>
                      <span className={styles.sideValue}>{formatShort(selected.createdAt)}</span>
                    </div>
                    <div className={styles.sideRow}>
                      <span className={styles.sideLabel}>Due</span>
                      <span className={styles.sideValue}>{formatShort(selected.dueAt)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.sideCard}>
                  <div className={styles.sideTitle}>Next objectives</div>
                  <div className={styles.miniList}>
                    {nextMilestones.length === 0 ? <div className={styles.miniEmpty}>All objectives complete.</div> : null}
                    {nextMilestones.map((s) => (
                      <div key={s.id} className={styles.miniItem}>
                        <span className={styles.miniDot} aria-hidden="true" />
                        <span className={styles.miniText}>{s.title}</span>
                        <span className={styles.miniMeta}>{formatShort(s.dueAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.sideCard}>
                  <div className={styles.sideTitle}>Schedule sync</div>
                  <div className={styles.sideHint}>Quest milestones are added to Schedule automatically. Completing the mission removes them.</div>
                  <div className={styles.sideRows}>
                    <div className={styles.sideRow}>
                      <span className={styles.sideLabel}>Planned</span>
                      <span className={styles.sideValue}>{questEvents.length} item(s)</span>
                    </div>
                    <div className={styles.sideRow}>
                      <span className={styles.sideLabel}>Next</span>
                      <span className={styles.sideValue}>{questEvents[0] ? formatShort(questEvents[0].startAt) : "—"}</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <div className={styles.emptyCard}>
              <div className={styles.emptyTitle}>No mission selected</div>
              <div className={styles.emptySub}>Go back and select a mission.</div>
            </div>
          )}
        </div>
      )}

      {generatorOpen
        ? createPortal(
            <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Generate quest" onClick={() => setGeneratorOpen(false)}>
              <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHead}>
                  <div>
                    <div className={styles.modalTitle}>Generate quest</div>
                    <div className={styles.modalSub}>Auto creates objectives and schedule milestones.</div>
                  </div>
                  <button className={styles.iconBtn} type="button" onClick={() => setGeneratorOpen(false)} aria-label="Close generator">
                    <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                  </button>
                </div>

                <div className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <div className={styles.label}>Type</div>
                      <select className={styles.control} value={type} onChange={(e) => setType(e.target.value as QuestType)} aria-label="Quest type">
                        <option value="assignment">Assignment</option>
                        <option value="exam">Exam</option>
                        <option value="routine">Daily routine</option>
                      </select>
                    </div>
                    <div className={styles.field}>
                      <div className={styles.label}>Priority</div>
                      <select className={styles.control} value={priority} onChange={(e) => setPriority(e.target.value as QuestPriority)} aria-label="Quest priority">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <div className={styles.label}>Due</div>
                    <input className={styles.control} type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} aria-label="Due date" />
                  </div>

                  <div className={styles.field}>
                    <div className={styles.label}>Title</div>
                    <input className={styles.control} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Database assignment" aria-label="Quest title" />
                  </div>

                  <div className={styles.field}>
                    <div className={styles.label}>Notes</div>
                    <textarea className={styles.textarea} value={context} onChange={(e) => setContext(e.target.value)} placeholder="Course, scope, target grade, constraints…" aria-label="Quest notes" />
                  </div>

                  <div className={styles.modalActions}>
                    <button className={styles.primaryBtn} type="button" onClick={submit} aria-label="Create mission">
                      Create mission
                    </button>
                    <button className={styles.ghostBtn} type="button" onClick={() => setGeneratorOpen(false)} aria-label="Cancel generate quest">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
