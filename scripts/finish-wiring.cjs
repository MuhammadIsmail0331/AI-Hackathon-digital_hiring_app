/* finish-wiring.cjs — idempotent: BOM-safe i18n key ensure + missing Link import fix */
const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();

function walk(d, out = []) {
  let es;
  try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return out; }
  for (const e of es) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(e.name) && !e.name.endsWith(".d.ts")) out.push(p);
  }
  return out;
}
const files = [...walk(path.join(ROOT, "src", "app")), ...walk(path.join(ROOT, "src", "components"))];

/* ---- 1. Fix files that render <Link> without importing it ---- */
let linkFixes = 0;
for (const f of files) {
  if (!f.endsWith(".tsx")) continue;
  let s = fs.readFileSync(f, "utf8");
  if (!/<Link\b/.test(s)) continue;
  if (/import\s*\{[^}]*\bLink\b[^}]*\}\s*from/.test(s)) continue;
  const nav = s.match(/import\s*\{([^}]*)\}\s*from\s*["']@\/i18n\/navigation["'];?/);
  if (nav) {
    const names = nav[1].split(",").map((x) => x.trim()).filter(Boolean);
    if (!names.includes("Link")) names.push("Link");
    s = s.replace(nav[0], `import { ${names.join(", ")} } from "@/i18n/navigation";`);
  } else if (/^\s*["']use client["'];?\s*$/m.test(s)) {
    s = s.replace(/^(\s*["']use client["'];?\s*\n)/, `$1import { Link } from "@/i18n/navigation";\n`);
  } else {
    s = `import { Link } from "@/i18n/navigation";\n` + s;
  }
  fs.writeFileSync(f, s, "utf8");
  linkFixes++;
  console.log("link-import fixed:", path.relative(ROOT, f));
}

/* ---- 2. Ensure every used (namespace, key) exists in en.json + ur.json ---- */
function findMsgDir() {
  for (const c of ["src/i18n/messages", "src/messages", "messages", "i18n/messages"]) {
    const p = path.join(ROOT, c);
    if (fs.existsSync(path.join(p, "en.json"))) return p;
  }
  return null;
}
const dir = findMsgDir();
if (!dir) { console.log("NO-MSG-DIR-FOUND"); process.exit(1); }
console.log("messages dir:", path.relative(ROOT, dir));

const load = (p) => {
  let s = fs.readFileSync(p, "utf8");
  const bom = s.charCodeAt(0) === 0xfeff;
  if (bom) s = s.slice(1);
  return { bom, j: JSON.parse(s) };
};
const save = (p, bom, j) => fs.writeFileSync(p, (bom ? "\uFEFF" : "") + JSON.stringify(j, null, 2) + "\n", "utf8");
function setPath(j, dotted, val) {
  const parts = dotted.split(".");
  let o = j;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof o[parts[i]] !== "object" || !o[parts[i]]) o[parts[i]] = {};
    o = o[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (o[last] !== undefined) return false;
  o[last] = val;
  return true;
}

/* Collect namespace -> keys actually used via t("...") */
const nsKeys = {};
for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  const nss = [...s.matchAll(/useTranslations\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
  if (!nss.length) continue;
  const keys = [...s.matchAll(/[^.\w$]t\(\s*["']([^"']+)["']\s*[,)]/g)].map((m) => m[1]);
  for (const ns of nss) {
    (nsKeys[ns] = nsKeys[ns] || new Set());
    for (const k of keys) nsKeys[ns].add(k);
  }
}

const UR = { "Nav.chat": "چیٹ", "Nav.media": "میڈیا", "Chat.title": "چیٹ", "Chat.support": "سپورٹ" };
const human = (k) => k.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ").replace(/^./, (c) => c.toUpperCase());
let total = 0;
for (const loc of ["en", "ur"]) {
  const p = path.join(dir, loc + ".json");
  const { bom, j } = load(p);
  let n = 0;
  const ensure = (dotted, val) => { if (setPath(j, dotted, val)) { n++; console.log("+ " + loc + "." + dotted); } };
  ensure("Nav.chat", loc === "ur" ? "چیٹ" : "Chat");
  ensure("Nav.media", loc === "ur" ? "میڈیا" : "Media");
  for (const [ns, keys] of Object.entries(nsKeys)) {
    for (const k of keys) {
      const dotted = ns + "." + k;
      ensure(dotted, loc === "ur" ? (UR[dotted] || human(k)) : human(k));
    }
  }
  save(p, bom, j);
  JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "")); // validity gate
  total += n;
  console.log(loc + ".json: +" + n + " keys (valid JSON ok)");
}
console.log("DONE linkFixes=" + linkFixes + " keysAdded=" + total);