/**
 * Bootstrap — carrega assets com caminho relativo correto.
 * Uso: <script src="js/bootstrap.js" data-depth="0"></script>
 * depth = número de níveis abaixo de public/ (0 = index.html, 1 = auth/login.html)
 */
(function () {
  const script = document.currentScript;
  const depth = parseInt(script?.dataset?.depth || "0", 10);
  const root = depth === 0 ? "" : "../".repeat(depth);

  window.ZL = {
    root,
    asset(path) {
      return root + path;
    },
    depth,
  };

  const ASSET_VERSION = "33";

  const robots = document.createElement("meta");
  robots.name = "robots";
  robots.content = "noindex, nofollow, noarchive";
  document.head.appendChild(robots);

  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.type = "image/svg+xml";
  favicon.href = root + "assets/favicon.svg";
  document.head.appendChild(favicon);

  const styles = ["css/tokens.css", "css/base.css", "css/components.css"];
  styles.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${root}${href}?v=${ASSET_VERSION}`;
    document.head.appendChild(link);
  });

  const modules = script?.dataset?.modules;
  const extraScripts = modules ? modules.split(",").map((s) => s.trim()) : [];

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = `${root}${src}?v=${ASSET_VERSION}`;
      el.onload = resolve;
      el.onerror = reject;
      document.head.appendChild(el);
    });

  const coreScripts = [
    "js/firebase-config.js",
    "js/icons.js",
    "js/nav.js",
    "js/quick-exit.js",
    "js/auth.js",
    "js/profile.js",
    "js/assistant.js",
    "js/assistant-widget.js",
  ];

  (async () => {
    try {
      for (const src of coreScripts) {
        await loadScript(src);
      }
      if (extraScripts.some((src) => src.includes("communities.js"))) {
        await loadScript("js/communities-fallback.js");
      }
      for (const src of extraScripts) {
        try {
          await loadScript(src);
        } catch (err) {
          console.error(`Zela: falha ao carregar ${src}`, err);
        }
      }
      const notifyReady = () => {
        if (typeof window.ZL.onReady === "function") {
          window.ZL.onReady();
        }
        document.dispatchEvent(new CustomEvent("zela:ready"));
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", notifyReady, { once: true });
      } else {
        notifyReady();
      }
    } catch (err) {
      console.error("Zela bootstrap error:", err);
    }
  })();
})();
