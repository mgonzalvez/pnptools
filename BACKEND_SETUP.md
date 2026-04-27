# PnP Tools Submission Backend (GitHub Pages Compatible)

This site is static, so submissions should go to Google Apps Script, then GitHub Actions syncs the sheet to `data/resources.csv`.

## 1) Apps Script webhook

Deploy your Google Apps Script as a Web App (`/exec`) and have it append rows with these fields:

- `category`
- `title`
- `creator`
- `description`
- `link`
- `image`

The frontend sends JSON with those keys plus `submitted_at` and `source`.

## 2) Frontend webhook URL

Set this in `/index.html`:

```html
window.PNP_TOOLS_SUBMISSION_WEBHOOK_URL = "https://script.google.com/macros/s/AKfy.../exec";
```

## 3) Google Sheet publish URL for Actions sync

In GitHub repo settings, add repo variable:

- `GOOGLE_SHEETS_RESOURCES_CSV_URL` = your published sheet CSV URL (the `output=csv` URL)

Workflow file:

- `.github/workflows/sync-resources-from-sheets.yml`

It runs every 30 minutes (and manually via `workflow_dispatch`), normalizes headers to:

`CATEGORY,TITLE,CREATOR,DESCRIPTION,LINK,IMAGE`

and commits changes to `data/resources.csv`.
