import test from "node:test";
import assert from "node:assert/strict";

import { BaseService } from "../src/domains/base-service.js";
import { AuthController } from "../src/domains/auth/auth-controller.js";

function installStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  globalThis.localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
  return store;
}

function jsonResponse(status, payload) {
  return {
    status,
    ok: status >= 200 && status < 300,
    statusText: status === 401 ? "Unauthorized" : "OK",
    headers: {
      get(name) {
        return String(name).toLowerCase() === "content-type"
          ? "application/json"
          : null;
      },
    },
    async text() {
      return JSON.stringify(payload);
    },
    async json() {
      return payload;
    },
  };
}

test("login request never sends a stale Authorization token", async () => {
  installStorage({
    authToken: "token-antigo-invalido",
    isAuthenticated: "true",
  });

  let capturedHeaders = null;
  globalThis.fetch = async (_url, options) => {
    capturedHeaders = options.headers;
    return jsonResponse(401, { detail: "Credenciais inválidas." });
  };

  const api = new BaseService("https://example.test");

  await assert.rejects(
    () =>
      api.post("gestor/auth/login/", {
        username: "Claudio",
        password: "senha",
      }),
    /Credenciais inválidas/
  );

  assert.equal(capturedHeaders.Authorization, undefined);
});

test("authenticated API requests still send the current token", async () => {
  installStorage({
    authToken: "token-valido",
    isAuthenticated: "true",
  });

  let capturedHeaders = null;
  globalThis.fetch = async (_url, options) => {
    capturedHeaders = options.headers;
    return jsonResponse(200, { ok: true });
  };

  const api = new BaseService("https://example.test");
  const response = await api.get("gestor/livros/");

  assert.equal(response.ok, true);
  assert.equal(capturedHeaders.Authorization, "Token token-valido");
});

test("a fresh login replaces a stale local session with the new token", async () => {
  const store = installStorage({
    authToken: "token-antigo",
    isAuthenticated: "true",
    user: JSON.stringify({ username: "antigo" }),
  });

  let capturedHeaders = null;
  globalThis.fetch = async (_url, options) => {
    capturedHeaders = options.headers;
    return jsonResponse(200, {
      token: "token-novo",
      user: { username: "Claudio", role: "admin" },
    });
  };

  const auth = new AuthController();
  await auth.login("Claudio", "senha-nova");

  assert.equal(capturedHeaders.Authorization, undefined);
  assert.equal(store.get("authToken"), "token-novo");
  assert.equal(store.get("isAuthenticated"), "true");
  assert.equal(JSON.parse(store.get("user")).username, "Claudio");
});
