import test from "node:test";
import assert from "node:assert/strict";

import {
  extractIsbnFromBarcode,
  isBookIsbn13,
  isValidIsbn10,
  isValidIsbn13,
  normalizeIsbn,
} from "../src/utils/isbn.js";

test("normalizes ISBN punctuation and spaces", () => {
  assert.equal(normalizeIsbn("978-0-14-032872-1"), "9780140328721");
  assert.equal(normalizeIsbn("0-306-40615-2"), "0306406152");
});

test("validates ISBN-10 checksum", () => {
  assert.equal(isValidIsbn10("0306406152"), true);
  assert.equal(isValidIsbn10("0306406153"), false);
});

test("validates ISBN-13 checksum", () => {
  assert.equal(isValidIsbn13("9780140328721"), true);
  assert.equal(isValidIsbn13("9780140328722"), false);
});

test("recognizes book EAN prefixes", () => {
  assert.equal(isBookIsbn13("9780140328721"), true);
  assert.equal(isBookIsbn13("9791090636071"), true);
  assert.equal(isBookIsbn13("4006381333931"), false);
});

test("extracts ISBN from camera/scanner payload", () => {
  assert.equal(
    extractIsbnFromBarcode("ISBN: 9780140328721 / add-on 90000"),
    "9780140328721"
  );
  assert.equal(extractIsbnFromBarcode("4006381333931"), "");
});
