import "./isbn-scanner.css";
import { extractIsbnFromBarcode } from "../../utils/isbn.js";

const SCAN_INTERVAL_MS = 220;

class IsbnScanner extends HTMLElement {
  constructor() {
    super();
    this._stream = null;
    this._detector = null;
    this._timer = null;
    this._scanning = false;
  }

  connectedCallback() {
    this.render();
    this._bindEvents();
  }

  disconnectedCallback() {
    this.close();
  }

  render() {
    this.innerHTML = `
      <div class="isbn-scanner-backdrop" hidden>
        <section
          class="isbn-scanner-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="isbn-scanner-title"
        >
          <div class="isbn-scanner-header">
            <div>
              <h3 id="isbn-scanner-title">Ler ISBN pela câmera</h3>
              <p>Aponte a câmera traseira para o código de barras do livro.</p>
            </div>
            <button
              type="button"
              class="isbn-scanner-close outline border-0"
              aria-label="Fechar scanner"
              title="Fechar"
            >
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </div>

          <div class="isbn-scanner-video-wrap">
            <video class="isbn-scanner-video" playsinline muted></video>
            <div class="isbn-scanner-frame" aria-hidden="true"></div>
          </div>

          <p class="isbn-scanner-status" aria-live="polite">
            Preparando câmera...
          </p>

          <div class="isbn-scanner-actions">
            <button type="button" class="isbn-scanner-cancel outline">
              Cancelar
            </button>
          </div>
        </section>
      </div>
    `;
  }

  _bindEvents() {
    this.querySelector(".isbn-scanner-close")?.addEventListener("click", () =>
      this.close()
    );
    this.querySelector(".isbn-scanner-cancel")?.addEventListener("click", () =>
      this.close()
    );
    this.querySelector(".isbn-scanner-backdrop")?.addEventListener(
      "click",
      (event) => {
        if (event.target === event.currentTarget) this.close();
      }
    );
  }

  async open() {
    this.close();

    const backdrop = this.querySelector(".isbn-scanner-backdrop");
    const status = this.querySelector(".isbn-scanner-status");
    const video = this.querySelector(".isbn-scanner-video");

    if (!backdrop || !status || !video) return;

    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
    status.textContent = "Preparando câmera...";

    if (!window.isSecureContext) {
      this._fail(
        "A leitura por câmera exige conexão segura (HTTPS). Use o ISBN digitado ou um scanner físico."
      );
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      this._fail(
        "Este navegador não disponibiliza acesso à câmera. Use o ISBN digitado ou um scanner físico."
      );
      return;
    }

    if (!("BarcodeDetector" in window)) {
      this._fail(
        "Este navegador não oferece leitura de código de barras pela câmera. Use Chrome/Edge atualizado no celular, digite o ISBN ou use um scanner físico."
      );
      return;
    }

    try {
      let formats = ["ean_13"];
      if (typeof window.BarcodeDetector.getSupportedFormats === "function") {
        const supported = await window.BarcodeDetector.getSupportedFormats();
        const wanted = ["ean_13", "code_128"];
        formats = wanted.filter((format) => supported.includes(format));
        if (!formats.length) formats = undefined;
      }

      this._detector = formats
        ? new window.BarcodeDetector({ formats })
        : new window.BarcodeDetector();

      this._stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      video.srcObject = this._stream;
      await video.play();

      this._scanning = true;
      status.textContent =
        "Câmera ativa. Centralize o código de barras ISBN dentro da moldura.";
      this._scheduleScan();
    } catch (error) {
      const message =
        error?.name === "NotAllowedError"
          ? "Permissão de câmera negada. Autorize a câmera nas configurações do navegador ou use o ISBN digitado."
          : "Não foi possível iniciar a câmera. Tente novamente ou use o ISBN digitado.";
      this._fail(message);
    }
  }

  close() {
    this._scanning = false;

    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }

    if (this._stream) {
      this._stream.getTracks().forEach((track) => track.stop());
      this._stream = null;
    }

    const video = this.querySelector(".isbn-scanner-video");
    if (video) {
      video.pause?.();
      video.srcObject = null;
    }

    const backdrop = this.querySelector(".isbn-scanner-backdrop");
    if (backdrop) backdrop.hidden = true;

    document.body.style.overflow = "";
  }

  _fail(message) {
    this._scanning = false;
    const status = this.querySelector(".isbn-scanner-status");
    if (status) status.textContent = message;

    this.dispatchEvent(
      new CustomEvent("isbn-scan-error", {
        bubbles: true,
        detail: { message },
      })
    );
  }

  _scheduleScan() {
    if (!this._scanning) return;
    this._timer = setTimeout(() => this._scanFrame(), SCAN_INTERVAL_MS);
  }

  async _scanFrame() {
    if (!this._scanning || !this._detector) return;

    const video = this.querySelector(".isbn-scanner-video");
    if (!video || video.readyState < 2) {
      this._scheduleScan();
      return;
    }

    try {
      const barcodes = await this._detector.detect(video);
      for (const barcode of barcodes) {
        const isbn = extractIsbnFromBarcode(barcode.rawValue);
        if (!isbn) continue;

        navigator.vibrate?.(80);
        this.dispatchEvent(
          new CustomEvent("isbn-scan", {
            bubbles: true,
            detail: {
              isbn,
              rawValue: barcode.rawValue,
              format: barcode.format || "",
            },
          })
        );
        this.close();
        return;
      }
    } catch {
      // Falhas transitórias de detecção não interrompem o scanner.
    }

    this._scheduleScan();
  }
}

customElements.define("isbn-scanner", IsbnScanner);
