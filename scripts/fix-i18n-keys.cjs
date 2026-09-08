/* BOM-safe i18n key fixer: scans touched files for t("key") usage per namespace,
   adds any missing keys to en.json + ur.json (Urdu map, else English fallback). */
const fs = require("fs");
const UR = { chat: "چیٹ", media: "میڈیا", title: "عنوان", subtitle: "ذیلی عنوان", send: "بھیجیں", placeholder: "پیغام لکھیں…", empty: "ابھی کوئی پیغام نہیں", you: "آپ", support: "سپورٹ", ai: "AI اسسٹنٹ", portfolio: "پورٹ فولیو", photos: "تصاویر", add: "شامل کریں", save: "محفوظ کریں", cancel: "منسوخ", description: "تفصیل", upload: "اپ لوڈ", remove: "ہٹائیں", back: "واپس", loading: "لوڈ ہو رہا ہے…", error: "خرابی", retry: "دوبارہ کوشش", messages: "پیغامات", photo: "تصویر", location: "مقام", gallery: "گیلری", work: "کام" };
const targets = ["src/components/layout/MobileNav.tsx", "src/components/layout/AutoNav.tsx", "src/app/[locale]/chat/page.tsx", "src/app/[locale]/worker/media/page.tsx", "src/app/[locale]/worker/profile/edit/page.tsx"];
const load = (f) => { const s = fs.readFileSync(f, "utf8").replace(/^\uFEFF/, ""); return JSON.parse(s); };
const en = load("src/i18n/messages/en.json");
const ur = load("src/i18n/messages/ur.json");
const human = (k) => k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
let addedEn = 0, addedUr = 0, warns = [];
for (const file of targets) {
  if (!fs.existsSync(file)) { warns.push("MISSING FILE: " + file); continue; }
  const src = fs.readFileSync(file, "utf8");
  const nsList = [...src.matchAll(/useTranslations\("([^"]+)"\)/g)].map((m) => m[1]);
  const dynamic = /useTranslations\((?!["])/.test(src);
  if (!nsList.length && dynamic) warns.push("DYNAMIC NS: " + file);
  const ns = nsList[0] || "Common";
  const keys = [...new Set([...src.matchAll(/\b(?:t|nav)\("([A-Za-z0-9_.]+)"\)/g)].map((m) => m[1]))];
  for (const key of keys) {
    const parts = key.includes(".") ? key.split(".") : [key];
    const enRef = () => parts.reduce((o, p) => (o && typeof o === "object" ? o[p] : undefined), en);
    const urRef = () => parts.reduce((o, p) => (o && typeof o === "object" ? o[p] : undefined), ur);
    const setIn = (obj, val) => { let o = obj; for (let i = 0; i < parts.length - 1; i++) { if (typeof o[parts[i]] !== "object" || o[parts[i]] === null) o[parts[i]] = {}; o = o[parts[i]]; } if (typeof o[parts[parts.length - 1]] !== "string") o[parts[parts.length - 1]] = val; };
    const enVal = human(parts[parts.length - 1]);
    if (enRef() === undefined) { setIn(en, enVal); addedEn++; }
    if (urRef() === undefined) { setIn(ur, UR[parts[parts.length - 1]] || enVal); addedUr++; }
  }
}
for (const [f, obj] of [["src/i18n/messages/en.json", en], ["src/i18n/messages/ur.json", ur]]) {
  JSON.parse(JSON.stringify(obj)); // sanity
  fs.writeFileSync(f, JSON.stringify(obj, null, 2) + "\n", "utf8");
  JSON.parse(fs.readFileSync(f, "utf8")); // validity gate
}
console.log("ADDED en=" + addedEn + " ur=" + addedUr);
if (warns.length) console.log("WARN:\n" + warns.join("\n"));
console.log("JSON-VALID both locales");
