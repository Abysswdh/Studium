const STATE = {
  now: null,
  providerTabId: null,
};

function sameOrigin(urlA, urlB) {
  try {
    return new URL(urlA).origin === new URL(urlB).origin;
  } catch {
    return false;
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Provider updates
  if (msg?.type === "PROVIDER_STATE") {
    STATE.now = { ...msg.state, updatedAt: Date.now() };
    if (sender?.tab?.id) STATE.providerTabId = sender.tab.id;
    sendResponse?.({ ok: true });
    return true;
  }

  // Bridge asks for state
  if (msg?.type === "GET_STATE") {
    sendResponse?.({ ok: true, state: STATE.now });
    return true;
  }

  // Bridge sends command -> forward to last provider tab
  if (msg?.type === "CMD") {
    const tabId = STATE.providerTabId;
    if (!tabId) {
      sendResponse?.({ ok: false, error: "no_provider" });
      return true;
    }
    chrome.tabs.sendMessage(tabId, { type: "CMD", cmd: msg.cmd, value: msg.value }, (resp) => {
      sendResponse?.(resp ?? { ok: false });
    });
    return true;
  }

  // PING/PONG
  if (msg?.type === "PING") {
    sendResponse?.({ ok: true });
    return true;
  }

  return false;
});

// Keep providerTabId fresh if tab is closed.
chrome.tabs.onRemoved.addListener((tabId) => {
  if (STATE.providerTabId === tabId) STATE.providerTabId = null;
});

