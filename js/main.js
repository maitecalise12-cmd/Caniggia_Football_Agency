/* =========================================================
   Caniggia Football Agency – Interacciones
   ========================================================= */

document.documentElement.classList.remove("no-js");

document.addEventListener("DOMContentLoaded", () => {
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
     Al hacer clic en un número, la rueda gira (--active) para dejarlo al centro
     y se muestra el texto de ese servicio. También funciona con las flechas del teclado. */
  const wheel = document.getElementById("svcWheel");
  if (wheel) {
    const tabs = [...wheel.querySelectorAll(".svc-wheel__num")];
    const panels = [...wheel.querySelectorAll(".svc-wheel__panel")];

    const selectService = (index, focus = false) => {
      wheel.style.setProperty("--active", index);
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.classList.toggle("is-active", active);
        tab.classList.toggle("is-far", Math.abs(i - index) >= 2);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel, i) => panel.classList.toggle("is-active", i === index));
      if (focus) tabs[index].focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => selectService(i));
      tab.addEventListener("keydown", (e) => {
        const next = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!next) return;
        e.preventDefault();
        selectService((i + next + tabs.length) % tabs.length, true);
      });
    });

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
