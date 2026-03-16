"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import styles from "./notes-hub.module.css";

type NotesView = "all" | "favorites" | "hidden" | "deleted";

type Note = {
  id: string;
  title: string;
  body: string;
  bodyFormat: "plain" | "html";
  tags: string[];
  folder: string | null;
  favorite: boolean;
  pinned: boolean;
  sortOrder: number;
  hiddenAt: number | null;
  reminderAt: number | null;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
};

type TagDef = { id: string; label: string; dotClass: string };
type FolderDef = { id: string; label: string };

type NotesStore = {
  notes: Note[];
  tagCatalog: TagDef[];
  folderCatalog: FolderDef[];
};

const FOLDER_FILTER_ANY = "__any_folder__";
const TAG_FILTER_ANY = "__any_tag__";

const TAG_DOT_PALETTE = ["notesDot--mint", "notesDot--aqua", "notesDot--violet", "notesDot--gold"];

const DEFAULT_TAGS: TagDef[] = [
  { id: "school", label: "School related", dotClass: "notesDot--mint" },
  { id: "church", label: "Church sermons", dotClass: "notesDot--aqua" },
  { id: "movies", label: "Movies & games", dotClass: "notesDot--violet" },
  { id: "family", label: "Family trip", dotClass: "notesDot--gold" },
];

const DEFAULT_FOLDERS: FolderDef[] = [
  { id: "2026", label: "2026" },
  { id: "2025", label: "2025" },
];

function now() {
  return Date.now();
}

function makeId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `n_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function getScopedKey(base: string) {
  if (typeof document === "undefined") return base;
  const fromBody = document.body?.dataset?.userId || "";
  const fromRoot = document.querySelector<HTMLElement>(".shellRoot")?.dataset?.userId || "";
  const userId = String(fromBody || fromRoot || "").trim();
  return userId ? `${base}:u${userId}` : base;
}

function storageKey() {
  return getScopedKey("studium:notes:v1");
}

function openTargetKey() {
  return getScopedKey("studium:notes:openNoteId:v1");
}

function hiddenUnlockKey() {
  return getScopedKey("studium:notes:hiddenUnlocked:v1");
}

const OPEN_TARGET_KEY_FALLBACK = "studium:notes:openNoteId:v1";

function openTargetPayload(note: Note) {
  return JSON.stringify({
    id: note.id,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    title: note.title,
  });
}

function stripHtmlQuick(html: string) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeForPreview(html: string) {
  try {
    const doc = new DOMParser().parseFromString(String(html || ""), "text/html");
    doc.querySelectorAll("script,style,iframe,object,embed,link,meta").forEach((n) => n.remove());
    doc.querySelectorAll("img,audio,video").forEach((el) => {
      const block = doc.createElement("div");
      block.className = "notesAttachment--missing";
      block.textContent = "Attachment";
      el.replaceWith(block);
    });
    doc.querySelectorAll("*").forEach((el) => {
      Array.from(el.attributes).forEach((a) => {
        const name = a.name.toLowerCase();
        const value = String(a.value || "");
        if (name.startsWith("on")) el.removeAttribute(a.name);
        if (name === "href" && value.trim().toLowerCase().startsWith("javascript:")) el.removeAttribute(a.name);
        if (name === "src" && value.trim().toLowerCase().startsWith("javascript:")) el.removeAttribute(a.name);
      });
    });
    return doc.body.innerHTML;
  } catch {
    return String(html || "");
  }
}

function loadStore(): NotesStore {
  const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(storageKey());
  const parsed = safeJsonParse<any>(raw);
  const tagCatalog: TagDef[] = Array.isArray(parsed?.tagCatalog) && parsed.tagCatalog.length ? parsed.tagCatalog : DEFAULT_TAGS;
  const folderCatalog: FolderDef[] = Array.isArray(parsed?.folderCatalog) && parsed.folderCatalog.length ? parsed.folderCatalog : DEFAULT_FOLDERS;
  const notes: Note[] = Array.isArray(parsed?.notes)
    ? parsed.notes.map((n: any) => ({
        id: String(n.id || ""),
        title: String(n.title || "Untitled"),
        body: String(n.body || ""),
        bodyFormat: n.bodyFormat === "html" ? "html" : "plain",
        tags: Array.isArray(n.tags) ? n.tags.map(String) : [],
        folder: typeof n.folder === "string" ? n.folder : null,
        favorite: !!n.favorite,
        pinned: !!n.pinned,
        sortOrder: Number(n.sortOrder ?? n.order ?? n.updatedAt ?? now()),
        hiddenAt: n.hiddenAt ? Number(n.hiddenAt) : n.archivedAt ? Number(n.archivedAt) : null,
        reminderAt: n.reminderAt ? Number(n.reminderAt) : null,
        createdAt: Number(n.createdAt || now()),
        updatedAt: Number(n.updatedAt || now()),
        deletedAt: n.deletedAt ? Number(n.deletedAt) : null,
      }))
    : [];

  return { notes, tagCatalog, folderCatalog };
}

function formatRelative(ts: number) {
  const delta = Math.max(0, now() - ts);
  const min = Math.floor(delta / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export default function NotesHub() {
  const router = useRouter();
  const [store, setStore] = useState<NotesStore>(() => ({ notes: [], tagCatalog: DEFAULT_TAGS, folderCatalog: DEFAULT_FOLDERS }));
  const [view, setView] = useState<NotesView>("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [folderFilter, setFolderFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string>("");
  const [hiddenUnlocked, setHiddenUnlocked] = useState(false);
  const [modal, setModal] = useState<null | "addFolder" | "addTag">(null);
  const [modalLabel, setModalLabel] = useState("");
  const [tagDotDraft, setTagDotDraft] = useState(TAG_DOT_PALETTE[0] || "notesDot--mint");

  useEffect(() => {
    setStore(loadStore());
  }, []);

  useEffect(() => {
    try {
      const ok = sessionStorage.getItem(hiddenUnlockKey()) === "1";
      if (ok) setHiddenUnlocked(true);
    } catch {
      // ignore
    }
  }, []);

  const persistStore = (next: NotesStore) => {
    setStore(next);
    try {
      const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(storageKey());
      const parsed = safeJsonParse<any>(raw) || {};
      const merged = { ...parsed, notes: next.notes, tagCatalog: next.tagCatalog, folderCatalog: next.folderCatalog };
      localStorage.setItem(storageKey(), JSON.stringify(merged));
    } catch {
      // ignore
    }
  };

  const sidebarItemClass = (active: boolean) => ["notesSidebarItem", "gridCard", active ? "notesSidebarItem--active" : ""].filter(Boolean).join(" ");
  const tagPillClass = (active: boolean) => ["notesTagPill", "gridCard", active ? "notesTagPill--active" : ""].filter(Boolean).join(" ");

  const tagLabelById = useMemo(() => Object.fromEntries(store.tagCatalog.map((t) => [t.id, t.label])), [store.tagCatalog]);
  const folderLabelById = useMemo(() => Object.fromEntries(store.folderCatalog.map((f) => [f.id, f.label])), [store.folderCatalog]);

  const folderCounts = useMemo(() => {
    const map: Record<string, number> = {};
    store.notes.forEach((n) => {
      if (n.deletedAt) return;
      if (n.hiddenAt) return;
      if (!n.folder) return;
      map[n.folder] = (map[n.folder] || 0) + 1;
    });
    return map;
  }, [store.notes]);

  const tagCounts = useMemo(() => {
    const map: Record<string, number> = {};
    store.notes.forEach((n) => {
      if (n.deletedAt) return;
      if (n.hiddenAt) return;
      const tags = Array.isArray(n.tags) ? n.tags : [];
      tags.forEach((id) => {
        map[id] = (map[id] || 0) + 1;
      });
    });
    return map;
  }, [store.notes]);

  const allFolderNoteCount = useMemo(() => store.notes.filter((n) => !n.deletedAt && !n.hiddenAt && !!n.folder).length, [store.notes]);
  const allTaggedNoteCount = useMemo(() => store.notes.filter((n) => !n.deletedAt && !n.hiddenAt && Array.isArray(n.tags) && n.tags.length > 0).length, [store.notes]);

  const tabCounts = useMemo(() => {
    const all = store.notes.filter((n) => !n.deletedAt && !n.hiddenAt).length;
    const favorites = store.notes.filter((n) => !n.deletedAt && !n.hiddenAt && n.favorite).length;
    const hidden = store.notes.filter((n) => !n.deletedAt && !!n.hiddenAt).length;
    const deleted = store.notes.filter((n) => !!n.deletedAt).length;
    return { all, favorites, hidden, deleted };
  }, [store.notes]);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = store.notes.slice();

    if (view === "hidden") list = list.filter((n) => !n.deletedAt && !!n.hiddenAt);
    else if (view === "favorites") list = list.filter((n) => !n.deletedAt && !n.hiddenAt && n.favorite);
    else if (view === "deleted") list = list.filter((n) => !!n.deletedAt);
    else list = list.filter((n) => !n.deletedAt && !n.hiddenAt);

    // Tag/folder filters shouldn't affect Deleted.
    if (view !== "deleted") {
      if (folderFilter === FOLDER_FILTER_ANY) list = list.filter((n) => !!n.folder);
      else if (folderFilter) list = list.filter((n) => n.folder === folderFilter);

      if (tagFilter === TAG_FILTER_ANY) list = list.filter((n) => Array.isArray(n.tags) && n.tags.length > 0);
      else if (tagFilter) list = list.filter((n) => n.tags.includes(tagFilter));
    }

    if (q) {
      list = list.filter((n) => {
        const bodyText = n.bodyFormat === "html" ? stripHtmlQuick(n.body) : n.body;
        return (n.title + "\n" + bodyText).toLowerCase().includes(q);
      });
    }

    if (view === "deleted") {
      list.sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
      return list;
    }

    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (a.sortOrder !== b.sortOrder) return b.sortOrder - a.sortOrder;
      return b.updatedAt - a.updatedAt;
    });
    return list;
  }, [folderFilter, search, store.notes, tagFilter, view]);

  const activeNote = useMemo(() => filteredNotes.find((n) => n.id === activeId) || filteredNotes[0] || null, [activeId, filteredNotes]);

  useEffect(() => {
    if (activeId) return;
    if (filteredNotes[0]) setActiveId(filteredNotes[0].id);
  }, [activeId, filteredNotes]);

  useEffect(() => {
    const inView = !!activeId && filteredNotes.some((n) => n.id === activeId);
    if (inView) return;
    if (filteredNotes[0]?.id) setActiveId(filteredNotes[0].id);
    else setActiveId("");
  }, [activeId, filteredNotes]);

  const previewHtml = useMemo(() => {
    if (!activeNote) return "";
    if (activeNote.bodyFormat === "html") return sanitizeForPreview(activeNote.body);
    const safe = String(activeNote.body || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return safe.replace(/\n/g, "<br/>");
  }, [activeNote]);

  const addFolder = () => {
    setModalLabel("");
    setModal("addFolder");
  };

  const addTag = () => {
    setModalLabel("");
    setTagDotDraft(TAG_DOT_PALETTE[store.tagCatalog.length % TAG_DOT_PALETTE.length] || "notesDot--mint");
    setModal("addTag");
  };

  const createFolder = (rawLabel: string) => {
    const label = String(rawLabel || "").trim();
    if (!label) return false;
    const id = `f_${makeId()}`;
    const next: NotesStore = { ...store, folderCatalog: [...store.folderCatalog, { id, label }] };
    persistStore(next);
    return true;
  };

  const createTag = (rawLabel: string, dotClass: string) => {
    const label = String(rawLabel || "").trim();
    if (!label) return false;
    const id = `t_${makeId()}`;
    const safeDot = TAG_DOT_PALETTE.includes(dotClass) ? dotClass : TAG_DOT_PALETTE[0] || "notesDot--mint";
    const next: NotesStore = { ...store, tagCatalog: [...store.tagCatalog, { id, label, dotClass: safeDot }] };
    persistStore(next);
    return true;
  };

  const deleteFolder = (id: string) => {
    const found = store.folderCatalog.find((f) => f.id === id) || null;
    if (!found) return;
    if (!window.confirm(`Delete folder "${found.label}"?\n\nNotes in this folder will be moved to no folder.`)) return;
    if (folderFilter === id) setFolderFilter(null);
    const next: NotesStore = {
      ...store,
      folderCatalog: store.folderCatalog.filter((f) => f.id !== id),
      notes: store.notes.map((n) => (n.folder === id ? { ...n, folder: null } : n)),
    };
    persistStore(next);
  };

  const deleteTag = (id: string) => {
    const found = store.tagCatalog.find((t) => t.id === id) || null;
    if (!found) return;
    if (!window.confirm(`Delete tag "${found.label}"?\n\nThis will remove the tag from all notes.`)) return;
    if (tagFilter === id) setTagFilter(null);
    const next: NotesStore = {
      ...store,
      tagCatalog: store.tagCatalog.filter((t) => t.id !== id),
      notes: store.notes.map((n) => ({ ...n, tags: Array.isArray(n.tags) ? n.tags.filter((x) => x !== id) : [] })),
    };
    persistStore(next);
  };

  const deleteNote = (id: string) => {
    const target = store.notes.find((n) => n.id === id) || null;
    if (!target) return;
    if (target.deletedAt) return;
    if (!window.confirm(`Move "${target.title || "Untitled"}" to Recently deleted?`)) return;
    const t = now();
    const next: NotesStore = { ...store, notes: store.notes.map((n) => (n.id === id ? { ...n, deletedAt: t, updatedAt: t } : n)) };
    persistStore(next);
  };

  const openHiddenView = () => {
    if (hiddenUnlocked) {
      setView("hidden");
      return;
    }
    const pwd = String(window.prompt("Password for Hidden notes") || "");
    if (pwd !== "1111") return;
    setHiddenUnlocked(true);
    try {
      sessionStorage.setItem(hiddenUnlockKey(), "1");
    } catch {
      // ignore
    }
    setView("hidden");
  };

  return (
    <div className={styles.page} aria-label="Notes hub">
      <div className={styles.body} aria-label="Notes content">
        <div className={styles.col} aria-label="Folders column">
          <div className={styles.colHead} aria-label="Folders header">
            <div className={styles.colHeadTop}>
              <div className={styles.colTitle}>
                <div className={styles.cardTitle}>Folder</div>
              </div>
              <button type="button" className={styles.outsideBtn} aria-label="Add folder" title="Add folder" onClick={addFolder}>
                Add Folder
              </button>
            </div>
          </div>

          <section className={styles.panel} aria-label="Folders">
            <div className={styles.catalog} role="list" aria-label="Folder list">
              <button
                type="button"
                className={sidebarItemClass(folderFilter === FOLDER_FILTER_ANY)}
                role="listitem"
                onClick={() => setFolderFilter((prev) => (prev === FOLDER_FILTER_ANY ? null : FOLDER_FILTER_ANY))}
                aria-label="All folders"
              >
                <i className="fa-solid fa-folder-open" aria-hidden="true" />
                <span className="notesSidebarItem__label">All</span>
                <span className="notesSidebarItem__count">{allFolderNoteCount}</span>
              </button>
              {store.folderCatalog.map((f) => (
                <div key={f.id} className={styles.hoverRow}>
                  <button
                    type="button"
                    className={[sidebarItemClass(folderFilter === f.id), styles.hoverRowMain].filter(Boolean).join(" ")}
                    role="listitem"
                    onClick={() => setFolderFilter(f.id)}
                    aria-label={`Folder ${f.label}`}
                  >
                    <i className="fa-solid fa-folder" aria-hidden="true" />
                    <span className="notesSidebarItem__label">{f.label}</span>
                    <span className="notesSidebarItem__count">{folderCounts[f.id] || 0}</span>
                  </button>
                  <div className={styles.hoverRowActions}>
                    <button
                      type="button"
                      className={["notesInlineIconBtn gridCard", styles.hoverRevealBtn].join(" ")}
                      aria-label={`Delete folder ${f.label}`}
                      title="Delete folder"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteFolder(f.id);
                      }}
                    >
                      <i className="fa-solid fa-trash" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.col} aria-label="Tags column">
          <div className={styles.colHead} aria-label="Tags header">
            <div className={styles.colHeadTop}>
              <div className={styles.colTitle}>
                <div className={styles.cardTitle}>Tags</div>
              </div>
              <button type="button" className={styles.outsideBtn} aria-label="Add tag" title="Add tag" onClick={addTag}>
                Add tags
              </button>
            </div>
          </div>

          <section className={styles.panel} aria-label="Tags">
            <div className={styles.catalog} role="list" aria-label="Tag list">
              <button
                type="button"
                className={tagPillClass(tagFilter === TAG_FILTER_ANY)}
                role="listitem"
                onClick={() => setTagFilter((prev) => (prev === TAG_FILTER_ANY ? null : TAG_FILTER_ANY))}
                aria-label="All tags"
              >
                <span className="notesDot notesDot--mint" aria-hidden="true" />
                <span className="notesRowItem">All</span>
                <span className="notesSidebarItem__count">{allTaggedNoteCount}</span>
              </button>
              {store.tagCatalog.map((t) => (
                <div key={t.id} className={styles.hoverRow}>
                  <button
                    type="button"
                    className={[tagPillClass(tagFilter === t.id), styles.hoverRowMain].filter(Boolean).join(" ")}
                    role="listitem"
                    onClick={() => setTagFilter(t.id)}
                    aria-label={`Tag ${t.label}`}
                  >
                    <span className={["notesDot", t.dotClass].filter(Boolean).join(" ")} aria-hidden="true" />
                    <span className="notesRowItem">{t.label}</span>
                    <span className="notesSidebarItem__count">{tagCounts[t.id] || 0}</span>
                  </button>
                  <div className={styles.hoverRowActions}>
                    <button
                      type="button"
                      className={["notesInlineIconBtn gridCard", styles.hoverRevealBtn].join(" ")}
                      aria-label={`Delete tag ${t.label}`}
                      title="Delete tag"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteTag(t.id);
                      }}
                    >
                      <i className="fa-solid fa-trash" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.col} aria-label="All notes column">
          <div className={styles.colHead} aria-label="All notes header">
            <div className={styles.colHeadTop}>
              <div className={styles.colTitle}>
                <div className={styles.cardTitle}>All Notes</div>
              </div>
              <Link href="/notes/new?fullscreen=1&new=1" className={styles.outsideBtn} aria-label="Add note" title="Add note">
                Add Note
              </Link>
            </div>
          </div>

          <section className={styles.panel} aria-label="Notes list">
            <div className={styles.notesPanelHead} aria-label="Notes list header">
              <div className={styles.tabs} aria-label="All notes tabs">
                <button
                  type="button"
                  className={[styles.tabBtn, view === "all" ? styles.tabBtnActive : ""].filter(Boolean).join(" ")}
                  onClick={() => setView("all")}
                  aria-label="All notes"
                >
                  <span className="notesRowItem">All</span>
                  <span className="notesSidebarItem__count" aria-label={`${tabCounts.all} note(s)`}>
                    {tabCounts.all}
                  </span>
                </button>
                <button
                  type="button"
                  className={[styles.tabBtn, view === "favorites" ? styles.tabBtnActive : ""].filter(Boolean).join(" ")}
                  onClick={() => setView("favorites")}
                  aria-label="Favorite notes"
                >
                  <span className="notesRowItem">Favorite</span>
                  <span className="notesSidebarItem__count" aria-label={`${tabCounts.favorites} favorite note(s)`}>
                    {tabCounts.favorites}
                  </span>
                </button>
                <button
                  type="button"
                  className={[styles.tabBtn, view === "hidden" ? styles.tabBtnActive : ""].filter(Boolean).join(" ")}
                  onClick={openHiddenView}
                  aria-label="Hidden notes"
                >
                  <span className="notesRowItem">Hidden</span>
                  <span className="notesSidebarItem__count" aria-label="Hidden notes count is hidden">
                    •
                  </span>
                </button>
                <button
                  type="button"
                  className={[styles.tabBtn, view === "deleted" ? styles.tabBtnActive : ""].filter(Boolean).join(" ")}
                  onClick={() => setView("deleted")}
                  aria-label="Recently deleted"
                >
                  <span className="notesRowItem">Recently deleted</span>
                  <span className="notesSidebarItem__count" aria-label={`${tabCounts.deleted} deleted note(s)`}>
                    {tabCounts.deleted}
                  </span>
                </button>
              </div>

              <div className="notesSearchWrap">
                <i className="fa-solid fa-magnifying-glass text-white/55" aria-hidden="true" />
                <input
                  className="notesSearchInput"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notes..."
                  aria-label="Search notes"
                />
              </div>
            </div>

            <div className={styles.notesPanelBody}>
              <div className={styles.list} role="list" aria-label="Notes list items">
                {filteredNotes.map((n) => (
                  <div key={n.id} className={styles.hoverRow}>
                    <button
                      type="button"
                      className={[
                        "notesListItem",
                        "gridCard",
                        styles.noteItem,
                        styles.hoverRowMain,
                        activeNote?.id === n.id ? "notesListItem--active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      role="listitem"
                      onClick={() => setActiveId(n.id)}
                    >
                      <div className="notesListItem__title">{n.title || "Untitled"}</div>
                      <div className="notesListItem__excerpt">
                        {(() => {
                          const bodyText = n.bodyFormat === "html" ? stripHtmlQuick(n.body) : n.body;
                          return bodyText.trim() ? bodyText.trim().slice(0, 120) : "Start typing to capture your thoughts...";
                        })()}
                      </div>
                      <div className="notesListItem__meta">
                        {n.pinned ? "Pinned | " : ""}
                        {formatRelative(n.updatedAt)}
                        {n.hiddenAt ? " | Hidden" : ""}
                        {n.favorite ? " | Favorite" : ""}
                        {n.folder ? ` | ${folderLabelById[n.folder] || n.folder}` : ""}
                        {n.tags.length ? ` | ${n.tags.map((id) => tagLabelById[id] || id).join(", ")}` : ""}
                      </div>
                    </button>
                    {view !== "deleted" && !n.deletedAt ? (
                      <div className={styles.hoverRowActions}>
                        <button
                          type="button"
                          className={["notesInlineIconBtn gridCard", styles.hoverRevealBtn].join(" ")}
                          aria-label={`Delete note ${n.title || "Untitled"}`}
                          title="Delete note"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteNote(n.id);
                          }}
                        >
                          <i className="fa-solid fa-trash" aria-hidden="true" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
                {filteredNotes.length === 0 ? <div className="notesEmptyState">No notes match your filters.</div> : null}
              </div>
            </div>
          </section>
        </div>

        <div className={styles.col} aria-label="Preview column">
          <div className={styles.colHead} aria-label="Preview header">
            <div className={styles.colHeadTop}>
              <div className={styles.colTitle}>
                <div className={styles.cardTitle}>Preview</div>
              </div>
              <button
                type="button"
                className={styles.outsideBtn}
                aria-label="Open editor"
                title="Open editor"
                disabled={!activeNote?.id}
                onClick={() => {
                  if (!activeNote?.id) return;
                  const href = `/notes/new?note=${encodeURIComponent(activeNote.id)}`;
                  try {
                    const payload = openTargetPayload(activeNote);
                    sessionStorage.setItem(openTargetKey(), payload);
                    sessionStorage.setItem(OPEN_TARGET_KEY_FALLBACK, payload);
                    localStorage.setItem(openTargetKey(), payload);
                    localStorage.setItem(OPEN_TARGET_KEY_FALLBACK, payload);
                  } catch {
                    // ignore
                  }
                  router.push(href);
                }}
              >
                <i className="fa-solid fa-pen-to-square" aria-hidden="true" />
                Open
              </button>
            </div>
          </div>

          <section className={styles.panel} aria-label="Selected note">
            <div className={styles.cardSub}>{activeNote ? formatRelative(activeNote.updatedAt) : "Pick a note from the list."}</div>

            <div className={styles.selected} aria-label="Selected note preview">
              {activeNote ? (
                <div className={styles.selectedInner} aria-label="Selected note details">
                  <div className={styles.selectedTitle}>{activeNote.title || "Untitled"}</div>
                  <div
                    className="notesPreviewBody notesPreviewBody--html"
                    aria-label="Selected note content"
                    dangerouslySetInnerHTML={{ __html: previewHtml || '<span class="notesPreviewEmpty">No content yet.</span>' }}
                  />
                </div>
              ) : (
                <div className="notesEmptyPreview">Select a note from the list.</div>
              )}
            </div>
          </section>
        </div>
      </div>

      {modal ? (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={modal === "addFolder" ? "Add folder" : "Add tag"}
          onClick={() => setModal(null)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className={styles.modalTitle}>{modal === "addFolder" ? "Add folder" : "Add tag"}</div>
            <div className={styles.modalSub}>
              {modal === "addFolder" ? "Create a folder to organize notes." : "Create a tag to label notes."}
            </div>

            <input
              autoFocus
              className={styles.modalInput}
              value={modalLabel}
              onChange={(e) => setModalLabel(e.target.value)}
              placeholder={modal === "addFolder" ? "Folder name" : "Tag name"}
              aria-label={modal === "addFolder" ? "Folder name" : "Tag name"}
              onKeyDown={(e) => {
                if (e.key === "Escape") setModal(null);
                if (e.key !== "Enter") return;
                if (modal === "addFolder") {
                  if (createFolder(modalLabel)) setModal(null);
                } else {
                  if (createTag(modalLabel, tagDotDraft)) setModal(null);
                }
              }}
            />

            {modal === "addTag" ? (
              <div className={styles.dotPicker} aria-label="Pick tag color">
                {TAG_DOT_PALETTE.map((dot) => (
                  <button
                    key={dot}
                    type="button"
                    className={[styles.dotBtn, tagDotDraft === dot ? styles.dotBtnActive : ""].filter(Boolean).join(" ")}
                    aria-label={`Pick ${dot}`}
                    onClick={() => setTagDotDraft(dot)}
                  >
                    <span className={["notesDot", dot].filter(Boolean).join(" ")} aria-hidden="true" />
                  </button>
                ))}
              </div>
            ) : null}

            <div className={styles.modalActions}>
              <button type="button" className={styles.modalBtn} onClick={() => setModal(null)} aria-label="Cancel">
                Cancel
              </button>
              <button
                type="button"
                className={[styles.modalBtn, styles.modalBtnPrimary].join(" ")}
                onClick={() => {
                  if (modal === "addFolder") {
                    if (createFolder(modalLabel)) setModal(null);
                  } else {
                    if (createTag(modalLabel, tagDotDraft)) setModal(null);
                  }
                }}
                aria-label={modal === "addFolder" ? "Create folder" : "Create tag"}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
