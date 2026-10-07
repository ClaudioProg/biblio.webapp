import test from "node:test";
import assert from "node:assert/strict";

import {
  filterTerritoryRows,
  formatNullableCurrency,
  formatNullableNumber,
  isMissingValue,
} from "../src/utils/territory.js";

test("territory formatter preserves missing values as dash", () => {
  assert.equal(isMissingValue(null), true);
  assert.equal(isMissingValue(""), true);
  assert.equal(formatNullableNumber(null), "—");
  assert.equal(formatNullableCurrency(""), "—");
});

test("territory formatter keeps zero as a valid number", () => {
  assert.equal(formatNullableNumber(0), "0");
  assert.match(formatNullableCurrency(0), /0,00/);
});

test("territory filter returns all rows when no code is selected", () => {
  const rows = [{ cd_bairro: "1" }, { cd_bairro: "2" }];
  assert.deepEqual(filterTerritoryRows(rows), rows);
});

test("territory filter selects exact neighborhood code", () => {
  const rows = [
    { cd_bairro: "3548500016", bairro: "Paquetá" },
    { cd_bairro: "3548500002", bairro: "Gonzaga" },
  ];
  assert.deepEqual(filterTerritoryRows(rows, "3548500016"), [rows[0]]);
});
