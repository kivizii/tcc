/**
 * Mural de relatos — UI com posts em localStorage (mock).
 */
window.ZL = window.ZL || {};

window.ZL.initMuralPage = function () {
  const listEl = document.getElementById("mural-posts");
  const form = document.getElementById("mural-form");
  if (!listEl) return;

  const STORAGE_KEY = "mural_posts";

  const seedPosts = [
    {
      author: "Júlia",
      text: "Depois de muito medo, consegui pedir ajuda. Hoje estou reconstruindo minha vida com dignidade.",
      date: "2026-02-10",
    },
    {
      author: "Apoiador",
      text: "Respeitar as mulheres é construir uma sociedade mais segura para todos.",
      date: "2026-02-08",
    },
  ];

  function getPosts() {
    return window.ZL.storage.get(STORAGE_KEY, seedPosts);
  }

  function savePosts(posts) {
    window.ZL.storage.set(STORAGE_KEY, posts);
  }

  function render() {
    const posts = getPosts();
    listEl.innerHTML = posts
      .map(
        (p) => `
      <article class="card">
        <h3 class="card__title">${escapeHtml(p.author)}</h3>
        <p class="card__text">${escapeHtml(p.text)}</p>
        <span class="text-muted">${p.date}</span>
      </article>`
      )
      .join("");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = window.ZL.getCurrentUser();
      if (!user) {
        alert("Faça login para publicar no mural.");
        window.location.href = window.ZL.asset("auth/login.html");
        return;
      }
      const text = form.text.value.trim();
      if (!text) return;
      const posts = getPosts();
      posts.unshift({
        author: user.displayName || "Anônima",
        text,
        date: new Date().toISOString().slice(0, 10),
      });
      savePosts(posts);
      form.reset();
      render();
    });
  }

  render();
};

document.addEventListener("zela:ready", () => {
  if (document.body.dataset.page === "mural") {
    window.ZL.initMuralPage();
  }
});
