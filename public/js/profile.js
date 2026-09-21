/**
 * Perfil da usuária — avatar, modal e helpers de exibição.
 */
window.ZL = window.ZL || {};

const AVATAR_COLORS = [
  "var(--color-rosa)",
  "var(--color-lilas)",
  "var(--color-nude)",
  "var(--color-info)",
  "var(--color-sucesso)",
];

const AVATAR_MAX_BYTES = 150 * 1024;
const AVATAR_MAX_DIMENSION = 256;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

function profileStorageKey(uid) {
  return `profile_${uid}`;
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
  return AVATAR_COLORS[hashAuthorName(name || "?") % AVATAR_COLORS.length];
}

function resolveUid(uid) {
  if (uid) return uid;
  const user = window.ZL.getCurrentUser?.();
  return user?.uid || null;
}

window.ZL.getUserProfile = function (uid) {
  const resolvedUid = resolveUid(uid);
  if (!resolvedUid) return null;

  const stored = window.ZL.storage.get(profileStorageKey(resolvedUid), {});
  const user = window.ZL.getCurrentUser?.();

  return {
    uid: resolvedUid,
    displayName: stored.displayName || user?.displayName || "",
    email: user?.email || stored.email || "",
    cpf: stored.cpf || user?.cpf || "",
    avatarDataUrl: stored.avatarDataUrl || "",
    isWoman: stored.isWoman ?? user?.isWoman,
  };
};

window.ZL.saveUserProfile = function (patch = {}) {
  const uid = resolveUid(patch.uid);
  if (!uid) throw new Error("Faça login para salvar o perfil.");

  const user = window.ZL.getCurrentUser?.();
  const current = window.ZL.storage.get(profileStorageKey(uid), {});
  const seeded = user
    ? {
        displayName: current.displayName || user.displayName || "",
        cpf: current.cpf || user.cpf || "",
        isWoman: current.isWoman ?? user.isWoman,
        avatarDataUrl: current.avatarDataUrl || "",
      }
    : current;
  const next = { ...seeded, ...patch };
  delete next.uid;
  window.ZL.storage.set(profileStorageKey(uid), next);
  window.ZL.renderHeaderAvatar?.();
  document.dispatchEvent(new CustomEvent("zela:profile-updated", { detail: { uid } }));
  return window.ZL.getUserProfile(uid);
};

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Não foi possível ler a imagem."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

function canvasToDataUrl(canvas, mimeType, quality) {
  return canvas.toDataURL(mimeType, quality);
}

function estimateDataUrlBytes(dataUrl) {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

async function resizeAvatarFile(file) {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error("Use uma imagem JPG, PNG ou WebP.");
  }

  const img = await loadImageFromFile(file);
  const scale = Math.min(1, AVATAR_MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.9;
  let dataUrl = canvasToDataUrl(canvas, "image/jpeg", quality);

  while (estimateDataUrlBytes(dataUrl) > AVATAR_MAX_BYTES && quality > 0.4) {
    quality -= 0.1;
    dataUrl = canvasToDataUrl(canvas, "image/jpeg", quality);
  }

  if (estimateDataUrlBytes(dataUrl) > AVATAR_MAX_BYTES) {
    throw new Error("A imagem ficou grande mesmo após compressão. Tente outra foto.");
  }

  return dataUrl;
}

window.ZL.setUserAvatar = async function (file) {
  if (!file) throw new Error("Nenhuma imagem selecionada.");
  const dataUrl = await resizeAvatarFile(file);
  return window.ZL.saveUserProfile({ avatarDataUrl: dataUrl });
};

window.ZL.getAvatarMarkup = function (userOrProfile, size = "sm") {
  const profile = userOrProfile?.uid
    ? window.ZL.getUserProfile(userOrProfile.uid) || userOrProfile
    : userOrProfile;
  const displayName = profile?.displayName || "Usuária";
  const initials = getAuthorInitials(displayName);
  const sizeClass = size === "lg" ? "user-avatar--lg" : "user-avatar--sm";

  if (profile?.avatarDataUrl) {
    return `<span class="user-avatar ${sizeClass}" role="img" aria-label="Foto de ${escapeHtml(displayName)}"><img src="${profile.avatarDataUrl}" alt="Foto de ${escapeHtml(displayName)}"></span>`;
  }

  const color = getAvatarColor(displayName);
  return `<span class="user-avatar ${sizeClass} user-avatar--initials" style="background:${color}" role="img" aria-label="Avatar de ${escapeHtml(displayName)}">${escapeHtml(initials)}</span>`;
};

function bindAvatarFileInput(input, onSuccess, onError) {
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    try {
      await window.ZL.setUserAvatar(file);
      onSuccess?.();
    } catch (err) {
      onError?.(err);
    }
  });
}

function closeProfileModal() {
  document.getElementById("profile-modal-overlay")?.remove();
}

window.ZL.showProfileModal = function () {
  const user = window.ZL.getCurrentUser();
  if (!user) {
    window.location.href = window.ZL.asset("auth/login.html");
    return;
  }

  closeProfileModal();
  const profile = window.ZL.getUserProfile(user.uid);
  const cpfLine = profile.cpf && window.ZL.maskCpfDisplay
    ? `<p class="profile-modal__meta text-muted">CPF: ${escapeHtml(window.ZL.maskCpfDisplay(profile.cpf))}</p>`
    : "";

  const overlay = document.createElement("div");
  overlay.id = "profile-modal-overlay";
  overlay.className = "modal-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "profile-modal-title");
  overlay.innerHTML = `
    <div class="modal profile-modal">
      <button type="button" class="profile-modal__close btn btn--ghost" aria-label="Fechar perfil">×</button>
      <div class="profile-modal__avatar-wrap">
        ${window.ZL.getAvatarMarkup(profile, "lg")}
      </div>
      <h2 class="profile-modal__title" id="profile-modal-title">${escapeHtml(profile.displayName || "Bem-vinda")}</h2>
      ${profile.email ? `<p class="profile-modal__meta text-muted">${escapeHtml(profile.email)}</p>` : ""}
      ${cpfLine}
      <input type="file" id="profile-avatar-input" accept="image/*" hidden>
      <div class="profile-modal__actions">
        <button type="button" class="btn btn--primary btn--block" id="profile-change-photo">Alterar foto</button>
        <a href="${window.ZL.asset("community/notas.html")}" class="btn btn--ghost btn--block">Notas da comunidade</a>
        <a href="${window.ZL.asset("settings.html")}" class="btn btn--ghost btn--block">Configurações</a>
      </div>
    </div>
  `;

  const close = () => closeProfileModal();

  overlay.querySelector(".profile-modal__close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      close();
      document.removeEventListener("keydown", onKeyDown);
    }
  };
  document.addEventListener("keydown", onKeyDown);

  const fileInput = overlay.querySelector("#profile-avatar-input");
  const changePhotoBtn = overlay.querySelector("#profile-change-photo");
  changePhotoBtn.addEventListener("click", () => fileInput.click());

  bindAvatarFileInput(
    fileInput,
    () => {
      const updated = window.ZL.getUserProfile(user.uid);
      overlay.querySelector(".profile-modal__avatar-wrap").innerHTML = window.ZL.getAvatarMarkup(updated, "lg");
    },
    (err) => {
      alert(err.message || "Não foi possível atualizar a foto.");
    }
  );

  document.body.appendChild(overlay);
  changePhotoBtn.focus();
};

window.ZL.renderHeaderAvatar = function () {
  const slot = document.getElementById("header-avatar-slot");
  if (!slot) return;

  const user = window.ZL.getCurrentUser();

  if (user) {
    const profile = window.ZL.getUserProfile(user.uid);
    slot.innerHTML = `
      <button type="button" class="header-avatar-btn" id="header-avatar-btn" aria-label="Ver meu perfil">
        ${window.ZL.getAvatarMarkup(profile, "sm")}
      </button>`;
    slot.querySelector("#header-avatar-btn")?.addEventListener("click", () => {
      window.ZL.showProfileModal();
    });
    return;
  }

  slot.innerHTML = `
    <a href="${window.ZL.asset("auth/login.html")}" class="header-avatar-btn header-avatar-btn--guest" aria-label="Entrar na conta">
      ${window.ZL.getAvatarMarkup({ displayName: "?" }, "sm")}
    </a>`;
};

document.addEventListener("zela:ready", () => {
  window.ZL.renderHeaderAvatar();
  window.ZL.onAuthChange?.(() => {
    window.ZL.renderHeaderAvatar();
    window.ZL.updateHeaderAuth?.();
  });
});

document.addEventListener("zela:profile-updated", () => {
  window.ZL.renderHeaderAvatar();
});
