/* =========================================================
   Caniggia Football Agency – Interacciones
   ========================================================= */

document.documentElement.classList.remove("no-js");

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.querySelectorAll(".nav__link");

  /* ---------- Header con fondo al hacer scroll ---------- */
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

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

  /* ---------- Link activo según la sección visible ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const sectionToLink = {
    home: "home",
    about: "about",
    experience: "about",
    team: "about",
    caniggia: "caniggia",
    services: "services",
    players: "players",
    contact: "contact",
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = sectionToLink[entry.target.id];
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${target}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => sectionObserver.observe(s));

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

  /* ---------- Contadores de la banda de experiencia ---------- */
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

  /* ---------- Filtro de jugadores por posición ---------- */
  const filters = document.querySelectorAll(".filter");
  const players = document.querySelectorAll(".player");

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.filter;
      filters.forEach((b) => b.classList.toggle("is-active", b === btn));
      players.forEach((p) => {
        const show = value === "all" || p.dataset.position === value;
        p.classList.toggle("is-hidden", !show);
        if (show) p.classList.add("is-visible");
      });
    });
  });

  /* ---------- Formulario de contacto ----------
     Sin servidor: valida los campos y abre el cliente de correo
     con el mensaje armado. Para enviar desde la web directamente,
     conectar un servicio como Formspree o un backend propio. */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const CONTACT_EMAIL = "info@caniggiafootballagency.com";

  form.addEventListener("submit", (e) => {
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
      status.textContent = "Please complete all required fields with valid information.";
      status.className = "form__status is-error";
      return;
    }

    const data = new FormData(form);
    const subject = `Website enquiry – ${data.get("profile")}`;
    const body =
      `Name: ${data.get("name")}\n` +
      `Email: ${data.get("email")}\n` +
      `Club / Organization: ${data.get("organization") || "-"}\n` +
      `Profile: ${data.get("profile")}\n\n` +
      `${data.get("message")}`;

    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    status.textContent = "Thank you! Your email app will open to send the message.";
    status.className = "form__status is-ok";
    form.reset();
  });

  /* ---------- Año del footer ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
});
