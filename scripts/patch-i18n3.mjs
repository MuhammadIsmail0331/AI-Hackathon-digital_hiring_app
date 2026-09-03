import { readFileSync, writeFileSync } from "node:fs";
function deepMerge(t, p) {
  for (const [k, v] of Object.entries(p)) {
    if (v && typeof v === "object") { t[k] = t[k] ?? {}; deepMerge(t[k], v); } else { t[k] = v; }
  }
}
const patches = {
  "src/i18n/messages/en.json": { Jobs: { wageInvalid: "Please enter a daily wage between 100 and 100,000 PKR" } },
  "src/i18n/messages/ur.json": { Jobs: { wageInvalid: "براہِ کرم 100 سے 100,000 روپے کے درمیان روزانہ اجرت درج کریں" } },
};
for (const [path, patch] of Object.entries(patches)) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  deepMerge(json, patch);
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log("patched:", path);
}
