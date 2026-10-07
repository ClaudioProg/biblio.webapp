export function isMissingValue(value) {
  return value === null || value === undefined || value === "";
}

export function formatNullableNumber(
  value,
  options = {},
  locale = "pt-BR"
) {
  if (isMissingValue(value)) return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return number.toLocaleString(locale, options);
}

export function formatNullableCurrency(value, locale = "pt-BR") {
  if (isMissingValue(value)) return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return number.toLocaleString(locale, {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function filterTerritoryRows(rows, neighborhoodCode = "") {
  const safeRows = Array.isArray(rows) ? rows : [];
  const code = String(neighborhoodCode || "").trim();
  if (!code) return safeRows;
  return safeRows.filter((row) => String(row?.cd_bairro || "") === code);
}
