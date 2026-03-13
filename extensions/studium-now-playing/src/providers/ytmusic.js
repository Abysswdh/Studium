function text(el) {
  return (el?.textContent || "").trim();
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function qs(sel) {
  return document.querySelector(sel);
}

function click(el) {
  if (el && typeof el.click === "function") el.click();
}

function mediaEl() {
  return document.querySelector("video") || document.querySelector("audio");
}

function setVolume(v01) {
  const m = mediaEl();
  if (m) {
    m.muted = false;
    m.volume = clamp(v01, 0, 1);
  }
}

function readState() {
  const title =
    text(qs("ytmusic-player-bar .title")) ||
    text(qs("ytmusic-player-bar .title.ytmusic-player-bar")) ||
    text(qs("ytmusic-player-bar #title")) ||
    "";

  const artist =
    text(qs("ytmusic-player-bar .byline a")) ||
    text(qs("ytmusic-player-bar .subtitle a")) ||
    "";

  const img = qs("ytmusic-player-bar img");
  const artworkUrl = img?.getAttribute("src") || undefined;

  const playBtn =
    qs('ytmusic-player-bar button[aria-label="Play"]') ||
    qs('ytmusic-player-bar button[aria-label="Pause"]') ||
    qs('tp-yt-paper-icon-button[title="Play"]') ||
    qs('tp-yt-paper-icon-button[title="Pause"]');
  const aria = (playBtn?.getAttribute("aria-label") || playBtn?.getAttribute("title") || "").toLowerCase();
  const isPlaying = aria.includes("pause");

  const m = mediaEl();
  const volume = typeof m?.volume === "number" ? m.volume : undefined;

  return {
    provider: "ytmusic",
    title,
    artist,
    artworkUrl,
    isPlaying,
    volume,
  };
}

let lastJson = "";
function push() {
  const s = readState();
  const json = JSON.stringify(s);
  if (json === lastJson) return;
  lastJson = json;
  chrome.runtime.sendMessage({ type: "PROVIDER_STATE", state: s }, () => {});
}

setInterval(push, 900);
push();

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "CMD") return false;
  const cmd = msg.cmd;

  if (cmd === "setVolume") setVolume(Number(msg.value));

  if (cmd === "playpause") {
    const btn =
      qs('ytmusic-player-bar button[aria-label="Play"]') ||
      qs('ytmusic-player-bar button[aria-label="Pause"]') ||
      qs('tp-yt-paper-icon-button[aria-label="Play"]') ||
      qs('tp-yt-paper-icon-button[aria-label="Pause"]') ||
      qs('tp-yt-paper-icon-button[title="Play"]') ||
      qs('tp-yt-paper-icon-button[title="Pause"]');
    if (btn) click(btn);
  } else if (cmd === "next") {
    const btn =
      qs('ytmusic-player-bar button[aria-label="Next song"]') ||
      qs('ytmusic-player-bar button[aria-label="Next"]') ||
      qs('tp-yt-paper-icon-button[aria-label="Next song"]') ||
      qs('tp-yt-paper-icon-button[title="Next song"]');
    if (btn) click(btn);
  } else if (cmd === "prev") {
    const btn =
      qs('ytmusic-player-bar button[aria-label="Previous song"]') ||
      qs('ytmusic-player-bar button[aria-label="Previous"]') ||
      qs('tp-yt-paper-icon-button[aria-label="Previous song"]') ||
      qs('tp-yt-paper-icon-button[title="Previous song"]');
    if (btn) click(btn);
  }

  sendResponse?.({ ok: true });
  setTimeout(push, 250);
  return true;
});

