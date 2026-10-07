export function normalizeIsbn(value) {
  return String(value || "")
    .replace(/[^0-9Xx]/g, "")
    .toUpperCase();
}

export function isValidIsbn10(value) {
  const isbn = normalizeIsbn(value);
  if (!/^\d{9}[\dX]$/.test(isbn)) return false;

  const sum = isbn.split("").reduce((acc, char, index) => {
    const digit = char === "X" ? 10 : Number(char);
    return acc + digit * (10 - index);
  }, 0);

  return sum % 11 === 0;
}

export function isValidIsbn13(value) {
  const isbn = normalizeIsbn(value);
  if (!/^\d{13}$/.test(isbn)) return false;

  const sum = isbn
    .slice(0, 12)
    .split("")
    .reduce(
      (acc, char, index) =>
        acc + Number(char) * (index % 2 === 0 ? 1 : 3),
      0
    );

  const expected = (10 - (sum % 10)) % 10;
  return expected === Number(isbn[12]);
}

export function isBookIsbn13(value) {
  const isbn = normalizeIsbn(value);
  return /^(978|979)\d{10}$/.test(isbn) && isValidIsbn13(isbn);
}

export function extractIsbnFromBarcode(value) {
  const raw = String(value || "");
  const direct13 = raw.match(/(?:978|979)\d{10}/)?.[0];
  if (direct13 && isBookIsbn13(direct13)) return direct13;

  const normalized = normalizeIsbn(raw);
  if (isBookIsbn13(normalized)) return normalized;
  if (isValidIsbn10(normalized)) return normalized;

  return "";
}
