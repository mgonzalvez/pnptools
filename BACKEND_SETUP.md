# PnP Tools Submission Backend

PnP Tools is hosted as a static GitHub Pages site. Production submissions follow
this path:

`submit.html` → Google Apps Script → Google Sheet → GitHub Actions → `data/resources.csv`

## 1. Google Sheet

Create a sheet with columns that can be normalized to the canonical CSV schema:

```text
CATEGORY,TITLE,CREATOR,DESCRIPTION,LINK,IMAGE,TAGS
```

`CREATOR` is part of the canonical schema but is not currently collected by the
submission form, so form submissions may leave it blank. `TAGS` contains a
comma-separated list of up to three tags.

The sync workflow accepts these header aliases:

| Canonical header | Accepted aliases |
| --- | --- |
| `CATEGORY` | `CATEGORY`, `TYPE` |
| `TITLE` | `TITLE`, `NAME` |
| `CREATOR` | `CREATOR`, `AUTHOR` |
| `DESCRIPTION` | `DESCRIPTION`, `DESC` |
| `LINK` | `LINK`, `URL`, `WEBSITE` |
| `IMAGE` | `IMAGE`, `IMG`, `THUMBNAIL` |
| `TAGS` | `TAGS`, `TAGS LIST`, `LABELS` |

Publish the sheet as CSV and retain its public `output=csv` URL.

## 2. Apps Script webhook

Deploy the Google Apps Script as a Web App with an `/exec` URL. Its `doPost`
handler must parse the request body as JSON and append the submitted values to
the corresponding sheet columns.

The frontend sends:

```json
{
  "submitted_at": "2026-01-01T00:00:00.000Z",
  "source": "pnp-tools",
  "category": "PnP Tools",
  "title": "Example resource",
  "description": "Short description",
  "link": "https://example.com",
  "image": "https://example.com/image.png",
  "tags": "cards, layout"
}
```

The request uses `Content-Type: text/plain;charset=utf-8` and `mode: no-cors`
for Google Apps Script compatibility. The browser can confirm that the request
was sent, but it cannot inspect the Apps Script response.

## 3. Frontend webhook URL

Set the deployed Apps Script URL in `submit.html`:

```html
<script>
  window.PNP_TOOLS_SUBMISSION_WEBHOOK_URL =
    "https://script.google.com/macros/s/AKfy.../exec";
</script>
```

Do not place this configuration in `index.html`; the submission logic is loaded
only by `submit.html`.

## 4. GitHub Actions sync

In the GitHub repository settings, add this Actions repository variable:

```text
GOOGLE_SHEETS_RESOURCES_CSV_URL=https://docs.google.com/...&output=csv
```

The workflow at `.github/workflows/sync-resources-from-sheets.yml`:

1. Runs every 30 minutes and supports manual `workflow_dispatch` runs.
2. Downloads the published sheet CSV.
3. Normalizes aliases and column order to the seven canonical headers.
4. Rejects a header mismatch or a file with no data rows.
5. Commits and pushes `data/resources.csv` only when its content changed.

The workflow needs `contents: write`, which is declared in the workflow file.

## Local development

Start the dependency-free development server:

```bash
node server.js
```

Open `http://127.0.0.1:3000`.

The checked-in `submit.html` contains the production webhook URL, so submitting
the form during local development sends a real production submission. Avoid
testing the submit button unless that is intentional.
