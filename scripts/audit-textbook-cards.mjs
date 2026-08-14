import fs from "node:fs/promises";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(scriptDir, "..");
const source = await fs.readFile(path.join(siteDir, "textbook-data.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context);
const data = context.window.DSE_TEXTBOOK_DATA;

const failures = [];
for (const language of ["eng", "chn"]) {
  const points = data.languages[language];
  if (points.length !== 365) failures.push(`${language}: expected 365 cards, found ${points.length}`);
  const sequences = new Set(points.map((point) => point.sequence));
  if (sequences.size !== 365) failures.push(`${language}: duplicate or missing sequence numbers`);
  for (const point of points) {
    if (!point.content?.trim()) failures.push(`${language} #${point.sequence}: empty content`);
    if (/Precise formula:/i.test(point.formula || "")) failures.push(`${language} #${point.sequence}: OCR label leaked into formula`);
    if (/[\uFFFD]/.test(`${point.content}${point.formula || ""}${point.formula_notes || ""}`)) failures.push(`${language} #${point.sequence}: replacement character`);
  }
}

const english = data.languages.eng;
const normalized = english.filter((point) => point.formula);
if (normalized.length !== 205) failures.push(`eng: expected 205 normalized formula cards, found ${normalized.length}`);
for (const sequence of [16, 239]) {
  const point = english.find((item) => item.sequence === sequence);
  if (!point?.formula || !point?.formula_notes) failures.push(`eng #${sequence}: normalized formula or notation missing`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("PASS: 730 bilingual cards checked; 205 English formula cards use normalized formula blocks.");
}
