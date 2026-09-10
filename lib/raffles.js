import fs from "node:fs";
import path from "node:path";

const RAFFLES_DIR = path.join(process.cwd(), "data", "raffles");

export function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function listRaffleSlugs() {
  try {
    return fs
      .readdirSync(RAFFLES_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
  } catch {
    return [];
  }
}

export function getRaffle(slug) {
  try {
    const file = path.join(RAFFLES_DIR, `${slug}.json`);
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function listRaffles() {
  return listRaffleSlugs()
    .map((slug) => getRaffle(slug))
    .filter(Boolean)
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}
