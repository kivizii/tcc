/**
 * Notas da comunidade — feed público com demonstração, notas privadas e comentários.
 */
window.ZL = window.ZL || {};

const NOTE_MAX_LENGTH = 280;
const COMMENT_MAX_LENGTH = 200;
const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const PUBLIC_NOTES_KEY = "public_daily_notes";

const SEED_PUBLIC_NOTES = [
  {
    id: "demo_note_1",
    text: "Hoje acordei com medo, mas decidi vir aqui escrever. Só isso já me fez respirar melhor.",
    author: "Marina",
    demo: true,
    createdAt: "2026-03-10T08:15:00.000Z",
  },
  {
    id: "demo_note_2",
    text: "Alguém mais sente culpa por colocar os próprios limites? Estou aprendendo que dizer não também é autocuidado.",
    author: "Patrícia",
    demo: true,
    createdAt: "2026-03-09T19:40:00.000Z",
  },
  {
    id: "demo_note_3",
    text: "Passei no curso de informática da Zela! Não foi fácil conciliar com os filhos, mas eu consegui.",
    author: "Júlia",
    demo: true,
    createdAt: "2026-03-09T12:05:00.000Z",
  },
  {
    id: "demo_note_4",
    text: "Queria agradecer quem comentou na minha nota ontem. Me senti vista e isso importa demais.",
    author: "Sofia",
    demo: true,
    createdAt: "2026-03-08T21:30:00.000Z",
  },
  {
    id: "demo_note_5",
    text: "Dica do dia: anotar três coisas boas antes de dormir. Parece simples, mas muda o humor da noite.",
    author: "Ana",
    demo: true,
    createdAt: "2026-03-08T07:50:00.000Z",
  },
];

const SEED_COMMENTS = {
  demo_note_1: [
    {
      id: "demo_comment_1_1",
      text: "Você não está sozinha, Marina. Fico feliz que tenha escrito.",
      author: "Sofia",
      demo: true,
      createdAt: "2026-03-10T08:22:00.000Z",
    },
    {
      id: "demo_comment_1_2",
      text: "Também começo o dia assim às vezes. Um passo de cada vez.",
      author: "Patrícia",
      demo: true,
      createdAt: "2026-03-10T08:35:00.000Z",
    },
  ],
  demo_note_2: [
    {
      id: "demo_comment_2_1",
      text: "Sinto isso o tempo todo. Colocar limite não é egoísmo.",
      author: "Ana",
      demo: true,
      createdAt: "2026-03-09T20:10:00.000Z",
    },
  ],
  demo_note_3: [
    {
      id: "demo_comment_3_1",
      text: "Que orgulho, Júlia! Você é inspiração.",
      author: "Marina",
      demo: true,
      createdAt: "2026-03-09T12:18:00.000Z",
    },
    {
      id: "demo_comment_3_2",
      text: "Parabéns! Quero fazer esse curso também.",
      author: "Sofia",
      demo: true,
      createdAt: "2026-03-09T13:02:00.000Z",
    },
  ],
  demo_note_4: [
    {
      id: "demo_comment_4_1",
      text: "Esse espaço existe pra isso. Obrigada por compartilhar.",
      author: "Patrícia",
      demo: true,
      createdAt: "2026-03-08T21:45:00.000Z",
    },
  ],
  demo_note_5: [
    {
      id: "demo_comment_5_1",
      text: "Vou tentar hoje! Obrigada pela dica.",
      author: "Júlia",
      demo: true,
      createdAt: "2026-03-08T08:05:00.000Z",
    },
  ],
};

function privateNotesStorageKey(uid) {
  return `daily_notes_${uid}`;
}

function commentsStorageKey(noteId) {
  return `note_comments_${noteId}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function getPublicNotes() {
  return window.ZL.storage.get(PUBLIC_NOTES_KEY, []);
}

function savePublicNotes(notes) {
  window.ZL.storage.set(PUBLIC_NOTES_KEY, notes);
}

function getPrivateNotes(uid) {
  if (!uid) return [];
  return window.ZL.storage.get(privateNotesStorageKey(uid), []);
}

function savePrivateNotes(uid, notes) {
  window.ZL.storage.set(privateNotesStorageKey(uid), notes);
}

function getSeedComments(noteId) {
  return SEED_COMMENTS[noteId] || [];
}

function getStoredComments(noteId) {
  return window.ZL.storage.get(commentsStorageKey(noteId), []);
}

function getComments(noteId) {
  const merged = [...getSeedComments(noteId), ...getStoredComments(noteId)];
  return merged.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

function saveStoredComments(noteId, comments) {
  window.ZL.storage.set(commentsStorageKey(noteId), comments);
}

function getCommunityNotes() {
  const publicNotes = getPublicNotes();
  const merged = [...SEED_PUBLIC_NOTES, ...publicNotes];
  return merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function formatNoteDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const noteDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - noteDay) / (24 * 60 * 60 * 1000));
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  if (diffDays === 0) return `hoje às ${time}`;
  if (diffDays === 1) return `ontem às ${time}`;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year} às ${time}`;
}

function canEditNote(note) {
  if (note?.demo) return false;
  if (!note?.createdAt) return false;
  return Date.now() - new Date(note.createdAt).getTime() <= EDIT_WINDOW_MS;
}

function isOwnNote(note, user) {
  if (!user || note.demo) return false;
  return note.authorUid === user.uid;
}

function renderAuthorAvatar(note) {
  const profile = { displayName: note.author || "Usuária", uid: note.authorUid || null };
  if (typeof window.ZL.getAvatarMarkup === "function") {
    return window.ZL.getAvatarMarkup(profile, "sm");
  }
  return `<span class="user-avatar user-avatar--sm user-avatar--initials">${escapeHtml((note.author || "?").slice(0, 2).toUpperCase())}</span>`;
}

function renderComment(comment) {
  const profile = { displayName: comment.author || "Usuária", uid: comment.authorUid || null };
  const avatar =
    typeof window.ZL.getAvatarMarkup === "function"
      ? window.ZL.getAvatarMarkup(profile, "sm")
      : "";

  return `
    <div class="daily-note-comment">
      <span class="daily-note-comment__avatar">${avatar}</span>
      <div class="daily-note-comment__body">
        <p class="daily-note-comment__meta">
          <span class="daily-note-comment__author">${escapeHtml(comment.author || "Usuária")}</span>
          <span class="daily-note-comment__time">${escapeHtml(formatNoteDate(comment.createdAt))}</span>
        </p>
        <p class="daily-note-comment__text">${escapeHtml(comment.text)}</p>
      </div>
    </div>`;
}

function renderCommentsSection(note, currentUser) {
  const comments = getComments(note.id);
  const commentsHtml = comments.map(renderComment).join("");
  const loginUrl = `${window.ZL.asset("auth/login.html")}?redirect=${encodeURIComponent(window.ZL.asset("community/notas.html"))}`;

  const formHtml = currentUser
    ? `
      <form class="daily-note__comment-form" data-comment-form="${escapeHtml(note.id)}">
        <label class="sr-only" for="comment-${escapeHtml(note.id)}">Comentar</label>
        <input
          class="form-input daily-note__comment-input"
          type="text"
          id="comment-${escapeHtml(note.id)}"
          maxlength="${COMMENT_MAX_LENGTH}"
          placeholder="Escreva um comentário..."
          required
        >
        <button type="submit" class="btn btn--sm btn--primary">Comentar</button>
      </form>`
    : `<p class="daily-note__comment-login text-muted"><a href="${loginUrl}">Entre</a> para comentar.</p>`;

  return `
    <div class="daily-note__comments">
      <p class="daily-note__comments-title">Comentários (${comments.length})</p>
      <div class="daily-note__comments-list">${commentsHtml}</div>
      ${formHtml}
    </div>`;
}

function renderNoteCard(note, index, options = {}) {
  const { variant = "community", currentUser = null } = options;
  const tiltClass = index % 2 === 0 ? "daily-note--tilt-left" : "daily-note--tilt-right";
  const own = isOwnNote(note, currentUser);
  const editBtn =
    own && canEditNote(note)
      ? `<button type="button" class="daily-note__action" data-action="edit" data-scope="${variant}" data-id="${escapeHtml(note.id)}">Editar</button>`
      : "";
  const deleteBtn = own
    ? `<button type="button" class="daily-note__action daily-note__action--danger" data-action="delete" data-scope="${variant}" data-id="${escapeHtml(note.id)}">Excluir</button>`
    : "";

  const badge = note.demo
    ? `<span class="daily-note__badge">Demonstração</span>`
    : own
      ? `<span class="daily-note__badge daily-note__badge--own">Sua nota</span>`
      : variant === "private"
        ? `<span class="daily-note__badge daily-note__badge--private">Privada</span>`
        : "";

  return `
    <article class="daily-note ${tiltClass}" data-note-id="${escapeHtml(note.id)}" data-note-scope="${variant}">
      <div class="daily-note__header">
        <span class="daily-note__author-avatar">${renderAuthorAvatar(note)}</span>
        <div class="daily-note__author-meta">
          <p class="daily-note__author-name">${escapeHtml(note.author || "Usuária")}</p>
          <p class="daily-note__date">${escapeHtml(formatNoteDate(note.createdAt))}</p>
        </div>
        ${badge}
      </div>
      <p class="daily-note__text" data-note-text>${escapeHtml(note.text)}</p>
      ${own ? `<div class="daily-note__actions">${editBtn}${deleteBtn}</div>` : ""}
      ${renderCommentsSection(note, currentUser)}
    </article>`;
}

function renderEmptyState(message) {
  return `<p class="daily-notes-empty text-muted">${escapeHtml(message)}</p>`;
}

function requireLoginForAction() {
  const loginUrl = `${window.ZL.asset("auth/login.html")}?redirect=${encodeURIComponent(window.ZL.asset("community/notas.html"))}`;
  window.location.href = loginUrl;
  return null;
}

window.ZL.initNotasPage = function () {
  const form = document.getElementById("daily-notes-form");
  const input = document.getElementById("daily-note-input");
  const counterEl = document.getElementById("daily-note-counter");
  const privateToggle = document.getElementById("daily-note-private");
  const communityListEl = document.getElementById("community-notes-list");
  const privateListEl = document.getElementById("private-notes-list");
  const privateSectionEl = document.getElementById("private-notes-section");
  const composerLockedEl = document.getElementById("composer-login-hint");
  if (!form || !input || !communityListEl) return;

  let currentUser = window.ZL.getCurrentUser();
  let editingId = null;
  let editingScope = null;

  function updateComposerState() {
    currentUser = window.ZL.getCurrentUser();
    const loggedIn = Boolean(currentUser);

    form.classList.toggle("daily-notes-composer--locked", !loggedIn);
    input.disabled = !loggedIn;
    if (privateToggle) privateToggle.disabled = !loggedIn;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = !loggedIn;

    if (composerLockedEl) {
      composerLockedEl.hidden = loggedIn;
      const loginLink = composerLockedEl.querySelector("a");
      if (loginLink) {
        loginLink.href = `${window.ZL.asset("auth/login.html")}?redirect=${encodeURIComponent(window.ZL.asset("community/notas.html"))}`;
      }
    }
  }

  function updateCounter() {
    const length = input.value.length;
    if (counterEl) counterEl.textContent = `${length} / ${NOTE_MAX_LENGTH}`;
  }

  function renderCommunity() {
    const notes = getCommunityNotes();
    if (notes.length === 0) {
      communityListEl.innerHTML = renderEmptyState(
        "Nenhuma nota na comunidade ainda. Seja a primeira a compartilhar."
      );
      return;
    }
    communityListEl.innerHTML = notes
      .map((note, index) => renderNoteCard(note, index, { variant: "community", currentUser }))
      .join("");
  }

  function renderPrivate() {
    if (!privateListEl || !privateSectionEl) return;

    if (!currentUser) {
      privateSectionEl.hidden = true;
      return;
    }

    const notes = getPrivateNotes(currentUser.uid).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (notes.length === 0) {
      privateSectionEl.hidden = true;
      privateListEl.innerHTML = "";
      return;
    }

    privateSectionEl.hidden = false;
    privateListEl.innerHTML = notes
      .map((note, index) => renderNoteCard(note, index, { variant: "private", currentUser }))
      .join("");
  }

  function render() {
    currentUser = window.ZL.getCurrentUser();
    updateComposerState();
    renderCommunity();
    renderPrivate();
  }

  function resetComposer() {
    editingId = null;
    editingScope = null;
    form.reset();
    if (privateToggle) privateToggle.checked = false;
    updateCounter();
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = "Publicar nota";
  }

  function findNoteById(noteId, scope) {
    if (scope === "private") {
      return getPrivateNotes(currentUser?.uid).find((item) => item.id === noteId) || null;
    }
    const publicNote = getPublicNotes().find((item) => item.id === noteId);
    if (publicNote) return publicNote;
    return SEED_PUBLIC_NOTES.find((item) => item.id === noteId) || null;
  }

  function updateNoteInStorage(noteId, scope, text) {
    if (scope === "private") {
      const notes = getPrivateNotes(currentUser.uid);
      const note = notes.find((item) => item.id === noteId);
      if (!note) return false;
      note.text = text;
      note.updatedAt = new Date().toISOString();
      savePrivateNotes(currentUser.uid, notes);
      return true;
    }

    const notes = getPublicNotes();
    const note = notes.find((item) => item.id === noteId);
    if (!note) return false;
    note.text = text;
    note.updatedAt = new Date().toISOString();
    savePublicNotes(notes);
    return true;
  }

  function deleteNoteFromStorage(noteId, scope) {
    if (scope === "private") {
      savePrivateNotes(
        currentUser.uid,
        getPrivateNotes(currentUser.uid).filter((item) => item.id !== noteId)
      );
      return;
    }
    savePublicNotes(getPublicNotes().filter((item) => item.id !== noteId));
  }

  input.addEventListener("input", updateCounter);
  updateCounter();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentUser) {
      requireLoginForAction();
      return;
    }

    const text = input.value.trim();
    if (!text) return;

    const isPrivate = Boolean(privateToggle?.checked);

    if (editingId && editingScope) {
      const note = findNoteById(editingId, editingScope);
      if (!note || !isOwnNote(note, currentUser)) {
        resetComposer();
        render();
        return;
      }
      if (!canEditNote(note)) {
        alert("Esta nota não pode mais ser editada.");
        resetComposer();
        return;
      }
      updateNoteInStorage(editingId, editingScope, text);
      resetComposer();
      render();
      return;
    }

    if (isPrivate) {
      const notes = getPrivateNotes(currentUser.uid);
      notes.unshift({
        id: `note_${Date.now()}`,
        text,
        author: currentUser.displayName || "Você",
        authorUid: currentUser.uid,
        createdAt: new Date().toISOString(),
      });
      savePrivateNotes(currentUser.uid, notes);
    } else {
      const notes = getPublicNotes();
      notes.unshift({
        id: `note_${Date.now()}`,
        text,
        author: currentUser.displayName || "Você",
        authorUid: currentUser.uid,
        createdAt: new Date().toISOString(),
      });
      savePublicNotes(notes);
    }

    resetComposer();
    render();
  });

  function handleListClick(e) {
    const commentForm = e.target.closest("[data-comment-form]");
    if (commentForm) return;

    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    if (!currentUser) {
      requireLoginForAction();
      return;
    }

    const action = btn.dataset.action;
    const noteId = btn.dataset.id;
    const scope = btn.dataset.scope || "community";
    const note = findNoteById(noteId, scope);
    if (!note || !isOwnNote(note, currentUser)) return;

    if (action === "delete") {
      const confirmed = confirm("Excluir esta anotação?");
      if (!confirmed) return;
      deleteNoteFromStorage(noteId, scope);
      if (editingId === noteId) resetComposer();
      render();
      return;
    }

    if (action === "edit") {
      if (!canEditNote(note)) {
        alert("Esta nota não pode mais ser editada.");
        return;
      }
      editingId = noteId;
      editingScope = scope;
      input.value = note.text;
      if (privateToggle) privateToggle.checked = scope === "private";
      updateCounter();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = "Salvar edição";
      input.focus();
    }
  }

  communityListEl.addEventListener("click", handleListClick);
  privateListEl?.addEventListener("click", handleListClick);

  document.addEventListener("submit", (e) => {
    const commentForm = e.target.closest("[data-comment-form]");
    if (
      !commentForm ||
      (!communityListEl.contains(commentForm) && !privateListEl?.contains(commentForm))
    ) {
      return;
    }

    e.preventDefault();
    if (!currentUser) {
      requireLoginForAction();
      return;
    }

    const noteId = commentForm.dataset.commentForm;
    const inputEl = commentForm.querySelector(".daily-note__comment-input");
    const text = inputEl?.value.trim();
    if (!text) return;

    const comments = getStoredComments(noteId);
    comments.push({
      id: `comment_${Date.now()}`,
      text,
      author: currentUser.displayName || "Você",
      authorUid: currentUser.uid,
      createdAt: new Date().toISOString(),
    });
    saveStoredComments(noteId, comments);
    if (inputEl) inputEl.value = "";
    render();
  });

  window.ZL.onAuthChange?.(() => render());
  document.addEventListener("zela:profile-updated", () => render());

  render();
};

document.addEventListener("zela:ready", () => {
  if (document.body.dataset.page === "notas") {
    window.ZL.initNotasPage();
  }
});
