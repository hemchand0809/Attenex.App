import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import selfsigned from "selfsigned";

const certDir = join(process.cwd(), "certs");
const certPath = join(certDir, "localhost.pem");
const keyPath = join(certDir, "localhost-key.pem");

if (!existsSync(certDir)) {
  mkdirSync(certDir);
}

async function ensureCerts() {
  if (!existsSync(certPath) || !existsSync(keyPath)) {
    const attrs = [{ name: "commonName", value: "localhost" }];
    const pems = await selfsigned.generate(attrs, {
      algorithm: "sha256",
      notAfterDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      keySize: 2048,
      extensions: [
        {
          name: "subjectAltName",
          altNames: [
            { type: 2, value: "localhost" },
            { type: 7, ip: "127.0.0.1" },
            { type: 7, ip: "::1" },
          ],
        },
      ],
    });
    writeFileSync(certPath, pems.cert, "utf8");
    writeFileSync(keyPath, pems.private, "utf8");
  }
}

await ensureCerts();

export default defineConfig({
  vite: {
    base: "/Attenex.App/",
    server: {
      host: "0.0.0.0",
      port: 8080,
      strictPort: true,
      https: {
        key: readFileSync(keyPath),
        cert: readFileSync(certPath),
      },
    },
  },
});