/**
 * Balãozinho flutuante da Assistente Zela — visível em todas as páginas.
 */
(function () {
  const HIDDEN_PAGES = ["assistant", "exit"];
  const HIDDEN_PATHS = [/assistente\.html/i, /exit\.html/i];

  function shouldHideWidget() {
    if (document.body?.dataset?.noAssistantWidget === "true") return true;
    if (HIDDEN_PAGES.includes(document.body?.dataset?.page)) return true;
    const path = window.location.pathname;
    return HIDDEN_PATHS.some((pattern) => pattern.test(path));
  }

  function trapFocus(panel, fab) {
    const focusable = panel.querySelectorAll(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function onKeyDown(event) {
      if (event.key === "Escape") {
        closePanel(panel, fab);
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    panel._focusTrapHandler = onKeyDown;
    document.addEventListener("keydown", onKeyDown);
    first?.focus();
  }

  function releaseFocus(panel) {
    if (panel._focusTrapHandler) {
      document.removeEventListener("keydown", panel._focusTrapHandler);
      panel._focusTrapHandler = null;
    }
  }

  function openPanel(panel, fab) {
    panel.hidden = false;
    panel.classList.add("assistant-panel--open");
    fab.setAttribute("aria-expanded", "true");
    document.body.classList.add("assistant-panel-open");
    trapFocus(panel, fab);
  }

  function closePanel(panel, fab) {
    panel.classList.remove("assistant-panel--open");
    panel.hidden = true;
    fab.setAttribute("aria-expanded", "false");
    document.body.classList.remove("assistant-panel-open");
    releaseFocus(panel);
    fab.focus();
  }

  function showWidgetLoading(root) {
    if (!root) return;
    root.innerHTML = `<p class="chat-system-message" role="status">Carregando assistente...</p>`;
  }

  function showWidgetError(root, message) {
    if (!root) return;
    root.innerHTML = `<p class="alert alert--error" role="alert">${message}</p>`;
  }

  function createWidget() {
    if (shouldHideWidget()) return;
    if (document.getElementById("assistant-fab")) return;

    const fab = document.createElement("button");
    fab.type = "button";
    fab.id = "assistant-fab";
    fab.className = "assistant-fab";
    fab.setAttribute("aria-expanded", "false");
    fab.setAttribute("aria-controls", "assistant-panel");
    fab.setAttribute("aria-label", "Abrir assistente Zela — tire dúvidas sobre seus direitos");
    fab.innerHTML = `
      <span class="assistant-fab__icon" aria-hidden="true">${window.ZL?.icon ? window.ZL.icon("chat", "icon", 22) : "💬"}</span>
      <span class="assistant-fab__badge">24h</span>`;

    const panel = document.createElement("div");
    panel.id = "assistant-panel";
    panel.className = "assistant-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "Assistente Zela");
    panel.innerHTML = `
      <button type="button" class="assistant-panel__backdrop" data-assistant-close aria-label="Fechar assistente"></button>
      <div class="assistant-panel__sheet">
        <header class="assistant-panel__header">
          <div class="assistant-panel__title-wrap">
            <h2 class="assistant-panel__title">Assistente Zela</h2>
            <span class="assistant-panel__badge">24h</span>
          </div>
          <button type="button" class="assistant-panel__close" data-assistant-close aria-label="Fechar">✕</button>
        </header>
        <div class="assistant-panel__body" id="assistant-widget-root">
          <p class="chat-system-message" role="status">Carregando assistente...</p>
        </div>
      </div>`;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    let chatController = null;
    let chatReady = false;
    let chatInitFailed = false;
    let initPromise = null;

function isChatInitSuccess(result) {
  return Boolean(result && result.ok !== false && (result.ok === true || typeof result.sendMessage === "function"));
}

    async function ensureChat() {
      if (chatReady) return true;
      if (chatInitFailed) return false;
      if (initPromise) return initPromise;

      const root = document.getElementById("assistant-widget-root");
      if (!root) {
        chatInitFailed = true;
        return false;
      }

      if (typeof window.ZL.initAssistantChat !== "function") {
        showWidgetError(root, "Não foi possível carregar o chat. Recarregue a página.");
        chatInitFailed = true;
        return false;
      }

      showWidgetLoading(root);

      initPromise = Promise.resolve(
        window.ZL.initAssistantChat(root, {
          compact: true,
          showExpandLink: true,
          inputId: "assistant-widget-input",
        })
      )
        .then((result) => {
          if (isChatInitSuccess(result)) {
            chatController = result;
            chatReady = true;
            return true;
          }

          chatInitFailed = true;
          showWidgetError(root, result?.error || "Não foi possível carregar o chat. Recarregue a página.");
          return false;
        })
        .catch((err) => {
          console.error("Zela: falha ao inicializar widget da assistente.", err);
          chatInitFailed = true;
          showWidgetError(root, "Não foi possível carregar o chat. Recarregue a página.");
          return false;
        })
        .finally(() => {
          initPromise = null;
        });

      return initPromise;
    }

    fab.addEventListener("click", async () => {
      const isOpen = panel.classList.contains("assistant-panel--open");
      if (isOpen) {
        closePanel(panel, fab);
        return;
      }

      const ready = await ensureChat();
      if (!ready) {
        panel.hidden = false;
        panel.classList.add("assistant-panel--open");
        fab.setAttribute("aria-expanded", "true");
        return;
      }

      openPanel(panel, fab);
    });

    panel.querySelectorAll("[data-assistant-close]").forEach((el) => {
      el.addEventListener("click", () => closePanel(panel, fab));
    });

    ensureChat();
  }

  document.addEventListener("zela:ready", createWidget);
})();