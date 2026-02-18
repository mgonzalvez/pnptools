const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const HOST = "127.0.0.1";
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const CSV_PATH = path.join(ROOT_DIR, "data", "resources.csv");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/resources") {
      await handleCreateResource(req, res);
      return;
    }

    if (req.method === "GET") {
      await serveStatic(req, res);
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (err) {
    sendJson(res, 500, { error: "Server error.", detail: String(err.message || err) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

async function handleCreateResource(req, res) {
  const bodyText = await readBody(req);
  let payload;
  try {
    payload = JSON.parse(bodyText || "{}");
  } catch (_) {
    sendJson(res, 400, { error: "Invalid JSON body." });
    return;
  }

  const row = {
    category: sanitize(payload.category),
    title: sanitize(payload.title),
    creator: sanitize(payload.creator),
    description: sanitize(payload.description),
    link: sanitize(payload.link),
    image: sanitize(payload.image)
  };

  if (!row.category || !row.title || !row.description || !row.link) {
    sendJson(res, 400, { error: "Missing required fields: category, title, description, link." });
    return;
  }

  if (!isValidHttpUrl(row.link) || (row.image && !isValidHttpUrl(row.image))) {
    sendJson(res, 400, { error: "Link and image must be valid http(s) URLs." });
    return;
  }

  const line = toCsvLine([
    row.category,
    row.title,
    row.creator,
    row.description,
    row.link,
    row.image
  ]);

  await fs.appendFile(CSV_PATH, `\n${line}`, "utf8");
  sendJson(res, 201, { ok: true });
}

async function serveStatic(req, res) {
  const pathname = new URL(req.url, `http://${HOST}:${PORT}`).pathname;
  const requestPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(ROOT_DIR, `.${requestPath}`);
  const rootPath = path.resolve(ROOT_DIR);

  if (!filePath.startsWith(rootPath + path.sep)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  } catch (_) {
    sendText(res, 404, "Not found");
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
      if (Buffer.concat(chunks).length > 1_000_000) {
        reject(new Error("Request body too large."));
      }
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function toCsvLine(values) {
  return values.map(escapeCsvCell).join(",");
}

function escapeCsvCell(value) {
  const text = String(value || "");
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
}

function sanitize(value) {
  return String(value || "").trim();
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(payload);
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}
