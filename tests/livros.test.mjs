import test from "node:test";
import assert from "node:assert/strict";

import { sortLivrosByTitle } from "../src/utils/livros.js";

test("ordena livros alfabeticamente pelo título em pt-BR", () => {
  const livros = [
    { id: 1, titulo: "Zoologia" },
    { id: 2, titulo: "Árvore" },
    { id: 3, titulo: "abelhas" },
    { id: 4, titulo: "Bibliotecas" },
  ];

  const ordenados = sortLivrosByTitle(livros);

  assert.deepEqual(
    ordenados.map((livro) => livro.titulo),
    ["abelhas", "Árvore", "Bibliotecas", "Zoologia"]
  );
});

test("não altera o array original", () => {
  const livros = [
    { id: 1, titulo: "Zoologia" },
    { id: 2, titulo: "Abelhas" },
  ];

  sortLivrosByTitle(livros);

  assert.deepEqual(
    livros.map((livro) => livro.titulo),
    ["Zoologia", "Abelhas"]
  );
});
