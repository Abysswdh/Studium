function text(el) {
  return (el?.textContent || "").trim();
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function qs(sel) {
  return document.querySelector(sel);
}

function click(sel) {
  const b = qs(sel);
  if (b && typeof b.click === "function") b.click();
}

function setVolume(v01) {
  const audio = document.querySelector("audio");
  if (audio) {
    audio.muted = false;
    audio.volume = clamp(v01, 0, 1);
    return;
  }
  const slider = document.querySelector('input[data-testid="volume-bar"]');
  if (slider) {
    slider.value = String(Math.round(clamp(v01, 0, 1) * 100));
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    slider.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function readState() {
  const title =
    text(qs('[data-testid="nowplaying-track-link"]')) ||
    text(qs('[data-testid="context-item-link"]')) ||
    text(qs(".now-playing__name")) ||
    "";
  const artist =
    text(qs('[data-testid="nowplaying-artist"]')) ||
    text(qs(".now-playing__artist")) ||
    "";

  const playpause = qs('button[data-testid="control-button-playpause"]');
  const aria = (playpause?.getAttribute("aria-label") || "").toLowerCase();
  const isPlaying = aria.includes("pause");

  const img = document.querySelector('img[data-testid="cover-art-image"]');
  const artworkUrl = img?.getAttribute("src") || undefined;

  const audio = document.querySelector("audio");
  const volume = typeof audio?.volume === "number" ? audio.volume : undefined;

  return {
    provider: "spotify",
    title,
    artist,
    artworkUrl,
    isPlaying,
    volume,
  };
}

let lastJson = "";
async function push() {
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
  if (cmd === "next") click('button[data-testid="control-button-skip-forward"]');
  else if (cmd === "prev") click('button[data-testid="control-button-skip-back"]');
  else if (cmd === "playpause") click('button[data-testid="control-button-playpause"]');
  else if (cmd === "setVolume") setVolume(Number(msg.value));
  sendResponse?.({ ok: true });
  setTimeout(push, 250);
  return true;
});

