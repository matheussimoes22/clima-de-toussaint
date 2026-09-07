/** Copia somente arquivos públicos para a pasta de publicação existente. */
import { cp, mkdir } from "node:fs/promises";
const output = new URL("../dist/", import.meta.url);
await mkdir(output, { recursive: true });
for (const name of [
  "assets",
  "index.html",
  "clima-de-toussaint.html",
  "favicon.ico",
  "manifest.webmanifest",
  "sw.js",
]) {
  await cp(new URL(`../${name}`, import.meta.url), new URL(name, output), {
    recursive: true,
  });
}
console.log(
  "dist atualizada: publique seu conteúdo no projeto Netlify existente.",
);
