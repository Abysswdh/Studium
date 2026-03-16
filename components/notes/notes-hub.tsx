"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import styles from "./notes-hub.module.css";

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
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const tagLabelById = useMemo(() => Object.fromEntries(store.tagCatalog.map((t) => [t.id, t.label])), [store.tagCatalog]);
  const folderLabelById = useMemo(() => Object.fromEntries(store.folderCatalog.map((f) => [f.id, f.label])), [store.folderCatalog]);

  const visibleNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = store.notes.filter((n) => !n.deletedAt && !n.hiddenAt);
    if (q) {
      list = list.filter((n) => {
        const bodyText = n.bodyFormat === "html" ? stripHtmlQuick(n.body) : n.body;
        return (n.title + "\n" + bodyText).toLowerCase().includes(q);
      });
    }
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (a.sortOrder !== b.sortOrder) return b.sortOrder - a.sortOrder;
      return b.updatedAt - a.updatedAt;
    });
    return list;
  }, [search, store.notes]);

  const activeNote = useMemo(() => visibleNotes.find((n) => n.id === activeId) || visibleNotes[0] || null, [activeId, visibleNotes]);

  useEffect(() => {
    if (activeId) return;
    if (visibleNotes[0]) setActiveId(visibleNotes[0].id);
  }, [activeId, visibleNotes]);

  const previewHtml = useMemo(() => {
    if (!activeNote) return "";
    if (activeNote.bodyFormat === "html") return sanitizeForPreview(activeNote.body);
    const safe = String(activeNote.body || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return safe.replace(/\n/g, "<br/>");
  }, [activeNote]);

  return (
    <div className={styles.page} aria-label="Notes hub">
      <div className={styles.topBar} aria-label="Notes header">
        <div>
          <div className={styles.title}>Notes</div>
          <div className={styles.sub}>Capture quick notes, then open the editor for deep work.</div>
        </div>
        <Link href="/notes/new" className={styles.actionBtn} aria-label="Add new note" title="Add new note">
          <i className="fa-solid fa-plus" aria-hidden="true" />
          Add note
        </Link>
      </div>

      <div className={styles.body} aria-label="Notes content">
        <section className={styles.left} aria-label="Notes list">
          <div className={styles.cardHead}>
            <div>
              <div className={styles.cardTitle}>Notes</div>
              <div className={styles.cardSub}>{visibleNotes.length} note(s)</div>
            </div>
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

          <div className={styles.list} role="list" aria-label="Notes list items">
            {visibleNotes.map((n) => (
              <button
                key={n.id}
                type="button"
                className={["notesListItem", "gridCard", styles.noteItem, activeNote?.id === n.id ? "notesListItem--active" : ""].filter(Boolean).join(" ")}
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
                  {n.folder ? ` | ${folderLabelById[n.folder] || n.folder}` : ""}
                  {n.tags.length ? ` | ${n.tags.map((id) => tagLabelById[id] || id).join(", ")}` : ""}
                </div>
              </button>
            ))}
            {visibleNotes.length === 0 ? <div className="notesEmptyState">No notes yet.</div> : null}
          </div>
        </section>

        <section className={styles.right} aria-label="Selected note">
          <div className={styles.cardHead}>
            <div>
              <div className={styles.cardTitle}>Selected note</div>
              <div className={styles.cardSub}>{activeNote ? formatRelative(activeNote.updatedAt) : "Pick a note from the list."}</div>
            </div>
            <button
              type="button"
              className={styles.openBtn}
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
  );
}
