import "./app-header.css";

// ADICIONADO: helper de navegação com fallback
function go(path) {
  if (typeof window !== "undefined") {
    if (window.navigate) return window.navigate(path); // SPA
    return (window.location.href = path);              // fallback hard reload
  }
}

// Web Component para o header compartilhado
class AppHeader extends HTMLElement {
  connectedCallback() {
    const path = window.location.pathname;
    const isDashboard = path.startsWith("/dashboard");
    const isLivros = path.startsWith("/livros");
    const isUnidades = path.startsWith("/unidades");
    const isUsuarios = path.startsWith("/usuarios");
    const isEmprestimos = path.startsWith("/emprestimos");
    const isFaq = path.startsWith("/faq");
    
    this.innerHTML = /* html */ `
      <header id="main-header" class="header">
        <button type="button" class="logo-button" data-home-link aria-label="Ir para o Dashboard">
          <img src="/assets/imgs/logotipo.png" alt="Bibliotecas Conectadas" class="logo logo--desktop" />
          <img src="/assets/imgs/icone.png" alt="" class="logo logo--mobile" aria-hidden="true" />
        </button>
        
        <button type="button" class="hamburger-btn" id="hamburger-btn" aria-label="Abrir menu" aria-controls="side-menu" aria-expanded="false">
          <i class="fa-solid fa-bars"></i>
        </button>
      </header>
      
      <div class="menu-overlay" id="menu-overlay"></div>
      
      <nav class="side-menu" id="side-menu" aria-label="Navegação principal" aria-hidden="true" inert>
        <div class="side-menu-header">
          <h3>Menu</h3>
          <button type="button" class="close-menu-btn" id="close-menu-btn" aria-label="Fechar menu">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <ul class="side-menu-list">
          <li>
            <a href="#" id="menu-dashboard-btn" class="side-menu-item ${isDashboard ? 'active' : ''}">
              <i class="fa-solid fa-chart-column"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#" id="menu-livros-btn" class="side-menu-item ${isLivros ? 'active' : ''}">
              <i class="fa-solid fa-book"></i>
              <span>Livros</span>
            </a>
          </li>
          <li>
            <a href="#" id="menu-unidades-btn" class="side-menu-item ${isUnidades ? 'active' : ''}">
              <i class="fa-solid fa-building"></i>
              <span>Unidades</span>
            </a>
          </li>
          <li>
            <a href="#" id="menu-usuarios-btn" class="side-menu-item ${isUsuarios ? 'active' : ''}">
              <i class="fa-solid fa-users"></i>
              <span>Usuários</span>
            </a>
          </li>
          <li>
            <a href="#" id="menu-emprestimos-btn" class="side-menu-item ${isEmprestimos ? 'active' : ''}">
              <i class="fa-solid fa-right-left"></i>
              <span>Empréstimos</span>
            </a>
          </li>
          <li>
            <a href="#" id="menu-faq-btn" class="side-menu-item ${isFaq ? 'active' : ''}">
              <i class="fa-solid fa-circle-question"></i>
              <span>FAQ</span>
            </a>
          </li>
          <li>
            <a href="#" id="menu-password-btn" class="side-menu-item">
              <i class="fa-solid fa-key"></i>
              <span>Alterar senha</span>
            </a>
          </li>
          <li class="menu-divider"></li>
          <li>
            <a href="#" id="menu-logout-btn" class="side-menu-item logout">
              <i class="fa-solid fa-right-from-bracket"></i>
              <span>Sair</span>
            </a>
          </li>
        </ul>
      </nav>
    `;
    
    const hamburgerBtn = this.querySelector("#hamburger-btn");
    const closeMenuBtn = this.querySelector("#close-menu-btn");
    const menuOverlay = this.querySelector("#menu-overlay");
    const sideMenu = this.querySelector("#side-menu");
    
    const openMenu = () => {
      sideMenu.classList.add("open");
      menuOverlay.classList.add("open");
      sideMenu.removeAttribute("inert");
      sideMenu.setAttribute("aria-hidden", "false");
      hamburgerBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      closeMenuBtn.focus();
    };
    
    const closeMenu = ({ restoreFocus = true } = {}) => {
      sideMenu.classList.remove("open");
      menuOverlay.classList.remove("open");
      sideMenu.setAttribute("inert", "");
      sideMenu.setAttribute("aria-hidden", "true");
      hamburgerBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (restoreFocus) hamburgerBtn.focus();
    };
    
    hamburgerBtn.onclick = (e) => {
      e.preventDefault();
      openMenu();
    };
    
    closeMenuBtn.onclick = (e) => {
      e.preventDefault();
      closeMenu();
    };
    
    menuOverlay.onclick = (e) => {
      e.preventDefault();
      closeMenu();
    };

    this._handleEscape = (e) => {
      if (e.key === "Escape" && sideMenu.classList.contains("open")) {
        closeMenu();
      }
    };
    document.addEventListener("keydown", this._handleEscape);
    
    this.querySelectorAll("[data-home-link]").forEach((homeLink) => {
      homeLink.onclick = (e) => {
        e.preventDefault();
        go("/dashboard");
      };
    });
    
    this.querySelector("#menu-dashboard-btn").onclick = (e) => {
      e.preventDefault();
      closeMenu({ restoreFocus: false });
      go("/dashboard");
    };

    this.querySelector("#menu-livros-btn").onclick = (e) => {
      e.preventDefault();
      closeMenu({ restoreFocus: false });
      window.navigate && window.navigate("/livros");
    };
    
    this.querySelector("#menu-unidades-btn").onclick = (e) => {
      e.preventDefault();
      closeMenu({ restoreFocus: false });
      window.navigate && window.navigate("/unidades");
    };

    this.querySelector("#menu-usuarios-btn").onclick = (e) => {
      e.preventDefault();
      closeMenu({ restoreFocus: false });
      window.navigate && window.navigate("/usuarios");
    };

    this.querySelector("#menu-emprestimos-btn").onclick = (e) => {
      e.preventDefault();
      closeMenu({ restoreFocus: false });
      window.navigate && window.navigate("/emprestimos");
    };
    
    this.querySelector("#menu-faq-btn").onclick = (e) => {
      e.preventDefault();
      closeMenu({ restoreFocus: false });
      window.navigate && window.navigate("/faq");
    };
    
    this.querySelector("#menu-password-btn").onclick = (e) => {
      e.preventDefault();
      closeMenu({ restoreFocus: false });
      go("/alterar-senha");
    };

    this.querySelector("#menu-logout-btn").onclick = (e) => {
      e.preventDefault();
      closeMenu({ restoreFocus: false });
      if (window.confirm("Deseja realmente sair do sistema?")) {
        if (window.authController?.logout) {
          window.authController.logout();
        } else {
          localStorage.removeItem("authToken");
          localStorage.removeItem("isAuthenticated");
          localStorage.removeItem("user");
        }
        go("/login");
      }
    };
  }

  disconnectedCallback() {
    if (this._handleEscape) {
      document.removeEventListener("keydown", this._handleEscape);
    }
    document.body.style.overflow = "";
  }
}
customElements.define("app-header", AppHeader);
