# PnP Tools

Static GitHub Pages site for browsing and submitting Print-and-Play tools/resources.

## Local Development

No installation or build step is required. Start the dependency-free Node.js
server:

```bash
node server.js
```

Then open `http://127.0.0.1:3000`.

The submission page is configured with the production Google Apps Script
webhook. A local form submission therefore creates a real production
submission; avoid using the submit button for test data.

## Current Features

- CSV-driven resource directory (`data/resources.csv`)
- Multi-page section URLs (all driven by the same CSV):
  - `index.html` (All)
  - `martins-tools.html`
  - `free-pnp-sources.html`
  - `pnp-groups.html`
  - `pnp-stores.html`
  - `pnp-tools.html`
  - `formerly-on-pnparcade.html`
- Responsive card layout with:
  - Image
  - Title
  - Description
  - Tag badges (from CSV `TAGS`)
  - External link
- Search by title/description/category/tag text
- Sort options:
  - Title A-Z
  - Title Z-A
  - Category A-Z
- Single top nav strip with section links:
  - All
  - Martin's Tools
  - Free PnP Sources
  - PnP Groups
  - PnP Stores
  - PnP Tools
  - Formerly on PnPArcade
- Tools dropdown menu:
  - PnPFinder
  - PnP Launchpad
  - Card Formatter
  - Card Extractor
  - Prototyper
- Featured carousel on section pages (5-second auto-rotate):
  - Clickable slides
  - Curated title + description + "why it stands out"
- Clickable tag badges on cards:
  - Clicking a badge filters current page by that tag
  - Clicking active badge again clears tag filter
  - Dedicated `Clear tag filter` control appears when a tag filter is active
- Dedicated submission page (`submit.html`)
- Favicons from `/images/favicon.png` + `/images/favicon.ico`
- Cloudflare Web Analytics on browse + submit pages
- Shared Gonzhome visual system:
  - Responsive branded header
  - Related Sites menu
  - Persisted light/dark theme with system fallback
  - Layered glass surfaces and elevated resource cards

## Submission Form

Submission form is on `submit.html` and sends to a Google Apps Script Web App URL.

Validation rules:

- Required:
  - Category
  - Title
  - Description
  - Link
  - Image URL
- Link must be a valid public `http(s)` URL
- Image URL must be a public direct image URL ending in `.jpg`, `.jpeg`, or `.png`
- Blocks common non-public sources (e.g. Drive/Dropbox/OneDrive/Facebook/local URLs)
- Duplicate protection against existing site data:
  - Same link, or
  - Same title + category
- Optional tags field:
  - Multi-select populated from existing CSV tags
  - Max 3 tags per submission
- Category list includes:
  - Free PnP Sources
  - PnP Groups
  - PnP Stores
  - PnP Tools
  - Formerly on PnPArcade
  - (`Martin's Tools` is reserved and not available in submit dropdown)

Submission UX:

- Concise success/failure messaging
- Double-submit guarded (in-flight lock + disabled submit button)

## Data/Sync Flow

- Form submits to Google Apps Script Web App (`/exec`)
- Sheet data is published as CSV
- GitHub Action syncs sheet CSV into `data/resources.csv`
  - Workflow: `.github/workflows/sync-resources-from-sheets.yml`
  - Sync includes `TAGS` column

Canonical CSV headers:

```text
CATEGORY,TITLE,CREATOR,DESCRIPTION,LINK,IMAGE,TAGS
```

`CREATOR` is supported by the data schema but is not currently collected by the
submission form. See `BACKEND_SETUP.md` for webhook, sheet, and repository
variable configuration.

## Project Structure

- `index.html` - browse page
- `martins-tools.html` - section page
- `free-pnp-sources.html` - section page
- `pnp-groups.html` - section page
- `pnp-stores.html` - section page
- `pnp-tools.html` - section page
- `formerly-on-pnparcade.html` - section page
- `submit.html` - submission page
- `app.js` - browse/filter/sort/render logic
- `site-ui.js` - shared header, related-sites menu, and theme behavior
- `submit.js` - submission + validation logic
- `server.js` - dependency-free local static server
- `styles.css` - shared styles
- `data/resources.csv` - source data displayed on site
- `images/` - local images and favicon files
- `.github/workflows/sync-resources-from-sheets.yml` - scheduled sheet-to-CSV sync
- `BACKEND_SETUP.md` - production submission and sync setup
