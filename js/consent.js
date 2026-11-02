/* =========================================================
   Caniggia Football Agency – Cookies y datos personales
   Se usa en todas las páginas (index, privacy, terms).

   1) Banner de cookies: Google Analytics y el píxel de Meta
      se cargan SOLO si la persona los acepta.
   2) "Cookie settings": vuelve a abrir el panel para cambiar la elección.
   3) "Delete my data": borra de este navegador la elección de cookies y las
      cookies de Analytics / Meta, y permite pedir el borrado de los mensajes
      enviados por el formulario.

   ▸ PARA ACTIVAR ANALYTICS Y EL PÍXEL: completar los dos IDs de abajo.
     Mientras estén vacíos, no se carga nada aunque la persona acepte.
   ========================================================= */

const CFA_CONFIG = {
  GA_MEASUREMENT_ID: "",   // ej.: "G-XXXXXXXXXX"  (Google Analytics 4)
  META_PIXEL_ID: "",       // ej.: "123456789012345" (Meta / Facebook)
  CONTACT_EMAIL: "caniggiaagency@gmail.com",
  CONSENT_VERSION: 1,      // subir este número si cambian las cookies: se vuelve a pedir el consentimiento
};

(() => {
  const STORAGE_KEY = "cfa-cookie-consent";

  /* ---------- Guardar / leer la elección ---------- */
  const readConsent = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved && saved.version === CFA_CONFIG.CONSENT_VERSION ? saved : null;
    } catch {
      return null;
    }
  };

  const saveConsent = (analytics, marketing) => {
    const consent = { analytics, marketing, date: new Date().toISOString(), version: CFA_CONFIG.CONSENT_VERSION };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(consent)); } catch { /* modo privado: se pregunta de nuevo la próxima vez */ }
    return consent;
  };

  /* ---------- Borrar cookies de Analytics y Meta ---------- */
  const deleteTrackingCookies = () => {
    const names = document.cookie.split(";").map((c) => c.split("=")[0].trim());
    const host = location.hostname;
    const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
    names
      .filter((name) => /^(_ga|_gid|_gat|_gcl|_fbp|_fbc)/.test(name))
      .forEach((name) => {
        domains.forEach((domain) => {
          document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
        });
      });
  };

  /* ---------- Cargar los scripts (solo con consentimiento) ---------- */
  const loadScript = (src) => {
    const s = document.createElement("script");
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  };

  const loadGoogleAnalytics = () => {
    const id = CFA_CONFIG.GA_MEASUREMENT_ID;
    if (!id || window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
  };

  const loadMetaPixel = () => {
    const id = CFA_CONFIG.META_PIXEL_ID;
    if (!id || window.fbq) return;
    const fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
    loadScript("https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", id);
    fbq("track", "PageView");
  };

  const applyConsent = (consent) => {
    if (!consent) return;
    if (consent.analytics) loadGoogleAnalytics();
    if (consent.marketing) loadMetaPixel();
  };

  /* ---------- Banner ---------- */
  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie preferences");
  banner.hidden = true;
  banner.innerHTML = `
    <div class="cookie-banner__inner">
      <p class="cookie-banner__text">
        We use essential storage to remember your choice and, only if you accept,
        Google Analytics (to understand how the site is used) and the Meta Pixel
        (to measure our campaigns). You can change your choice at any time in
        “Cookie settings”. <a href="privacy.html#cookies">Learn more</a>.
      </p>
      <div class="cookie-banner__prefs" hidden>
        <label class="cookie-option">
          <input type="checkbox" checked disabled>
          <span><strong>Essential</strong> – remembers your cookie choice. Always on.</span>
        </label>
        <label class="cookie-option">
          <input type="checkbox" data-consent="analytics">
          <span><strong>Analytics</strong> – Google Analytics, anonymous usage statistics.</span>
        </label>
        <label class="cookie-option">
          <input type="checkbox" data-consent="marketing">
          <span><strong>Marketing</strong> – Meta Pixel, measurement of ads on Facebook / Instagram.</span>
        </label>
      </div>
      <div class="cookie-banner__actions">
        <button type="button" class="cookie-btn" data-action="settings">Settings</button>
        <button type="button" class="cookie-btn" data-action="reject">Reject all</button>
        <button type="button" class="cookie-btn cookie-btn--primary" data-action="accept">Accept all</button>
        <button type="button" class="cookie-btn cookie-btn--primary" data-action="save" hidden>Save choice</button>
      </div>
    </div>`;
  document.body.appendChild(banner);

  const prefs = banner.querySelector(".cookie-banner__prefs");
  const checkAnalytics = banner.querySelector('[data-consent="analytics"]');
  const checkMarketing = banner.querySelector('[data-consent="marketing"]');
  const btn = (action) => banner.querySelector(`[data-action="${action}"]`);

  const showBanner = (withSettings = false) => {
    const current = readConsent();
    checkAnalytics.checked = !!(current && current.analytics);
    checkMarketing.checked = !!(current && current.marketing);
    prefs.hidden = !withSettings;
    btn("settings").hidden = withSettings;
    btn("save").hidden = !withSettings;
    banner.hidden = false;
  };

  const choose = (analytics, marketing) => {
    const previous = readConsent();
    const consent = saveConsent(analytics, marketing);
    banner.hidden = true;
    // si se retira un permiso que estaba dado, se borran sus cookies y se recarga
    // para que el script deje de funcionar
    const withdrawn = previous && ((previous.analytics && !analytics) || (previous.marketing && !marketing));
    if (withdrawn) {
      deleteTrackingCookies();
      location.reload();
      return;
    }
    applyConsent(consent);
  };

  btn("accept").addEventListener("click", () => choose(true, true));
  btn("reject").addEventListener("click", () => choose(false, false));
  btn("settings").addEventListener("click", () => showBanner(true));
  btn("save").addEventListener("click", () => choose(checkAnalytics.checked, checkMarketing.checked));

  // links "Cookie settings" (footer y páginas legales)
  document.querySelectorAll("[data-cookie-settings]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      showBanner(true);
    })
  );

  /* ---------- Borrar mis datos (página de privacidad) ---------- */
  const deleteLocal = document.querySelector("[data-delete-local]");
  const deleteStatus = document.getElementById("deleteLocalStatus");
  if (deleteLocal) {
    deleteLocal.addEventListener("click", () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* nada guardado */ }
      deleteTrackingCookies();
      if (deleteStatus) {
        deleteStatus.textContent = "Done. Your cookie choice and any analytics or marketing cookies from this site were deleted from this browser.";
      }
      setTimeout(() => location.reload(), 2500);
    });
  }

  // pedido de borrado de los mensajes enviados por el formulario
  const deleteForm = document.getElementById("deleteRequestForm");
  if (deleteForm) {
    const status = document.getElementById("deleteRequestStatus");
    deleteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(deleteForm);
      const email = String(data.get("email") || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = "Please enter the email address you used to contact us.";
        status.className = "form__status is-error";
        return;
      }
      if (data.get("_honey")) return;
      const button = deleteForm.querySelector('button[type="submit"]');
      button.disabled = true;
      status.textContent = "Sending…";
      status.className = "form__status";
      try {
        const response = await fetch(`https://formsubmit.co/ajax/${CFA_CONFIG.CONTACT_EMAIL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            _subject: "Data deletion request (website)",
            _replyto: email,
            _template: "table",
            Request: "Delete all personal data held about me",
            Email: email,
            Details: data.get("details") || "-",
            Date: new Date().toISOString(),
          }),
        });
        if (!response.ok) throw new Error(response.status);
        status.textContent = "Request received. We will delete your data and confirm by email within 5 working days.";
        status.className = "form__status is-ok";
        deleteForm.reset();
      } catch {
        status.innerHTML = `The request could not be sent. Please email <a href="mailto:${CFA_CONFIG.CONTACT_EMAIL}?subject=Data%20deletion%20request">${CFA_CONFIG.CONTACT_EMAIL}</a>.`;
        status.className = "form__status is-error";
      } finally {
        button.disabled = false;
      }
    });
  }

  /* ---------- Inicio ---------- */
  const consent = readConsent();
  if (consent) applyConsent(consent);
  else showBanner(false);
})();
