// View de autenticação
export class AuthView {
  renderLogin(onLogin) {
    document.querySelector("#app-content").innerHTML = `
      <div class="login-container">
        <img src="/assets/imgs/logo.png" alt="Logo Bibliotecas Conectadas" id="logo-bibliotecas" /> 
        <form id="login-form">
          <h2>Login</h2>
          <div>
            <label for="username">Usuário:</label>
            <input type="text" id="username" name="username" placeholder="Digite seu usuário" />
          </div>
          <div>
            <label for="password">Senha:</label>
            <input type="password" id="password" name="password" placeholder="Digite sua senha" />
          </div>
          <small id="login-feedback" class="app-inline-feedback" aria-live="polite"></small>
          <button type="submit">Entrar</button>
        </form>
        <div style="text-align:center;margin-top:1.5rem;">
          <a href="/faq" id="faq-link" style="color:var(--primary);text-decoration:none;display:inline-flex;align-items:center;gap:0.5rem;">
            <i class="fa-solid fa-circle-question"></i>
            <span>Dúvidas? Consulte o FAQ</span>
          </a>
        </div>
      </div>
    `;
    document.getElementById("login-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      onLogin(username, password);
    });
    
    const faqLink = document.getElementById("faq-link");
    if (faqLink) {
      faqLink.addEventListener("click", (e) => {
        e.preventDefault();
        window.navigate && window.navigate("/faq");
      });
    }
  }

  setLoading(isLoading) {
    const form = document.getElementById("login-form");
    if (!form) return;
    const button = form.querySelector('button[type="submit"]');
    const feedback = document.getElementById("login-feedback");
    if (!button) return;

    if (isLoading) {
      button.disabled = true;
      button.textContent = "Entrando...";
      if (feedback) {
        feedback.textContent = "Validando credenciais...";
        feedback.classList.remove("is-error", "is-success");
        feedback.classList.add("is-loading");
      }
      return;
    }

    button.disabled = false;
    button.textContent = "Entrar";
    if (feedback) {
      feedback.classList.remove("is-loading");
    }
  }

  showError(message) {
    const feedback = document.getElementById("login-feedback");
    if (!feedback) return;
    feedback.textContent = message || "Não foi possível entrar.";
    feedback.classList.remove("is-loading", "is-success");
    feedback.classList.add("is-error");
  }

  renderChangePassword(onSubmit, onBack) {
    const root = document.querySelector("#app-content");
    if (!root) return;

    root.innerHTML = `
      <section class="form-container">
        <form id="change-password-form">
          <page-header title="Alterar senha" back-button-id="voltar-senha-btn"></page-header>

          <div>
            <label for="current-password">Senha atual:</label>
            <input type="password" id="current-password" autocomplete="current-password" required />
          </div>

          <div>
            <label for="new-password">Nova senha:</label>
            <input type="password" id="new-password" autocomplete="new-password" minlength="8" required />
          </div>

          <div>
            <label for="confirm-password">Confirmar nova senha:</label>
            <input type="password" id="confirm-password" autocomplete="new-password" minlength="8" required />
          </div>

          <small id="change-password-feedback" class="app-inline-feedback" aria-live="polite"></small>

          <div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:1rem;">
            <button type="button" id="cancelar-senha-btn" class="outline">Cancelar</button>
            <button type="submit">Alterar senha</button>
          </div>
        </form>
      </section>
    `;

    const form = root.querySelector("#change-password-form");
    const feedback = root.querySelector("#change-password-feedback");
    const goBack = () => onBack?.();

    root.querySelector("#voltar-senha-btn")?.addEventListener("click", goBack);
    root.querySelector("#cancelar-senha-btn")?.addEventListener("click", goBack);

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const currentPassword = root.querySelector("#current-password")?.value || "";
      const newPassword = root.querySelector("#new-password")?.value || "";
      const confirmPassword = root.querySelector("#confirm-password")?.value || "";
      const button = form.querySelector('button[type="submit"]');

      if (newPassword !== confirmPassword) {
        if (feedback) {
          feedback.textContent = "A confirmação da nova senha não confere.";
          feedback.classList.add("is-error");
        }
        return;
      }

      if (button) {
        button.disabled = true;
        button.textContent = "Alterando...";
      }
      if (feedback) {
        feedback.textContent = "Atualizando senha...";
        feedback.classList.remove("is-error", "is-success");
        feedback.classList.add("is-loading");
      }

      try {
        await onSubmit?.(currentPassword, newPassword);
        if (feedback) {
          feedback.textContent = "Senha alterada com sucesso.";
          feedback.classList.remove("is-error", "is-loading");
          feedback.classList.add("is-success");
        }
        form.reset();
      } catch (error) {
        if (feedback) {
          feedback.textContent = error?.message || "Não foi possível alterar a senha.";
          feedback.classList.remove("is-loading", "is-success");
          feedback.classList.add("is-error");
        }
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = "Alterar senha";
        }
      }
    });
  }
}
