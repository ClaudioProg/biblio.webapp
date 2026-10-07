// 📄 src/components/livro/livro-exemplares.js
import { BaseService } from "../../domains/base-service.js";
import { showToast } from "../../utils/feedback.js";
import { escapeHtml } from "../../utils/html.js";

const api = new BaseService();

class LivroExemplaresPage extends HTMLElement {
  constructor() {
    super();
    this._livroId = null;
    this._livro = null;
    this._unidadesDisponiveis = [];
    this._unidadesSelecionadas = [];
    this._onSalvar = null;
    this._onCancelar = null;
  }

  set livroId(value) {
    this._livroId = Number(value) || null;
  }

  set livro(value) {
    this._livro = value || null;
  }

  set unidadesDisponiveis(value) {
    this._unidadesDisponiveis = Array.isArray(value) ? value : [];
  }

  set unidadesSelecionadas(value) {
    this._unidadesSelecionadas = Array.isArray(value) ? value : [];
  }

  set onSalvar(value) {
    this._onSalvar = typeof value === "function" ? value : null;
  }

  set onCancelar(value) {
    this._onCancelar = typeof value === "function" ? value : null;
  }

  connectedCallback() {
    this.renderSkeleton();
    this.bootstrap().catch((err) => {
      console.error("Erro ao carregar exemplares:", err);
      this.innerHTML = this.errorView(
        "Não foi possível carregar os exemplares deste livro."
      );
      this.bindBackActions();
    });
  }

  async bootstrap() {
    this._livroId = this._livroId || this.getLivroIdFromUrl();
    if (!this._livroId) {
      throw new Error("ID do livro não encontrado.");
    }

    if (!this._livro) {
      this._livro = await api.get(`/gestor/livros/${this._livroId}/`);
    }

    if (!this._unidadesDisponiveis.length) {
      const unidades = await api.get("/gestor/unidades/");
      this._unidadesDisponiveis = Array.isArray(unidades) ? unidades : [];
    }

    const unidadesDoLivro = Array.isArray(this._livro?.unidades_detalhe)
      ? this._livro.unidades_detalhe
      : Array.isArray(this._livro?.unidades)
        ? this._livro.unidades
        : [];

    if (unidadesDoLivro.length) {
      this._unidadesSelecionadas = unidadesDoLivro.map((item) => ({
        unidade:
          item.unidade && typeof item.unidade === "object"
            ? item.unidade
            : this._unidadesDisponiveis.find(
                (u) => Number(u.id) === Number(item.unidade)
              ) || { id: Number(item.unidade), nome: `Unidade ${item.unidade}` },
        exemplares: Number(item.exemplares) || 0,
      }));
    } else {
      const relacoes = await api.get(
        `/gestor/livro-unidades/?livro=${this._livroId}`
      );
      this._unidadesSelecionadas = (Array.isArray(relacoes) ? relacoes : []).map(
        (item) => ({
          unidade:
            item.unidade && typeof item.unidade === "object"
              ? item.unidade
              : this._unidadesDisponiveis.find(
                  (u) => Number(u.id) === Number(item.unidade)
                ) || { id: Number(item.unidade), nome: `Unidade ${item.unidade}` },
          exemplares: Number(item.exemplares) || 0,
        })
      );
    }

    this.renderEditor();
  }

  getLivroIdFromUrl() {
    const path = window.location.pathname || "";
    const match = path.match(/\/livros\/(\d+)\/exemplares/);
    return match?.[1] ? Number(match[1]) : null;
  }

  getQuantidade(unidadeId) {
    const row = this._unidadesSelecionadas.find(
      (item) => Number(item.unidade?.id) === Number(unidadeId)
    );
    return Number(row?.exemplares) || 0;
  }

  totalExemplares() {
    return this._unidadesDisponiveis.reduce(
      (total, unidade) => total + this.getQuantidade(unidade.id),
      0
    );
  }

  renderSkeleton() {
    this.innerHTML = `
      <section class="container">
        <page-header title="Exemplares por Unidade" back-button-id="voltar-btn"></page-header>
        <div class="app-loading-panel">Carregando exemplares...</div>
      </section>
    `;
  }

  renderEditor() {
    const livro = this._livro || {};
    const unidades = this._unidadesDisponiveis || [];

    this.innerHTML = `
      <section class="container">
        <page-header title="Exemplares por Unidade" back-button-id="voltar-btn"></page-header>

        <div style="margin:8px 0 16px 0;color:#555">
          <div><strong>Livro:</strong> ${escapeHtml(livro.titulo || "—")}</div>
          <div><strong>Total de exemplares:</strong> <span id="total-exemplares">${this.totalExemplares()}</span></div>
        </div>

        <form id="exemplares-form">
          <div style="display:grid;gap:.75rem">
            ${
              unidades.length
                ? unidades
                    .map(
                      (unidade) => `
                        <label style="display:grid;grid-template-columns:minmax(0,1fr) 120px;gap:12px;align-items:center;border:1px solid #eee;border-radius:12px;padding:12px 14px">
                          <span>
                            <strong>${escapeHtml(unidade.nome)}</strong>
                            ${
                              unidade.endereco
                                ? `<small style="display:block;color:#666">${escapeHtml(unidade.endereco)}</small>`
                                : ""
                            }
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="9999"
                            step="1"
                            data-unidade-id="${unidade.id}"
                            value="${this.getQuantidade(unidade.id)}"
                            aria-label="Exemplares em ${escapeHtml(unidade.nome)}"
                          />
                        </label>
                      `
                    )
                    .join("")
                : '<div style="color:#777">Nenhuma unidade cadastrada.</div>'
            }
          </div>

          <div style="display:flex;gap:.75rem;margin-top:20px">
            <button type="button" id="cancelar-btn" class="outline">Cancelar</button>
            <button type="submit" id="salvar-btn" ${
              unidades.length ? "" : "disabled"
            }>Salvar exemplares</button>
          </div>
        </form>
      </section>
    `;

    this.bindEditorActions();
  }

  bindEditorActions() {
    this.bindBackActions();

    const form = this.querySelector("#exemplares-form");
    const totalEl = this.querySelector("#total-exemplares");
    const salvarBtn = this.querySelector("#salvar-btn");

    const recalc = () => {
      const total = Array.from(
        this.querySelectorAll('input[data-unidade-id]')
      ).reduce((sum, input) => sum + Math.max(0, Number(input.value) || 0), 0);
      if (totalEl) totalEl.textContent = String(total);
    };

    this.querySelectorAll('input[data-unidade-id]').forEach((input) => {
      input.addEventListener("input", recalc);
    });

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const unidades = Array.from(
        this.querySelectorAll('input[data-unidade-id]')
      )
        .map((input) => ({
          unidade: Number(input.dataset.unidadeId),
          exemplares: Math.max(0, Number(input.value) || 0),
        }))
        .filter((item) => item.unidade > 0 && item.exemplares > 0);

      if (salvarBtn) {
        salvarBtn.disabled = true;
        salvarBtn.textContent = "Salvando...";
      }

      try {
        if (this._onSalvar) {
          await this._onSalvar({ unidades });
        } else {
          await api.patch(`/gestor/livros/${this._livroId}/`, { unidades });
          showToast("Exemplares atualizados com sucesso!", "success");
        }
      } catch (err) {
        console.error("Erro ao salvar exemplares:", err);
        showToast(
          err?.message || "Não foi possível salvar os exemplares.",
          "error"
        );
        if (salvarBtn) {
          salvarBtn.disabled = false;
          salvarBtn.textContent = "Salvar exemplares";
        }
      }
    });
  }

  bindBackActions() {
    const goBack = () => {
      if (this._onCancelar) {
        this._onCancelar();
        return;
      }
      if (window.navigate) {
        window.navigate("/livros");
        return;
      }
      window.location.href = "/livros";
    };

    this.querySelector("#voltar-btn")?.addEventListener("click", goBack);
    this.querySelector("#cancelar-btn")?.addEventListener("click", goBack);
  }

  errorView(message) {
    return `
      <section class="container">
        <page-header title="Exemplares por Unidade" back-button-id="voltar-btn"></page-header>
        <div style="color:#b00020">${message}</div>
        <div style="margin-top:12px">
          <button type="button" id="cancelar-btn" class="outline">Voltar</button>
        </div>
      </section>
    `;
  }
}

customElements.define("livro-exemplares-page", LivroExemplaresPage);
export default LivroExemplaresPage;
