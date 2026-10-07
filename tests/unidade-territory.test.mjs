import test from "node:test";
import assert from "node:assert/strict";

import { validateUnidadeFormData } from "../src/utils/form-validation.js";

const base = {
  nome: "Biblioteca Teste",
  endereco: "Rua Teste, 1",
  telefone: "",
  email: "",
  site: "",
};

test("accepts a valid optional IBGE neighborhood code", () => {
  const result = validateUnidadeFormData({
    ...base,
    ibge_bairro_codigo: "3548500005",
  });

  assert.equal(result.isValid, true);
  assert.equal(result.cleanData.ibge_bairro_codigo, "3548500005");
});

test("turns an empty IBGE neighborhood into null", () => {
  const result = validateUnidadeFormData({
    ...base,
    ibge_bairro_codigo: "",
  });

  assert.equal(result.isValid, true);
  assert.equal(result.cleanData.ibge_bairro_codigo, null);
});

test("rejects malformed IBGE neighborhood codes", () => {
  const result = validateUnidadeFormData({
    ...base,
    ibge_bairro_codigo: "123",
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.ibge_bairro_codigo, /inválido/i);
});
