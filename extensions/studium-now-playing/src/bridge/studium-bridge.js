function postToPage(type, payload) {
  try {
    window.postMessage({ __studium_ext: 1, type, ...payload }, window.location.origin);
  } catch {
    // ignore
  }
}

window.addEventListener("message", (ev) => {
  if (ev.source !== window) return;
  if (ev.origin !== window.location.origin) return;
  const data = ev.data;
  if (!data || data.__studium !== 1) return;

  if (data.type === "PING") {
    chrome.runtime.sendMessage({ type: "PING" }, (resp) => {
      if (resp?.ok) postToPage("PONG", { ok: true });
    });
    return;
  }

  if (data.type === "GET_STATE") {
    chrome.runtime.sendMessage({ type: "GET_STATE" }, (resp) => {
      if (resp?.ok) postToPage("STATE", { state: resp.state || null });
    });
    return;
  }

  if (data.type === "CMD") {
    chrome.runtime.sendMessage({ type: "CMD", cmd: data.cmd, value: data.value }, () => {});
    return;
  }
});

