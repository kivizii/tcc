/**
 * Assistente Zela — chat 1-a-1 com FAQ local + IA via Cloud Function.
 */
(function () {
window.ZL = window.ZL || {};

const ASSISTANT_STORAGE_KEY = "assistant_messages";
const ASSISTANT_AUTHOR = "Assistente Zela";
const ASSISTANT_REPLY_MIN_MS = 600;
const ASSISTANT_REPLY_MAX_MS = 1400;

let knowledgeCache = null;
let knowledgePromise = null;

const FALLBACK_KNOWLEDGE = {
  suggestedMessages: [
    "Quais são meus direitos?",
    "Como funciona a DEAM?",
    "O que é medida protetiva?",
    "Posso ligar para o 180?",
  ],
  welcomeMessage:
    "Olá! Sou a Assistente Zela. Estou aqui 24 horas para orientar sobre seus direitos, canais de apoio e tipos de violência. Como posso ajudar?",
  crisisKeywords: ["estou em perigo", "me bateu agora", "socorro", "quero me matar"],
  crisisResponse:
    "Sua segurança vem primeiro. Ligue **190** se estiver em perigo agora, **180** (Central da Mulher, 24h) ou **188** (CVV). Use o botão SOS do app se precisar alertar contatos.",
  topics: [
    {
      keywords: ["180", "central da mulher"],
      answer:
        "O **180** é gratuito, sigiloso e funciona **24 horas**. Ligue para orientação ou denúncia. Em risco imediato, ligue **190**.",
    },
    {
      keywords: ["deam", "delegacia"],
      answer:
        "A **DEAM** atende violência contra a mulher. Você pode registrar boletim de ocorrência. Ligue **180** para saber a unidade mais próxima.",
    },
    {
      keywords: ["direitos", "maria da penha"],
      answer:
        "A **Lei Maria da Penha** garante medidas protetivas, afastamento do agressor e atendimento especializado. Violência doméstica é crime.",
    },
  ],
};

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatMessageTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function renderMarkdownLite(text) {
  const escaped = escapeHtml(text || "");
  return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
}

function getAuthorInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function hashAuthorName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const AVATAR_COLORS = [
  "var(--color-rosa)",
  "var(--color-lilas)",
  "var(--color-nude)",
  "var(--color-info)",
  "var(--color-sucesso)",
];

function getAvatarColor(name) {
  return AVATAR_COLORS[hashAuthorName(name) % AVATAR_COLORS.length];
}

function renderAssistantAvatar() {
  return `<span class="message-bubble__avatar assistant-avatar" aria-hidden="true">Z</span>`;
}

function renderMessageBubble(message) {
  const timeHtml = message.time
    ? `<span class="message-bubble__time">${escapeHtml(message.time)}</span>`
    : "";

  if (message.role === "user") {
    const userName = message.author || "Você";
    const initials = getAuthorInitials(userName);
    const avatarColor = getAvatarColor(userName);
    return `
      <div class="message-row message-row--own">
        <span class="message-bubble__avatar" style="background:${avatarColor}" aria-hidden="true">${escapeHtml(initials)}</span>
        <div class="message-bubble message-bubble--own">
          <div class="message-bubble__meta">
            <span class="message-bubble__author">${escapeHtml(userName)}</span>
            ${timeHtml}
          </div>
          ${escapeHtml(message.text)}
        </div>
      </div>`;
  }

  return `
    <div class="message-row message-row--other">
      ${renderAssistantAvatar()}
      <div class="message-bubble message-bubble--other message-bubble--assistant">
        <div class="message-bubble__meta">
          <span class="message-bubble__author">${escapeHtml(ASSISTANT_AUTHOR)}</span>
          ${timeHtml}
        </div>
        ${renderMarkdownLite(message.text)}
      </div>
    </div>`;
}

function renderTypingIndicator() {
  return `<p class="chat-system-message" role="status">Assistente Zela está digitando...</p>`;
}

async function loadKnowledge() {
  if (knowledgeCache) return knowledgeCache;
  if (knowledgePromise) return knowledgePromise;

  knowledgePromise = fetch(window.ZL.asset("data/assistant-knowledge.json"))
    .then((res) => (res.ok ? res.json() : FALLBACK_KNOWLEDGE))
    .catch(() => FALLBACK_KNOWLEDGE)
    .then((data) => {
      knowledgeCache = data;
      return data;
    });

  return knowledgePromise;
}

function getStoredMessages() {
  if (!window.ZL?.storage) return [];
  const stored = window.ZL.storage.get(ASSISTANT_STORAGE_KEY, []);
  return Array.isArray(stored) ? stored : [];
}

function saveStoredMessages(messages) {
  if (!window.ZL?.storage) return false;
  return window.ZL.storage.set(ASSISTANT_STORAGE_KEY, messages);
}

window.ZL.getAssistantMessages = getStoredMessages;

window.ZL.clearAssistantMessages = function () {
  if (window.ZL?.storage) {
    window.ZL.storage.remove(ASSISTANT_STORAGE_KEY);
  }
  document.dispatchEvent(new CustomEvent("zela:assistant-cleared"));
};

function detectCrisis(text, knowledge) {
  const normalized = normalizeText(text);
  const keywords = knowledge?.crisisKeywords || FALLBACK_KNOWLEDGE.crisisKeywords;
  return keywords.some((keyword) => normalized.includes(normalizeText(keyword)));
}

function matchFaq(text, knowledge) {
  const normalized = normalizeText(text);
  const topics = knowledge?.topics || FALLBACK_KNOWLEDGE.topics;
  let best = null;
  let bestScore = 0;

  topics.forEach((topic) => {
    const score = (topic.keywords || []).reduce((acc, keyword) => {
      const key = normalizeText(keyword);
      return normalized.includes(key) ? acc + key.length : acc;
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  });

  return best?.answer || null;
}

function getDefaultFaqAnswer(knowledge) {
  return (
    "Posso orientar sobre **direitos**, **tipos de violência** e **canais oficiais** (180, 190, DEAM, 188). " +
    "Tente perguntar, por exemplo: \"Como funciona a DEAM?\" ou \"Quais são meus direitos?\". " +
    "Em risco imediato, ligue **190** ou **180**."
  );
}

function canUseAssistantAI() {
  return Boolean(window.ZL?.assistantFunctionUrl) && window.ZL.demoMode === false;
}

async function callAssistantAPI(messages) {
  const url = window.ZL?.assistantFunctionUrl;
  if (!url) return null;

  const payload = messages.map((msg) => ({
    role: msg.role,
    text: msg.text,
  }));

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: payload }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Falha ao consultar a assistente.");
  }

  const data = await response.json();
  return data?.reply || null;
}

async function generateAssistantReply(text, history, knowledge) {
  if (detectCrisis(text, knowledge)) {
    return {
      text: knowledge?.crisisResponse || FALLBACK_KNOWLEDGE.crisisResponse,
      source: "crisis",
    };
  }

  if (canUseAssistantAI()) {
    try {
      const aiReply = await callAssistantAPI(history);
      if (aiReply) {
        return { text: aiReply, source: "ai" };
      }
    } catch (err) {
      console.warn("Zela: IA indisponível, usando FAQ local.", err);
    }
  }

  const faqAnswer = matchFaq(text, knowledge);
  return {
    text: faqAnswer || getDefaultFaqAnswer(knowledge),
    source: "faq",
  };
}

function getDemoNoticeText() {
  if (canUseAssistantAI()) {
    return "Assistente com IA ativa. Orientação informativa — não substitui advogada. Em risco imediato, ligue 190 ou 180.";
  }
  return "Modo demonstração: respostas automáticas locais. Configure Firebase + Cloud Function para IA completa.";
}

function buildAssistantAsset(path) {
  if (typeof window.ZL?.asset === "function") {
    return window.ZL.asset(path);
  }
  return path;
}

function buildAssistantMarkup(options = {}) {
  const compact = options.compact === true;
  const inputId = options.inputId || "assistant-input";
  return (
    '<div class="assistant-chat' +
    (compact ? " assistant-chat--compact" : "") +
    '">' +
    '<div class="assistant-chat__notice alert alert--info" data-assistant-notice>' +
    escapeHtml(getDemoNoticeText()) +
    "</div>" +
    '<div class="assistant-chat__messages message-list" data-assistant-messages aria-live="polite"></div>' +
    '<div class="assistant-chat__composer">' +
    '<div class="chat-suggestions" data-assistant-suggestions hidden aria-label="Sugestões de pergunta"></div>' +
    '<form class="chat-input-row" data-assistant-form method="post" action="#" novalidate>' +
    '<label class="sr-only" for="' +
    escapeHtml(inputId) +
    '">Sua pergunta</label>' +
    '<input class="form-input" type="text" id="' +
    escapeHtml(inputId) +
    '" data-assistant-input placeholder="Escreva sua dúvida..." autocomplete="off">' +
    '<button type="submit" class="btn btn--primary" data-assistant-send>Enviar</button>' +
    "</form>" +
    '<div class="assistant-chat__actions">' +
    '<button type="button" class="btn btn--ghost btn--sm" data-assistant-clear>Limpar conversa</button>' +
    (options.showExpandLink
      ? '<a href="' +
        escapeHtml(buildAssistantAsset("support/assistente.html")) +
        '" class="assistant-chat__expand-link">Abrir em tela cheia</a>'
      : "") +
    "</div></div></div>"
  );
}

window.ZL.initAssistantChat = function (rootEl, options = {}) {
  if (!rootEl) return { ok: false, error: "Elemento do chat não encontrado." };

  try {
    const inputId = options.inputId || `assistant-input-${Math.random().toString(36).slice(2, 8)}`;
    rootEl.innerHTML = buildAssistantMarkup({ ...options, inputId });

    const messagesEl = rootEl.querySelector("[data-assistant-messages]");
    const formEl = rootEl.querySelector("[data-assistant-form]");
    const inputEl = rootEl.querySelector("[data-assistant-input]");
    const suggestionsEl = rootEl.querySelector("[data-assistant-suggestions]");
    const noticeEl = rootEl.querySelector("[data-assistant-notice]");
    const clearBtn = rootEl.querySelector("[data-assistant-clear]");

    if (!messagesEl || !formEl || !inputEl) {
      const missing = [
        !messagesEl ? "mensagens" : null,
        !formEl ? "formulario" : null,
        !inputEl ? "input" : null,
      ]
        .filter(Boolean)
        .join(", ");
      throw new Error("Nao foi possivel montar a interface do chat (" + missing + ").");
    }

    let knowledge = FALLBACK_KNOWLEDGE;
    let messages = getStoredMessages().filter(
      (msg) => msg && typeof msg.text === "string" && (msg.role === "user" || msg.role === "assistant")
    );
    let isTyping = false;
    let replyTimeout = null;

    function updateNotice() {
      if (noticeEl) noticeEl.textContent = getDemoNoticeText();
    }

    function render() {
      if (!messagesEl) return;

      if (messages.length === 0 && !isTyping) {
        messagesEl.innerHTML = renderMessageBubble({
          role: "assistant",
          text: knowledge.welcomeMessage || FALLBACK_KNOWLEDGE.welcomeMessage,
          time: "",
        });
        return;
      }

      messagesEl.innerHTML =
        messages.map((msg) => renderMessageBubble(msg)).join("") + (isTyping ? renderTypingIndicator() : "");
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function renderSuggestions() {
      if (!suggestionsEl) return;
      const suggestions = Array.isArray(knowledge.suggestedMessages)
        ? knowledge.suggestedMessages
        : FALLBACK_KNOWLEDGE.suggestedMessages;

      suggestionsEl.hidden = false;
      suggestionsEl.innerHTML = `
        <p class="chat-suggestions__label">Perguntas frequentes</p>
        <div class="chat-suggestions__list">
          ${suggestions
            .map((msg) => `<button type="button" class="chat-suggestion-chip">${escapeHtml(msg)}</button>`)
            .join("")}
        </div>`;

      suggestionsEl.querySelectorAll(".chat-suggestion-chip").forEach((chip) => {
        chip.addEventListener("click", () => sendMessage(chip.textContent));
      });
    }

    function persist() {
      saveStoredMessages(messages);
    }

    async function sendMessage(rawText) {
      const text = String(rawText || "").trim();
      if (!text || isTyping) return false;

      const userMessage = {
        role: "user",
        author: window.ZL.getCurrentUser?.()?.displayName || "Você",
        text,
        time: formatMessageTime(),
        createdAt: new Date().toISOString(),
      };

      messages.push(userMessage);
      persist();
      render();

      isTyping = true;
      render();

      const delay =
        ASSISTANT_REPLY_MIN_MS + Math.random() * (ASSISTANT_REPLY_MAX_MS - ASSISTANT_REPLY_MIN_MS);

      replyTimeout = window.setTimeout(async () => {
        try {
          const reply = await generateAssistantReply(text, messages, knowledge);
          messages.push({
            role: "assistant",
            text: reply.text,
            time: formatMessageTime(),
            source: reply.source,
            createdAt: new Date().toISOString(),
          });
          persist();
        } catch (err) {
          console.error("Zela: falha ao gerar resposta da assistente.", err);
          messages.push({
            role: "assistant",
            text: "Desculpe, não consegui responder agora. Tente novamente ou ligue **180** para orientação imediata.",
            time: formatMessageTime(),
            source: "error",
            createdAt: new Date().toISOString(),
          });
          persist();
        } finally {
          isTyping = false;
          replyTimeout = null;
          render();
        }
      }, delay);

      if (inputEl) inputEl.value = "";
      return true;
    }

    function handleSubmit(event) {
      event.preventDefault();
      sendMessage(inputEl?.value);
    }

    function handleClear() {
      if (replyTimeout) {
        clearTimeout(replyTimeout);
        replyTimeout = null;
      }
      isTyping = false;
      messages = [];
      window.ZL.clearAssistantMessages();
      render();
    }

    function onAssistantCleared() {
      messages = [];
      isTyping = false;
      render();
    }

    formEl.addEventListener("submit", handleSubmit);
    clearBtn?.addEventListener("click", handleClear);
    inputEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSubmit(event);
      }
    });
    document.addEventListener("zela:assistant-cleared", onAssistantCleared);

    updateNotice();
    renderSuggestions();
    render();

    loadKnowledge()
      .then((loaded) => {
        knowledge = loaded;
        updateNotice();
        renderSuggestions();
        render();
      })
      .catch((err) => {
        console.warn("Zela: falha ao carregar base de conhecimento, usando fallback.", err);
      });

    return {
      ok: true,
      sendMessage,
      render,
      destroy() {
        if (replyTimeout) clearTimeout(replyTimeout);
        formEl.removeEventListener("submit", handleSubmit);
        clearBtn?.removeEventListener("click", handleClear);
        document.removeEventListener("zela:assistant-cleared", onAssistantCleared);
      },
    };
  } catch (err) {
    console.error("Zela: falha ao inicializar assistente.", err);
    const detail = err?.message ? ` (${err.message})` : "";
    rootEl.innerHTML = `<p class="alert alert--error" role="alert">Não foi possível carregar o chat. Recarregue a página.${escapeHtml(detail)}</p>`;
    return { ok: false, error: err.message || "Falha ao inicializar chat." };
  }
};

window.ZL.initAssistantPage = function () {
  if (document.body?.dataset?.page !== "assistant") return;

  const rootEl = document.getElementById("assistant-chat-root");
  if (!rootEl) return;

  try {
    const result = window.ZL.initAssistantChat(rootEl, { showExpandLink: false });
    if (result?.ok === false) {
      rootEl.innerHTML = `<p class="alert alert--error" role="alert">Não foi possível carregar o chat. Recarregue a página.</p>`;
    }
  } catch (err) {
    console.error("Zela: falha ao iniciar página da assistente.", err);
    rootEl.innerHTML = `<p class="alert alert--error" role="alert">Não foi possível carregar o chat. Recarregue a página.</p>`;
  }
};

function startAssistantPageInit() {
  if (typeof window.ZL.initAssistantPage !== "function") return;
  window.ZL.initAssistantPage();
}

document.addEventListener("zela:ready", startAssistantPageInit);
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(startAssistantPageInit, 0);
});
})();
