export function sortLivrosByTitle(livros) {
  if (!Array.isArray(livros)) return [];

  return [...livros].sort((a, b) =>
    String(a?.titulo || "").localeCompare(
      String(b?.titulo || ""),
      "pt-BR",
      { sensitivity: "base" }
    )
  );
}
