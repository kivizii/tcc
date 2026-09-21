/**
 * Carrega conteúdo estático de data/content.json.
 */
window.ZL = window.ZL || {};

const CONTENT_JSON_VERSION = 4;

window.ZL.loadContent = async function () {
  const url = `${window.ZL.asset("data/content.json")}?v=${CONTENT_JSON_VERSION}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Não foi possível carregar o conteúdo.");
  return res.json();
};

function filterItems(items, options = {}) {
  const { filterKey, filterValue } = options;
  if (!filterKey || !filterValue || filterValue === "all") return items;
  return items.filter((i) => i.category === filterValue || i.type === filterValue);
}

function extractYouTubeId(url) {
  const m = String(url).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function youtubeThumbnail(url) {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

function getPrimaryVideoUrl(item) {
  if (item.link && item.link !== "#" && extractYouTubeId(item.link)) return item.link;
  const links = Array.isArray(item.links) ? item.links : [];
  const videoLink = links.find((entry) => entry.type === "video" && entry.url && entry.url !== "#");
  return videoLink ? videoLink.url : null;
}

function renderThumbnailHtml(url, title, className = "card__thumb") {
  const thumb = youtubeThumbnail(url);
  if (!thumb) return "";

  const safeTitle = escapeHtml(title);
  const safeUrl = escapeHtml(url);
  const safeThumb = escapeHtml(thumb);

  return `
    <a href="${safeUrl}" class="${className}" target="_blank" rel="noopener" aria-label="Assistir: ${safeTitle}">
      <img src="${safeThumb}" alt="Thumbnail: ${safeTitle}" loading="lazy" width="320" height="180">
    </a>`;
}

window.ZL.renderCardGrid = function (containerId, items, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const list = filterItems(items, options);

  if (list.length === 0) {
    container.innerHTML = '<p class="text-muted">Nenhum item encontrado.</p>';
    return;
  }

  container.innerHTML = `<div class="card-grid">${list
    .map((item) => {
      const hasLink = item.link && item.link !== "#";
      const isYouTube = hasLink && extractYouTubeId(item.link);
      const thumbHtml = isYouTube ? renderThumbnailHtml(item.link, item.title) : "";

      return `
    <article class="card">
      ${thumbHtml}
      <h3 class="card__title">${escapeHtml(item.title)}</h3>
      <p class="card__text">${escapeHtml(item.description)}</p>
      ${item.source ? `<p class="card__text text-muted">Por ${escapeHtml(item.source)}</p>` : ""}
      ${item.tag ? `<span class="tag">${escapeHtml(item.tag)}</span>` : ""}
      ${hasLink ? `<a href="${escapeHtml(item.link)}" class="btn btn--sm btn--primary mt-md" target="_blank" rel="noopener">${isYouTube ? "Assistir no YouTube" : "Acessar"}</a>` : ""}
    </article>`;
    })
    .join("")}</div>`;
};

window.ZL.renderCourseBlocks = function (containerId, items, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const list = filterItems(items, options);

  if (list.length === 0) {
    container.innerHTML = '<p class="text-muted">Nenhum curso encontrado.</p>';
    return;
  }

  container.innerHTML = `<div class="course-block-list">${list
    .map((item) => {
      const links = Array.isArray(item.links) ? item.links : [];
      const primaryVideoUrl = getPrimaryVideoUrl(item);
      const thumbHtml = primaryVideoUrl
        ? renderThumbnailHtml(primaryVideoUrl, item.title, "course-block__thumb")
        : "";

      const linksHtml = links
        .filter((entry) => entry.url && entry.url !== "#")
        .map((entry) => {
          const isVideo = entry.type === "video";
          const isCourse = entry.type === "course";
          const label = entry.label || (isVideo ? "Assistir no YouTube" : "Ver formação completa");
          const className = isCourse
            ? "course-link course-link--secondary"
            : "course-link course-link--video";
          const miniThumb = isVideo && youtubeThumbnail(entry.url)
            ? `<img class="course-link__thumb" src="${escapeHtml(youtubeThumbnail(entry.url))}" alt="" loading="lazy" width="48" height="36">`
            : "";

          return `<a href="${escapeHtml(entry.url)}" class="${className}" target="_blank" rel="noopener">${miniThumb}<span class="course-link__label">${escapeHtml(label)}</span></a>`;
        })
        .join("");

      return `
    <article class="course-block card">
      ${thumbHtml}
      <h3 class="course-block__title">${escapeHtml(item.title)}</h3>
      <p class="course-block__text">${escapeHtml(item.description)}</p>
      ${item.source ? `<p class="course-block__source text-muted">Por ${escapeHtml(item.source)}</p>` : ""}
      ${item.tag ? `<span class="tag">${escapeHtml(item.tag)}</span>` : ""}
      ${linksHtml ? `<div class="course-block__links">${linksHtml}</div>` : ""}
    </article>`;
    })
    .join("")}</div>`;
};

window.ZL.initFilterTags = function (tagContainerId, items, onFilter) {
  const container = document.getElementById(tagContainerId);
  if (!container) return;

  const categories = ["all", ...new Set(items.map((i) => i.category || i.type).filter(Boolean))];
  container.innerHTML = categories
    .map(
      (cat) =>
        `<button type="button" class="tag${cat === "all" ? " tag--active" : ""}" data-filter="${cat}">${
          cat === "all" ? "Todos" : cat
        }</button>`
    )
    .join("");

  container.querySelectorAll(".tag").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".tag").forEach((t) => t.classList.remove("tag--active"));
      btn.classList.add("tag--active");
      onFilter(btn.dataset.filter);
    });
  });
};

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

window.ZL.initContentPage = async function (type, containerId, tagContainerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '<p class="text-muted">Carregando...</p>';
  }

  try {
    const data = await window.ZL.loadContent();
    const items = data[type] || [];
    const render =
      type === "cursos"
        ? (filter) => window.ZL.renderCourseBlocks(containerId, items, { filterKey: "category", filterValue: filter })
        : (filter) => window.ZL.renderCardGrid(containerId, items, { filterKey: "category", filterValue: filter });

    if (tagContainerId) {
      window.ZL.initFilterTags(tagContainerId, items, render);
    }
    render("all");
  } catch (err) {
    console.error("Zela: erro ao carregar conteúdo", err);
    if (container) {
      container.innerHTML =
        '<p class="form-error">Não foi possível carregar os cursos. Verifique sua conexão e recarregue a página.</p>';
    }
  }
};

document.addEventListener("zela:ready", () => {
  const page = document.body.dataset.page;
  if (page === "videos") window.ZL.initContentPage("videos", "content-grid", "filter-tags");
  if (page === "cursos") window.ZL.initContentPage("cursos", "content-grid", "filter-tags");
  if (page === "empregos") window.ZL.initContentPage("empregos", "content-grid", "filter-tags");
});
