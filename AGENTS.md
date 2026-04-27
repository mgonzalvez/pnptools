# PnP Tools - Agent Guidelines

## Project Overview

Static GitHub Pages site for browsing and submitting Print-and-Play board game tools and resources. All data is driven by a single CSV file (`data/resources.csv`). The site is purely frontend (HTML/CSS/JS) deployed to GitHub Pages, with submissions handled via Google Apps Script webhook and GitHub Actions sync.

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks)
- **Backend**: None (GitHub Pages static hosting)
- **Local dev server**: `node server.js` (runs on port 3000)
- **Data**: `data/resources.csv` (canonical source)
- **Submissions**: Google Apps Script Web App (`/exec`) -> Google Sheet -> GitHub Actions sync -> `data/resources.csv`
- **CI/CD**: GitHub Actions workflow at `.github/workflows/sync-resources-from-sheets.yml` (runs every 30 min)
- **Analytics**: Cloudflare Web Analytics

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Main browse page (all categories) |
| `martins-tools.html` | Section page - Martin's Tools |
| `free-pnp-sources.html` | Section page - Free PnP Sources |
| `pnp-groups.html` | Section page - PnP Groups |
| `pnp-stores.html` | Section page - PnP Stores |
| `pnp-tools.html` | Section page - PnP Tools |
| `formerly-on-pnparcade.html` | Section page - Formerly on PnPArcade |
| `submit.html` | Submission form page |
| `app.js` | Browse/filter/sort/render logic for all section pages |
| `submit.js` | Submission form validation + webhook logic |
| `server.js` | Local Node.js dev server (static files + POST `/api/resources`) |
| `styles.css` | Shared styles |
| `data/resources.csv` | Canonical data source (CATEGORY, TITLE, CREATOR, DESCRIPTION, LINK, IMAGE, TAGS) |
| `.github/workflows/sync-resources-from-sheets.yml` | GitHub Action that syncs Google Sheet CSV into `data/resources.csv` |

## CSV Schema (`data/resources.csv`)

Headers: `CATEGORY,TITLE,CREATOR,DESCRIPTION,LINK,IMAGE,TAGS`

- **CATEGORY**: Must match one of: `Martin's Tools`, `Free PnP Sources`, `PnP Groups`, `PnP Stores`, `PnP Tools`, `Formerly on PnPArcade`
- **TAGS**: Comma-separated tag strings (e.g. `card game, solo, free`)
- **IMAGE**: Public direct URL ending in `.jpg`, `.jpeg`, or `.png` (or relative path like `images/filename.png`)

## Architecture

### Data Flow

1. User submits via `submit.html` -> POST to Google Apps Script webhook
2. Apps Script appends row to Google Sheet
3. Google Sheet published as CSV (configured via repo variable `GOOGLE_SHEETS_RESOURCES_CSV_URL`)
4. GitHub Action downloads sheet CSV, normalizes headers, diffs against existing `data/resources.csv`
5. If changed, commits and pushes updated `data/resources.csv`
6. GitHub Pages serves updated site

### Frontend Structure

- All section pages share the same JS logic in `app.js`
- `app.js` fetches `data/resources.csv`, parses it, and renders cards based on the page's `data-default-category` attribute
- Category filtering is done client-side via `normalizeCategoryLabel()` which handles various label aliases
- Featured carousel on each section page is hardcoded in `FEATURED_BY_CATEGORY` object in `app.js`
- Tag badges on cards are clickable to filter by tag; a "Clear tag filter" button appears when active

### Submission Flow

- `submit.js` validates form client-side (URL format, blocked hosts, image extension, duplicates)
- Duplicate detection checks existing CSV for same link or same title+category
- Tags dropdown is dynamically populated from existing CSV tags
- Max 3 tags per submission
- Double-submit protection via in-flight lock + disabled button
- Webhook URL is set via `window.PNP_TOOLS_SUBMISSION_WEBHOOK_URL` in `submit.html`

## Conventions

- **No frameworks or build tools** - everything is vanilla JS/CSS/HTML
- **No `package.json`** - `server.js` uses only Node.js built-in modules (`http`, `fs`, `path`)
- **CSV parsing** is custom (hand-rolled in both `app.js` and `submit.js`) - do not introduce external CSV libraries
- **Image paths**: relative paths like `images/foo.png` are resolved with `BASE_PATH` prefix for GitHub Pages subdirectory deployment
- **Category normalization**: `normalizeCategoryLabel()` in `app.js` handles fuzzy matching of category names (e.g. "PnP Tools" / "Utilities" -> "PnP Tools")
- **Martin's Tools** is reserved - not available in the submission form dropdown
- **CSS custom properties** used for theming (e.g. `--muted`)
- **Font**: Space Grotesk from Google Fonts

## Running Locally

```bash
node server.js
# Open http://127.0.0.1:3000
```

## Adding a Resource

- **Via form**: Use `submit.html` (validates and sends to Google Sheet)
- **Direct CSV edit**: Edit `data/resources.csv` manually (bypasses validation, use for bulk edits)
- **After CSV change**: Commit and push; the site updates automatically via GitHub Pages

## Modifying Featured Carousel

Edit the `FEATURED_BY_CATEGORY` object in `app.js`. Each category has an array of featured items with: `title`, `description`, `why`, `link`, `image`.

## GitHub Secrets/Variables

- `GOOGLE_SHEETS_RESOURCES_CSV_URL` (repo variable): Published Google Sheet CSV URL for the sync workflow

## Important Constraints

- Site is static - no server-side rendering or database
- All section pages are separate HTML files but share `app.js` logic
- CSV is the single source of truth - all data flows through it
- The GitHub Action normalizes headers flexibly (aliases like "TYPE" -> "CATEGORY", "NAME" -> "TITLE", etc.)
- Images must be public direct URLs (blocked hosts: Google Drive, Dropbox, OneDrive, iCloud, Mega, Facebook, localhost)
