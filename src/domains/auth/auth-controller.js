import { BaseService } from "../base-service.js";

export class AuthController {
  constructor() {
    this.api = new BaseService();
    this.isAuthenticated = false;
    this.token = null;
    this.user = null;
  }

  async login(username, password) {
    const normalizedUsername = String(username || "").trim();
    const normalizedPassword = String(password || "");

    if (!normalizedUsername || !normalizedPassword) {
      throw new Error("Informe usuário e senha.");
    }

    const response = await this.api.post("gestor/auth/login/", {
      username: normalizedUsername,
      password: normalizedPassword,
    });

    if (!response?.token) {
      throw new Error("A API não retornou um token de autenticação.");
    }

    this.token = response.token;
    this.user = response.user || { username: normalizedUsername };
    this.isAuthenticated = true;

    localStorage.setItem("authToken", this.token);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(this.user));

    return true;
  }

  async changePassword(currentPassword, newPassword) {
    const response = await this.api.post("gestor/auth/change-password/", {
      current_password: String(currentPassword || ""),
      new_password: String(newPassword || ""),
    });

    if (response?.token) {
      this.token = response.token;
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("isAuthenticated", "true");
    }

    return response;
  }

  logout() {
    const token = this.getToken();

    if (token) {
      this.api
        .post("gestor/auth/logout/", {})
        .catch((error) => console.warn("Falha ao invalidar token no servidor:", error));
    }

    this.clearLocalSession();
  }

  clearLocalSession() {
    this.isAuthenticated = false;
    this.token = null;
    this.user = null;

    localStorage.removeItem("authToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
  }

  checkAuth() {
    const token = localStorage.getItem("authToken");
    const storedAuth = localStorage.getItem("isAuthenticated") === "true";

    if (!storedAuth || !token) {
      this.isAuthenticated = false;
      return false;
    }

    this.token = token;
    this.isAuthenticated = true;

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch {
        this.user = null;
      }
    }

    return true;
  }

  getToken() {
    return this.token || localStorage.getItem("authToken");
  }

  getUser() {
    if (this.user) return this.user;

    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      this.user = JSON.parse(userStr);
      return this.user;
    } catch {
      return null;
    }
  }
}
