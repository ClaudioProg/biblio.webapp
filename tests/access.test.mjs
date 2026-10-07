import test from "node:test";
import assert from "node:assert/strict";

import {
  accessDisplayName,
  accessRoleLabel,
  isAdminUser,
} from "../src/utils/access.js";

test("recognizes administrator role", () => {
  assert.equal(isAdminUser({ role: "admin" }), true);
  assert.equal(isAdminUser({ role: "staff" }), false);
  assert.equal(isAdminUser(null), false);
});

test("builds a readable access account name", () => {
  assert.equal(
    accessDisplayName({ first_name: "Maria", last_name: "Silva", username: "maria" }),
    "Maria Silva"
  );
  assert.equal(accessDisplayName({ username: "maria" }), "maria");
});

test("labels access roles in Portuguese", () => {
  assert.equal(accessRoleLabel("admin"), "Administrador");
  assert.equal(accessRoleLabel("staff"), "Operador");
});
