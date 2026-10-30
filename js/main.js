/* =========================================================
   Caniggia Football Agency – Interacciones
   ========================================================= */

document.documentElement.classList.remove("no-js");

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Hero editable: contenido desde hero.json ----------
     Título, botones e imagen se leen de hero.json. Si el archivo no carga
     (por ejemplo, abriendo index.html con doble clic), queda el contenido
     de respaldo que está escrito en el HTML. */
  const heroTitle = document.getElementById("heroTitle");
  const heroActions = document.getElementById("heroActions");
  const heroMedia = document.getElementById("heroMedia");

  if (heroTitle && heroActions && heroMedia) {
    fetch("hero.json", { cache: "no-cache" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((hero) => {
        if (Array.isArray(hero.titulo) && hero.titulo.length) {
          heroTitle.replaceChildren(
            ...hero.titulo.map((linea, i) => {
              const el = document.createElement(linea.negrita ? "strong" : "span");
              el.textContent = linea.texto || "";
              if (linea.grande) el.classList.add("hero__big");
              el.style.animationDelay = `${i * 0.1}s`;
              return el;
            })
          );
        }

        if (Array.isArray(hero.botones) && hero.botones.length) {
          heroActions.replaceChildren(
            ...hero.botones.map((boton, i) => {
              const a = document.createElement("a");
              a.textContent = boton.texto || "";
              a.href = boton.link || "#";
              a.className = `btn ${boton.estilo === "borde" ? "btn--ghost" : "btn--primary"}`;
              a.style.animationDelay = `${0.4 + i * 0.1}s`;
              if (/^https?:\/\//.test(a.getAttribute("href"))) {
                a.target = "_blank";
                a.rel = "noopener";
              }
              return a;
            })
          );
        }

        // dirección completa: así el navegador no la interpreta relativa a la carpeta css/
        const cssUrl = (ruta) => `url("${new URL(ruta, document.baseURI).href}")`;
        if (hero.imagen) heroMedia.style.setProperty("--hero-img", cssUrl(hero.imagen));
        if (hero.imagenCelular) heroMedia.style.setProperty("--hero-img-mobile", cssUrl(hero.imagenCelular));
      })
      .catch(() => { /* sin hero.json: se queda el contenido de respaldo del HTML */ });
  }

  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.querySelectorAll(".nav__link");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sombra del header al hacer scroll ---------- */
  const onScrollHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Menú móvil ---------- */
  const closeMenu = () => {
    nav.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-open");
  };

  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Link activo del menú ---------- */
  const linkedSections = ["services", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
        if (link) link.classList.toggle("is-active", entry.isIntersecting);
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  linkedSections.forEach((s) => sectionObserver.observe(s));

  /* ---------- Aparición de elementos al hacer scroll ---------- */
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Caniggia: scroll horizontal (solo en el Home) ----------
     En escritorio la sección queda fija y, al bajar con el scroll,
     el contenido se desplaza hacia la izquierda mostrando la línea
     de tiempo. En pantallas chicas se ve en vertical. */
  const journey = document.getElementById("caniggia");
  const track = document.getElementById("journeyTrack");
  if (journey && track) {
    // Igual que en styles.css: horizontal solo en pantallas anchas Y con suficiente alto
    const desktop = window.matchMedia("(min-width: 901px) and (min-height: 620px)");
    let distance = 0;

    const setupJourney = () => {
      const horizontal = desktop.matches; // el movimiento lo controla el scroll del usuario
      journey.classList.toggle("is-horizontal", horizontal);

      if (!horizontal) {
        journey.style.height = "";
        track.style.transform = "";
        return;
      }

      const viewH = window.innerHeight - header.offsetHeight;
      distance = Math.max(track.scrollWidth - window.innerWidth, 0);
      journey.style.height = `${viewH + distance}px`;
      updateJourney();
    };

    const updateJourney = () => {
      if (!journey.classList.contains("is-horizontal")) return;
      const start = journey.offsetTop - header.offsetHeight;
      const progress = Math.min(Math.max((window.scrollY - start) / (distance || 1), 0), 1);
      track.style.transform = `translate3d(${-progress * distance}px, 0, 0)`;
    };

    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateJourney();
        ticking = false;
      });
    }, { passive: true });

    window.addEventListener("resize", setupJourney);
    window.addEventListener("load", setupJourney);
    if (document.fonts) document.fonts.ready.then(setupJourney);
    setupJourney();

    /* ---------- Caniggia: 3 fotos que se alternan ---------- */
    const photos = document.querySelectorAll(".founder__photo");
    if (photos.length > 1 && !reducedMotion) {
      let current = 0;
      setInterval(() => {
        photos[current].classList.remove("is-active");
        current = (current + 1) % photos.length;
        photos[current].classList.add("is-active");
      }, 4000);
    }

    /* ---------- Caniggia: video de fondo ----------
       Se reproduce solo mientras la sección está en pantalla. */
    const video = document.getElementById("journeyVideo");
    if (video) {
      if (reducedMotion) {
        video.removeAttribute("autoplay");
        video.pause();
      } else {
        const videoObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        });
        videoObserver.observe(journey);
      }
    }
  } // fin sección Caniggia

  /* ---------- Services: rueda ----------
     La rueda gira cambiando --active (0 a 3). Se mueve con:
       · flecha ↓ (o tecla ↓): número siguiente (01 → 02 → 03 → 04),
       · flecha ↑ (o tecla ↑): número anterior (04 → 03 → 02 → 01),
       · clic en un número,
       · arrastrando la rueda (mouse o dedo); al soltar se acomoda en el más cercano. */
  const wheel = document.getElementById("svcWheel");
  if (wheel) {
    const tabs = [...wheel.querySelectorAll(".svc-wheel__num")];
    const panels = [...wheel.querySelectorAll(".svc-wheel__panel")];
    const ring = wheel.querySelector(".svc-wheel__ring");
    const dragZone = wheel.querySelector(".svc-wheel__drag");
    const last = tabs.length - 1;
    let current = 0;

    // marca el número activo y su texto ("position" puede tener decimales mientras se arrastra)
    const highlight = (position) => {
      const index = Math.min(Math.max(Math.round(position), 0), last);
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.classList.toggle("is-active", active);
        tab.classList.toggle("is-far", Math.abs(i - position) >= 1.6);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel, i) => panel.classList.toggle("is-active", i === index));
    };

    // después del 04 vuelve al 01 (y antes del 01, al 04)
    const selectService = (index, focus = false) => {
      current = (index + tabs.length) % tabs.length;
      wheel.style.setProperty("--active", current);
      highlight(current);
      if (focus) tabs[current].focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", (e) => {
        if (wheel.dataset.justDragged) { e.preventDefault(); return; } // fue un arrastre, no un clic
        selectService(i);
      });
      tab.addEventListener("keydown", (e) => {
        const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!step) return;
        e.preventDefault();
        selectService(i + step, true);
      });
    });

    // Flechas: ↓ siguiente, ↑ anterior
    wheel.querySelectorAll(".svc-wheel__arrow").forEach((arrow) => {
      arrow.addEventListener("click", () => selectService(current + Number(arrow.dataset.dir)));
    });

    // Arrastrar: el desplazamiento vertical se convierte en giro a lo largo del arco
    let drag = null;

    const onDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      const radius = ring.offsetWidth / 2;
      const step = parseFloat(getComputedStyle(wheel).getPropertyValue("--step")) || 20;
      drag = { startY: e.clientY, start: current, pxPerItem: radius * (step * Math.PI / 180), moved: false, id: e.pointerId };
    };

    const onMove = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dy = e.clientY - drag.startY;
      if (!drag.moved && Math.abs(dy) < 6) return; // umbral: por debajo es un clic
      if (!drag.moved) {
        drag.moved = true;
        wheel.classList.add("is-dragging");
        wheel.setPointerCapture?.(e.pointerId);
      }
      // arrastrar hacia arriba avanza; con resistencia en los extremos
      let position = drag.start - dy / drag.pxPerItem;
      if (position < 0) position *= 0.35;
      if (position > last) position = last + (position - last) * 0.35;
      wheel.style.setProperty("--active", position.toFixed(3));
      highlight(position);
      e.preventDefault();
    };

    const onUp = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.moved) {
        const position = parseFloat(wheel.style.getPropertyValue("--active")) || 0;
        wheel.classList.remove("is-dragging");
        selectService(Math.min(Math.max(Math.round(position), 0), last));
        // evita que el "click" que llega al soltar cambie la selección
        wheel.dataset.justDragged = "1";
        setTimeout(() => delete wheel.dataset.justDragged, 0);
      }
      drag = null;
    };

    [dragZone, ...tabs].forEach((el) => el && el.addEventListener("pointerdown", onDown));
    wheel.addEventListener("pointermove", onMove);
    wheel.addEventListener("pointerup", onUp);
    wheel.addEventListener("pointercancel", onUp);

    selectService(0);
  }

  /* ---------- Formulario de contacto ----------
     Sin servidor: valida los campos y abre el cliente de correo
     con el mensaje armado. Para enviar desde la web directamente,
     conectar un servicio como Formspree o un backend propio.
     Los mensajes salen en el idioma de la página (<html lang>). */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const CONTACT_EMAIL = "info@caniggiafootballagency.com";
  const es = document.documentElement.lang === "es";
  const msg = es
    ? { error: "Completá todos los campos obligatorios con datos válidos.", ok: "¡Gracias! Se va a abrir tu correo para enviar el mensaje.", subject: "Consulta desde la web" }
    : { error: "Please complete all required fields with valid information.", ok: "Thank you! Your email app will open to send the message.", subject: "Website enquiry" };

  if (form) form.addEventListener("submit", (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll("[required]").forEach((field) => {
      const wrapper = field.closest(".field");
      const ok = field.type === "email"
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())
        : field.value.trim() !== "";
      wrapper.classList.toggle("has-error", !ok);
      if (!ok) valid = false;
    });

    if (!valid) {
      status.textContent = msg.error;
      status.className = "form__status is-error";
      return;
    }

    const data = new FormData(form);
    const subject = `${msg.subject} – ${data.get("profile")}`;
    const body =
      `Name: ${data.get("name")}\n` +
      `Email: ${data.get("email")}\n` +
      `Club / Organization: ${data.get("organization") || "-"}\n` +
      `Profile: ${data.get("profile")}\n\n` +
      `${data.get("message")}`;

    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    status.textContent = msg.ok;
    status.className = "form__status is-ok";
    form.reset();
  });

  /* ---------- Año del footer ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
