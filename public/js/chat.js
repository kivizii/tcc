/**
 * Chat feminino — demo fixo em JSON + mensagens da usuária + respostas simuladas.
 */
window.ZL = window.ZL || {};

const DEFAULT_ROOM_ID = "amizade";
const LEGACY_STORAGE_KEY = "chat_messages";
const SIMULATED_REPLY_MIN_MS = 1500;
const SIMULATED_REPLY_MAX_MS = 3000;
const COMMUNITY_FETCH_TIMEOUT_MS = 5000;

const DEFAULT_SUGGESTED_MESSAGES = [
  "Oi, meninas!",
  "Obrigada pelo acolhimento.",
  "Alguém pode conversar?",
];

const GENERIC_SIMULATED_REPLIES = [
  "Obrigada por compartilhar. Você não está sozinha.",
  "Te entendo. Estamos aqui com você.",
  "Pode falar no seu tempo. Ninguém vai te julgar.",
  "Que bom que você escreveu. Isso já é um passo importante.",
  "Seu relato importa. Obrigada por confiar neste espaço.",
  "Respira fundo. Você está entre amigas aqui.",
];

const AVATAR_COLORS = [
  "var(--color-rosa)",
  "var(--color-lilas)",
  "var(--color-nude)",
  "var(--color-info)",
  "var(--color-sucesso)",
];

const FALLBACK_COMMUNITIES = {
  amizade: {
    id: "amizade",
    name: "Amizade e acolhimento",
    description: "Faça amizades e encontre apoio emocional",
    memberCount: 18,
    seedMessages: [
      { author: "Ana", text: "Bom dia, meninas. Vocês não estão sozinhas. Estamos aqui para ouvir.", time: "08:42", own: false },
      { author: "Marina", text: "Oi, Ana! Obrigada por abrir o dia assim. Alguém quer conversar hoje?", time: "08:45", own: false },
      { author: "Patrícia", text: "Eu queria. Passei a noite ansiosa e não sei com quem desabafar fora daqui.", time: "08:51", own: false },
      { author: "Sofia", text: "Patrícia, pode falar no seu tempo. Ninguém vai te julgar.", time: "08:54", own: false },
      { author: "Ana", text: "Exato. Às vezes só escrever já alivia um pouco.", time: "08:56", own: false },
      { author: "Marina", text: "Quando me sinto sozinha, lembro que este espaço existe. Me ajuda muito.", time: "09:02", own: false },
      { author: "Patrícia", text: "Isso me conforta. Acho que vou contar o que aconteceu ontem.", time: "09:08", own: false },
      { author: "Sofia", text: "Estamos aqui. Respira fundo e vai com calma.", time: "09:10", own: false },
      { author: "Ana", text: "Se preferir, pode mandar só um pedacinho. Você decide o ritmo.", time: "09:12", own: false },
      { author: "Marina", text: "E se alguém nova chegar hoje: seja bem-vinda. Este é um lugar seguro.", time: "09:18", own: false },
    ],
  },
};

function userMessagesStorageKey(roomId) {
  return `chat_user_${roomId}`;
}

function simulatedMessagesStorageKey(roomId) {
  return `chat_simulated_${roomId}`;
}

function legacyMessagesStorageKey(roomId) {
  return `chat_messages_${roomId}`;
}

function getFallbackCommunity(roomId) {
  const curated = window.ZL.CURATED_COMMUNITIES_FALLBACK;
  if (Array.isArray(curated)) {
    const found = curated.find((c) => c.id === roomId);
    if (found) return found;
  }
  return FALLBACK_COMMUNITIES[roomId] || FALLBACK_COMMUNITIES[DEFAULT_ROOM_ID];
}

function resolveCommunity(community, roomId) {
  if (community?.seedMessages?.length) return community;
  const fallback = getFallbackCommunity(roomId);
  if (!community) return fallback;
  return { ...community, seedMessages: fallback.seedMessages };
}

function getDemoMessages(community) {
  return community?.seedMessages || [];
}

function getUserMessages(roomId) {
  if (!window.ZL?.storage) return [];
  return window.ZL.storage.get(userMessagesStorageKey(roomId), []);
}

function getSimulatedMessages(roomId) {
  if (!window.ZL?.storage) return [];
  return window.ZL.storage.get(simulatedMessagesStorageKey(roomId), []);
}

function canSendInChat() {
  if (window.ZL.getCurrentUser?.()) return true;
  if (document.body?.dataset?.page === "chat") return true;
  return window.ZL.demoMode !== false;
}

function getChatActor() {
  return (
    window.ZL.getCurrentUser?.() || {
      uid: "demo-guest",
      displayName: "Você",
      avatarDataUrl: "",
    }
  );
}

window.ZL.paintChatSeedsFallback = function (roomId) {
  const listEl = document.getElementById("chat-messages");
  if (!listEl || listEl.getAttribute("data-zl-has-messages") === "1") return false;

  const community = resolveCommunity(null, roomId || DEFAULT_ROOM_ID);
  const msgs = getDemoMessages(community);
  if (!msgs.length) return false;

  const guestUser = getChatActor();
  listEl.innerHTML = msgs.map((msg) => renderMessageBubble(msg, guestUser)).join("");
  listEl.setAttribute("data-zl-has-messages", "1");
  listEl.scrollTop = listEl.scrollHeight;
  return true;
};

function saveUserMessages(roomId, msgs) {
  return window.ZL.storage.set(userMessagesStorageKey(roomId), msgs);
}

function saveSimulatedMessages(roomId, msgs) {
  return window.ZL.storage.set(simulatedMessagesStorageKey(roomId), msgs);
}

function fetchCommunityWithTimeout(roomId, timeoutMs = COMMUNITY_FETCH_TIMEOUT_MS) {
  if (typeof window.ZL.getCommunityById !== "function") {
    return Promise.resolve(null);
  }

  return Promise.race([
    window.ZL.getCommunityById(roomId),
    new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}

function getAllMessages(community, roomId, extraUserMessages = []) {
  const seeds = getDemoMessages(community);
  const dynamic = [
    ...getUserMessages(roomId),
    ...extraUserMessages,
    ...getSimulatedMessages(roomId),
  ].sort(
    (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  );
  return [...seeds, ...dynamic];
}

function getSuggestedMessages(community) {
  const custom = community?.suggestedMessages;
  if (Array.isArray(custom) && custom.length > 0) {
    return custom.filter((msg) => typeof msg === "string" && msg.trim());
  }
  return DEFAULT_SUGGESTED_MESSAGES;
}

function getCommunityAuthors(community) {
  const seeds = community?.seedMessages || [];
  const authors = seeds.map((m) => m.author).filter(Boolean);
  const unique = [...new Set(authors)].filter((name) => name !== "Moderação");
  return unique.length > 0 ? unique : ["Marina"];
}

function pickSimulatedReply(community) {
  const authors = getCommunityAuthors(community);
  const author = authors[Math.floor(Math.random() * authors.length)];
  const pool =
    Array.isArray(community?.simulatedReplies) && community.simulatedReplies.length > 0
      ? community.simulatedReplies
      : GENERIC_SIMULATED_REPLIES;
  const text = pool[Math.floor(Math.random() * pool.length)];
  return { author, text };
}

function migrateLegacyMessages(roomId) {
  if (!window.ZL?.storage) return;

  const userKey = userMessagesStorageKey(roomId);
  const legacyRoom = window.ZL.storage.get(legacyMessagesStorageKey(roomId), null);
  const legacyGlobal = roomId === DEFAULT_ROOM_ID
    ? window.ZL.storage.get(LEGACY_STORAGE_KEY, null)
    : null;
  const sources = [legacyRoom, legacyGlobal].filter((msgs) => Array.isArray(msgs) && msgs.length > 0);

  if (sources.length > 0) {
    const existingUser = window.ZL.storage.get(userKey, []);
    if (!existingUser || existingUser.length === 0) {
      const ownMessages = sources.flat().filter((m) => m && m.own);
      if (ownMessages.length > 0) {
        window.ZL.storage.set(userKey, ownMessages);
      }
    }
  }

  window.ZL.storage.remove(legacyMessagesStorageKey(roomId));
  if (roomId === DEFAULT_ROOM_ID) {
    window.ZL.storage.remove(LEGACY_STORAGE_KEY);
  }
}

function formatMessageTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
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

function getAvatarColor(name) {
  return AVATAR_COLORS[hashAuthorName(name) % AVATAR_COLORS.length];
}

function renderOwnMessageAvatar(user) {
  if (typeof window.ZL.getAvatarMarkup === "function" && user) {
    return `<span class="message-bubble__avatar message-bubble__avatar--profile">${window.ZL.getAvatarMarkup(user, "sm")}</span>`;
  }

  const name = user?.displayName || "Você";
  const initials = getAuthorInitials(name);
  const avatarColor = getAvatarColor(name);
  return `<span class="message-bubble__avatar" style="background:${avatarColor}" aria-hidden="true">${escapeHtml(initials)}</span>`;
}

function renderMessageBubble(m, currentUser) {
  const timeHtml = m.time
    ? `<span class="message-bubble__time">${escapeHtml(m.time)}</span>`
    : "";

  if (m.own) {
    return `
      <div class="message-row message-row--own">
        ${renderOwnMessageAvatar(currentUser)}
        <div class="message-bubble message-bubble--own">
          <div class="message-bubble__meta">
            <span class="message-bubble__author">${escapeHtml(m.author)}</span>
            ${timeHtml}
          </div>
          ${escapeHtml(m.text)}
        </div>
      </div>`;
  }

  const initials = getAuthorInitials(m.author);
  const avatarColor = getAvatarColor(m.author || "?");
  const simulatedClass = m.simulated ? " message-bubble--simulated" : "";

  return `
    <div class="message-row message-row--other">
      <span class="message-bubble__avatar" style="background:${avatarColor}" aria-hidden="true">${escapeHtml(initials)}</span>
      <div class="message-bubble message-bubble--other${simulatedClass}">
        <div class="message-bubble__meta">
          <span class="message-bubble__author">${escapeHtml(m.author)}</span>
          ${timeHtml}
        </div>
        ${escapeHtml(m.text)}
      </div>
    </div>`;
}

function renderSystemMessage(text) {
  return `<p class="chat-system-message">${escapeHtml(text)}</p>`;
}

function formatMemberCount(count) {
  if (!count || count < 1) return "";
  return count === 1 ? "1 mulher online" : `${count} mulheres online`;
}

function scrollToMessages(listEl) {
  if (!listEl) return;
  listEl.classList.remove("message-list--entered");
  listEl.scrollIntoView({ behavior: "smooth", block: "start" });
  requestAnimationFrame(() => {
    listEl.classList.add("message-list--entered");
  });
}

function updateRoomHeader(state) {
  const { community, titleEl, subtitleEl, iconEl, membersEl } = state;
  const roomName = community.name || "Chat feminino";
  const roomDescription = community.description || "Converse com segurança. Você não está sozinha.";
  const iconName = community.icon || (community.type === "alert" ? "alert" : "chat");

  if (titleEl) titleEl.textContent = roomName;
  if (subtitleEl) subtitleEl.textContent = roomDescription;
  if (iconEl && typeof window.ZL.icon === "function") {
    iconEl.innerHTML = window.ZL.icon(iconName, "icon icon--shortcut", 24);
  }
  if (membersEl) {
    const memberText = formatMemberCount(community.memberCount);
    if (memberText) {
      membersEl.textContent = memberText;
      membersEl.hidden = false;
    } else {
      membersEl.hidden = true;
    }
  }
  document.title = `${roomName} — Zela`;
}

let chatPageState = null;
let pendingRoomId = null;
let chatInitPromise = null;

const CHAT_BROWSE_TITLE = "Chat feminino — Zela";

function extractRoomIdFromCard(card) {
  const fromData = card.dataset.roomId;
  if (fromData) return fromData;

  try {
    return new URL(card.href, window.location.href).searchParams.get("room");
  } catch {
    return null;
  }
}

function getChatBrowseUrl() {
  return window.location.pathname;
}

function getChatRoomUrl(roomId) {
  return `${window.location.pathname}?room=${encodeURIComponent(roomId)}`;
}

function setActiveChatView(mode) {
  const browseEl = document.getElementById("chat-browse-view");
  const roomEl = document.getElementById("chat-room-view");
  const isBrowse = mode === "browse";

  if (browseEl) {
    browseEl.classList.toggle("chat-view--active", isBrowse);
    browseEl.setAttribute("aria-hidden", isBrowse ? "false" : "true");
    if (isBrowse) browseEl.removeAttribute("hidden");
    else browseEl.setAttribute("hidden", "");
  }
  if (roomEl) {
    roomEl.classList.toggle("chat-view--active", !isBrowse);
    roomEl.setAttribute("aria-hidden", isBrowse ? "true" : "false");
    if (isBrowse) roomEl.setAttribute("hidden", "");
    else roomEl.removeAttribute("hidden");
  }

  document.body.dataset.chatView = mode;
}

async function waitForChatElements() {
  for (let i = 0; i < 60; i++) {
    const listEl = document.getElementById("chat-messages");
    const form = document.getElementById("chat-form");
    if (listEl && form) return { listEl, form };
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return null;
}

function showBrowseViewUI() {
  setActiveChatView("browse");
  document.title = CHAT_BROWSE_TITLE;

  try {
    history.replaceState(null, "", getChatBrowseUrl());
  } catch {
    /* file:// may block replaceState */
  }
}

function showRoomViewUI() {
  setActiveChatView("room");
}

function showChatLoading() {
  const listEl = document.getElementById("chat-messages");
  if (listEl) {
    listEl.innerHTML = renderSystemMessage("Carregando conversa...");
  }
}

function showChatRoomError(message) {
  const listEl = document.getElementById("chat-messages");
  if (listEl) {
    listEl.innerHTML = `<p class="text-muted" role="alert">${escapeHtml(message)}</p>`;
  }
  console.error("Zela:", message);
}

function showChatInitError(message) {
  const panel = document.getElementById("communities-panel");
  if (panel) {
    panel.innerHTML = `<p class="text-muted" role="alert">${escapeHtml(message)}</p>`;
  }
  showChatRoomError(message);
}

window.ZL.showBrowseView = function () {
  chatPageState?.cancelSimulatedReply?.();
  showBrowseViewUI();
};

window.ZL.showChatRoom = async function (newRoomId) {
  if (!newRoomId) return false;

  if (!chatPageState) {
    pendingRoomId = newRoomId;
    return false;
  }

  const roomChanged = newRoomId !== chatPageState.roomId;
  chatPageState.cancelSimulatedReply?.();
  showRoomViewUI();

  chatPageState.roomId = newRoomId;
  if (roomChanged) {
    chatPageState.showWelcomeMessage = false;
    migrateLegacyMessages(newRoomId);
  }

  chatPageState.community = resolveCommunity(null, newRoomId);
  updateRoomHeader(chatPageState);
  chatPageState.render();

  try {
    chatPageState.ensureJoinedState();
    chatPageState.updateParticipationUI();
  } catch (err) {
    console.warn("Zela: falha ao atualizar participação na sala.", err);
    chatPageState.updateParticipationUI?.();
  }

  let community = null;
  try {
    community = await fetchCommunityWithTimeout(newRoomId);
  } catch (err) {
    console.warn("Zela: falha ao carregar comunidade, usando fallback.", err);
  }

  chatPageState.community = resolveCommunity(community, newRoomId);
  updateRoomHeader(chatPageState);
  chatPageState.render();

  try {
    history.replaceState(null, "", getChatRoomUrl(newRoomId));
  } catch {
    /* file:// may block replaceState */
  }

  document.dispatchEvent(
    new CustomEvent("zela:chat-room-changed", { detail: { roomId: newRoomId } })
  );

  chatPageState.input?.focus();
  if (chatPageState.listEl) {
    chatPageState.listEl.scrollTop = chatPageState.listEl.scrollHeight;
  }

  return true;
};

window.ZL.switchChatRoom = window.ZL.showChatRoom;

window.ZL.ensureChatPageReady = function () {
  if (chatPageState) return Promise.resolve(true);
  return window.ZL.initChatPage();
};

window.ZL.openChatRoom = async function (roomId) {
  if (!roomId) return false;

  try {
    const ready = await window.ZL.ensureChatPageReady();
    if (!ready) return false;
    return await window.ZL.showChatRoom(roomId);
  } catch (err) {
    console.error("Zela: falha ao abrir sala de chat.", err);
    return false;
  }
};

function getChatLoginRedirectUrl() {
  return window.location.pathname + window.location.search;
}

function redirectToLogin() {
  const loginUrl = window.ZL.asset("auth/login.html");
  const redirect = encodeURIComponent(getChatLoginRedirectUrl());
  window.location.href = `${loginUrl}?redirect=${redirect}`;
}

window.ZL.initChatPage = async function () {
  if (chatPageState) return true;
  if (chatInitPromise) return chatInitPromise;

  chatInitPromise = (async () => {
    const initialRoomId = window.ZL.getRoomFromUrl?.() || DEFAULT_ROOM_ID;
    const user = window.ZL.getCurrentUser();
    const roomFromUrl = new URLSearchParams(window.location.search).get("room");

    if (roomFromUrl) {
      const listEl = document.getElementById("chat-messages");
      if (listEl && listEl.getAttribute("data-zl-has-messages") !== "1") {
        showChatLoading();
      }
    }

    const elements = await waitForChatElements();
    if (!elements) {
      showChatInitError("Não foi possível inicializar o chat. Recarregue a página.");
      return false;
    }

    const { listEl, form } = elements;
    const input = document.getElementById("chat-input");
    const titleEl = document.getElementById("chat-room-title");
    const subtitleEl = document.getElementById("chat-room-subtitle");
    const membersEl = document.getElementById("chat-room-members");
    const iconEl = document.getElementById("chat-room-icon");
    const joinedBadge = document.getElementById("chat-joined-badge");
    const demoNoticeEl = document.getElementById("chat-demo-notice");
    const authNoticeEl = document.getElementById("chat-auth-notice");
    const authLoginLink = document.getElementById("chat-auth-login-link");
    const suggestionsEl = document.getElementById("chat-suggestions");
    const backBtn = document.getElementById("chat-back-btn");
    const sendBtn = document.getElementById("chat-send-btn");

    const state = {
      user: user || { uid: "guest", displayName: "Visitante", avatarDataUrl: "" },
      roomId: initialRoomId,
      community: resolveCommunity(null, initialRoomId),
      showWelcomeMessage: false,
      lastJoinedState: null,
      typingAuthor: null,
      simulatedReplyTimeout: null,
      storageWarning: null,
      memoryUserMessages: [],
      listEl,
      form,
      input,
      titleEl,
      subtitleEl,
      membersEl,
      iconEl,
      joinedBadge,
      demoNoticeEl,
      authNoticeEl,
      authLoginLink,
      sendBtn,
      suggestionsEl,
    };

    chatPageState = state;

    if (authLoginLink) {
      const loginUrl = `${window.ZL.asset("auth/login.html")}?redirect=${encodeURIComponent(getChatLoginRedirectUrl())}`;
      authLoginLink.href = loginUrl;
    }

    function setStorageWarning(message) {
      state.storageWarning = message || null;
      updateParticipationUI();
    }

  function isJoined() {
    return window.ZL.isCommunityJoined?.(state.roomId) ?? false;
  }

  function cancelSimulatedReply() {
    if (state.simulatedReplyTimeout) {
      clearTimeout(state.simulatedReplyTimeout);
      state.simulatedReplyTimeout = null;
    }
    state.typingAuthor = null;
  }

  function scheduleSimulatedReply() {
    cancelSimulatedReply();
    const { author, text } = pickSimulatedReply(state.community);
    state.typingAuthor = author;

    const delay =
      SIMULATED_REPLY_MIN_MS +
      Math.random() * (SIMULATED_REPLY_MAX_MS - SIMULATED_REPLY_MIN_MS);

    render();

    state.simulatedReplyTimeout = setTimeout(() => {
      state.simulatedReplyTimeout = null;
      state.typingAuthor = null;

      const simulated = getSimulatedMessages(state.roomId);
      simulated.push({
        author,
        text,
        time: formatMessageTime(),
        own: false,
        simulated: true,
        createdAt: new Date().toISOString(),
      });
      if (!saveSimulatedMessages(state.roomId, simulated)) {
        setStorageWarning("Não foi possível salvar a resposta simulada neste navegador.");
      }
      render();
    }, delay);
  }

  function showAuthNotice(focusLink = false) {
    if (state.authNoticeEl) {
      state.authNoticeEl.hidden = false;
      if (focusLink) state.authLoginLink?.focus();
    }
  }

  function sendUserMessage(text) {
    if (!canSendInChat()) {
      showAuthNotice(true);
      return false;
    }

    state.user = getChatActor();
    try {
      ensureJoinedState();
    } catch (err) {
      console.warn("Zela: falha ao registrar participação.", err);
    }

    const trimmed = (text || "").trim();
    if (!trimmed) return false;

    const newMsg = {
      author: state.user.displayName || "Você",
      text: trimmed,
      time: formatMessageTime(),
      own: true,
      createdAt: new Date().toISOString(),
    };

    const userMsgs = getUserMessages(state.roomId);
    userMsgs.push(newMsg);

    if (!saveUserMessages(state.roomId, userMsgs)) {
      state.memoryUserMessages.push(newMsg);
      setStorageWarning(
        "Mensagem enviada nesta sessão. O navegador não conseguiu salvar no armazenamento local."
      );
    } else {
      setStorageWarning(null);
    }
    state.showWelcomeMessage = false;
    render();
    updateParticipationUI();
    scheduleSimulatedReply();
    return true;
  }

  function handleMessageSend() {
    if (!canSendInChat()) {
      showAuthNotice(true);
      return false;
    }

    const text = state.input.value.trim();
    if (!text) return false;

    return sendUserMessage(text);
  }

  function isRoomVisible() {
    const roomEl = document.getElementById("chat-room-view");
    return roomEl?.classList.contains("chat-view--active") === true;
  }

  function renderSuggestions() {
    if (!state.suggestionsEl) return;

    if (!isRoomVisible()) {
      state.suggestionsEl.hidden = true;
      state.suggestionsEl.innerHTML = "";
      return;
    }

    const suggestions = getSuggestedMessages(state.community);
    if (suggestions.length === 0) {
      state.suggestionsEl.hidden = true;
      state.suggestionsEl.innerHTML = "";
      return;
    }

    state.suggestionsEl.hidden = false;
    state.suggestionsEl.innerHTML = `
      <p class="chat-suggestions__label">Sugestões rápidas</p>
      <div class="chat-suggestions__list">
        ${suggestions
          .map(
            (msg) =>
              `<button type="button" class="chat-suggestion-chip">${escapeHtml(msg)}</button>`
          )
          .join("")}
      </div>`;

    state.suggestionsEl.querySelectorAll(".chat-suggestion-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        sendUserMessage(chip.textContent);
      });
    });
  }

  function updateParticipationUI() {
    const joined = isJoined();
    const roomVisible = isRoomVisible();

    if (state.joinedBadge) state.joinedBadge.hidden = !joined;

    const loggedIn = !!window.ZL.getCurrentUser();
    const canSend = canSendInChat();

    if (state.authNoticeEl) {
      state.authNoticeEl.hidden = !roomVisible || loggedIn || (canSend && window.ZL.demoMode);
    }

    if (roomVisible) {
      state.form.hidden = false;
      state.form.classList.remove("chat-input-row--locked");
      if (state.input) {
        state.input.disabled = false;
        state.input.readOnly = !canSend;
        state.input.placeholder = canSend
          ? "Escreva sua mensagem..."
          : "Faça login para enviar mensagens";
      }
      if (state.sendBtn) {
        state.sendBtn.disabled = false;
        state.sendBtn.setAttribute("aria-disabled", canSend ? "false" : "true");
      }
      if (state.demoNoticeEl) {
        if (state.storageWarning) {
          state.demoNoticeEl.textContent = state.storageWarning;
        } else if (!loggedIn && window.ZL.demoMode) {
          state.demoNoticeEl.textContent =
            "Modo demonstração: você pode enviar mensagens. Faça login para salvar seu perfil e participar com seu nome.";
        } else {
          state.demoNoticeEl.textContent = loggedIn
            ? "Conversas demonstrativas entre participantes fictícias. Suas mensagens aparecem em lilás e podem receber respostas simuladas de acolhimento."
            : "Você pode ler as conversas. Faça login para enviar mensagens nesta comunidade.";
        }
      }
    } else {
      state.form.hidden = true;
      state.form.classList.add("chat-input-row--locked");
      if (state.input) state.input.disabled = true;
      if (state.sendBtn) {
        state.sendBtn.disabled = true;
        state.sendBtn.setAttribute("aria-disabled", "true");
      }
    }

    renderSuggestions();

    if (state.lastJoinedState !== joined) {
      state.lastJoinedState = joined;
      document.dispatchEvent(
        new CustomEvent("zela:chat-join-changed", { detail: { roomId: state.roomId, joined } })
      );
    }
  }

  function ensureJoinedState() {
    if (typeof window.ZL.joinCommunity !== "function" || isJoined()) return;

    if (!window.ZL.joinCommunity(state.roomId, { silent: true })) {
      throw new Error("Falha ao salvar participação no chat.");
    }
  }

  function render() {
    const msgs = getAllMessages(state.community, state.roomId, state.memoryUserMessages);

    if (msgs.length === 0 && !state.showWelcomeMessage && !state.typingAuthor) {
      state.listEl.innerHTML = renderSystemMessage(
        "Seja bem-vinda! Você pode começar a conversa por aqui."
      );
      return;
    }

    const welcomeHtml = state.showWelcomeMessage
      ? renderSystemMessage("Você entrou na comunidade. Seja bem-vinda!")
      : "";

    const typingHtml = state.typingAuthor
      ? renderSystemMessage(`${state.typingAuthor} está digitando...`)
      : "";

    state.listEl.innerHTML =
      welcomeHtml +
      msgs.map((msg) => renderMessageBubble(msg, state.user)).join("") +
      typingHtml;
    state.listEl.setAttribute(
      "data-zl-has-messages",
      msgs.length > 0 || state.showWelcomeMessage || state.typingAuthor ? "1" : "0"
    );
    state.listEl.scrollTop = state.listEl.scrollHeight;
  }

  document.addEventListener("zela:profile-updated", () => {
    state.user = getChatActor();
    updateParticipationUI();
    render();
  });

  window.ZL.onAuthChange?.(() => {
    state.user = getChatActor();
    updateParticipationUI();
    render();
  });

  state.render = render;
  state.updateParticipationUI = updateParticipationUI;
  state.ensureJoinedState = ensureJoinedState;
  state.cancelSimulatedReply = cancelSimulatedReply;
  state.sendUserMessage = sendUserMessage;
  state.handleMessageSend = handleMessageSend;

  window.ZL.sendChatMessage = function (text) {
    if (!chatPageState?.sendUserMessage) return false;
    return chatPageState.sendUserMessage(text);
  };

  bindChatSendControls();

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.ZL.showBrowseView();
    });
  }

  if (roomFromUrl) {
    showRoomViewUI();
    state.roomId = roomFromUrl;
    state.community = resolveCommunity(null, roomFromUrl);
    updateRoomHeader(state);
    window.ZL.paintChatSeedsFallback(roomFromUrl);
    state.render();
    state.updateParticipationUI();

    try {
      await window.ZL.showChatRoom(roomFromUrl);
    } catch (err) {
      console.warn("Zela: falha ao completar abertura da sala, mantendo fallback.", err);
    }
  } else {
    window.ZL.showBrowseView();
  }

  if (pendingRoomId && pendingRoomId !== roomFromUrl) {
    const pending = pendingRoomId;
    pendingRoomId = null;
    try {
      await window.ZL.showChatRoom(pending);
    } catch (err) {
      console.warn("Zela: falha ao abrir sala pendente.", err);
    }
  } else {
    pendingRoomId = null;
  }

  document.dispatchEvent(new CustomEvent("zela:chat-ready"));

  return true;
  })();

  try {
    const ok = await chatInitPromise;
    if (!ok) chatInitPromise = null;
    return ok;
  } catch (err) {
    console.error("Zela: falha ao inicializar chat.", err);
    showChatInitError("Não foi possível inicializar o chat. Recarregue a página.");
    chatInitPromise = null;
    return false;
  }
};

function bindChatSendControls() {
  const form = document.getElementById("chat-form");
  const sendBtn = document.getElementById("chat-send-btn");
  const input = document.getElementById("chat-input");
  if (!form || form.dataset.zlSendBound === "1") return;
  form.dataset.zlSendBound = "1";

  const doSend = async (event) => {
    event?.preventDefault?.();

    if (typeof window.zlSendChatMessage === "function") {
      window.zlSendChatMessage(event);
      return;
    }

    if (!chatPageState) {
      const ready = await window.ZL.initChatPage?.();
      if (!ready || !chatPageState) return;
    }

    if (chatPageState.handleMessageSend?.()) {
      if (chatPageState.input) chatPageState.input.value = "";
    }
  };

  form.addEventListener("submit", doSend);
  sendBtn?.addEventListener("click", doSend);
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      doSend(e);
    }
  });
}

function startChatPageInit() {
  if (document.body?.dataset?.page !== "chat") return;
  if (typeof window.ZL.initChatPage !== "function") return;

  const roomFromUrl = new URLSearchParams(window.location.search).get("room");
  if (roomFromUrl) {
    window.ZL.paintChatSeedsFallback?.(roomFromUrl);
  }

  window.ZL.initChatPage();
}

document.addEventListener("zela:ready", () => {
  startChatPageInit();
  setTimeout(() => {
    if (!chatPageState) startChatPageInit();
  }, 2000);
});

if (document.readyState !== "loading") {
  setTimeout(() => {
    bindChatSendControls();
    startChatPageInit();
  }, 0);
} else {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      const roomFromUrl = new URLSearchParams(window.location.search).get("room");
      if (roomFromUrl) window.ZL.paintChatSeedsFallback?.(roomFromUrl);
      bindChatSendControls();
    },
    { once: true }
  );
}
