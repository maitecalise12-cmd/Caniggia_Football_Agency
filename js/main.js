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

  /* ---------- Menú hamburguesa izquierdo: al tocarlo bajan los nombres de las secciones ---------- */
  const sideToggle = document.getElementById("sideToggle");
  const sideMenu = document.getElementById("sideMenu");

  if (sideToggle && sideMenu) {
    const setSideMenu = (open) => {
      sideMenu.classList.toggle("is-open", open);
      sideToggle.classList.toggle("is-open", open);
      sideToggle.setAttribute("aria-expanded", String(open));
      sideToggle.setAttribute("aria-label", open ? "Close sections menu" : "Open sections menu");
      sideMenu.setAttribute("aria-hidden", String(!open));
    };

    sideToggle.addEventListener("click", () => setSideMenu(!sideMenu.classList.contains("is-open")));
    sideMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setSideMenu(false)));
    // tocar en cualquier otro lado lo cierra
    document.addEventListener("click", (e) => {
      if (!sideMenu.contains(e.target) && !sideToggle.contains(e.target)) setSideMenu(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setSideMenu(false);
    });

    // [•] en la sección que se está viendo
    const sideLinks = [...sideMenu.querySelectorAll("a")];
    const currentObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          sideLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === `#${entry.target.id}`));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sideLinks
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean)
      .forEach((section) => currentObserver.observe(section));
  }

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

    // Botón Services del hero: mientras está en true, la línea de tiempo queda quieta
    let lockJourney = false;
    let autoScrolling = false;

    const updateJourney = () => {
      if (!journey.classList.contains("is-horizontal")) return;
      // se libera recién cuando la sección ya no se ve, así no da un salto a la vista
      if (lockJourney && !autoScrolling) {
        const box = journey.getBoundingClientRect();
        if (box.bottom <= header.offsetHeight || box.top >= window.innerHeight) lockJourney = false;
      }
      const start = journey.offsetTop - header.offsetHeight;
      const progress = lockJourney ? 0 : Math.min(Math.max((window.scrollY - start) / (distance || 1), 0), 1);
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

    /* ---------- Links internos con el mismo desplazamiento suave ----------
       Menú hamburguesa de secciones, botones del hero, links de la barra y el logo.
       Todos se mueven en un solo movimiento suave. Si en el camino está la
       sección de Caniggia, no se detienen ni recorren la línea de tiempo de
       costado: la pasan como si fuera una sección más. En celular funcionan normal. */
    const skipLinks = document.querySelectorAll("#heroActions, .nav__link, .header .brand, .side-menu");
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const scrollPastJourney = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link || !journey.classList.contains("is-horizontal")) return;
      const hash = link.getAttribute("href");
      const section = document.querySelector(hash);
      if (!section) return;

      const from = window.scrollY;
      const journeyStart = journey.offsetTop - header.offsetHeight;
      const journeyEnd = journeyStart + distance; // fin del tramo horizontal
      const target = Math.max(section.getBoundingClientRect().top + window.scrollY - header.offsetHeight, 0);
      const goingDown = from < journeyStart && target > journeyEnd;
      const goingUp = from > journeyEnd && target < journeyStart;
      const skip = goingDown || goingUp; // atraviesa la línea de tiempo
      e.preventDefault();
      history.replaceState(null, "", hash);

      if (reducedMotion) {
        window.scrollTo({ top: target, behavior: "instant" });
        return;
      }

      // recorrido "virtual": si atraviesa la línea de tiempo, ese tramo se descuenta
      // (lo que está debajo de ella se corre "distance" hacia arriba)
      const start = goingUp ? from - distance : from;
      const end = goingDown ? target - distance : target;
      const total = end - start;
      if (Math.abs(total) < 1) return;
      const duration = Math.min(Math.max(Math.abs(total) * 0.4, 900), 2200);
      const t0 = performance.now();

      // si la persona scrollea a mano, se corta
      let cancelled = false;
      const cancel = () => { cancelled = true; };
      window.addEventListener("wheel", cancel, { once: true, passive: true });
      window.addEventListener("touchstart", cancel, { once: true, passive: true });

      if (skip) {
        lockJourney = true;
        autoScrolling = true;
        updateJourney(); // la deja quieta en el inicio antes de que entre en pantalla
      }

      const frame = (now) => {
        const k = cancelled ? 1 : Math.min((now - t0) / duration, 1);
        if (!cancelled) {
          const v = start + total * easeInOut(k);
          window.scrollTo({ top: skip && v >= journeyStart ? v + distance : v, behavior: "instant" });
        }
        if (k < 1) {
          requestAnimationFrame(frame);
          return;
        }
        autoScrolling = false;
        window.removeEventListener("wheel", cancel);
        window.removeEventListener("touchstart", cancel);
        updateJourney();
      };
      requestAnimationFrame(frame);
    };

    skipLinks.forEach((el) => el.addEventListener("click", scrollPastJourney));

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

    /* Celular: desplegable. Se ven solo los títulos; al tocar uno se abre su texto
       y se cierra el que estaba abierto. (Mismo corte que el CSS: 900px de ancho) */
    const mobile = window.matchMedia("(max-width: 900px)");
    const toggles = [...wheel.querySelectorAll(".svc-wheel__toggle")];

    toggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        if (!mobile.matches) return; // en escritorio el título no es desplegable
        const panel = toggle.closest(".svc-wheel__panel");
        const open = !panel.classList.contains("is-open");
        panels.forEach((p) => p.classList.remove("is-open"));
        toggles.forEach((t) => t.setAttribute("aria-expanded", "false"));
        panel.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
      });
    });
  }

  /* ---------- Formulario de contacto ----------
     Envía el mensaje directo al mail de CONTACT_EMAIL usando FormSubmit
     (servicio gratuito, sin servidor propio). La primera vez que alguien
     lo usa, FormSubmit manda a ese mail un correo para ACTIVAR el formulario:
     hay que abrirlo y confirmar; desde ahí llegan todos los mensajes.
     Los mensajes de estado salen en el idioma de la página (<html lang>). */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const CONTACT_EMAIL = "caniggiaagency@gmail.com";
  const es = document.documentElement.lang === "es";
  const msg = es
    ? { error: "Completá todos los campos obligatorios con datos válidos.", sending: "Enviando…", ok: "¡Gracias! Recibimos tu mensaje y te vamos a responder pronto.", fail: "No se pudo enviar el mensaje. Probá de nuevo o escribinos por Instagram.", subject: "Consulta desde la web" }
    : { error: "Please complete all required fields with valid information.", sending: "Sending…", ok: "Thank you! We received your message and will get back to you soon.", fail: "The message could not be sent. Please try again or reach us on Instagram.", subject: "Website enquiry" };

  if (form) form.addEventListener("submit", async (e) => {
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
    if (data.get("_honey")) return; // campo trampa: solo lo completan los robots de spam

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    status.textContent = msg.sending;
    status.className = "form__status";

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `${msg.subject} – ${data.get("profile")}`,
          _replyto: data.get("email"), // al tocar "Responder" le contestás a quien escribió
          _template: "table",
          Name: data.get("name"),
          Email: data.get("email"),
          "Club / Organization": data.get("organization") || "-",
          Profile: data.get("profile"),
          Message: data.get("message"),
        }),
      });
      if (!response.ok) throw new Error(response.status);
      status.textContent = msg.ok;
      status.className = "form__status is-ok";
      form.reset();
    } catch {
      status.textContent = msg.fail;
      status.className = "form__status is-error";
    } finally {
      button.disabled = false;
    }
  });

  /* ---------- Año del footer ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
