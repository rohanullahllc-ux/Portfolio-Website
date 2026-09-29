function renderTimeline(container, items) {
  container.innerHTML = items
    .map(
      (t) => `
    <div class="timeline-item reveal">
      <span class="year">${t.year}</span>
      <h4>${t.label}</h4>
    </div>`
    )
    .join("");
}

function renderSkills(container, skills) {
  container.innerHTML = skills
    .map(
      (s) => `
    <div class="skill-row">
      <div class="skill-row__label"><span>${s.name}</span><span>${s.level}%</span></div>
      <div class="skill-bar"><div class="skill-bar__fill" data-level="${s.level}"></div></div>
    </div>`
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  const content = await SiteContent.load();
  SiteTheme.apply(content.theme);
  SiteNav.render("about", content.home.name);
  renderSocialIcons(document.getElementById("footer-social"), content.contact);

  document.getElementById("about-heading").textContent = `About ${content.home.name}`;
  document.getElementById("about-story").textContent = content.about.story;
  renderTimeline(document.getElementById("about-timeline"), content.about.timeline);
  renderSkills(document.getElementById("about-skills"), content.about.skills);

  SiteAnimations.initReveal();
  SiteAnimations.animateSkillBars();
});
