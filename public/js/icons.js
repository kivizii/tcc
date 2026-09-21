/**
 * Biblioteca de ícones SVG Zela — stroke simples, cor via currentColor.
 */
(function () {
  const ICONS = {
    home: '<path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z"/>',
    sos: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
    contacts:
      '<path d="M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M23 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    map: '<path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    settings:
      '<circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
    books: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    wrench:
      '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.8-2.8 2.5-2.5z"/>',
    graduation:
      '<path d="M22 10l-10-5L2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
    chat: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    alert:
      '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
  };

  /**
   * @param {string} name
   * @param {string} [className]
   * @param {number} [size]
   */
  function icon(name, className = "icon", size = 24) {
    const paths = ICONS[name];
    if (!paths) return "";
    return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }

  window.ZL = window.ZL || {};
  window.ZL.icon = icon;
  window.ZL.ICONS = Object.keys(ICONS);

  function hydrateIcons() {
    document.querySelectorAll("[data-icon]").forEach((el) => {
      const name = el.dataset.icon;
      if (!name || !ICONS[name]) return;
      const size = parseInt(el.dataset.iconSize || "24", 10);
      const extraClass = el.dataset.iconClass || "icon";
      el.innerHTML = icon(name, extraClass, size);
    });
  }

  document.addEventListener("DOMContentLoaded", hydrateIcons);
})();
