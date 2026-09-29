function renderStats(container, stats) {
  container.innerHTML = stats
    .map(
      (s) => `
    <div class="stat-card reveal">
      <div class="stat-value" data-counter-target="${s.value}" data-counter-suffix="${s.suffix || ""}">0${s.suffix || ""}</div>
      <div class="stat-label">${s.label}</div>
    </div>`
    )
    .join("");
}

function renderServicesTeaser(container, items) {
  container.innerHTML = items
    .map(
      (s) => `
    <div class="icon-card reveal">
      <div class="icon-badge">${icon(s.icon)}</div>
      <h3>${s.title}</h3>
      <p>${s.text}</p>
    </div>`
    )
    .join("");
}

function renderFeaturedWork(container, projects, ids) {
  const featured = ids.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
  container.innerHTML = featured.map(workCardMarkup).join("");
}

function renderTestimonials(container, testimonials) {
  container.innerHTML = `
    ${testimonials
      .map(
        (t, i) => `
      <div class="testimonial-card ${i === 0 ? "active" : ""}" data-index="${i}">
        <p class="quote">&ldquo;${t.quote}&rdquo;</p>
        <p class="author">${t.author} &mdash; ${t.role}</p>
      </div>`
      )
      .join("")}
    <div class="testimonial-dots">
      ${testimonials.map((_, i) => `<button data-index="${i}" class="${i === 0 ? "active" : ""}"></button>`).join("")}
    </div>`;

  const cards = container.querySelectorAll(".testimonial-card");
  const dots = container.querySelectorAll(".testimonial-dots button");
  let active = 0;

  function show(index) {
    cards.forEach((c) => c.classList.toggle("active", Number(c.dataset.index) === index));
    dots.forEach((d) => d.classList.toggle("active", Number(d.dataset.index) === index));
    active = index;
  }

  dots.forEach((d) => d.addEventListener("click", () => show(Number(d.dataset.index))));
  setInterval(() => show((active + 1) % testimonials.length), 5500);
}

function renderBrandMarquee(container, brands) {
  const items = brands.map((b) => `<img src="${b.logo}" alt="${b.name}" />`).join("");
  container.innerHTML = items + items; // duplicate for seamless loop
}

document.addEventListener("DOMContentLoaded", async () => {
  const content = await SiteContent.load();
  SiteTheme.apply(content.theme);
  SiteNav.render("home", content.home.name);
  renderSocialIcons(document.getElementById("footer-social"), content.contact);

  document.getElementById("hero-title").textContent = content.home.title;
  document.getElementById("hero-name").textContent = content.home.name;
  document.getElementById("hero-tagline").textContent = content.home.tagline;
  document.getElementById("hero-photo").src = content.home.heroImage;
  const ctaBtn = document.getElementById("hero-cta");
  ctaBtn.textContent = content.home.ctaLabel + " ";
  ctaBtn.appendChild(document.createRange().createContextualFragment(icon("arrowRight")));

  const viewPortfolioBtn = document.getElementById("view-portfolio-btn");
  viewPortfolioBtn.appendChild(document.createRange().createContextualFragment(" " + icon("arrowRight")));

  renderStats(document.getElementById("stats-grid"), content.home.stats);
  renderServicesTeaser(document.getElementById("services-teaser"), content.home.servicesTeaser);
  renderFeaturedWork(document.getElementById("featured-work"), content.portfolio.projects, content.home.featuredWorkIds);
  setupLightbox(document.getElementById("featured-work"), content.portfolio.projects);
  renderTestimonials(document.getElementById("testimonial-slider"), content.home.testimonials);
  renderBrandMarquee(document.getElementById("brand-track"), content.home.brands);

  SiteAnimations.initReveal();
  SiteAnimations.animateCounters();
});
