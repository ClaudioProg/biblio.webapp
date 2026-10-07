import "./dashboard-page.css";
import { escapeHtml } from "../../utils/html.js";

class DashboardPage extends HTMLElement {
  set data(value) {
    this._data = value && typeof value === "object" ? value : {};
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  _number(value) {
    return Number(value || 0).toLocaleString("pt-BR");
  }

  render() {
    const data = this._data || {};
    const resumo = data.resumo || {};
    const porGenero = Array.isArray(data.acervo_por_genero) ? data.acervo_por_genero : [];
    const porTipo = Array.isArray(data.acervo_por_tipo) ? data.acervo_por_tipo : [];
    const porUnidade = Array.isArray(data.por_unidade) ? data.por_unidade : [];

    const powerBiUrl =
      typeof import.meta !== "undefined" &&
      import.meta?.env?.VITE_POWERBI_EMBED_URL
        ? String(import.meta.env.VITE_POWERBI_EMBED_URL).trim()
        : "";

    this.innerHTML = `
      <section class="dashboard-page">
        <div class="dashboard-heading">
          <div>
            <p class="dashboard-eyebrow">Projeto Integrador IV</p>
            <h2>Dashboard analítico</h2>
            <p>
              Indicadores agregados do acervo e da circulação registrados no
              Bibliotecas Conectadas. Esta camada não utiliza dados pessoais
              dos leitores.
            </p>
          </div>
        </div>

        <div class="dashboard-cards" aria-label="Indicadores principais">
          ${this._card("Títulos", resumo.titulos)}
          ${this._card("Exemplares", resumo.exemplares)}
          ${this._card("Unidades", resumo.unidades)}
          ${this._card("Usuários ativos", resumo.usuarios_ativos)}
          ${this._card("Empréstimos abertos", resumo.emprestimos_abertos)}
          ${this._card("Empréstimos devolvidos", resumo.emprestimos_devolvidos)}
        </div>

        <div class="dashboard-grid">
          <article class="dashboard-panel">
            <h3>Acervo por gênero</h3>
            ${this._simpleTable(
              ["Gênero", "Títulos", "Exemplares"],
              porGenero.map((row) => [
                escapeHtml(row.genero || "Não informado"),
                this._number(row.titulos),
                this._number(row.exemplares),
              ])
            )}
          </article>

          <article class="dashboard-panel">
            <h3>Acervo por tipo de obra</h3>
            ${this._simpleTable(
              ["Tipo", "Títulos", "Exemplares"],
              porTipo.map((row) => [
                escapeHtml(row.tipo_obra || "Não informado"),
                this._number(row.titulos),
                this._number(row.exemplares),
              ])
            )}
          </article>
        </div>

        <article class="dashboard-panel">
          <h3>Acervo e circulação por unidade</h3>
          ${this._simpleTable(
            ["Unidade", "Títulos", "Exemplares", "Empréstimos", "Abertos", "Devolvidos"],
            porUnidade.map((row) => [
              escapeHtml(row.unidade || "Não informada"),
              this._number(row.titulos),
              this._number(row.exemplares),
              this._number(row.emprestimos_total),
              this._number(row.emprestimos_abertos),
              this._number(row.emprestimos_devolvidos),
            ])
          )}
        </article>

        <article class="dashboard-panel dashboard-powerbi">
          <div>
            <h3>Power BI</h3>
            <p>
              O painel do Power BI será integrado aqui após a definição das
              bases do IBGE, dos indicadores e da forma de compartilhamento.
              Os dados acima já constituem a camada agregada da plataforma
              para essa integração.
            </p>
          </div>
          ${
            powerBiUrl
              ? `<iframe
                  title="Painel Power BI — Bibliotecas Conectadas"
                  src="${escapeHtml(powerBiUrl)}"
                  loading="lazy"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen>
                </iframe>`
              : `<div class="dashboard-powerbi-placeholder">
                  Painel Power BI ainda não publicado.
                </div>`
          }
        </article>

        <p class="dashboard-note">
          ${escapeHtml(
            data.meta?.observacao ||
              "Os indicadores descrevem os registros existentes na plataforma e não equivalem automaticamente à demanda da população."
          )}
        </p>
      </section>
    `;
  }

  _card(label, value) {
    return `
      <article class="dashboard-card">
        <span>${escapeHtml(label)}</span>
        <strong>${this._number(value)}</strong>
      </article>
    `;
  }

  _simpleTable(headers, rows) {
    return `
      <div class="table-responsive">
        <table class="striped dashboard-table">
          <thead>
            <tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${
              rows.length
                ? rows
                    .map(
                      (row) =>
                        `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
                    )
                    .join("")
                : `<tr><td colspan="${headers.length}" class="dashboard-empty">Sem dados disponíveis.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    `;
  }
}

customElements.define("dashboard-page", DashboardPage);
