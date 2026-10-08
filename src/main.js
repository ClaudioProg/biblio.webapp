import "./css/style.css";
import "./components/page-header.js";
import "./components/livro/livro-form.js";
import "./components/livro/livro-exemplares.js";
import "./components/livro/livro-list.js";
import "./components/unidade/unidade-form.js";
import "./components/unidade/unidade-list.js";
import "./components/usuario/usuario-form.js";
import "./components/usuario/usuario-list.js";
import "./components/emprestimo/emprestimo-form.js";
import "./components/emprestimo/emprestimo-list.js";
import "./components/app-header.js";
import "./components/dashboard/dashboard-page.js";
import "./components/acesso/acesso-page.js";
import { router as appRouter } from "./routes.js";
import { GestorController } from "./domains/gestor/gestor-controller.js";
import { AuthController } from "./domains/auth/auth-controller.js";
import { AuthView } from "./domains/auth/auth-view.js";
import { GestorView } from "./domains/gestor/gestor-view.js";

const gestorController = new GestorController();
window.gestorController = gestorController;
const authController = new AuthController();
window.authController = authController;
const authView = new AuthView();
const gestorView = new GestorView();
window.gestorView = gestorView;

function navigate(path) {
  window.history.pushState({}, "", path);
  appRouter({
    gestorController,
    gestorView,
    authController,
    authView,
    navigate,
  });
  window.scrollTo(0, 0);
}

window.navigate = navigate;

window.addEventListener("popstate", () =>
  appRouter({
    gestorController,
    gestorView,
    authController,
    authView,
    navigate,
  })
);

appRouter({ gestorController, gestorView, authController, authView, navigate });

// Tabelas responsivas: no desktop permanecem como tabela; no mobile
// cada linha recebe rótulos para ser apresentada como card sem rolagem horizontal.
function enhanceResponsiveTables() {
  document.querySelectorAll(".table-responsive table").forEach((table) => {
    table.classList.add("mobile-card-table");

    const headers = Array.from(table.querySelectorAll("thead th")).map((th) =>
      String(th.textContent || "").trim()
    );

    table.querySelectorAll("tbody tr").forEach((row) => {
      Array.from(row.children).forEach((cell, index) => {
        if (cell.tagName !== "TD" || cell.hasAttribute("colspan")) return;
        cell.dataset.label = headers[index] || "";
      });
    });
  });
}

// Scroll indicators ficam restritos às telas em que a tabela continua horizontal.
function updateTableScrollIndicators() {
  enhanceResponsiveTables();

  document.querySelectorAll(".table-responsive").forEach((container) => {
    const hasOverflow = container.scrollWidth > container.clientWidth + 1;
    if (hasOverflow) container.classList.add("is-scrollable");
    else container.classList.remove("is-scrollable");

    if (container.scrollLeft > 6) container.classList.add("scrolled");
    else container.classList.remove("scrolled");

    if (!container.__scrollHandlerAttached) {
      container.addEventListener("scroll", () => {
        if (container.scrollLeft > 6) container.classList.add("scrolled");
        else container.classList.remove("scrolled");
      });
      container.__scrollHandlerAttached = true;
    }
  });
}

let responsiveTableFrame = null;
const scheduleResponsiveTableEnhancement = () => {
  if (responsiveTableFrame) cancelAnimationFrame(responsiveTableFrame);
  responsiveTableFrame = requestAnimationFrame(() => {
    responsiveTableFrame = null;
    updateTableScrollIndicators();
  });
};

window.addEventListener("resize", scheduleResponsiveTableEnhancement);
window.addEventListener("DOMContentLoaded", scheduleResponsiveTableEnhancement);

const tableObserver = new MutationObserver(scheduleResponsiveTableEnhancement);
tableObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

setTimeout(scheduleResponsiveTableEnhancement, 120);
