const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "public", "images", "placeholders");
fs.mkdirSync(outDir, { recursive: true });

function write(name, svg) {
  fs.writeFileSync(path.join(outDir, name), svg.trim() + "\n", "utf-8");
}

// ---- Profile avatar ----
write(
  "profile.svg",
  `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff7a1a"/>
      <stop offset="100%" stop-color="#2fb2ff"/>
    </linearGradient>
  </defs>
  <rect width="480" height="480" rx="32" fill="#14110e"/>
  <circle cx="240" cy="240" r="210" fill="url(#g)" opacity="0.18"/>
  <circle cx="240" cy="196" r="76" fill="none" stroke="url(#g)" stroke-width="6"/>
  <path d="M100 400c20-84 92-132 140-132s120 48 140 132" fill="none" stroke="url(#g)" stroke-width="6" stroke-linecap="round"/>
</svg>`
);

// ---- Project thumbnails ----
const projects = [
  { file: "project-1.svg", label: "Boutique Apparel Storefront", icon: "bag" },
  { file: "project-2.svg", label: "Home Goods Relaunch", icon: "refresh" },
  { file: "project-3.svg", label: "Local Bakery Website", icon: "browser" },
  { file: "project-4.svg", label: "Cart Recovery Automation", icon: "gear" },
  { file: "project-5.svg", label: "Subscription Box Storefront", icon: "bag" },
  { file: "project-6.svg", label: "Fitness Brand Redesign", icon: "refresh" },
  { file: "project-7.svg", label: "Inventory Sync Tool", icon: "gear" },
  { file: "project-8.svg", label: "Multi-Page Business Site", icon: "browser" },
];

function iconMarkup(kind) {
  if (kind === "bag") {
    return `<path d="M-20 -8h40l4 44h-48z" fill="none" stroke="#f5f0ea" stroke-width="3.5" opacity="0.9"/>
      <path d="M-10 -8v-8a10 10 0 0 1 20 0v8" fill="none" stroke="#f5f0ea" stroke-width="3.5" opacity="0.9"/>`;
  }
  if (kind === "refresh") {
    return `<path d="M-26 0a26 26 0 0 1 45-18" fill="none" stroke="#f5f0ea" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
      <path d="M26 0a26 26 0 0 1-45 18" fill="none" stroke="#f5f0ea" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
      <path d="M19 -18 26 -18 26 -11" fill="none" stroke="#f5f0ea" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
      <path d="M-19 18 -26 18 -26 11" fill="none" stroke="#f5f0ea" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`;
  }
  if (kind === "gear") {
    return `<circle cx="0" cy="0" r="12" fill="none" stroke="#f5f0ea" stroke-width="3.5" opacity="0.9"/>
      ${[0, 45, 90, 135, 180, 225, 270, 315]
        .map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 16 * Math.cos(rad), y1 = 16 * Math.sin(rad);
          const x2 = 26 * Math.cos(rad), y2 = 26 * Math.sin(rad);
          return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#f5f0ea" stroke-width="3.5" stroke-linecap="round" opacity="0.9"/>`;
        })
        .join("")}`;
  }
  // browser
  return `<rect x="-32" y="-22" width="64" height="44" rx="4" fill="none" stroke="#f5f0ea" stroke-width="3.5" opacity="0.9"/>
    <line x1="-32" y1="-10" x2="32" y2="-10" stroke="#f5f0ea" stroke-width="3.5" opacity="0.9"/>
    <circle cx="-25" cy="-16" r="1.8" fill="#f5f0ea" opacity="0.9"/>
    <circle cx="-19" cy="-16" r="1.8" fill="#f5f0ea" opacity="0.9"/>`;
}

projects.forEach((p, i) => {
  const hueShift = i * 22;
  write(
    p.file,
    `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="bg${i}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${20 + hueShift}, 90%, 45%)"/>
      <stop offset="100%" stop-color="hsl(${200 + hueShift}, 85%, 40%)"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="#14110e"/>
  <rect width="640" height="360" fill="url(#bg${i})" opacity="0.35"/>
  <g transform="translate(320,150)">${iconMarkup(p.icon)}</g>
  <text x="320" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#f5f0ea" opacity="0.9">${p.label}</text>
</svg>`
  );
});

// ---- Brand wordmarks ----
const brands = ["Northwind Apparel", "Bright Home Goods", "Lumen Boutique", "Pixel Mercantile", "CraftedGoods Co", "Vertex Outfitters"];
brands.forEach((name, i) => {
  write(
    `brand-${i + 1}.svg`,
    `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 80">
  <text x="130" y="48" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="26" letter-spacing="1" fill="#9a958d">${name}</text>
</svg>`
  );
});

console.log("Generated", 1 + projects.length + brands.length, "placeholder SVGs in", outDir);
