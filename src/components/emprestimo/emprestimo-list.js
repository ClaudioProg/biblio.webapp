import "./emprestimo-list.css";
import { escapeHtml } from "../../utils/html.js";

class EmprestimoList extends HTMLElement {
  _formatDate(dateString) {
    if (!dateString) return "-";
    try {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year.slice(-2)}`;
    } catch {
      return "-";
    }
  }

  set emprestimos(value) {
    this._emprestimos = Array.isArray(value) ? value : [];
    this.render();
  }

  get emprestimos() {
    return Array.isArray(this._emprestimos) ? this._emprestimos : [];
  }

  set onAdd(value) {
    this._onAdd = value;
    this.render();
  }

  set onEdit(value) {
    this._onEdit = value;
    this.render();
  }

  set onDelete(value) {
    this._onDelete = value;
    this.render();
  }

  set onFilter(value) {
    this._onFilter = value;
    this.render();
  }

  render() {
    const emprestimos = this.emprestimos;
    this.innerHTML = /* html */ `
      <section style="display:grid;gap:1rem;">
        <div class="emprestimo-list-header">
          <div>
            <p style="margin:0 0 0.25rem 0;letter-spacing:0.08em;text-transform:uppercase;font-size:0.78rem;opacity:0.7;">Circulação de acervo</p>
            <h2 style="margin:0;">Empréstimos</h2>
            <p style="margin:0.35rem 0 0 0;max-width:52rem;opacity:0.85;">Relacione livros com usuários e acompanhe o status de devolução.</p>
          </div>
          <button type="button" id="add-emprestimo-btn" class="outline">+ Novo Empréstimo</button>
        </div>

        <div style="margin-bottom:1.5rem;border:1px solid #ddd;border-radius:8px;background:#f9f9f9;">
          <button type="button" style="width:100%;padding:1rem;border:0;border-bottom:1px solid #ddd;background:#f0f0f0;cursor:pointer;display:flex;justify-content:space-between;align-items:center;text-align:left;" id="filter-toggle" aria-expanded="false" aria-controls="filter-content">
            <span style="font-weight:600;">Filtros de Busca</span>
            <span id="filter-arrow" aria-hidden="true" style="font-size:1.2em;">▼</span>
          </button>
          <div id="filter-content" style="padding:1rem;display:none;">
            <form id="emprestimo-filter-form">
              <div class="emprestimo-filter-grid">
                <div>
                  <label for="filter-search">Livro ou Usuário:</label>
                  <input type="text" id="filter-search" name="search" placeholder="Digite para buscar" />
                </div>
                <div>
                  <label for="filter-status">Status:</label>
                  <select id="filter-status" name="status">
                    <option value="">Todos</option>
                    <option value="aberto">Aberto</option>
                    <option value="devolvido">Devolvido</option>
                  </select>
                </div>
              </div>
              <div style="display:grid;justify-content:flex-end;gap:0.5rem;grid-template-columns:auto auto;">
                <button type="button" id="clear-filters" class="outline">Limpar Filtros</button>
                <button type="submit" class="primary">Filtrar</button>
              </div>
            </form>
          </div>
        </div>

        <div class="table-responsive">
          <table class="emprestimos-table striped">
            <thead>
              <tr>
                <th>Livro</th>
                <th>Unidade</th>
                <th>Usuário</th>
                <th>Empréstimo</th>
                <th>Devolução</th>
                <th>Status</th>
                <th class="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${
                emprestimos.length > 0
                  ? emprestimos
                      .map(
                        (item) => /* html */ `
                <tr>
                  <td>${escapeHtml(item.livro_titulo || "-")}</td>
                  <td>${escapeHtml(item.unidade_nome || "-")}</td>
                  <td>${escapeHtml(item.usuario_nome || "-")}</td>
                  <td>${this._formatDate(item.data_emprestimo)}</td>
                  <td>${this._formatDate(item.data_devolucao || item.data_prevista_devolucao)}</td>
                  <td>
                    <span class="status-badge ${item.status === "devolvido" ? "status-badge--devolvido" : "status-badge--aberto"}">
                      ${item.status === "devolvido" ? "Devolvido" : "Aberto"}
                    </span>
                  </td>
                  <td>
                    <div class="list-actions">
                      <button type="button" class="edit-emprestimo-icon outline border-0" data-id="${item.id}" title="Editar" aria-label="Editar empréstimo de ${escapeHtml(item.livro_titulo || "livro")}"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i></button>
                    </div>
                  </td>
                </tr>
              `
                      )
                      .join("")
                  : '<tr><td colspan="7" style="text-align:center;color:#888;">Nenhum empréstimo cadastrado.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </section>
    `;

    const addBtn = this.querySelector("#add-emprestimo-btn");
    if (addBtn) {
      addBtn.onclick = (e) => {
        e.preventDefault();
        if (this._onAdd) this._onAdd();
      };
    }

    this.querySelectorAll(".edit-emprestimo-icon").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        if (this._onEdit) this._onEdit(parseInt(btn.dataset.id, 10));
      };
    });

    const filterToggle = this.querySelector("#filter-toggle");
    const filterContent = this.querySelector("#filter-content");
    const filterArrow = this.querySelector("#filter-arrow");

    if (filterToggle && filterContent && filterArrow) {
      filterToggle.onclick = () => {
        const isVisible = filterContent.style.display !== "none";
        filterContent.style.display = isVisible ? "none" : "block";
        filterToggle.setAttribute("aria-expanded", String(!isVisible));
        filterArrow.textContent = isVisible ? "▶" : "▼";
      };
    }

    const filterForm = this.querySelector("#emprestimo-filter-form");
    if (filterForm) {
      filterForm.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(filterForm);
        const filters = {};
        if (formData.get("search")) filters.search = formData.get("search").trim();
        if (formData.get("status")) filters.status = formData.get("status");
        if (this._onFilter) this._onFilter(filters);
      };
    }

    const clearBtn = this.querySelector("#clear-filters");
    if (clearBtn) {
      clearBtn.onclick = (e) => {
        e.preventDefault();
        if (filterForm) filterForm.reset();
        if (this._onFilter) this._onFilter({});
      };
    }
  }
}

customElements.define("emprestimo-list", EmprestimoList);
