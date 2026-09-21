/**
 * Configuração Firebase + modo demonstração (localStorage).
 */
window.ZL = window.ZL || {};

window.ZL.firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

window.ZL.demoMode = true;
window.ZL.db = null;
window.ZL.auth = null;
/** URL HTTPS da Cloud Function assistantChat (configure após deploy). */
window.ZL.assistantFunctionUrl = "";

const DEMO_PREFIX = "zela_demo_";

window.ZL.storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(DEMO_PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(DEMO_PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(DEMO_PREFIX + key);
      return true;
    } catch {
      return false;
    }
  },
};

window.ZL.resetDemoData = function () {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith(DEMO_PREFIX)) {
      localStorage.removeItem(key);
    }
  }
  if (typeof window.ZL.clearCommunitiesCache === "function") {
    window.ZL.clearCommunitiesCache();
  }
};

window.ZL.clearDemoLogins = function () {
  window.ZL.storage.remove("users");
  window.ZL.storage.remove("currentUser");
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith(DEMO_PREFIX + "profile_")) {
      localStorage.removeItem(key);
    }
  }
};

/** Exporta todas as chaves demo do localStorage (mesma lógica do plano de migração). */
window.ZL.exportDemoData = function () {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(DEMO_PREFIX)) {
      data[key] = localStorage.getItem(key);
    }
  }
  return JSON.stringify(data);
};

/** Importa JSON exportado; retorna quantidade de chaves gravadas. */
window.ZL.importDemoData = function (json) {
  const data = JSON.parse(json);
  let count = 0;
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith(DEMO_PREFIX)) {
      localStorage.setItem(key, value);
      count++;
    }
  }
  return count;
};

/** Copia export para a área de transferência ou faz download. */
window.ZL.copyDemoExport = async function () {
  const json = window.ZL.exportDemoData();
  const parsed = JSON.parse(json);
  const count = Object.keys(parsed).length;
  if (count === 0) {
    throw new Error("Nenhum dado demo encontrado neste navegador.");
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(json);
    return { count, method: "clipboard" };
  }
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "zela-demo-backup.json";
  link.click();
  URL.revokeObjectURL(url);
  return { count, method: "download" };
};

(function consumeDemoQueryFlags() {
  const search = window.location.search || "";
  if (!/[?&]clearLogins(?:&|=|$)/.test(search) && !search.startsWith("?clearLogins")) {
    return;
  }
  window.ZL.clearDemoLogins();
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("clearLogins");
    const query = url.searchParams.toString();
    window.history.replaceState({}, "", url.pathname + (query ? "?" + query : "") + url.hash);
  } catch {
    /* file:// may block replaceState */
  }
  console.info("Zela: logins de teste apagados.");
})();

async function initFirebase() {
  const config = window.ZL.firebaseConfig;
  const hasConfig = config.apiKey && config.projectId;

  if (!hasConfig) {
    console.info("Zela: modo demonstração (localStorage). Configure firebase-config.local.js para Firebase real.");
    window.ZL.demoMode = true;
    return;
  }

  try {
    const { initializeApp } = await import(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"
    );
    const { getAuth } = await import(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"
    );
    const { getFirestore } = await import(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"
    );

    const app = initializeApp(config);
    window.ZL.auth = getAuth(app);
    window.ZL.db = getFirestore(app);
    window.ZL.demoMode = false;
    console.info("Zela: Firebase conectado.");
  } catch (err) {
    console.warn("Zela: Firebase indisponível, usando modo demo.", err);
    window.ZL.demoMode = true;
  }
}

window.ZL.initFirebase = initFirebase;
initFirebase();
