# Portfolio Website — Build Plan

This file replaces `Portfolio-Website-with-Claude-Complete-Plan.pdf` (deleted — its text
extracted poorly and this is the durable reference instead). It is the complete build
plan for this project: a premium, animated personal portfolio website plus a
password-protected Admin Panel, built one page at a time, in order, in a single
ongoing conversation.

## Budget constraint (governs every technical choice below)

The site owner is a bootstrapped founder starting from zero — the entire initial
build must run on **free-tier / free / open-source tools only**: hosting, domain,
the Admin Panel's backend/database, fonts, icons, and animation libraries. Do not
default to paid services anywhere in Steps 1–10. Once the first paying client has
landed, paid hosting, a custom domain, and other paid upgrades come back into scope
and should be revisited then — not assumed upfront. Concretely, this means:
- **Hosting (Step 10):** a free static host (e.g. Netlify, Vercel, GitHub Pages, Cloudflare Pages) with its free subdomain — no purchased domain yet.
- **Admin Panel persistence (Step 8):** a free-tier or git-based backend (e.g. Supabase/Firebase free tier, or a git-committed data file) for saving content/theme/image changes — not a paid database plan.
- **Fonts/icons/animation libraries:** free/open-source only (e.g. Google Fonts, free icon sets, free animation libraries).

## How this works

Each step below builds on the last. After finishing what's asked in a step, package
the whole project so far into one linked, working set of files (every page navigable
from every other page) before moving to the next step. Don't jump ahead — wait for
confirmation between steps.

## Design identity (applies to every page, set on the Home Page and never changed after)

- Dark charcoal background with glowing orange + electric blue accents
- Modern, bold sans-serif fonts
- Premium, cinematic, hyper-realistic mood — never a generic template look
- Smooth scroll-reveal animations: elements fade and slide into view as the visitor scrolls
- Background animation: soft, blurred glowing gradient/particles that slowly drift and pulse
- **Never** use a moving line, scanning bar, or sweeping light effect — reads as distracting, not premium
- Every page must stay visually consistent with whatever is established on the Home Page

## Example persona used while drafting content: Ahmed

Ahmed is a placeholder video editor (5 years experience, edits YouTube videos/reels,
manages channels) used so every prompt below is fully filled-in and ready to send.
**Replace Ahmed's details with the real site owner's details before sending each
step's content** — name, title, tagline, numbers, services + prices, awards, and
contact info. Where a real detail isn't ready yet, use a realistic placeholder and
note it should be replaced later via the Admin Panel. The Step 1 training message and
the structure/wording of each step's design instructions don't need to change — only
personal content does.

## Step 1 — Train Claude as web developer (send first, alone)

> For this entire conversation, act as a professional web developer and UI/UX
> designer who specializes in building premium, animated portfolio websites. Build
> the complete portfolio website step by step, one page at a time, exactly in the
> order given. After each message, build only what was asked, show the result, then
> wait for the next instruction before moving on.
>
> Every time something is finished or updated, package the complete project so far
> into one single zip file, with every page properly linked through a working
> navigation menu, so there is always one complete, up-to-date set of files.
>
> Remember the exact colors, fonts, animation style, and design mood established on
> the first page, and keep using that same style consistently on every page after,
> so the finished site feels like one connected experience.
>
> Once every page is built, also build a complete, password-protected Admin Panel
> connected to all of them, for managing the whole website afterward.
>
> Confirm understanding, then wait for the first page.

## Step 2 — Home Page

Sets the entire visual identity (colors, fonts, animation, mood) — every later page
matches this one.

Sections, in order:
1. Hero — profile photo one side, name/title/tagline other side, CTA button ("View My Work"). Placeholder headshot with soft glowing border/frame for now.
2. Stats section — key numbers as animated count-up counters on scroll.
3. Short services teaser — icons + one-line descriptions.
4. Featured work — small grid of project thumbnails, hover zoom, "View Full Portfolio" button linking to the Portfolio page.
5. Testimonials — 2–3 sample client quotes in sliding cards.
6. Brand logos — smoothly sliding marquee row.
7. Closing CTA + footer with quick links and social icons.

Animation: profile photo reveals with a wipe/fade on load; sections fade+slide in one
after another on scroll; counters animate upward; thumbnails zoom/lift on hover;
testimonials auto/click-slide; logos loop endlessly. Same background-animation and
"no moving line/scanning effect" rules as above.

Ahmed's fill-in content: Video Editor & Content Creator, 5 years experience, tagline
"Turning raw footage into stories that hook", 300+ videos edited, 50+ clients, 4.9/5
average rating.

## Step 3 — Portfolio / Work Showcase Page

Full page the "View Full Portfolio" button links to; also in main nav.

- Filter tabs at top (Ahmed's categories: "YouTube Long-Form," "Short-Form Reels," "Color Grading & Sound Design")
- Responsive grid of project cards below tabs: thumbnail, title, one-line description. Placeholder thumbnails for now.
- Click a card → lightbox/expanded view (larger image + description, easy close).
- Animation: tabs smoothly highlight/reorder grid on click; cards reveal with staggered fade + slight upward movement on scroll; soft hover lift/glow per card.

## Step 4 — About Page

- Narrative layout telling the site owner's story (Ahmed: hobby editor for a friend's YouTube → fell in love with storytelling/sound design/color grading → full-time career; differentiator: builds narrative, not just cuts; mission: turn raw footage into polished, audience-growing stories).
- Animated timeline of milestones (Ahmed's: started as hobby → first paid client → 100 edited videos → managing full channels → 300+ videos/50+ clients).
- Skills section as animated progress bars/skill meters filling on scroll (Ahmed's: Video Editing, Color Grading, Sound Design, Channel Management, Short Form Reels).
- Same scroll-reveal + background animation as previous pages.

## Step 5 — Services Page

- One card per service: icon, short description, starting price. Cards reveal one after another on scroll; subtle hover lift/glow.
- Ahmed's services: YouTube Video Editing ($150/video), Short Form Reels Editing ($60/reel), Color Grading & Sound Design ($100/video), Full Channel Management ($600/month).

## Step 6 — Awards and Achievements Page

- Elegant timeline or achievement-card layout: award name, year, who gave it, why it matters. Each achievement animates into view individually on scroll.
- Ahmed's achievements: Best Editing Award 2024 (local content creators meetup); Featured Editor (recognized by a video editing software brand); Guest Speaker (video editing career talk at a local college seminar).

## Step 7 — Contact Page

- Contact details as clickable social icons (Ahmed: email ahmed.editz@gmail.com, WhatsApp on request, Instagram + YouTube).
- Contact form: Name, Email, Project Type, Budget, Message + visible submit button. Short inviting line above the form.
- Inputs subtly glow/highlight on focus. Same background/accent/scroll-reveal style.

## Step 8 — Admin Panel

Must be fully functional — every feature actually saves and updates the live site
instantly, not just look like it works.

- Login screen with working dummy credentials: `admin` / `Admin@123` (show these once ready, and flag that they must be changed before going live).
- From the panel, the owner can, with no code:
  - Edit text on Home, Portfolio, About, Services, Contact
  - Add/remove Services, including setting/updating each price
  - Add/remove Awards & Achievements
  - Add/remove Portfolio projects
  - Update contact email, WhatsApp, social links
  - Upload/change every image site-wide (profile photo, all project thumbnails in both the Home featured-work section and the full Portfolio page)
- Color theme switcher: 3–4 full site-wide themes (e.g. Midnight Blue, Charcoal Orange, Slate Purple, Emerald Dark) — switching instantly re-colors every live page, not just the admin panel.
- Clean dashboard on login, clearly labeled sections per page/feature.
- On completion: package everything (all pages + admin panel) into one final zip, plus a plain-language explanation of how to upload it to hosting and how to change the default admin password on first login.

## Step 9 — Review and polish pass

Ask Claude to review Home, Portfolio, About, Services, Awards, Contact, and the Admin
Panel together: colors/fonts/spacing/animation consistent across all pages; layout
clean on mobile, tablet, and desktop; fix anything inconsistent, broken, or
unfinished before confirming it's ready to upload.

## Step 10 — Test, then go live

Download the files, test the Admin Panel by logging in and making a small change,
then upload to real hosting per Claude's instructions. Keep a backup of the first
working version before making further changes.

## Step 11 — Swap Ahmed's details for the real owner's

Go through Steps 2–7 and replace: name/title/tagline, experience/numbers, the four
services and their prices, the three awards, and the email/WhatsApp/social links.
Missing a detail? Use "use realistic placeholder data for this and I will replace it
later" — the site owner can fill it in afterward via the Admin Panel. Step 1's
training message and every step's design/animation/sentence-structure instructions
stay as-is — only personal content changes.

## Step 12 — Fixing something that isn't working

Report format that gets a correct fix on the first try:
1. Name the exact page/section (e.g. "on the Contact Page", "Admin Panel, Services tab").
2. State expected behavior vs. actual behavior.
3. Quote any error message exactly; otherwise describe exactly what's seen.
4. Ask for a fix to that specific issue only, without touching anything already working.
5. After the fix, personally re-test that exact action, then request the updated zip.

Example (Ahmed's site): "On the Contact Page, when I click the Submit button after
filling out the form, nothing happens and no confirmation message appears. I expected
a success message to show and the form to reset after submitting. Please fix only
this specific issue without changing anything else that is already working correctly
on the rest of the website or in the Admin Panel. Once it is fixed, please give me
the updated complete zip file again."

More ready-to-adapt prompts, reusing the same structure:

> This function in my site's Admin Panel isn't working. Please check it and resolve it.

> Add a new page to my site called [page name], and make [these things] visible on it.

> Add a new feature to the Control Panel: [describe the feature].

> Add a new theme with a light color palette, and make all fonts bold.

> When I click [this function] on [this page] on my site, it doesn't work. Please check it and resolve it, without changing anything else that already works.

## Step 13 (optional/bonus) — Requesting a version of this guide for a different profession

Everything above is written around Ahmed, a video editor. To get Claude to produce an
equivalent step-by-step guide for a different profession instead of manually
reworking every step, send a prompt like:

> This document has instructions and ready-made prompts for building a complete
> portfolio website. I'm a freelance graphic designer. Please prepare a similar
> complete document for me, with this same structure and detail, so I can build my
> own graphic-design portfolio website from it.
