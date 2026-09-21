/**
 * Barra de navegação inferior + header.
 */
(function () {
  const NAV_ITEMS = [
    { id: "home", label: "Início", icon: "home", href: "index.html", match: /index\.html$|\/$/ },
    { id: "sos", label: "SOS", icon: "sos", href: "emergency/sos.html", match: /emergency/ },
    { id: "contacts", label: "Contatos", icon: "contacts", href: "contacts/index.html", match: /contacts/ },
    { id: "map", label: "Mapa", icon: "map", href: "map/index.html", match: /map/ },
    { id: "more", label: "Mais", icon: "menu", href: "settings.html", match: /settings|content|support|community|info|auth/ },
  ];

  function currentPath() {
    return window.location.pathname;
  }

  function isActive(item) {
    return item.match.test(currentPath());
  }

  function renderBottomNav() {
    if (document.body.dataset.noNav === "true") return;

    const nav = document.createElement("nav");
    nav.className = "bottom-nav";
    nav.setAttribute("aria-label", "Navegação principal");

    NAV_ITEMS.forEach((item) => {
      const a = document.createElement("a");
      a.href = window.ZL.asset(item.href);
      a.className = "bottom-nav__item" + (isActive(item) ? " bottom-nav__item--active" : "");
      a.innerHTML = `<span class="bottom-nav__icon">${window.ZL.icon(item.icon, "icon icon--nav")}</span><span>${item.label}</span>`;
      nav.appendChild(a);
    });

    document.body.appendChild(nav);
  }

  function renderHeader() {
    if (document.body.dataset.noHeader === "true") return;
    if (document.querySelector(".app-header")) return;

    const header = document.createElement("header");
    header.className = "app-header";
    header.innerHTML = `
      <div class="app-header__start">
        <div id="header-avatar-slot"></div>
        <a href="${window.ZL.asset("index.html")}" class="app-header__brand">
          <span class="app-header__brand-text">
            <img src="${window.ZL.asset("assets/logo/zela-wordmark.svg")}" alt="Zela" class="app-header__logo" width="72" height="28">
            <span class="app-header__tagline">Zela por ela</span>
          </span>
        </a>
      </div>
      <div id="header-auth-slot"></div>
    `;
    document.body.insertBefore(header, document.body.firstChild);
    document.body.classList.add("has-quick-exit");
  }

  window.ZL.renderNav = function () {
    renderHeader();
    renderBottomNav();
  };

  document.addEventListener("DOMContentLoaded", () => {
    window.ZL.renderNav();
  });
})();
