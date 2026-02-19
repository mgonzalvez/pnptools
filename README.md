# PnP Tools

Static GitHub Pages site for browsing and submitting Print-and-Play tools/resources.

## Current Features

- CSV-driven resource directory (`data/resources.csv`)
- Responsive card layout with:
  - Image
  - Category tag
  - Title
  - Description
  - External link
- Search by title/description/category text
- Sort options:
  - Title A-Z
  - Title Z-A
  - Category A-Z
- Single top nav strip with category filters:
  - All
  - Martin's Tools
  - Free PnP Sources
  - PnP Groups
  - PnP Stores
  - PnP Tools
- Tools dropdown menu (PnPFinder, PnP Launchpad, Card Formatter, Card Extractor)
- Dedicated submission page (`submit.html`)
- Favicons from `/images/favicon.png` + `/images/favicon.ico`
- Cloudflare Web Analytics on browse + submit pages

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

Submission UX:

- Success message with reference ID
- Failure message with reference ID
- Diagnostics block with endpoint/time/payload for webmaster troubleshooting

## Data/Sync Flow

- Form submits to Google Apps Script Web App (`/exec`)
- Sheet data is published as CSV
- GitHub Action syncs sheet CSV into `data/resources.csv`
  - Workflow: `.github/workflows/sync-resources-from-sheets.yml`

See also: `BACKEND_SETUP.md`

## Project Structure

- `index.html` - browse page
- `submit.html` - submission page
- `app.js` - browse/filter/sort/render logic
- `submit.js` - submission + validation logic
- `styles.css` - shared styles
- `data/resources.csv` - source data displayed on site
- `images/` - local images and favicon files
