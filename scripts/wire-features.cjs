/* Post-regionals wiring — idempotent. Chat + My Photos into mobile nav, Nav i18n keys, docs. */
const fs = require("fs"), path = require("path");
const R = p => path.join(process.cwd(), p);
const read = p => fs.existsSync(R(p)) ? fs.readFileSync(R(p), "utf8") : null;
const write = (p, c) => { fs.writeFileSync(R(p), c, "utf8"); console.log("WROTE: " + p); };

console.log("== 1. MobileNav items ==");
{
  const p = "src/components/layout/MobileNav.tsx";
  const before = read(p);
  if (!before) { console.log("FAIL: MobileNav.tsx missing"); process.exit(1); }
  let s = before;
  const hasHref = (src, h) => src.includes('"' + h + '"') || src.includes("'" + h + "'");
  const cloneItemAfter = (src, anchorHref, href, labelKey) => {
    if (hasHref(src, href)) return [src, "skip"];
    const re = new RegExp('(\\{[^{}]*href:\\s*"' + anchorHref + '"[^{}]*\\})');
    const m = src.match(re);
    if (!m) return [src, "noanchor:" + anchorHref];
    const item = m[1]
      .split(anchorHref).join(href)
      .replace(/(\w+)\("([^"]+)"\)/, '$1("' + labelKey + '")');
    return [src.replace(re, m[1] + ",\n      " + item), item];
  };
  const log = [];
  let r;
  [s, r] = cloneItemAfter(s, "/worker/my-jobs", "/chat", "chat");
  log.push("workerChat=" + (r === "skip" ? "skip" : String(r).startsWith("noanchor") ? r : "ok"));
  [s, r] = cloneItemAfter(s, "/worker/my-jobs", "/worker/media", "media");
  log.push("workerMedia=" + (r === "skip" ? "skip" : String(r).startsWith("noanchor") ? r : "ok"));
  [s, r] = cloneItemAfter(s, "/employer/jobs", "/chat", "chat");
  log.push("employerChat=" + (r === "skip" ? "skip" : String(r).startsWith("noanchor") ? r : "ok"));
  console.log(log.join(" | "));
  if (s !== before) {
    write(p, s);
    const i = s.indexOf('"/chat"');
    console.log("SNIPPET: " + s.slice(Math.max(0, i - 140), i + 70).replace(/\n/g, " ~ "));
  } else console.log("OK: MobileNav already wired");
}

console.log("== 2. Nav i18n keys ==");
for (const [f, kv] of [
  ["messages/en.json", { chat: "Chat", media: "My Photos" }],
  ["messages/ur.json", { chat: "چیٹ", media: "میری تصاویر" }],
]) {
  try {
    const j = JSON.parse(read(f));
    if (!j.Nav) j.Nav = {};
    let ch = false;
    for (const [k, v] of Object.entries(kv)) if (j.Nav[k] === undefined) { j.Nav[k] = v; ch = true; }
    if (ch) write(f, JSON.stringify(j, null, 2) + "\n"); else console.log("OK: " + f);
  } catch (e) { console.log("FAIL " + f + ": " + e.message); }
}

console.log("== 3. Docs ==");
{
  const d = "docs/ROADMAP.md";
  let s = read(d) || "";
  if (!s.includes("Post-Regionals Round 2")) {
    const today = new Date().toISOString().slice(0, 10);
    s += "\n| " + today + " | **Post-Regionals Round 2** — Chat and My-Photos entries added to the mobile bottom nav (both roles) + Nav i18n keys (EN/UR). `/worker/media` hosts avatar & portfolio uploads; `/chat` hosts direct threads + AI support bot. Still queued: LocationMap section inside media page, photo attach in job form, portfolio display on public profiles. |\n";
    write(d, s);
  } else console.log("OK: ROADMAP already updated");
}
console.log("DONE");