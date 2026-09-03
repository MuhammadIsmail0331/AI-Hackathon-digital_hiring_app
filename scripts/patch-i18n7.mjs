import { readFileSync, writeFileSync } from "node:fs";
function deepMerge(t, p) {
  for (const [k, v] of Object.entries(p)) {
    if (v && typeof v === "object") { t[k] = t[k] ?? {}; deepMerge(t[k], v); } else { t[k] = v; }
  }
}
const patches = {
  "src/i18n/messages/en.json": { Nav: { findPro: "Find Professionals" } },
  "src/i18n/messages/ur.json": { Nav: { findPro: "پیشہ ور تلاش کریں" } },
};
for (const [path, patch] of Object.entries(patches)) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  deepMerge(json, patch);
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log("patched:", path);
}
