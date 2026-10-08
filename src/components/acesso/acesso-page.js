import "./acesso-page.css";
import { escapeHtml } from "../../utils/html.js";
import {
  accessDisplayName,
  accessRoleLabel,
} from "../../utils/access.js";
import { showToast } from "../../utils/feedback.js";

class AcessoPage extends HTMLElement {
  constructor() {
    super();
    this._accounts = [];
    this._editingAccount = null;
    this.onCreate = null;
    this.onUpdate = null;
    this.onResetPassword = null;
  }

  set accounts(value) {
    this._accounts = Array.isArray(value) ? value : [];
    if (this.isConnected) this.render();
  }

  get accounts() {
    return this._accounts;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const editing = this._editingAccount;
    this.innerHTML = `
      <section class="access-page">
        <div class="access-page-heading">
          <div>
            <p class="access-eyebrow">Administração</p>
            <h2>Acessos à plataforma</h2>
            <p>
              Cadastre aqui os funcionários que podem entrar no Bibliotecas
              Conectadas. Esta lista é diferente de <strong>Usuários</strong>,
              que representa leitores/pessoas da biblioteca.
            </p>
          </div>
          <button type="button" id="access-new-btn">
            <i class="fa-solid fa-user-plus" aria-hidden="true"></i>
            Novo acesso
          </button>
        </div>

        <div id="access-form-panel" class="access-form-panel" ${editing ? "" : "hidden"}>
          ${this._formTemplate(editing)}
        </div>

        <article class="access-panel">
          <div class="access-desktop-table table-responsive">
            <table class="striped access-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Usuário</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Último acesso</th>
                  <th class="access-actions-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${
                  this.accounts.length
                    ? this.accounts.map((account) => this._rowTemplate(account)).join("")
                    : `
                      <tr>
                        <td colspan="7" class="access-empty">
                          Nenhuma conta de acesso encontrada.
                        </td>
                      </tr>
                    `
                }
              </tbody>
            </table>
          </div>

          <div class="access-mobile-list">
            ${this.accounts.length
              ? this.accounts
                  .map((account) => this._mobileCardTemplate(account))
                  .join("")
              : `
                <div class="access-mobile-empty">
                  Nenhuma conta de acesso encontrada.
                </div>
              `
            }
          </div>
        </article>

        <dialog id="access-password-dialog" class="access-password-dialog">
          <form method="dialog" id="access-password-form">
            <h3>Redefinir senha</h3>
            <p id="access-password-account"></p>

            <label for="access-new-password">Nova senha temporária</label>
            <input
              id="access-new-password"
              type="password"
              autocomplete="new-password"
              minlength="8"
              required
            />

            <label for="access-confirm-password">Confirmar senha</label>
            <input
              id="access-confirm-password"
              type="password"
              autocomplete="new-password"
              minlength="8"
              required
            />

            <div class="access-form-actions">
              <button type="button" class="outline" id="access-password-cancel">
                Cancelar
              </button>
              <button type="submit">Redefinir senha</button>
            </div>
          </form>
        </dialog>
      </section>
    `;

    this._bindEvents();
  }

  _formTemplate(account) {
    const isEdit = Boolean(account?.id);
    return `
      <form id="access-form">
        <div class="access-form-title">
          <h3>${isEdit ? "Editar acesso" : "Novo acesso"}</h3>
          <button
            type="button"
            id="access-form-close"
            class="outline border-0"
            aria-label="Fechar formulário"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <div class="access-form-grid">
          <div>
            <label for="access-first-name">Nome</label>
            <input
              id="access-first-name"
              name="first_name"
              maxlength="150"
              value="${escapeHtml(account?.first_name || "")}"
            />
          </div>

          <div>
            <label for="access-last-name">Sobrenome</label>
            <input
              id="access-last-name"
              name="last_name"
              maxlength="150"
              value="${escapeHtml(account?.last_name || "")}"
            />
          </div>

          <div>
            <label for="access-username">Usuário *</label>
            <input
              id="access-username"
              name="username"
              maxlength="150"
              autocomplete="username"
              required
              value="${escapeHtml(account?.username || "")}"
            />
          </div>

          <div>
            <label for="access-email">E-mail</label>
            <input
              id="access-email"
              name="email"
              type="email"
              maxlength="254"
              value="${escapeHtml(account?.email || "")}"
            />
          </div>

          <div>
            <label for="access-role">Perfil *</label>
            <select id="access-role" name="role" required>
              <option value="staff" ${account?.role === "staff" ? "selected" : ""}>
                Operador
              </option>
              <option value="admin" ${account?.role === "admin" ? "selected" : ""}>
                Administrador
              </option>
            </select>
            <small>
              Operador usa a plataforma. Administrador também gerencia acessos.
            </small>
          </div>

          <div class="access-active-field">
            <label>
              <input
                id="access-active"
                name="active"
                type="checkbox"
                ${account?.active === false ? "" : "checked"}
              />
              Conta ativa
            </label>
          </div>

          ${
            isEdit
              ? ""
              : `
                <div>
                  <label for="access-password">Senha temporária *</label>
                  <input
                    id="access-password"
                    name="password"
                    type="password"
                    autocomplete="new-password"
                    minlength="8"
                    required
                  />
                </div>
                <div>
                  <label for="access-password-confirm">Confirmar senha *</label>
                  <input
                    id="access-password-confirm"
                    type="password"
                    autocomplete="new-password"
                    minlength="8"
                    required
                  />
                </div>
              `
          }
        </div>

        <div class="access-form-actions">
          <button type="button" class="outline" id="access-form-cancel">
            Cancelar
          </button>
          <button type="submit">
            ${isEdit ? "Salvar alterações" : "Criar acesso"}
          </button>
        </div>
      </form>
    `;
  }

  _mobileCardTemplate(account) {
    const lastLogin = account.last_login
      ? new Date(account.last_login).toLocaleString("pt-BR")
      : "Nunca";

    return `
      <article class="access-mobile-card">
        <div class="access-mobile-card-header">
          <div>
            <strong>${escapeHtml(accessDisplayName(account))}</strong>
            <code>${escapeHtml(account.username)}</code>
          </div>
          <span class="access-status ${account.active ? "is-active" : "is-inactive"}">
            ${account.active ? "Ativa" : "Inativa"}
          </span>
        </div>

        <dl class="access-mobile-meta">
          <div><dt>Perfil</dt><dd>${escapeHtml(accessRoleLabel(account.role))}</dd></div>
          <div><dt>E-mail</dt><dd>${escapeHtml(account.email || "—")}</dd></div>
          <div><dt>Último acesso</dt><dd>${escapeHtml(lastLogin)}</dd></div>
        </dl>

        <div class="access-row-actions access-mobile-actions">
          <button type="button" class="outline access-edit" data-id="${account.id}">
            <i class="fa-solid fa-pen" aria-hidden="true"></i> Editar
          </button>
          <button type="button" class="outline access-password" data-id="${account.id}">
            <i class="fa-solid fa-key" aria-hidden="true"></i> Senha
          </button>
          <button
            type="button"
            class="outline access-toggle"
            data-id="${account.id}"
            data-active="${account.active ? "true" : "false"}"
          >
            <i class="fa-solid fa-power-off" aria-hidden="true"></i>
            ${account.active ? "Desativar" : "Ativar"}
          </button>
        </div>
      </article>
    `;
  }

  _rowTemplate(account) {
    const lastLogin = account.last_login
      ? new Date(account.last_login).toLocaleString("pt-BR")
      : "Nunca";

    return `
      <tr>
        <td>${escapeHtml(accessDisplayName(account))}</td>
        <td><code>${escapeHtml(account.username)}</code></td>
        <td>${escapeHtml(account.email || "—")}</td>
        <td>${escapeHtml(accessRoleLabel(account.role))}</td>
        <td>
          <span class="access-status ${account.active ? "is-active" : "is-inactive"}">
            ${account.active ? "Ativa" : "Inativa"}
          </span>
        </td>
        <td>${escapeHtml(lastLogin)}</td>
        <td>
          <div class="access-row-actions">
            <button
              type="button"
              class="outline access-edit"
              data-id="${account.id}"
              title="Editar acesso"
            >
              Editar
            </button>
            <button
              type="button"
              class="outline access-password"
              data-id="${account.id}"
              title="Redefinir senha"
            >
              Senha
            </button>
            <button
              type="button"
              class="outline access-toggle"
              data-id="${account.id}"
              data-active="${account.active ? "true" : "false"}"
              title="${account.active ? "Desativar conta" : "Ativar conta"}"
            >
              ${account.active ? "Desativar" : "Ativar"}
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  _bindEvents() {
    this.querySelector("#access-new-btn")?.addEventListener("click", () => {
      this._editingAccount = {
        role: "staff",
        active: true,
      };
      this.render();
      this.querySelector("#access-first-name")?.focus();
    });

    const closeForm = () => {
      this._editingAccount = null;
      this.render();
    };

    this.querySelector("#access-form-close")?.addEventListener("click", closeForm);
    this.querySelector("#access-form-cancel")?.addEventListener("click", closeForm);

    this.querySelector("#access-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const isEdit = Boolean(this._editingAccount?.id);
      const password = form.querySelector("#access-password")?.value || "";
      const confirmation = form.querySelector("#access-password-confirm")?.value || "";

      if (!isEdit && password !== confirmation) {
        showToast("A confirmação da senha não confere.", "error");
        return;
      }

      const payload = {
        username: form.username.value.trim(),
        first_name: form.first_name.value.trim(),
        last_name: form.last_name.value.trim(),
        email: form.email.value.trim(),
        role: form.role.value,
        active: form.active.checked,
      };
      if (!isEdit) payload.password = password;

      const submit = form.querySelector('button[type="submit"]');
      if (submit) submit.disabled = true;

      try {
        if (isEdit) {
          await this.onUpdate?.(this._editingAccount.id, payload);
          showToast("Acesso atualizado com sucesso.", "success");
        } else {
          await this.onCreate?.(payload);
          showToast("Acesso criado com sucesso.", "success");
        }
        this._editingAccount = null;
        this.render();
      } catch (error) {
        showToast(error?.message || "Não foi possível salvar o acesso.", "error");
      } finally {
        if (submit) submit.disabled = false;
      }
    });

    this.querySelectorAll(".access-edit").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        const account = this.accounts.find((item) => Number(item.id) === id);
        if (!account) return;
        this._editingAccount = { ...account };
        this.render();
      });
    });

    this.querySelectorAll(".access-toggle").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = Number(button.dataset.id);
        const active = button.dataset.active === "true";
        const account = this.accounts.find((item) => Number(item.id) === id);
        if (!account) return;

        const verb = active ? "desativar" : "ativar";
        if (!window.confirm(`Deseja realmente ${verb} o acesso de ${accessDisplayName(account)}?`)) {
          return;
        }

        button.disabled = true;
        try {
          await this.onUpdate?.(id, { active: !active });
          showToast(
            active ? "Acesso desativado." : "Acesso ativado.",
            "success"
          );
        } catch (error) {
          showToast(error?.message || "Não foi possível alterar o acesso.", "error");
          button.disabled = false;
        }
      });
    });

    const dialog = this.querySelector("#access-password-dialog");
    const passwordForm = this.querySelector("#access-password-form");
    let passwordAccountId = null;

    this.querySelectorAll(".access-password").forEach((button) => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        const account = this.accounts.find((item) => Number(item.id) === id);
        if (!account || !dialog) return;

        passwordAccountId = id;
        const label = this.querySelector("#access-password-account");
        if (label) {
          label.textContent = `Conta: ${accessDisplayName(account)} (${account.username})`;
        }
        passwordForm?.reset();
        dialog.showModal();
        this.querySelector("#access-new-password")?.focus();
      });
    });

    this.querySelector("#access-password-cancel")?.addEventListener("click", () => {
      dialog?.close();
    });

    passwordForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const password = this.querySelector("#access-new-password")?.value || "";
      const confirmation = this.querySelector("#access-confirm-password")?.value || "";

      if (password !== confirmation) {
        showToast("A confirmação da senha não confere.", "error");
        return;
      }

      const submit = passwordForm.querySelector('button[type="submit"]');
      if (submit) submit.disabled = true;

      try {
        await this.onResetPassword?.(passwordAccountId, password);
        showToast(
          "Senha redefinida. Sessões anteriores foram encerradas.",
          "success"
        );
        dialog?.close();
      } catch (error) {
        showToast(error?.message || "Não foi possível redefinir a senha.", "error");
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  }
}

customElements.define("acesso-page", AcessoPage);
