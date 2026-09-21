/**
 * Botão de saída rápida — redireciona para página neutra.
 */
(function () {
  const EXIT_URL = "exit.html";

  function createQuickExitButton() {
    if (document.body.dataset.noQuickExit === "true") return;

    const existing = document.getElementById("btn-quick-exit");
    if (existing) return;

    const btn = document.createElement("button");
    btn.id = "btn-quick-exit";
    btn.type = "button";
    btn.className = "btn-quick-exit";
    btn.setAttribute("aria-label", "Saída rápida para página neutra");
    btn.textContent = "Sair";

    btn.addEventListener("click", () => {
      window.location.replace(window.ZL.asset(EXIT_URL));
    });

    const header = document.querySelector(".app-header");
    if (header) {
      header.insertBefore(btn, header.lastElementChild);
    }
  }

  document.addEventListener("DOMContentLoaded", createQuickExitButton);
})();
