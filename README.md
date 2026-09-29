# Portfolio Website

A premium, animated portfolio website with a password-protected Admin Panel.
Built per the plan in [CLAUDE.md](CLAUDE.md).

## Running it locally

1. Install [Node.js](https://nodejs.org/) (v18 or newer) if you don't already have it.
2. Open a terminal in this folder and run:
   ```
   npm install
   npm start
   ```
3. Open **http://localhost:3000** in your browser for the live site.
4. Open **http://localhost:3000/admin.html** to manage the site.

Every page, the animations, and the Admin Panel all run from this one local
server — no paid services, accounts, or sign-ups are needed to try it.

## Admin Panel login

- **Username:** `admin`
- **Password:** `Admin@123`

Change this password immediately in the Admin Panel under **Account & Security**
before this site is shown to anyone else or put online. The panel will keep
reminding you until you do.

## What's editable from the Admin Panel

- All Home Page text, the profile photo, stats, services teaser, featured work
  selection, testimonials, and brand logos
- Portfolio categories and every project (title, category, description, thumbnail) — add, edit, delete
- The About page story, timeline, and skill meters
- Services — add, edit, delete, including price
- Awards & Achievements — add, edit, delete
- Contact details (email, WhatsApp, Instagram, YouTube)
- Contact form submissions (view and delete)
- The site-wide color theme (4 options) — changes every page instantly
- The admin password

All of this saves to `server/data/db.json` immediately — there's no separate
"publish" step.

## Current content status

The site now runs on Rohaanullah Khan's real name, services, and real email
(`rohanullahllc@gmail.com`). Still placeholder, pending real info (editable anytime
through the Admin Panel, no code needed):

- Tagline, years of experience, and stats are estimates — update once you have real numbers
- About page story, timeline, and skills are a plausible draft — personalize the wording
- Service prices are placeholder market rates — adjust to your real pricing
- Portfolio projects are generic placeholders — replace with real project titles, descriptions, and thumbnails
- Awards & Achievements are placeholders — replace with real ones once you have them, or remove
- WhatsApp number and Instagram/YouTube links are unset placeholders

## Going live for free

This site is deployed on three services, all genuinely free forever and **none
of them require a credit card**:

| Piece | Service | Why |
|---|---|---|
| Hosting (runs the app) | [Render](https://render.com) free web service | Well-established, no card required, free subdomain + HTTPS |
| Content database | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) free M0 cluster | Render's free tier wipes local files on every restart — Atlas keeps your content safe permanently |
| Image uploads | [Cloudinary](https://cloudinary.com/users/register/free) free tier | Same reason — uploaded images need to live somewhere that survives restarts |

Locally, none of this matters — the app just uses the local `server/data/db.json`
file and saves uploads to disk, exactly as before. The cloud services only
activate once their connection details are set as environment variables in
Render.

### One-time setup (steps only you can do — they need your email/account)

1. **Create a free MongoDB Atlas account** at the link above → create a free
   M0 cluster → create a database user (any username/password — save the
   password somewhere) → under "Network Access," allow access from anywhere
   (`0.0.0.0/0`) → get your connection string (Atlas calls this the "connection
   string" or "driver connection URI"), which looks like
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/`.
2. **Create a free Cloudinary account** at the link above → on your Cloudinary
   dashboard, copy the **API Environment variable**, which looks like
   `cloudinary://<api_key>:<api_secret>@<cloud_name>`.
3. **Create a free GitHub account** (if you don't have one) at
   [github.com](https://github.com) → create a new empty repository (any name,
   e.g. `portfolio-website`).
4. **Create a free Render account** at the link above, signing up with your
   GitHub account so it can access your repo.

### Deploying

Once you have the MongoDB connection string, the Cloudinary URL, and a GitHub
repo ready, tell Claude and it will push the code and walk through connecting
it on Render (using the included `render.yaml`, Render auto-detects the service
— you'll just paste the `MONGODB_URI` and `CLOUDINARY_URL` values into Render's
dashboard when prompted, so they're never stored in the code itself).

After the first deploy, change the default admin password immediately (Account
& Security in the Admin Panel) — it's now reachable by anyone with the URL.

## Project structure

```
server/           Express backend, JSON data store, API routes
public/           Static frontend: HTML pages, CSS, client-side JS, images
public/images/uploads/   Images you upload through the Admin Panel land here
scripts/          One-off helper scripts (placeholder image generation)
```
