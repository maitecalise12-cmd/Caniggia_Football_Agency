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

  /* ---------- Caniggia: scroll horizontal ----------
     En escritorio la sección queda fija y, al bajar con el scroll,
     el contenido se desplaza hacia la izquierda mostrando la línea
     de tiempo. En pantallas chicas se ve en vertical. */
  const journey = document.getElementById("caniggia");
  const track = document.getElementById("journeyTrack");
  const desktop = window.matchMedia("(min-width: 901px)");
  let distance = 0;

  const setupJourney = () => {
    const horizontal = desktop.matches && !reducedMotion;
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
