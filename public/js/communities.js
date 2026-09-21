/**
 * Comunidades de chat — listagem, criação (demo) e painel centralizado.
 */
window.ZL = window.ZL || {};

const COMMUNITIES_JSON_VERSION = 9;
const USER_COMMUNITIES_KEY = "user_communities";
const COMMUNITIES_VERSION_KEY = "communities_json_version";
const DEFAULT_ROOM_ID = "amizade";

let communitiesCache = null;

window.ZL.clearCommunitiesCache = function () {
  communitiesCache = null;
};

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function slugify(name) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36);
  return `${base || "comunidade"}-${Date.now()}`;
}

window.ZL.getRoomFromUrl = function () {
  const params = new URLSearchParams(window.location.search);
  return params.get("room") || DEFAULT_ROOM_ID;
};

window.ZL.getChatUrl = function (roomId) {
  return `${window.ZL.asset("community/chat.html")}?room=${encodeURIComponent(roomId)}`;
};

window.ZL.getChatRoomQueryUrl = function (roomId) {
  return `?room=${encodeURIComponent(roomId)}`;
};

function joinedStorageKey(roomId) {
  return `chat_joined_${roomId}`;
}

window.ZL.isCommunityJoined = function (roomId) {
  return window.ZL.storage.get(joinedStorageKey(roomId), false) === true;
};

window.ZL.joinCommunity = function (roomId, options = {}) {
  if (!window.ZL.storage.set(joinedStorageKey(roomId), true)) {
    return false;
  }
  if (!options.silent) {
    document.dispatchEvent(new CustomEvent("zela:chat-join-changed", { detail: { roomId, joined: true } }));
  }
  return true;
};

function getCuratedFallback() {
  return window.ZL.CURATED_COMMUNITIES_FALLBACK || [];
}

function mergeCommunities(curated) {
  const userCreated = window.ZL.storage.get(USER_COMMUNITIES_KEY, []);
  const seen = new Set(curated.map((c) => c.id));
  const merged = [...curated];
  userCreated.forEach((c) => {
    if (!seen.has(c.id)) {
      merged.push(c);
      seen.add(c.id);
    }
  });
  return merged;
}

window.ZL.loadCommunities = async function () {
  const storedVersion = window.ZL.storage.get(COMMUNITIES_VERSION_KEY, null);
  if (storedVersion !== COMMUNITIES_JSON_VERSION) {
    communitiesCache = null;
  }

  if (communitiesCache) return communitiesCache;

  let curated = [];
  try {
    const url = `${window.ZL.asset("data/communities.json")}?v=${COMMUNITIES_JSON_VERSION}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    curated = data.communities || [];
  } catch (err) {
    console.warn("Zela: fetch de communities.json falhou; usando fallback embutido.", err);
    curated = getCuratedFallback();
    if (!curated.length) {
      throw new Error("Não foi possível carregar as comunidades.");
    }
  }

  communitiesCache = mergeCommunities(curated);
  window.ZL.storage.set(COMMUNITIES_VERSION_KEY, COMMUNITIES_JSON_VERSION);
  return communitiesCache;
};

window.ZL.getCommunityById = async function (roomId) {
  const list = await window.ZL.loadCommunities();
  return list.find((c) => c.id === roomId) || null;
};

window.ZL.createCommunity = function ({ name, description, type }) {
  const trimmedName = (name || "").trim();
  if (trimmedName.length < 3) {
    throw new Error("O nome da comunidade deve ter pelo menos 3 caracteres.");
  }

  const community = {
    id: slugify(trimmedName),
    name: trimmedName,
    description: (description || "").trim() || "Comunidade criada por uma usuária",
    type: type === "alert" ? "alert" : "chat",
    icon: type === "alert" ? "alert" : "chat",
    userCreated: true,
    seedMessages: [],
  };

  const userCommunities = window.ZL.storage.get(USER_COMMUNITIES_KEY, []);
  userCommunities.push(community);
  window.ZL.storage.set(USER_COMMUNITIES_KEY, userCommunities);
  communitiesCache = null;

  return community;
};

function formatMemberCountLabel(count) {
  if (!count || count < 1) return "";
  return count === 1 ? "1 mulher online" : `${count} mulheres online`;
}

function getLastSeedPreview(community) {
  const seeds = community.seedMessages || [];
  if (seeds.length === 0) return "";
  const last = seeds[seeds.length - 1];
  const author = last.author ? `${last.author}: ` : "";
  return `${author}${last.text || ""}`;
}

function renderCommunityBrowseCard(community, activeRoomId, options = {}) {
  const isActive = activeRoomId === community.id;
  const isAlert = community.type === "alert";
  const isJoined = window.ZL.isCommunityJoined?.(community.id) ?? false;
  const iconName = community.icon || (isAlert ? "alert" : "chat");
  const memberLabel = formatMemberCountLabel(community.memberCount);
  const preview = getLastSeedPreview(community);
  const cardClass = `community-card${isActive ? " community-card--active" : ""}${isJoined ? " community-card--joined" : ""}${isAlert ? " community-card--alert" : ""}`;
  const cardBody = `
      <span class="community-card__icon">${window.ZL.icon(iconName, "icon icon--shortcut", 20)}</span>
      <span class="community-card__body">
        <span class="community-card__header">
          <span class="community-card__name">${escapeHtml(community.name)}</span>
          ${isJoined ? '<span class="community-card__joined" aria-label="Participando">✓</span>' : ""}
          ${isAlert ? '<span class="community-card__badge">Alerta</span>' : ""}
        </span>
        <span class="community-card__desc">${escapeHtml(community.description)}</span>
        ${memberLabel ? `<span class="community-card__members">${escapeHtml(memberLabel)}</span>` : ""}
        ${preview ? `<span class="community-card__preview">${escapeHtml(preview)}</span>` : ""}
      </span>`;

  if (options.chatPage) {
    return `
    <a
      href="${window.ZL.getChatRoomQueryUrl(community.id)}"
      class="${cardClass}"
      data-room-id="${escapeHtml(community.id)}"
      ${isActive ? 'aria-current="page"' : ""}
    >
      ${cardBody}
    </a>`;
  }

  return `
    <a
      href="${window.ZL.getChatUrl(community.id)}"
      class="${cardClass}"
      data-room-id="${escapeHtml(community.id)}"
      ${isActive ? 'aria-current="page"' : ""}
    >
      ${cardBody}
    </a>`;
}

function renderCommunityItem(community, activeRoomId, variant) {
  const isActive = activeRoomId === community.id;
  const isAlert = community.type === "alert";
  const iconName = community.icon || (isAlert ? "alert" : "chat");
  const isCompact = variant === "compact";

  if (isCompact) {
    const isJoined = window.ZL.isCommunityJoined?.(community.id) ?? false;
    return `
      <a
        href="${window.ZL.getChatUrl(community.id)}"
        class="community-pill${isActive ? " community-pill--active" : ""}${isAlert ? " community-pill--alert" : ""}${isJoined ? " community-pill--joined" : ""}"
        ${isActive ? 'aria-current="page"' : ""}
      >
        ${isJoined ? '<span class="community-pill__check" aria-hidden="true">✓</span>' : ""}
        ${escapeHtml(community.name)}
      </a>`;
  }

  return `
    <a
      href="${window.ZL.getChatUrl(community.id)}"
      class="community-item${isActive ? " community-item--active" : ""}${isAlert ? " community-item--alert" : ""}"
      ${isActive ? 'aria-current="page"' : ""}
    >
      <span class="community-item__icon">${window.ZL.icon(iconName, "icon icon--shortcut", 20)}</span>
      <span class="community-item__body">
        <span class="community-item__name">${escapeHtml(community.name)}</span>
        <span class="community-item__desc">${escapeHtml(community.description)}</span>
      </span>
      ${isAlert ? '<span class="community-item__badge">Alerta</span>' : ""}
    </a>`;
}

function renderCreateFormFields() {
  return `
    <form id="community-create-form" class="community-create__form">
      <div class="form-group">
        <label class="form-label" for="community-name">Nome</label>
        <input class="form-input" type="text" id="community-name" required minlength="3" maxlength="60" placeholder="Ex.: Grupo de estudos">
      </div>
      <div class="form-group">
        <label class="form-label" for="community-description">Descrição</label>
        <input class="form-input" type="text" id="community-description" maxlength="120" placeholder="Breve descrição do grupo">
      </div>
      <div class="form-group">
        <label class="form-label" for="community-type">Tipo</label>
        <select class="form-input" id="community-type">
          <option value="chat">Conversa</option>
          <option value="alert">Alerta</option>
        </select>
      </div>
      <p class="form-error" id="community-create-error" role="alert"></p>
      <button type="submit" class="btn btn--primary btn--block">Criar e entrar</button>
    </form>`;
}

function renderCreateSection(toggleLabel, toggleClass = "btn btn--ghost btn--block community-create__toggle") {
  return `
    <div class="community-create">
      <button type="button" class="${toggleClass}" id="community-create-toggle" aria-expanded="false" aria-controls="community-create-form-wrap">
        ${toggleLabel}
      </button>
      <div class="community-create__form-wrap" id="community-create-form-wrap" hidden>
        ${renderCreateFormFields()}
      </div>
    </div>`;
}

function bindCreateForm(container) {
  const toggleBtn = container.querySelector("#community-create-toggle");
  const formWrap = container.querySelector("#community-create-form-wrap");
  const form = container.querySelector("#community-create-form");
  const errorEl = container.querySelector("#community-create-error");

  if (!toggleBtn || !formWrap || !form) return;

  toggleBtn.addEventListener("click", () => {
    const open = formWrap.hidden;
    formWrap.hidden = !open;
    toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) form.querySelector("#community-name")?.focus();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (errorEl) errorEl.textContent = "";

    const user = window.ZL.getCurrentUser();
    if (!user) {
      const redirect = window.location.pathname + window.location.search;
      window.location.href =
        window.ZL.asset("auth/login.html") + "?redirect=" + encodeURIComponent(redirect);
      return;
    }

    const name = form.querySelector("#community-name")?.value || "";
    const description = form.querySelector("#community-description")?.value || "";
    const type = form.querySelector("#community-type")?.value || "chat";

    try {
      const community = window.ZL.createCommunity({ name, description, type });
      window.ZL.joinCommunity(community.id, { silent: true });
      if (document.body.dataset.page === "chat" && typeof window.ZL.openChatRoom === "function") {
        window.ZL.openChatRoom(community.id);
        return;
      }
      window.location.href = window.ZL.getChatUrl(community.id);
    } catch (err) {
      if (errorEl) errorEl.textContent = err.message || "Não foi possível criar a comunidade.";
    }
  });
}

window.ZL.renderCommunitiesPanel = async function (container, options = {}) {
  if (!container) return;

  const {
    activeRoomId = null,
    showCreateForm = true,
    variant = "full",
  } = options;

  container.innerHTML = '<p class="text-muted communities-panel__loading">Carregando comunidades...</p>';

  try {
    const communities = await window.ZL.loadCommunities();

    if (variant === "browse") {
      const isChatPage = document.body.dataset.page === "chat";
      const cardsHtml = communities
        .map((c) => renderCommunityBrowseCard(c, activeRoomId, { chatPage: isChatPage }))
        .join("");
      const createSection = showCreateForm
        ? renderCreateSection("+ Nova comunidade", "btn btn--sm btn--ghost btn--block community-create__toggle")
        : "";

      container.innerHTML = `
        <div class="communities-panel communities-panel--browse">
          <h2 class="communities-panel__browse-title">Comunidades femininas</h2>
          <nav class="communities-panel__list communities-panel__list--browse" aria-label="Comunidades femininas">
            ${cardsHtml}
          </nav>
          ${createSection}
        </div>`;

      bindCreateForm(container);
      return;
    }

    const itemsHtml = communities
      .map((c) => renderCommunityItem(c, activeRoomId, variant))
      .join("");

    if (variant === "compact") {
      const createRow = showCreateForm
        ? `<button type="button" class="btn btn--sm btn--ghost community-create__toggle" id="community-create-toggle" aria-expanded="false" aria-controls="community-create-form-wrap">+ Nova</button>`
        : "";
      const createForm = showCreateForm
        ? `<div class="community-create community-create--compact"><div class="community-create__form-wrap" id="community-create-form-wrap" hidden>${renderCreateFormFields()}</div></div>`
        : "";

      container.innerHTML = `
        <div class="communities-panel communities-panel--compact">
          <div class="communities-panel__compact-row">
            <nav class="communities-panel__list communities-panel__list--compact" aria-label="Salas de chat">
              ${itemsHtml}
            </nav>
            ${createRow}
          </div>
          ${createForm}
        </div>`;
    } else {
      const createSection = showCreateForm ? renderCreateSection("+ Criar comunidade") : "";

      container.innerHTML = `
        <div class="communities-panel communities-panel--full">
          <p class="communities-panel__subtitle">Converse, faça amizades e receba alertas</p>
          <nav class="communities-panel__list communities-panel__list--full" aria-label="Lista de comunidades">
            ${itemsHtml}
          </nav>
          ${createSection}
        </div>`;
    }

    bindCreateForm(container);
  } catch (err) {
    container.innerHTML = `<p class="text-muted">${escapeHtml(err.message || "Erro ao carregar comunidades.")}</p>`;
  }
};

document.addEventListener("zela:ready", async () => {
  const panel = document.getElementById("communities-panel");
  if (!panel) return;

  const isChatPage = document.body.dataset.page === "chat";
  await window.ZL.renderCommunitiesPanel(panel, {
    activeRoomId: isChatPage ? null : window.ZL.getRoomFromUrl?.(),
    showCreateForm: true,
    variant: "browse",
  });
});

document.addEventListener("zela:chat-join-changed", async () => {
  const panel = document.getElementById("communities-panel");
  const browseEl = document.getElementById("chat-browse-view");
  if (!panel || document.body.dataset.page !== "chat" || !browseEl?.classList.contains("chat-view--active")) return;

  await window.ZL.renderCommunitiesPanel(panel, {
    activeRoomId: null,
    showCreateForm: true,
    variant: "browse",
  });
});
