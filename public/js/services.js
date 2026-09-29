function renderServices(container, services) {
  container.innerHTML = services
    .map(
      (s) => `
    <div class="icon-card reveal">
      <div class="icon-badge">${icon(s.icon)}</div>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <span class="price">${s.price}</span>
    </div>`
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  const content = await SiteContent.load();
  SiteTheme.apply(content.theme);
  SiteNav.render("services", content.home.name);
  renderSocialIcons(document.getElementById("footer-social"), content.contact);

  renderServices(document.getElementById("services-grid"), content.services);
  SiteAnimations.initReveal();
});
