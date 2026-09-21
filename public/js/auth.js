/**
 * Autenticação — Firebase Auth ou modo demo (localStorage).
 */
window.ZL = window.ZL || {};

function assertCpfValid(cpf) {
  if (!window.ZL.validateCpf?.(cpf)) {
    throw new Error("CPF inválido.");
  }
  return window.ZL.normalizeCpf(cpf);
}

function findDemoUserByCpf(users, cpf) {
  const normalized = window.ZL.normalizeCpf(cpf);
  return Object.values(users).find((user) => user.cpf === normalized) || null;
}

function mergeProfileIntoUser(user, profile = {}) {
  if (!user) return null;
  return {
    ...user,
    displayName: user.displayName || profile.displayName || "",
    cpf: user.cpf || profile.cpf || "",
    avatarDataUrl: profile.avatarDataUrl || user.avatarDataUrl || "",
  };
}

window.ZL.getCurrentUser = function () {
  if (window.ZL.demoMode) {
    const user = window.ZL.storage.get("currentUser", null);
    if (!user) return null;
    const profile = window.ZL.storage.get(`profile_${user.uid}`, {});
    return mergeProfileIntoUser(user, profile);
  }
  const user = window.ZL.auth?.currentUser;
  if (!user) return null;
  const profile = window.ZL.storage.get(`profile_${user.uid}`, {});
  return mergeProfileIntoUser(
    {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || profile.displayName || "",
      cpf: profile.cpf || "",
    },
    profile
  );
};

async function hydrateFirebaseProfile(user) {
  if (!user || window.ZL.demoMode) return;
  const cached = window.ZL.storage.get(`profile_${user.uid}`, null);
  if (cached?.cpf) return;

  const { doc, getDoc } = await import(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"
  );
  const snap = await getDoc(doc(window.ZL.db, "users", user.uid));
  if (!snap.exists()) return;

  const data = snap.data();
  const existing = window.ZL.storage.get(`profile_${user.uid}`, {});
  window.ZL.storage.set(`profile_${user.uid}`, {
    ...existing,
    displayName: data.displayName || user.displayName || "",
    cpf: data.cpf || "",
    isWoman: data.isWoman,
  });
}

window.ZL.onAuthChange = function (callback) {
  if (window.ZL.demoMode) {
    callback(window.ZL.getCurrentUser());
    return () => {};
  }
  return import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js").then(
    ({ onAuthStateChanged }) =>
      onAuthStateChanged(window.ZL.auth, async (user) => {
        if (user) await hydrateFirebaseProfile(user);
        callback(window.ZL.getCurrentUser());
      })
  );
};

window.ZL.register = async function ({ cpf, email, password, displayName, isWoman }) {
  if (!isWoman) {
    throw new Error("Este espaço é exclusivo para mulheres.");
  }

  const normalizedCpf = assertCpfValid(cpf);
  const normalizedEmail = email.trim().toLowerCase();

  if (window.ZL.demoMode) {
    const users = window.ZL.storage.get("users", {});
    if (users[normalizedEmail]) throw new Error("E-mail já cadastrado.");
    if (findDemoUserByCpf(users, normalizedCpf)) throw new Error("CPF já cadastrado.");

    const uid = "demo_" + Date.now();
    users[normalizedEmail] = {
      uid,
      email: normalizedEmail,
      displayName,
      password,
      cpf: normalizedCpf,
      isWoman: true,
    };
    window.ZL.storage.set("users", users);
    const current = { uid, email: normalizedEmail, displayName, cpf: normalizedCpf, isWoman: true };
    window.ZL.storage.set("currentUser", current);
    return current;
  }

  const { createUserWithEmailAndPassword, updateProfile } = await import(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"
  );
  const { doc, setDoc, getDocs, collection, query, where, serverTimestamp } = await import(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"
  );

  const existing = await getDocs(query(collection(window.ZL.db, "users"), where("cpf", "==", normalizedCpf)));
  if (!existing.empty) throw new Error("CPF já cadastrado.");

  const cred = await createUserWithEmailAndPassword(window.ZL.auth, normalizedEmail, password);
  await updateProfile(cred.user, { displayName });
  await setDoc(doc(window.ZL.db, "users", cred.user.uid), {
    email: normalizedEmail,
    displayName,
    cpf: normalizedCpf,
    isWoman: true,
    createdAt: serverTimestamp(),
  });
  window.ZL.storage.set(`profile_${cred.user.uid}`, {
    displayName,
    cpf: normalizedCpf,
    isWoman: true,
  });
  return { uid: cred.user.uid, email: normalizedEmail, displayName, cpf: normalizedCpf, isWoman: true };
};

window.ZL.login = async function ({ cpf, email, password }) {
  const normalizedCpf = assertCpfValid(cpf);
  const normalizedEmail = email.trim().toLowerCase();

  if (!window.ZL.validateEmail(normalizedEmail)) {
    throw new Error("E-mail inválido.");
  }

  if (window.ZL.demoMode) {
    const users = window.ZL.storage.get("users", {});
    const user = users[normalizedEmail];
    if (!user || user.password !== password) {
      throw new Error("CPF, e-mail ou senha incorretos.");
    }
    if (!user.cpf) {
      throw new Error("Conta antiga sem CPF. Cadastre-se novamente com CPF.");
    }
    if (user.cpf !== normalizedCpf) {
      throw new Error("CPF não confere com este e-mail.");
    }
    if (!user.isWoman) {
      throw new Error("Este espaço é exclusivo para mulheres.");
    }
    const current = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      cpf: user.cpf,
      isWoman: true,
    };
    window.ZL.storage.set("currentUser", current);
    return current;
  }

  const { signInWithEmailAndPassword, signOut } = await import(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"
  );
  const { doc, getDoc } = await import(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"
  );

  const cred = await signInWithEmailAndPassword(window.ZL.auth, normalizedEmail, password);
  const profileSnap = await getDoc(doc(window.ZL.db, "users", cred.user.uid));
  const profile = profileSnap.exists() ? profileSnap.data() : null;

  if (!profile?.cpf) {
    await signOut(window.ZL.auth);
    throw new Error("Conta antiga sem CPF. Cadastre-se novamente com CPF.");
  }
  if (profile.cpf !== normalizedCpf) {
    await signOut(window.ZL.auth);
    throw new Error("CPF não confere com este e-mail.");
  }
  if (!profile.isWoman) {
    await signOut(window.ZL.auth);
    throw new Error("Este espaço é exclusivo para mulheres.");
  }

  const existing = window.ZL.storage.get(`profile_${cred.user.uid}`, {});
  window.ZL.storage.set(`profile_${cred.user.uid}`, {
    ...existing,
    displayName: profile.displayName || cred.user.displayName || "",
    cpf: profile.cpf,
    isWoman: true,
  });

  return mergeProfileIntoUser(
    {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: profile.displayName || cred.user.displayName || "",
      cpf: profile.cpf,
      isWoman: true,
    },
    window.ZL.storage.get(`profile_${cred.user.uid}`, {})
  );
};

window.ZL.logout = async function () {
  if (window.ZL.demoMode) {
    window.ZL.storage.remove("currentUser");
    return;
  }
  const { signOut } = await import(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"
  );
  await signOut(window.ZL.auth);
};

window.ZL.requireAuth = function (redirectTo) {
  const user = window.ZL.getCurrentUser();
  if (!user) {
    const loginUrl = window.ZL.asset("auth/login.html");
    const params = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : "";
    window.location.href = loginUrl + params;
    return null;
  }
  return user;
};

window.ZL.updateHeaderAuth = function () {
  const slot = document.getElementById("header-auth-slot");
  if (!slot) return;

  const user = window.ZL.getCurrentUser();
  if (user) {
    slot.innerHTML = "";
  } else {
    slot.innerHTML = `<a href="${window.ZL.asset("auth/login.html")}" class="btn btn--sm btn--primary">Entrar</a>`;
  }
};

document.addEventListener("zela:ready", () => {
  window.ZL.onAuthChange(() => window.ZL.updateHeaderAuth());
});

window.ZL.validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
window.ZL.validatePhone = (phone) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
};
