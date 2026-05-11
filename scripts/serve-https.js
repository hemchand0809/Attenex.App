import https from "https";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const distDir = path.join(appRoot, "dist");
const certDir = path.join(appRoot, "certs");
const certPath = path.join(certDir, "localhost.pem");
const keyPath = path.join(certDir, "localhost-key.pem");

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.error("Certificate files not found. Run npm run dev:https once or generate certs first.");
  process.exit(1);
}

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

const server = https.createServer(options, (req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end("Bad Request");
    return;
  }

  const requestedUrl = decodeURIComponent(req.url.split("?")[0]);
  let filePath = path.join(distDir, requestedUrl);

  if (requestedUrl.endsWith("/")) {
    filePath = path.join(filePath, "index.html");
  }

  if (!filePath.startsWith(distDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, "index.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end("Internal Server Error");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
});

const port = parseInt(process.env.PORT || "8443", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`HTTPS server running at https://localhost:${port}/`);
  console.log(`Network URLs:`);
  const interfaces = Object.values(os.networkInterfaces()).flat();
  for (const detail of interfaces) {
    if (detail && detail.family === "IPv4" && !detail.internal) {
      console.log(`  https://${detail.address}:${port}/`);
    }
  }
});
