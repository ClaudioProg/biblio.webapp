import "./dashboard-page.css";
import { escapeHtml } from "../../utils/html.js";
import {
  filterTerritoryRows,
  formatNullableCurrency,
  formatNullableNumber,
} from "../../utils/territory.js";

class DashboardPage extends HTMLElement {
  constructor() {
    super();
    this._selectedNeighborhoodCode = "";
  }

  set data(value) {
    this._data = value && typeof value === "object" ? value : {};
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const data = this._data || {};
    const operacional = data.operacional || data;
    const territorio = data.territorio || {};

    const resumo = operacional.resumo || {};
    const porGenero = Array.isArray(operacional.acervo_por_genero)
      ? operacional.acervo_por_genero
      : [];
    const porTipo = Array.isArray(operacional.acervo_por_tipo)
      ? operacional.acervo_por_tipo
      : [];
    const porUnidade = Array.isArray(operacional.por_unidade)
      ? operacional.por_unidade
      : [];

    const bairros = Array.isArray(territorio.bairros)
      ? territorio.bairros
      : [];
    const bairrosVisiveis = filterTerritoryRows(
      bairros,
      this._selectedNeighborhoodCode
    );
    const cobertura = territorio.cobertura || {};
    const validacao = territorio.validacao || {};
    const territorioMeta = territorio.meta || {};

    const powerBiUrl =
      typeof import.meta !== "undefined" &&
      import.meta?.env?.VITE_POWERBI_EMBED_URL
        ? String(import.meta.env.VITE_POWERBI_EMBED_URL).trim()
        : "";

    this.innerHTML = `
      <section class="dashboard-page">
        <header class="dashboard-heading">
          <div>
            <p class="dashboard-eyebrow">Projeto Integrador IV</p>
            <h2>Dashboard analítico</h2>
            <p>
              Indicadores agregados da plataforma e dados públicos do Censo
              Demográfico 2022. Nenhum dado pessoal de leitor é utilizado
              nesta camada analítica.
            </p>
          </div>
        </header>

        <section aria-labelledby="dashboard-operacional-title">
          <div class="dashboard-section-heading">
            <div>
              <p class="dashboard-eyebrow">Bibliotecas Conectadas</p>
              <h3 id="dashboard-operacional-title">Acervo e circulação</h3>
            </div>
          </div>

          <div class="dashboard-cards" aria-label="Indicadores operacionais">
            ${this._card("Títulos", resumo.titulos)}
            ${this._card("Exemplares", resumo.exemplares)}
            ${this._card("Unidades", resumo.unidades)}
            ${this._card("Usuários ativos", resumo.usuarios_ativos)}
            ${this._card("Empréstimos abertos", resumo.emprestimos_abertos)}
            ${this._card("Empréstimos devolvidos", resumo.emprestimos_devolvidos)}
          </div>
        </section>

        <div class="dashboard-grid">
          <article class="dashboard-panel">
            <h3>Acervo por gênero</h3>
            ${this._simpleTable(
              ["Gênero", "Títulos", "Exemplares"],
              porGenero.map((row) => [
                escapeHtml(row.genero || "Não informado"),
                formatNullableNumber(row.titulos),
                formatNullableNumber(row.exemplares),
              ])
            )}
          </article>

          <article class="dashboard-panel">
            <h3>Acervo por tipo de obra</h3>
            ${this._simpleTable(
              ["Tipo", "Títulos", "Exemplares"],
              porTipo.map((row) => [
                escapeHtml(row.tipo_obra || "Não informado"),
                formatNullableNumber(row.titulos),
                formatNullableNumber(row.exemplares),
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
              formatNullableNumber(row.titulos),
              formatNullableNumber(row.exemplares),
              formatNullableNumber(row.emprestimos_total),
              formatNullableNumber(row.emprestimos_abertos),
              formatNullableNumber(row.emprestimos_devolvidos),
            ])
          )}
        </article>

        <section class="dashboard-territory" aria-labelledby="dashboard-territory-title">
          <div class="dashboard-section-heading dashboard-section-heading--split">
            <div>
              <p class="dashboard-eyebrow">IBGE — Censo 2022</p>
              <h3 id="dashboard-territory-title">Território de Santos</h3>
              <p>
                Recorte por bairro com população, faixas etárias,
                alfabetização e rendimento da pessoa responsável pelo domicílio.
              </p>
            </div>

            <label class="dashboard-territory-filter">
              <span>Bairro</span>
              <select id="territory-neighborhood-filter">
                <option value="">Todos os bairros</option>
                ${bairros
                  .map(
                    (row) => `<option value="${escapeHtml(row.cd_bairro)}" ${
                      String(row.cd_bairro) === this._selectedNeighborhoodCode
                        ? "selected"
                        : ""
                    }>${escapeHtml(row.bairro)}</option>`
                  )
                  .join("")}
              </select>
            </label>
          </div>

          <div class="dashboard-territory-cards">
            ${this._card("Bairros no recorte", cobertura.bairros_total)}
            ${this._card("Com renda publicada", cobertura.bairros_com_renda)}
            ${this._card("Sem renda publicada", cobertura.bairros_sem_renda)}
            ${this._card("Com alfabetização", cobertura.bairros_com_taxa_alfabetizacao)}
          </div>

          <article class="dashboard-panel dashboard-territory-table-panel">
            <h3>
              ${this._selectedNeighborhoodCode
                ? "Indicadores do bairro selecionado"
                : "Indicadores por bairro"}
            </h3>
            <div class="dashboard-territory-table-wrap">
              ${this._simpleTable(
                [
                  "Bairro",
                  "População",
                  "0–14",
                  "15–29",
                  "30–59",
                  "60+",
                  "Alfabetização 15+",
                  "Renda mediana do responsável",
                ],
                bairrosVisiveis.map((row) => [
                  escapeHtml(row.bairro || "Não informado"),
                  formatNullableNumber(row.populacao_total),
                  formatNullableNumber(row.idade_0_14),
                  formatNullableNumber(row.idade_15_29),
                  formatNullableNumber(row.idade_30_59),
                  formatNullableNumber(row.idade_60_mais),
                  row.taxa_alfabetizacao_15_mais_pct == null
                    ? "—"
                    : `${formatNullableNumber(
                        row.taxa_alfabetizacao_15_mais_pct,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}%`,
                  formatNullableCurrency(row.renda_responsavel_mediana),
                ])
              )}
            </div>
          </article>

          <div class="dashboard-method-note" role="note">
            <strong>Leitura metodológica.</strong>
            Rendimento refere-se à pessoa responsável pelo domicílio.
            Valores não publicados pelo IBGE permanecem ausentes, e não zero.
            Há ${formatNullableNumber(
              validacao.diferencas_total_basico_demografia
            )} bairro(s) com diferença entre os totais das fontes Básico e
            Demografia e ${formatNullableNumber(
              validacao.diferencas_total_demografia_faixas_etarias
            )} com diferença entre o total demográfico e a soma das faixas
            etárias. Essas diferenças são preservadas e documentadas.
          </div>
        </section>

        <article class="dashboard-panel dashboard-powerbi">
          <div>
            <h3>Power BI</h3>
            <p>
              A base territorial oficial e os indicadores agregados da
              plataforma já estão estruturados. O painel Power BI será
              incorporado neste espaço após a modelagem final, publicação e
              validação com a biblioteca parceira.
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
            territorioMeta.observacao ||
              operacional.meta?.observacao ||
              "Os indicadores descrevem os registros existentes e não equivalem automaticamente à demanda da população."
          )}
        </p>
      </section>
    `;

    this._bindTerritoryFilter();
  }

  _bindTerritoryFilter() {
    const select = this.querySelector("#territory-neighborhood-filter");
    if (!select) return;

    select.addEventListener("change", () => {
      this._selectedNeighborhoodCode = String(select.value || "");
      this.render();
    });
  }

  _card(label, value) {
    return `
      <article class="dashboard-card">
        <span>${escapeHtml(label)}</span>
        <strong>${formatNullableNumber(value)}</strong>
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
