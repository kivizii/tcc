/**
 * Contatos de confiança — CRUD.
 */
window.ZL = window.ZL || {};

window.ZL.listContacts = async function () {
  const user = window.ZL.getCurrentUser();
  if (!user) return [];

  if (window.ZL.demoMode) {
    return window.ZL.storage.get(`contacts_${user.uid}`, []);
  }

  const { collection, getDocs, query, orderBy } = await import(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"
  );
  const snap = await getDocs(
    query(collection(window.ZL.db, "users", user.uid, "contacts"), orderBy("name"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

window.ZL.addContact = async function (contact) {
  const user = window.ZL.getCurrentUser();
  if (!user) throw new Error("Faça login para cadastrar contatos.");

  const data = {
    name: contact.name.trim(),
    phone: contact.phone.trim(),
    type: contact.type || "outro",
    notifyOnSos: contact.notifyOnSos !== false,
    createdAt: new Date().toISOString(),
  };

  if (window.ZL.demoMode) {
    const contacts = window.ZL.storage.get(`contacts_${user.uid}`, []);
    const id = "c_" + Date.now();
    contacts.push({ id, ...data });
    window.ZL.storage.set(`contacts_${user.uid}`, contacts);
    return { id, ...data };
  }

  const { collection, addDoc, serverTimestamp } = await import(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"
  );
  const ref = await addDoc(collection(window.ZL.db, "users", user.uid, "contacts"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...data };
};

window.ZL.updateContact = async function (id, contact) {
  const user = window.ZL.getCurrentUser();
  if (!user) throw new Error("Faça login.");

  if (window.ZL.demoMode) {
    const contacts = window.ZL.storage.get(`contacts_${user.uid}`, []);
    const idx = contacts.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Contato não encontrado.");
    contacts[idx] = { ...contacts[idx], ...contact };
    window.ZL.storage.set(`contacts_${user.uid}`, contacts);
    return contacts[idx];
  }

  const { doc, updateDoc } = await import(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"
  );
  await updateDoc(doc(window.ZL.db, "users", user.uid, "contacts", id), contact);
};

window.ZL.deleteContact = async function (id) {
  const user = window.ZL.getCurrentUser();
  if (!user) throw new Error("Faça login.");

  if (window.ZL.demoMode) {
    const contacts = window.ZL.storage.get(`contacts_${user.uid}`, []);
    window.ZL.storage.set(
      `contacts_${user.uid}`,
      contacts.filter((c) => c.id !== id)
    );
    return;
  }

  const { doc, deleteDoc } = await import(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"
  );
  await deleteDoc(doc(window.ZL.db, "users", user.uid, "contacts", id));
};

window.ZL.getPreferences = async function () {
  const user = window.ZL.getCurrentUser();
  if (!user) return {};

  if (window.ZL.demoMode) {
    return window.ZL.storage.get(`prefs_${user.uid}`, {
      quickExitEnabled: true,
      locationShareMinutes: 30,
    });
  }

  const { doc, getDoc } = await import(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"
  );
  const snap = await getDoc(doc(window.ZL.db, "users", user.uid, "preferences", "main"));
  return snap.exists() ? snap.data() : {};
};

window.ZL.savePreferences = async function (prefs) {
  const user = window.ZL.getCurrentUser();
  if (!user) throw new Error("Faça login.");

  if (window.ZL.demoMode) {
    window.ZL.storage.set(`prefs_${user.uid}`, prefs);
    return;
  }

  const { doc, setDoc, serverTimestamp } = await import(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"
  );
  await setDoc(
    doc(window.ZL.db, "users", user.uid, "preferences", "main"),
    { ...prefs, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

const CONTACT_TYPE_LABELS = {
  familia: "Família",
  amiga: "Amiga",
  vizinha: "Vizinha",
  outro: "Outro",
};

window.ZL.initContactsPage = function () {
  const listEl = document.getElementById("contact-list");
  const listHeader = document.getElementById("contacts-list-header");
  const countEl = document.getElementById("contacts-count");
  const form = document.getElementById("contact-form");
  const formTitle = document.getElementById("form-title");
  const formHint = document.getElementById("form-hint");
  const submitBtn = document.getElementById("contact-submit-btn");
  const editIdInput = document.getElementById("contact-edit-id");
  const cancelBtn = document.getElementById("contact-cancel");
  const formCard = document.querySelector(".contacts-form-card");

  if (!listEl || !form) return;

  window.ZL.requireAuth(window.location.pathname);

  function formatType(type) {
    return CONTACT_TYPE_LABELS[type] || CONTACT_TYPE_LABELS.outro;
  }

  function renderEmptyState() {
    if (listHeader) listHeader.classList.add("hidden");
    listEl.innerHTML = `
      <div class="contacts-empty-state">
        <div class="contacts-empty-state__icon" data-icon="contacts" data-icon-class="icon icon--shortcut" aria-hidden="true"></div>
        <p class="contacts-empty-state__title">Você ainda não cadastrou ninguém</p>
        <p class="contacts-empty-state__text">
          Adicione uma pessoa de confiança abaixo. Ela será alertada quando você precisar de ajuda.
        </p>
        <a href="#contact-form" class="btn btn--primary btn--block contacts-empty-state__cta">Adicionar primeiro contato</a>
      </div>`;
    if (window.ZL.icon && listEl.querySelector("[data-icon]")) {
      listEl.querySelectorAll("[data-icon]").forEach((el) => {
        const name = el.dataset.icon;
        const cls = el.dataset.iconClass || "icon";
        el.innerHTML = window.ZL.icon(name, cls);
      });
    }
    if (formCard) formCard.classList.add("contacts-form-card--highlight");
  }

  async function renderList() {
    const contacts = await window.ZL.listContacts();
    if (contacts.length === 0) {
      renderEmptyState();
      return;
    }

    if (formCard) formCard.classList.remove("contacts-form-card--highlight");
    if (listHeader) listHeader.classList.remove("hidden");
    if (countEl) {
      const label = contacts.length === 1 ? "1 contato cadastrado" : `${contacts.length} contatos cadastrados`;
      countEl.textContent = label;
    }

    listEl.innerHTML = `<ul class="contact-list">${contacts
      .map(
        (c) => `
      <li class="contact-item">
        <div class="contact-item__info">
          <strong>${escapeHtml(c.name)}</strong>
          <span>${escapeHtml(c.phone)} · ${escapeHtml(formatType(c.type))}${c.notifyOnSos !== false ? ' · <span class="contact-badge contact-badge--sos">SOS</span>' : ""}</span>
        </div>
        <div class="contact-item__actions">
          <button type="button" class="btn btn--sm btn--ghost" data-edit="${c.id}" aria-label="Editar ${escapeHtml(c.name)}">Editar</button>
          <button type="button" class="btn btn--sm btn--ghost" data-delete="${c.id}" aria-label="Excluir ${escapeHtml(c.name)}">Excluir</button>
        </div>
      </li>`
      )
      .join("")}</ul>`;

    listEl.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const contacts = await window.ZL.listContacts();
        const c = contacts.find((x) => x.id === btn.dataset.edit);
        if (!c) return;
        editIdInput.value = c.id;
        form.name.value = c.name;
        form.phone.value = c.phone;
        form.type.value = c.type;
        form.notifyOnSos.checked = c.notifyOnSos !== false;
        if (formTitle) formTitle.textContent = "Editar contato";
        if (formHint) formHint.textContent = "Atualize os dados do contato selecionado.";
        if (submitBtn) submitBtn.textContent = "Salvar alterações";
        if (cancelBtn) cancelBtn.classList.remove("hidden");
        form.scrollIntoView({ behavior: "smooth" });
      });
    });

    listEl.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Excluir este contato?")) return;
        await window.ZL.deleteContact(btn.dataset.delete);
        renderList();
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function resetForm() {
    form.reset();
    editIdInput.value = "";
    if (formTitle) formTitle.textContent = "Novo contato";
    if (formHint) formHint.textContent = "Preencha os dados de alguém de confiança.";
    if (submitBtn) submitBtn.textContent = "Salvar contato";
    if (cancelBtn) cancelBtn.classList.add("hidden");
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", resetForm);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = document.getElementById("contact-form-error");
    errEl?.classList.add("hidden");

    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const type = form.type.value;
    const notifyOnSos = form.notifyOnSos.checked;

    if (!name) {
      showError("Nome é obrigatório.");
      return;
    }
    if (!window.ZL.validatePhone(phone)) {
      showError("Telefone inválido. Use DDD + número.");
      return;
    }

    try {
      const editId = editIdInput.value;
      if (editId) {
        await window.ZL.updateContact(editId, { name, phone, type, notifyOnSos });
      } else {
        await window.ZL.addContact({ name, phone, type, notifyOnSos });
      }
      resetForm();
      renderList();
    } catch (err) {
      showError(err.message);
    }
  });

  function showError(msg) {
    const errEl = document.getElementById("contact-form-error");
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.remove("hidden");
    }
  }

  renderList();
};

document.addEventListener("zela:ready", () => {
  if (document.body.dataset.page === "contacts") {
    window.ZL.initContactsPage();
  }
});
