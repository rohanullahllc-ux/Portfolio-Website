document.addEventListener("DOMContentLoaded", async () => {
  const content = await SiteContent.load();
  SiteTheme.apply(content.theme);
  SiteNav.render("portfolio", content.home.name);
  renderSocialIcons(document.getElementById("footer-social"), content.contact);

  const { categories, projects } = content.portfolio;
  const tabsEl = document.getElementById("filter-tabs");
  const gridEl = document.getElementById("portfolio-grid");
  const allTabs = ["All", ...categories];

  tabsEl.innerHTML = allTabs
    .map((cat, i) => `<button class="filter-tab ${i === 0 ? "active" : ""}" data-cat="${cat}">${cat}</button>`)
    .join("");

  function renderGrid(filter) {
    const filtered = filter === "All" ? projects : projects.filter((p) => p.category === filter);

    if (filtered.length === 0) {
      const label = filter === "All" ? "Project" : `${filter} Project`;
      gridEl.innerHTML = `
        <div class="cta-banner reveal" style="grid-column: 1 / -1;">
          <h2>Your Next ${label} Could Be Here.</h2>
          <p>This category is wide open — be the first one featured in this portfolio.</p>
          <a href="/contact.html" class="btn btn-primary">Start the Conversation</a>
        </div>`;
      SiteAnimations.initReveal(gridEl);
      return;
    }

    gridEl.innerHTML = filtered.map(workCardMarkup).join("");
    SiteAnimations.initReveal(gridEl);
    setupLightbox(gridEl, projects);
  }

  tabsEl.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      tabsEl.querySelectorAll(".filter-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderGrid(tab.dataset.cat);
    });
  });

  renderGrid("All");
  SiteAnimations.initReveal();
});
