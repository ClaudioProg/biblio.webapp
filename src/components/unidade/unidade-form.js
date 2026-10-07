import "./unidade-form.css";
import { attachPhoneMask } from "../../utils/input-mask.js";
import { escapeHtml } from "../../utils/html.js";

// Web Component para o formulário de unidade (biblioteca)
class UnidadeForm extends HTMLElement {
  constructor() {
    super();
    this._bairros = [];
  }

  set bairros(value) {
    this._bairros = Array.isArray(value) ? value : [];
    this._renderBairros();
  }

  get bairros() {
    return Array.isArray(this._bairros) ? this._bairros : [];
  }

  _renderBairros() {
    const select = this.querySelector("#ibge_bairro_codigo");
    if (!select) return;

    const selected = select.value;
    select.innerHTML = `
      <option value="">Não informado</option>
      ${this.bairros
        .map(
          (bairro) =>
            `<option value="${escapeHtml(bairro.cd_bairro)}">${escapeHtml(
              bairro.bairro
            )}</option>`
        )
        .join("")}
    `;

    if (selected) select.value = selected;
  }

  connectedCallback() {
    const isEdit = this.hasAttribute("edit");
    this.innerHTML = `
      <form id="unidade-form">
        <page-header title="${
          isEdit ? "Editar Unidade" : "Adicionar Unidade"
        }" back-button-id="voltar-unidade-btn"></page-header>
        <div>
          <label for="nome">Nome:</label>
          <input type="text" id="nome" name="nome" maxlength="255" required />
        </div>
        <div>
          <label for="endereco">Endereço:</label>
          <input type="text" id="endereco" name="endereco" maxlength="500" required />
        </div>
        <div>
          <label for="ibge_bairro_codigo">Bairro IBGE:</label>
          <select id="ibge_bairro_codigo" name="ibge_bairro_codigo">
            <option value="">Não informado</option>
          </select>
          <small>
            Utilizado para relacionar a biblioteca aos indicadores territoriais
            oficiais do Censo 2022.
          </small>
        </div>
        <div>
          <label for="telefone">Telefone:</label>
          <input type="tel" id="telefone" name="telefone" maxlength="20" />
        </div>
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" maxlength="254" />
        </div>
        <div>
          <label for="site">Site:</label>
          <input type="url" id="site" name="site" maxlength="200" />
        </div>
        <div class="unidade-form-footer">
          <button type="button" id="cancelar-unidade-btn" class="outline">Cancelar</button>
          <button type="submit">Salvar Unidade</button>
        </div>
      </form>
    `;

    this._renderBairros();

    setTimeout(() => {
      const voltarBtn = this.querySelector("#voltar-unidade-btn");
      const cancelarBtn = this.querySelector("#cancelar-unidade-btn");
      const telefoneInput = this.querySelector("#telefone");
      attachPhoneMask(telefoneInput);

      if (voltarBtn) {
        voltarBtn.onclick = (e) => {
          e.preventDefault();
          window.navigate && window.navigate("/unidades");
        };
      }

      if (cancelarBtn) {
        cancelarBtn.onclick = (e) => {
          e.preventDefault();
          window.navigate && window.navigate("/unidades");
        };
      }
    }, 0);
  }
}

customElements.define("unidade-form", UnidadeForm);
