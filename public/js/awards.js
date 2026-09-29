function renderAwards(container, awards) {
  container.innerHTML = awards
    .map(
      (a) => `
    <div class="award-card reveal">
      <div class="icon-badge">${icon("award")}</div>
      <div>
        <span class="year-tag">${a.year}</span>
        <h3 style="margin:6px 0 4px;">${a.title}</h3>
        <p style="margin-bottom:4px; color:var(--text-primary);">${a.givenBy}</p>
        <p style="margin:0;">${a.description}</p>
      </div>
    </div>`
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  const content = await SiteContent.load();
  SiteTheme.apply(content.theme);
  SiteNav.render("awards", content.home.name);
  renderSocialIcons(document.getElementById("footer-social"), content.contact);

  renderAwards(document.getElementById("awards-list"), content.awards);
  SiteAnimations.initReveal();
});
