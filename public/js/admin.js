const SECTIONS = [
  { key: "dashboard", label: "Dashboard", icon: "home" },
  { key: "home", label: "Home Page", icon: "home" },
  { key: "portfolio", label: "Portfolio", icon: "layers" },
  { key: "about", label: "About Page", icon: "user" },
  { key: "services", label: "Services", icon: "briefcase" },
  { key: "awards", label: "Awards", icon: "award" },
  { key: "contact", label: "Contact Info", icon: "mail" },
  { key: "messages", label: "Messages", icon: "inbox" },
  { key: "theme", label: "Theme", icon: "palette" },
  { key: "account", label: "Account & Security", icon: "lock" },
];

const THEME_OPTIONS = [
  { key: "charcoal-orange", label: "Charcoal Orange", colors: ["#ff7a1a", "#2fb2ff"] },
  { key: "midnight-blue", label: "Midnight Blue", colors: ["#3aa0ff", "#7c5cff"] },
  { key: "slate-purple", label: "Slate Purple", colors: ["#a855f7", "#ec4899"] },
  { key: "emerald-dark", label: "Emerald Dark", colors: ["#10b981", "#f59e0b"] },
];

const ICON_OPTIONS = ["store", "cart", "bag", "search", "settings", "zap", "sliders", "layers", "award", "mail", "briefcase", "user", "film"];

const state = { content: null, messages: [], isDefaultPassword: true };

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}

function wireImageUpload(inputEl, previewEl, onUploaded, statusEl) {
  inputEl.addEventListener("change", async () => {
    const file = inputEl.files[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      previewEl.src = url;
      onUploaded(url);
      if (statusEl) flashStatus(statusEl, "Image uploaded.", "success");
    } catch (err) {
      if (statusEl) flashStatus(statusEl, err.message, "error");
    }
  });
}

function flashStatus(el, message, type) {
  el.className = `form-status ${type}`;
  el.textContent = message;
  setTimeout(() => {
    el.className = "form-status";
    el.textContent = "";
  }, 3500);
}

// ---------------- Auth / boot ----------------

async function boot() {
  const session = await apiFetch("/api/admin/session");
  if (!session.isAdmin) {
    showLogin();
    return;
  }
  state.isDefaultPassword = session.isDefaultPassword;
  state.content = await apiFetch("/api/content");
  SiteTheme.apply(state.content.theme);
  showDashboardShell();
}

function showLogin() {
  document.getElementById("login-view").style.display = "grid";
  document.getElementById("dashboard-view").style.display = "none";
}

function showDashboardShell() {
  document.getElementById("login-view").style.display = "none";
  document.getElementById("dashboard-view").style.display = "grid";
  renderSidebar();
  renderDashboard();
  renderHomeSection();
  renderPortfolioSection();
  renderAboutSection();
  renderServicesSection();
  renderAwardsSection();
  renderContactSection();
  renderThemeSection();
  renderAccountSection();
  renderMessagesSection();
  switchSection("dashboard");
}

function setupLoginForm() {
  const form = document.getElementById("login-form");
  const status = document.getElementById("login-status");
  document.getElementById("login-icon").innerHTML = icon("lock");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    try {
      await apiFetch("/api/admin/login", { method: "POST", body: JSON.stringify({ username, password }) });
      status.className = "form-status";
      status.textContent = "";
      await boot();
    } catch (err) {
      status.className = "form-status error";
      status.textContent = err.message;
    }
  });
}

function setupLogout() {
  const btn = document.getElementById("logout-btn");
  btn.innerHTML = `${icon("logout")} Log Out`;
  btn.addEventListener("click", async () => {
    await apiFetch("/api/admin/logout", { method: "POST" });
    location.reload();
  });
}

// ---------------- Sidebar / navigation ----------------

function renderSidebar() {
  const el = document.getElementById("admin-sidebar");
  el.innerHTML = SECTIONS.map(
    (s) => `<a href="#" class="admin-sidebar__link" data-key="${s.key}">${icon(s.icon)} ${s.label}</a>`
  ).join("");
  el.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      switchSection(a.dataset.key);
    })
  );
}

function switchSection(key) {
  document.querySelectorAll(".admin-panel-section").forEach((el) => el.classList.toggle("active", el.dataset.section === key));
  document.querySelectorAll(".admin-sidebar__link").forEach((el) => el.classList.toggle("active", el.dataset.key === key));
  document.getElementById("admin-page-title").textContent = SECTIONS.find((s) => s.key === key).label;
}

// ---------------- Dashboard ----------------

function renderDashboard() {
  const el = document.getElementById("section-dashboard");
  const c = state.content;
  el.innerHTML = `
    ${
      state.isDefaultPassword
        ? `<div class="alert-warn">${icon("lock")} You're still using the default admin password. Please change it in <strong>Account & Security</strong> before this site goes live.</div>`
        : ""
    }
    <div class="admin-card">
      <h3>Welcome back, ${c.home.name}</h3>
      <p>Use the menu on the left to update any part of your live website. Changes save instantly &mdash; no code required.</p>
    </div>
    <div class="card-grid">
      <div class="admin-card"><h3>${c.services.length}</h3><p>Services listed</p></div>
      <div class="admin-card"><h3>${c.portfolio.projects.length}</h3><p>Portfolio projects</p></div>
      <div class="admin-card"><h3>${c.awards.length}</h3><p>Awards &amp; achievements</p></div>
      <div class="admin-card"><h3>${state.messages.length}</h3><p>Contact messages</p></div>
    </div>`;
}

// ---------------- Home section ----------------

function renderHomeSection() {
  const el = document.getElementById("section-home");
  const h = state.content.home;
  el.innerHTML = `
    <div class="admin-card">
      <h3>Hero</h3>
      <div class="upload-row" style="margin-bottom:20px;">
        <img id="home-photo-preview" src="${h.heroImage}" alt="" />
        <div>
          <label class="btn btn-ghost btn-sm" style="cursor:pointer;">${icon("upload")} Upload Photo
            <input type="file" id="home-photo-input" accept="image/*" style="display:none;" />
          </label>
        </div>
      </div>
      <div class="field"><label>Name</label><input id="home-name" value="${h.name}" /></div>
      <div class="field"><label>Title</label><input id="home-title" value="${h.title}" /></div>
      <div class="field"><label>Tagline</label><input id="home-tagline" value="${h.tagline}" /></div>
      <div class="field"><label>CTA Button Label</label><input id="home-cta" value="${h.ctaLabel}" /></div>
      <button class="btn btn-primary btn-sm" id="save-hero">Save Hero</button>
      <div class="form-status" id="hero-status"></div>
    </div>

    <div class="admin-card">
      <h3>Stats</h3>
      <div id="stats-rows">
        ${h.stats
          .map(
            (s, i) => `
          <div class="admin-list-item" data-index="${i}">
            <input placeholder="Label" value="${s.label}" data-field="label" style="flex:2;" class="stat-input" />
            <input placeholder="Value" type="number" step="any" value="${s.value}" data-field="value" style="flex:1;" class="stat-input" />
            <input placeholder="Suffix" value="${s.suffix || ""}" data-field="suffix" style="flex:1;" class="stat-input" />
          </div>`
          )
          .join("")}
      </div>
      <button class="btn btn-primary btn-sm" id="save-stats">Save Stats</button>
      <div class="form-status" id="stats-status"></div>
    </div>

    <div class="admin-card">
      <h3>Services Teaser (shown on Home)</h3>
      <div id="teaser-rows">
        ${h.servicesTeaser
          .map(
            (s, i) => `
          <div class="admin-list-item" data-index="${i}" style="flex-wrap:wrap;">
            <select data-field="icon" class="teaser-input">${ICON_OPTIONS.map((o) => `<option value="${o}" ${o === s.icon ? "selected" : ""}>${o}</option>`).join("")}</select>
            <input placeholder="Title" value="${s.title}" data-field="title" class="teaser-input" style="flex:1;" />
            <input placeholder="Text" value="${s.text}" data-field="text" class="teaser-input" style="flex:2;" />
          </div>`
          )
          .join("")}
      </div>
      <button class="btn btn-primary btn-sm" id="save-teaser">Save Services Teaser</button>
      <div class="form-status" id="teaser-status"></div>
    </div>

    <div class="admin-card">
      <h3>Featured Work</h3>
      <p>Choose which portfolio projects appear in the Home page's Featured Work grid.</p>
      <div id="featured-checkboxes">
        ${state.content.portfolio.projects
          .map(
            (p) => `
          <label style="display:flex; align-items:center; gap:10px; padding:8px 0;">
            <input type="checkbox" value="${p.id}" ${h.featuredWorkIds.includes(p.id) ? "checked" : ""} />
            ${p.title}
          </label>`
          )
          .join("")}
      </div>
      <button class="btn btn-primary btn-sm" id="save-featured">Save Featured Work</button>
      <div class="form-status" id="featured-status"></div>
    </div>

    <div class="admin-card">
      <h3>Testimonials</h3>
      <div id="testimonial-rows">
        ${h.testimonials
          .map(
            (t, i) => `
          <div class="admin-list-item" data-index="${i}" style="flex-wrap:wrap;">
            <input placeholder="Quote" value="${t.quote}" data-field="quote" class="testimonial-input" style="flex:3; min-width:220px;" />
            <input placeholder="Author" value="${t.author}" data-field="author" class="testimonial-input" style="flex:1;" />
            <input placeholder="Role" value="${t.role}" data-field="role" class="testimonial-input" style="flex:1;" />
            <button type="button" class="btn btn-danger btn-sm remove-testimonial" data-index="${i}">${icon("trash")}</button>
          </div>`
          )
          .join("")}
      </div>
      <button class="btn btn-ghost btn-sm" id="add-testimonial">${icon("plus")} Add Testimonial</button>
      <button class="btn btn-primary btn-sm" id="save-testimonials">Save Testimonials</button>
      <div class="form-status" id="testimonials-status"></div>
    </div>

    <div class="admin-card">
      <h3>Brands / Logos</h3>
      <div id="brand-rows">
        ${h.brands
          .map(
            (b, i) => `
          <div class="admin-list-item" data-index="${i}">
            <img src="${b.logo}" alt="" style="width:60px; height:30px; object-fit:contain; background:var(--bg-elevated-2); border-radius:6px;" class="brand-logo-preview" />
            <input placeholder="Brand name" value="${b.name}" data-field="name" class="brand-input" style="flex:1;" />
            <label class="btn btn-ghost btn-sm" style="cursor:pointer;">${icon("upload")}
              <input type="file" accept="image/*" class="brand-logo-input" style="display:none;" />
            </label>
            <button type="button" class="btn btn-danger btn-sm remove-brand" data-index="${i}">${icon("trash")}</button>
          </div>`
          )
          .join("")}
      </div>
      <button class="btn btn-ghost btn-sm" id="add-brand">${icon("plus")} Add Brand</button>
      <button class="btn btn-primary btn-sm" id="save-brands">Save Brands</button>
      <div class="form-status" id="brands-status"></div>
    </div>`;

  wireImageUpload(
    document.getElementById("home-photo-input"),
    document.getElementById("home-photo-preview"),
    (url) => (h.heroImage = url),
    document.getElementById("hero-status")
  );

  document.getElementById("save-hero").addEventListener("click", async () => {
    const payload = {
      name: document.getElementById("home-name").value,
      title: document.getElementById("home-title").value,
      tagline: document.getElementById("home-tagline").value,
      ctaLabel: document.getElementById("home-cta").value,
      heroImage: h.heroImage,
    };
    try {
      const data = await apiFetch("/api/admin/home", { method: "PUT", body: JSON.stringify(payload) });
      Object.assign(state.content.home, data.home);
      flashStatus(document.getElementById("hero-status"), "Saved!", "success");
      renderDashboard();
    } catch (err) {
      flashStatus(document.getElementById("hero-status"), err.message, "error");
    }
  });

  document.getElementById("save-stats").addEventListener("click", async () => {
    const rows = [...document.querySelectorAll("#stats-rows .admin-list-item")];
    const stats = rows.map((row) => ({
      label: row.querySelector('[data-field="label"]').value,
      value: Number(row.querySelector('[data-field="value"]').value),
      suffix: row.querySelector('[data-field="suffix"]').value,
    }));
    try {
      const data = await apiFetch("/api/admin/home", { method: "PUT", body: JSON.stringify({ stats }) });
      state.content.home.stats = data.home.stats;
      flashStatus(document.getElementById("stats-status"), "Saved!", "success");
    } catch (err) {
      flashStatus(document.getElementById("stats-status"), err.message, "error");
    }
  });

  document.getElementById("save-teaser").addEventListener("click", async () => {
    const rows = [...document.querySelectorAll("#teaser-rows .admin-list-item")];
    const servicesTeaser = rows.map((row) => ({
      icon: row.querySelector('[data-field="icon"]').value,
      title: row.querySelector('[data-field="title"]').value,
      text: row.querySelector('[data-field="text"]').value,
    }));
    try {
      const data = await apiFetch("/api/admin/home", { method: "PUT", body: JSON.stringify({ servicesTeaser }) });
      state.content.home.servicesTeaser = data.home.servicesTeaser;
      flashStatus(document.getElementById("teaser-status"), "Saved!", "success");
    } catch (err) {
      flashStatus(document.getElementById("teaser-status"), err.message, "error");
    }
  });

  document.getElementById("save-featured").addEventListener("click", async () => {
    const featuredWorkIds = [...document.querySelectorAll("#featured-checkboxes input:checked")].map((cb) => Number(cb.value));
    try {
      const data = await apiFetch("/api/admin/home", { method: "PUT", body: JSON.stringify({ featuredWorkIds }) });
      state.content.home.featuredWorkIds = data.home.featuredWorkIds;
      flashStatus(document.getElementById("featured-status"), "Saved!", "success");
    } catch (err) {
      flashStatus(document.getElementById("featured-status"), err.message, "error");
    }
  });

  document.getElementById("add-testimonial").addEventListener("click", () => {
    h.testimonials.push({ quote: "", author: "", role: "" });
    renderHomeSection();
  });
  el.querySelectorAll(".remove-testimonial").forEach((btn) =>
    btn.addEventListener("click", () => {
      h.testimonials.splice(Number(btn.dataset.index), 1);
      renderHomeSection();
    })
  );
  document.getElementById("save-testimonials").addEventListener("click", async () => {
    const rows = [...document.querySelectorAll("#testimonial-rows .admin-list-item")];
    const testimonials = rows.map((row) => ({
      quote: row.querySelector('[data-field="quote"]').value,
      author: row.querySelector('[data-field="author"]').value,
      role: row.querySelector('[data-field="role"]').value,
    }));
    try {
      const data = await apiFetch("/api/admin/home", { method: "PUT", body: JSON.stringify({ testimonials }) });
      state.content.home.testimonials = data.home.testimonials;
      flashStatus(document.getElementById("testimonials-status"), "Saved!", "success");
    } catch (err) {
      flashStatus(document.getElementById("testimonials-status"), err.message, "error");
    }
  });

  document.getElementById("add-brand").addEventListener("click", () => {
    h.brands.push({ name: "", logo: "/images/placeholders/brand-1.svg" });
    renderHomeSection();
  });
  el.querySelectorAll(".remove-brand").forEach((btn) =>
    btn.addEventListener("click", () => {
      h.brands.splice(Number(btn.dataset.index), 1);
      renderHomeSection();
    })
  );
  el.querySelectorAll(".brand-logo-input").forEach((input, i) => {
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const url = await uploadImage(file);
        h.brands[i].logo = url;
        el.querySelectorAll(".brand-logo-preview")[i].src = url;
      } catch (err) {
        flashStatus(document.getElementById("brands-status"), err.message, "error");
      }
    });
  });
  document.getElementById("save-brands").addEventListener("click", async () => {
    const rows = [...document.querySelectorAll("#brand-rows .admin-list-item")];
    const brands = rows.map((row, i) => ({
      name: row.querySelector('[data-field="name"]').value,
      logo: h.brands[i].logo,
    }));
    try {
      const data = await apiFetch("/api/admin/home", { method: "PUT", body: JSON.stringify({ brands }) });
      state.content.home.brands = data.home.brands;
      flashStatus(document.getElementById("brands-status"), "Saved!", "success");
    } catch (err) {
      flashStatus(document.getElementById("brands-status"), err.message, "error");
    }
  });
}

// ---------------- Portfolio section ----------------

function renderPortfolioSection() {
  const el = document.getElementById("section-portfolio");
  const p = state.content.portfolio;
  el.innerHTML = `
    <div class="admin-card">
      <h3>Categories</h3>
      <div id="category-rows">
        ${p.categories.map((c, i) => `<div class="admin-list-item" data-index="${i}"><input value="${c}" class="category-input" style="flex:1;" /><button type="button" class="btn btn-danger btn-sm remove-category" data-index="${i}">${icon("trash")}</button></div>`).join("")}
      </div>
      <button class="btn btn-ghost btn-sm" id="add-category">${icon("plus")} Add Category</button>
      <button class="btn btn-primary btn-sm" id="save-categories">Save Categories</button>
      <div class="form-status" id="categories-status"></div>
    </div>

    <div class="admin-card">
      <h3>Projects</h3>
      <div id="project-rows">
        ${p.projects
          .map(
            (proj) => `
          <div class="admin-list-item" data-id="${proj.id}" style="flex-wrap:wrap; align-items:flex-start;">
            <img src="${proj.thumbnail}" class="project-thumb-preview" style="width:80px; aspect-ratio:16/9; object-fit:cover; border-radius:8px;" />
            <div style="flex:1; min-width:220px; display:flex; flex-direction:column; gap:8px;">
              <input placeholder="Title" value="${proj.title}" data-field="title" class="project-input" />
              <select data-field="category" class="project-input">${p.categories.map((c) => `<option ${c === proj.category ? "selected" : ""}>${c}</option>`).join("")}</select>
              <input placeholder="Description" value="${proj.description}" data-field="description" class="project-input" />
            </div>
            <label class="btn btn-ghost btn-sm" style="cursor:pointer;">${icon("upload")}
              <input type="file" accept="image/*" class="project-thumb-input" style="display:none;" />
            </label>
            <button type="button" class="btn btn-primary btn-sm save-project" data-id="${proj.id}">Save</button>
            <button type="button" class="btn btn-danger btn-sm delete-project" data-id="${proj.id}">${icon("trash")}</button>
          </div>`
          )
          .join("")}
      </div>
      <button class="btn btn-ghost btn-sm" id="add-project">${icon("plus")} Add Project</button>
      <div class="form-status" id="projects-status"></div>
    </div>`;

  document.getElementById("add-category").addEventListener("click", () => {
    p.categories.push("New Category");
    renderPortfolioSection();
  });
  el.querySelectorAll(".remove-category").forEach((btn) =>
    btn.addEventListener("click", () => {
      p.categories.splice(Number(btn.dataset.index), 1);
      renderPortfolioSection();
    })
  );
  document.getElementById("save-categories").addEventListener("click", async () => {
    const categories = [...document.querySelectorAll(".category-input")].map((i) => i.value);
    try {
      await apiFetch("/api/admin/portfolio/categories", { method: "PUT", body: JSON.stringify({ categories }) });
      state.content.portfolio.categories = categories;
      flashStatus(document.getElementById("categories-status"), "Saved!", "success");
      renderPortfolioSection();
    } catch (err) {
      flashStatus(document.getElementById("categories-status"), err.message, "error");
    }
  });

  document.getElementById("add-project").addEventListener("click", async () => {
    try {
      const data = await apiFetch("/api/admin/portfolio/projects", {
        method: "POST",
        body: JSON.stringify({
          title: "New Project",
          category: p.categories[0] || "",
          thumbnail: "/images/placeholders/project-1.svg",
          description: "",
        }),
      });
      state.content.portfolio.projects.push(data.item);
      renderPortfolioSection();
      renderHomeSection();
    } catch (err) {
      flashStatus(document.getElementById("projects-status"), err.message, "error");
    }
  });

  el.querySelectorAll(".project-thumb-input").forEach((input) => {
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;
      const row = input.closest(".admin-list-item");
      try {
        const url = await uploadImage(file);
        row.querySelector(".project-thumb-preview").src = url;
        row.dataset.newThumb = url;
      } catch (err) {
        flashStatus(document.getElementById("projects-status"), err.message, "error");
      }
    });
  });

  el.querySelectorAll(".save-project").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const row = btn.closest(".admin-list-item");
      const id = Number(row.dataset.id);
      const payload = {
        title: row.querySelector('[data-field="title"]').value,
        category: row.querySelector('[data-field="category"]').value,
        description: row.querySelector('[data-field="description"]').value,
      };
      if (row.dataset.newThumb) payload.thumbnail = row.dataset.newThumb;
      try {
        const data = await apiFetch(`/api/admin/portfolio/projects/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        const idx = state.content.portfolio.projects.findIndex((pr) => pr.id === id);
        state.content.portfolio.projects[idx] = data.item;
        flashStatus(document.getElementById("projects-status"), "Saved!", "success");
        renderHomeSection();
      } catch (err) {
        flashStatus(document.getElementById("projects-status"), err.message, "error");
      }
    });
  });

  el.querySelectorAll(".delete-project").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.id);
      if (!confirm("Delete this project?")) return;
      try {
        await apiFetch(`/api/admin/portfolio/projects/${id}`, { method: "DELETE" });
        state.content.portfolio.projects = state.content.portfolio.projects.filter((pr) => pr.id !== id);
        state.content.home.featuredWorkIds = state.content.home.featuredWorkIds.filter((fid) => fid !== id);
        renderPortfolioSection();
        renderHomeSection();
      } catch (err) {
        flashStatus(document.getElementById("projects-status"), err.message, "error");
      }
    });
  });
}

// ---------------- About section ----------------

function renderAboutSection() {
  const el = document.getElementById("section-about");
  const a = state.content.about;
  el.innerHTML = `
    <div class="admin-card">
      <h3>Story</h3>
      <div class="field"><textarea id="about-story-input" style="min-height:160px;">${a.story}</textarea></div>
      <button class="btn btn-primary btn-sm" id="save-story">Save Story</button>
      <div class="form-status" id="story-status"></div>
    </div>

    <div class="admin-card">
      <h3>Timeline</h3>
      <div id="timeline-rows">
        ${a.timeline
          .map(
            (t, i) => `
          <div class="admin-list-item" data-index="${i}">
            <input value="${t.year}" data-field="year" class="timeline-input" style="flex:0 0 100px;" />
            <input value="${t.label}" data-field="label" class="timeline-input" style="flex:1;" />
            <button type="button" class="btn btn-danger btn-sm remove-timeline" data-index="${i}">${icon("trash")}</button>
          </div>`
          )
          .join("")}
      </div>
      <button class="btn btn-ghost btn-sm" id="add-timeline">${icon("plus")} Add Milestone</button>
      <button class="btn btn-primary btn-sm" id="save-timeline">Save Timeline</button>
      <div class="form-status" id="timeline-status"></div>
    </div>

    <div class="admin-card">
      <h3>Skills</h3>
      <div id="skill-rows">
        ${a.skills
          .map(
            (s, i) => `
          <div class="admin-list-item" data-index="${i}">
            <input value="${s.name}" data-field="name" class="skill-input" style="flex:2;" />
            <input value="${s.level}" type="number" min="0" max="100" data-field="level" class="skill-input" style="flex:1;" />
            <button type="button" class="btn btn-danger btn-sm remove-skill" data-index="${i}">${icon("trash")}</button>
          </div>`
          )
          .join("")}
      </div>
      <button class="btn btn-ghost btn-sm" id="add-skill">${icon("plus")} Add Skill</button>
      <button class="btn btn-primary btn-sm" id="save-skills">Save Skills</button>
      <div class="form-status" id="skills-status"></div>
    </div>`;

  document.getElementById("save-story").addEventListener("click", async () => {
    try {
      const data = await apiFetch("/api/admin/about", {
        method: "PUT",
        body: JSON.stringify({ story: document.getElementById("about-story-input").value }),
      });
      state.content.about.story = data.about.story;
      flashStatus(document.getElementById("story-status"), "Saved!", "success");
    } catch (err) {
      flashStatus(document.getElementById("story-status"), err.message, "error");
    }
  });

  document.getElementById("add-timeline").addEventListener("click", () => {
    a.timeline.push({ year: "", label: "" });
    renderAboutSection();
  });
  el.querySelectorAll(".remove-timeline").forEach((btn) =>
    btn.addEventListener("click", () => {
      a.timeline.splice(Number(btn.dataset.index), 1);
      renderAboutSection();
    })
  );
  document.getElementById("save-timeline").addEventListener("click", async () => {
    const rows = [...document.querySelectorAll("#timeline-rows .admin-list-item")];
    const timeline = rows.map((row) => ({
      year: row.querySelector('[data-field="year"]').value,
      label: row.querySelector('[data-field="label"]').value,
    }));
    try {
      const data = await apiFetch("/api/admin/about", { method: "PUT", body: JSON.stringify({ timeline }) });
      state.content.about.timeline = data.about.timeline;
      flashStatus(document.getElementById("timeline-status"), "Saved!", "success");
    } catch (err) {
      flashStatus(document.getElementById("timeline-status"), err.message, "error");
    }
  });

  document.getElementById("add-skill").addEventListener("click", () => {
    a.skills.push({ name: "", level: 50 });
    renderAboutSection();
  });
  el.querySelectorAll(".remove-skill").forEach((btn) =>
    btn.addEventListener("click", () => {
      a.skills.splice(Number(btn.dataset.index), 1);
      renderAboutSection();
    })
  );
  document.getElementById("save-skills").addEventListener("click", async () => {
    const rows = [...document.querySelectorAll("#skill-rows .admin-list-item")];
    const skills = rows.map((row) => ({
      name: row.querySelector('[data-field="name"]').value,
      level: Number(row.querySelector('[data-field="level"]').value),
    }));
    try {
      const data = await apiFetch("/api/admin/about", { method: "PUT", body: JSON.stringify({ skills }) });
      state.content.about.skills = data.about.skills;
      flashStatus(document.getElementById("skills-status"), "Saved!", "success");
    } catch (err) {
      flashStatus(document.getElementById("skills-status"), err.message, "error");
    }
  });
}

// ---------------- Services section ----------------

function renderServicesSection() {
  const el = document.getElementById("section-services");
  el.innerHTML = `
    <div class="admin-card">
      <h3>Services</h3>
      <div id="services-admin-rows">
        ${state.content.services
          .map(
            (s) => `
          <div class="admin-list-item" data-id="${s.id}" style="flex-wrap:wrap;">
            <select data-field="icon" class="service-input">${ICON_OPTIONS.map((o) => `<option value="${o}" ${o === s.icon ? "selected" : ""}>${o}</option>`).join("")}</select>
            <input value="${s.title}" data-field="title" class="service-input" placeholder="Title" style="flex:1;" />
            <input value="${s.description}" data-field="description" class="service-input" placeholder="Description" style="flex:2;" />
            <input value="${s.price}" data-field="price" class="service-input" placeholder="Price" style="flex:1;" />
            <button type="button" class="btn btn-primary btn-sm save-service" data-id="${s.id}">Save</button>
            <button type="button" class="btn btn-danger btn-sm delete-service" data-id="${s.id}">${icon("trash")}</button>
          </div>`
          )
          .join("")}
      </div>
      <button class="btn btn-ghost btn-sm" id="add-service">${icon("plus")} Add Service</button>
      <div class="form-status" id="services-status"></div>
    </div>`;

  document.getElementById("add-service").addEventListener("click", async () => {
    try {
      const data = await apiFetch("/api/admin/services", {
        method: "POST",
        body: JSON.stringify({ icon: "film", title: "New Service", description: "", price: "" }),
      });
      state.content.services.push(data.item);
      renderServicesSection();
    } catch (err) {
      flashStatus(document.getElementById("services-status"), err.message, "error");
    }
  });

  el.querySelectorAll(".save-service").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const row = btn.closest(".admin-list-item");
      const id = Number(row.dataset.id);
      const payload = {
        icon: row.querySelector('[data-field="icon"]').value,
        title: row.querySelector('[data-field="title"]').value,
        description: row.querySelector('[data-field="description"]').value,
        price: row.querySelector('[data-field="price"]').value,
      };
      try {
        const data = await apiFetch(`/api/admin/services/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        const idx = state.content.services.findIndex((s) => s.id === id);
        state.content.services[idx] = data.item;
        flashStatus(document.getElementById("services-status"), "Saved!", "success");
        renderDashboard();
      } catch (err) {
        flashStatus(document.getElementById("services-status"), err.message, "error");
      }
    });
  });

  el.querySelectorAll(".delete-service").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.id);
      if (!confirm("Delete this service?")) return;
      try {
        await apiFetch(`/api/admin/services/${id}`, { method: "DELETE" });
        state.content.services = state.content.services.filter((s) => s.id !== id);
        renderServicesSection();
        renderDashboard();
      } catch (err) {
        flashStatus(document.getElementById("services-status"), err.message, "error");
      }
    });
  });
}

// ---------------- Awards section ----------------

function renderAwardsSection() {
  const el = document.getElementById("section-awards");
  el.innerHTML = `
    <div class="admin-card">
      <h3>Awards &amp; Achievements</h3>
      <div id="awards-admin-rows">
        ${state.content.awards
          .map(
            (a) => `
          <div class="admin-list-item" data-id="${a.id}" style="flex-wrap:wrap;">
            <input value="${a.title}" data-field="title" class="award-input" placeholder="Title" style="flex:2;" />
            <input value="${a.year}" data-field="year" class="award-input" placeholder="Year" style="flex:0 0 90px;" />
            <input value="${a.givenBy}" data-field="givenBy" class="award-input" placeholder="Given by" style="flex:1;" />
            <input value="${a.description}" data-field="description" class="award-input" placeholder="Why it matters" style="flex:2;" />
            <button type="button" class="btn btn-primary btn-sm save-award" data-id="${a.id}">Save</button>
            <button type="button" class="btn btn-danger btn-sm delete-award" data-id="${a.id}">${icon("trash")}</button>
          </div>`
          )
          .join("")}
      </div>
      <button class="btn btn-ghost btn-sm" id="add-award">${icon("plus")} Add Award</button>
      <div class="form-status" id="awards-status"></div>
    </div>`;

  document.getElementById("add-award").addEventListener("click", async () => {
    try {
      const data = await apiFetch("/api/admin/awards", {
        method: "POST",
        body: JSON.stringify({ title: "New Award", year: "", givenBy: "", description: "" }),
      });
      state.content.awards.push(data.item);
      renderAwardsSection();
    } catch (err) {
      flashStatus(document.getElementById("awards-status"), err.message, "error");
    }
  });

  el.querySelectorAll(".save-award").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const row = btn.closest(".admin-list-item");
      const id = Number(row.dataset.id);
      const payload = {
        title: row.querySelector('[data-field="title"]').value,
        year: row.querySelector('[data-field="year"]').value,
        givenBy: row.querySelector('[data-field="givenBy"]').value,
        description: row.querySelector('[data-field="description"]').value,
      };
      try {
        const data = await apiFetch(`/api/admin/awards/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        const idx = state.content.awards.findIndex((a) => a.id === id);
        state.content.awards[idx] = data.item;
        flashStatus(document.getElementById("awards-status"), "Saved!", "success");
        renderDashboard();
      } catch (err) {
        flashStatus(document.getElementById("awards-status"), err.message, "error");
      }
    });
  });

  el.querySelectorAll(".delete-award").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.id);
      if (!confirm("Delete this award?")) return;
      try {
        await apiFetch(`/api/admin/awards/${id}`, { method: "DELETE" });
        state.content.awards = state.content.awards.filter((a) => a.id !== id);
        renderAwardsSection();
        renderDashboard();
      } catch (err) {
        flashStatus(document.getElementById("awards-status"), err.message, "error");
      }
    });
  });
}

// ---------------- Contact section ----------------

function renderContactSection() {
  const el = document.getElementById("section-contact");
  const c = state.content.contact;
  el.innerHTML = `
    <div class="admin-card">
      <h3>Contact Details</h3>
      <div class="field"><label>Email</label><input id="contact-email-input" value="${c.email}" /></div>
      <div class="field"><label>WhatsApp</label><input id="contact-whatsapp-input" value="${c.whatsapp}" /></div>
      <div class="field"><label>Instagram URL</label><input id="contact-instagram-input" value="${c.instagram}" /></div>
      <div class="field"><label>YouTube URL</label><input id="contact-youtube-input" value="${c.youtube}" /></div>
      <button class="btn btn-primary btn-sm" id="save-contact">Save Contact Info</button>
      <div class="form-status" id="contact-admin-status"></div>
    </div>`;

  document.getElementById("save-contact").addEventListener("click", async () => {
    const payload = {
      email: document.getElementById("contact-email-input").value,
      whatsapp: document.getElementById("contact-whatsapp-input").value,
      instagram: document.getElementById("contact-instagram-input").value,
      youtube: document.getElementById("contact-youtube-input").value,
    };
    try {
      const data = await apiFetch("/api/admin/contact", { method: "PUT", body: JSON.stringify(payload) });
      state.content.contact = data.contact;
      flashStatus(document.getElementById("contact-admin-status"), "Saved!", "success");
    } catch (err) {
      flashStatus(document.getElementById("contact-admin-status"), err.message, "error");
    }
  });
}

// ---------------- Messages section ----------------

async function renderMessagesSection() {
  const el = document.getElementById("section-messages");
  el.innerHTML = `<div class="admin-card"><h3>Loading messages...</h3></div>`;
  try {
    state.messages = await apiFetch("/api/admin/messages");
  } catch (err) {
    el.innerHTML = `<div class="admin-card"><p>${err.message}</p></div>`;
    return;
  }
  el.innerHTML = `
    <div class="admin-card">
      <h3>Contact Form Messages (${state.messages.length})</h3>
      ${
        state.messages.length === 0
          ? `<p>No messages yet.</p>`
          : state.messages
              .map(
                (m) => `
        <div class="admin-list-item" data-id="${m.id}" style="flex-direction:column; align-items:stretch; gap:6px;">
          <div style="display:flex; justify-content:space-between;">
            <strong>${m.name} &lt;${m.email}&gt;</strong>
            <button type="button" class="btn btn-danger btn-sm delete-message" data-id="${m.id}">${icon("trash")}</button>
          </div>
          <div style="color:var(--text-secondary); font-size:0.85rem;">${m.projectType || ""} ${m.budget ? "&middot; " + m.budget : ""} &middot; ${new Date(m.receivedAt).toLocaleString()}</div>
          <p style="margin:0;">${m.message}</p>
        </div>`
              )
              .join("")
      }
    </div>`;

  el.querySelectorAll(".delete-message").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.id);
      try {
        await apiFetch(`/api/admin/messages/${id}`, { method: "DELETE" });
        state.messages = state.messages.filter((m) => m.id !== id);
        renderMessagesSection();
        renderDashboard();
      } catch (err) {
        console.error(err);
      }
    });
  });
  renderDashboard();
}

// ---------------- Theme section ----------------

function renderThemeSection() {
  const el = document.getElementById("section-theme");
  const current = state.content.theme;
  el.innerHTML = `
    <div class="admin-card">
      <h3>Color Theme</h3>
      <p>Changing the theme updates every page of the live website instantly.</p>
      <div class="theme-swatch-grid">
        ${THEME_OPTIONS.map(
          (t) => `
          <div class="theme-swatch ${t.key === current ? "selected" : ""}" data-key="${t.key}">
            <div class="swatch-dot" style="background: linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]});"></div>
            ${t.label}
          </div>`
        ).join("")}
      </div>
      <div class="form-status" id="theme-status"></div>
    </div>`;

  el.querySelectorAll(".theme-swatch").forEach((swatch) => {
    swatch.addEventListener("click", async () => {
      const themeKey = swatch.dataset.key;
      try {
        await apiFetch("/api/admin/theme", { method: "PUT", body: JSON.stringify({ theme: themeKey }) });
        state.content.theme = themeKey;
        SiteTheme.apply(themeKey);
        renderThemeSection();
        flashStatus(document.getElementById("theme-status"), "Theme updated across the whole site.", "success");
      } catch (err) {
        flashStatus(document.getElementById("theme-status"), err.message, "error");
      }
    });
  });
}

// ---------------- Account section ----------------

function renderAccountSection() {
  const el = document.getElementById("section-account");
  el.innerHTML = `
    <div class="admin-card">
      ${
        state.isDefaultPassword
          ? `<div class="alert-warn">${icon("lock")} You're currently using the default password. Change it before sharing this site publicly.
             <div class="badge-credential">Username: admin &nbsp;|&nbsp; Password: Admin@123</div></div>`
          : ""
      }
      <h3>Change Password</h3>
      <div class="field"><label>Current Password</label><input type="password" id="current-password" /></div>
      <div class="field"><label>New Password (min. 8 characters)</label><input type="password" id="new-password" /></div>
      <button class="btn btn-primary btn-sm" id="save-password">Update Password</button>
      <div class="form-status" id="password-status"></div>
    </div>`;

  document.getElementById("save-password").addEventListener("click", async () => {
    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    try {
      await apiFetch("/api/admin/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) });
      state.isDefaultPassword = false;
      flashStatus(document.getElementById("password-status"), "Password updated.", "success");
      renderAccountSection();
      renderDashboard();
    } catch (err) {
      flashStatus(document.getElementById("password-status"), err.message, "error");
    }
  });
}

// ---------------- Init ----------------

document.addEventListener("DOMContentLoaded", () => {
  setupLoginForm();
  setupLogout();
  boot();
});
