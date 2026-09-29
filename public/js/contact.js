document.addEventListener("DOMContentLoaded", async () => {
  const content = await SiteContent.load();
  SiteTheme.apply(content.theme);
  SiteNav.render("contact", content.home.name);
  renderSocialIcons(document.getElementById("footer-social"), content.contact);
  renderSocialIcons(document.getElementById("contact-social"), content.contact);

  document.getElementById("icon-mail").innerHTML = icon("mail");
  document.getElementById("icon-whatsapp").innerHTML = icon("whatsapp");
  document.getElementById("contact-email").textContent = content.contact.email;
  document.getElementById("contact-whatsapp").textContent = content.contact.whatsapp;

  const projectTypeSelect = document.getElementById("projectType");
  projectTypeSelect.innerHTML =
    content.services.map((s) => `<option>${s.title}</option>`).join("") + `<option>Something else</option>`;

  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form-status";
    status.textContent = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      status.className = "form-status success";
      status.textContent = "Thanks! Your message has been sent — I'll get back to you soon.";
      form.reset();
    } catch (err) {
      status.className = "form-status error";
      status.textContent = err.message || "Something went wrong. Please try again.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    }
  });

  SiteAnimations.initReveal();
});
