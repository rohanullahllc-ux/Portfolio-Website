const NAV_LINKS = [
  { href: "/", label: "Home", key: "home" },
  { href: "/portfolio.html", label: "Portfolio", key: "portfolio" },
  { href: "/about.html", label: "About", key: "about" },
  { href: "/services.html", label: "Services", key: "services" },
  { href: "/awards.html", label: "Awards", key: "awards" },
  { href: "/contact.html", label: "Contact", key: "contact" },
];

const SiteNav = {
  render(activeKey, siteName) {
    const navEl = document.getElementById("site-nav");
    const footerEl = document.getElementById("site-footer");
    if (navEl) {
      navEl.innerHTML = `
        <div class="site-header__inner">
          <a href="/" class="brand">${siteName || "Portfolio"}<span>.</span></a>
          <nav class="nav-links" id="nav-links">
            ${NAV_LINKS.map(
              (l) => `<a href="${l.href}" class="${l.key === activeKey ? "active" : ""}">${l.label}</a>`
            ).join("")}
          </nav>
          <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">${icon("menu")}</button>
        </div>`;
      const toggle = document.getElementById("nav-toggle");
      const links = document.getElementById("nav-links");
      toggle.addEventListener("click", () => links.classList.toggle("open"));
      links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => links.classList.remove("open")));
    }
    if (footerEl) {
      footerEl.innerHTML = `
        <div class="container site-footer__inner">
          <a href="/" class="brand">${siteName || "Portfolio"}<span>.</span></a>
          <nav class="nav-links" style="gap:20px;">
            ${NAV_LINKS.map((l) => `<a href="${l.href}">${l.label}</a>`).join("")}
          </nav>
          <div class="social-icons" id="footer-social"></div>
        </div>
        <p class="footer-copy">&copy; ${new Date().getFullYear()} ${siteName || "Portfolio"}. All rights reserved.</p>`;
    }
  },
};

const SiteContent = {
  _cache: null,
  async load() {
    if (this._cache) return this._cache;
    const res = await fetch("/api/content");
    this._cache = await res.json();
    return this._cache;
  },
};

const SiteTheme = {
  apply(theme) {
    if (theme) document.documentElement.setAttribute("data-theme", theme);
  },
};

function injectBackgroundAura() {
  if (document.querySelector(".bg-aura")) return;
  const aura = document.createElement("div");
  aura.className = "bg-aura";
  aura.innerHTML = `
    <div class="bg-aura__blob bg-aura__blob--a"></div>
    <div class="bg-aura__blob bg-aura__blob--b"></div>
    <div class="bg-aura__blob bg-aura__blob--c"></div>`;
  document.body.prepend(aura);
}

const SiteAnimations = {
  initReveal(root = document) {
    const els = root.querySelectorAll(".reveal:not(.observed)");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => {
      el.classList.add("observed");
      observer.observe(el);
    });
  },

  animateCounters(root = document) {
    const els = root.querySelectorAll("[data-counter-target]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          observer.unobserve(el);
          const target = parseFloat(el.dataset.counterTarget);
          const suffix = el.dataset.counterSuffix || "";
          const isDecimal = !Number.isInteger(target);
          const duration = 1400;
          const start = performance.now();
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = target * eased;
            el.textContent = (isDecimal ? value.toFixed(1) : Math.round(value)) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );
    els.forEach((el) => observer.observe(el));
  },

  animateSkillBars(root = document) {
    const els = root.querySelectorAll(".skill-bar__fill");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.width = entry.target.dataset.level + "%";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    els.forEach((el) => observer.observe(el));
  },
};

function workCardMarkup(project) {
  return `
    <div class="work-card reveal" data-project-id="${project.id}">
      <div class="work-card__thumb"><img src="${project.thumbnail}" alt="${project.title}" loading="lazy" /></div>
      <div class="work-card__body">
        <span class="category-tag">${project.category}</span>
        <h3>${project.title}</h3>
      </div>
    </div>`;
}

function setupLightbox(root, projects) {
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  const title = document.getElementById("lightbox-title");
  const desc = document.getElementById("lightbox-desc");
  const cat = document.getElementById("lightbox-category");
  const close = document.getElementById("lightbox-close");

  close.innerHTML = icon("close");

  root.querySelectorAll(".work-card").forEach((card) => {
    card.addEventListener("click", () => {
      const project = projects.find((p) => p.id === Number(card.dataset.projectId));
      if (!project) return;
      img.src = project.thumbnail;
      img.alt = project.title;
      title.textContent = project.title;
      desc.textContent = project.description;
      cat.textContent = project.category;
      lightbox.classList.add("open");
    });
  });

  close.addEventListener("click", () => lightbox.classList.remove("open"));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.classList.remove("open");
  });
}

function renderSocialIcons(container, contact) {
  if (!container || !contact) return;
  const links = [];
  if (contact.email) links.push({ icon: "mail", href: `mailto:${contact.email}` });
  if (contact.instagram) links.push({ icon: "instagram", href: contact.instagram });
  if (contact.youtube) links.push({ icon: "youtube", href: contact.youtube });
  container.innerHTML = links
    .map((l) => `<a href="${l.href}" target="_blank" rel="noopener">${icon(l.icon)}</a>`)
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  injectBackgroundAura();
});
