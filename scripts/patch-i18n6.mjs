import { readFileSync, writeFileSync } from "node:fs";
function deepMerge(t, p) {
  for (const [k, v] of Object.entries(p)) {
    if (v && typeof v === "object") { t[k] = t[k] ?? {}; deepMerge(t[k], v); } else { t[k] = v; }
  }
}
const patches = {
  "src/i18n/messages/en.json": {
    Profile: {
      savedToast: "Profile saved",
      myProfessions: "My professions",
      addProfession: "Add profession",
      editProfession: "Edit",
      professionLocked: "Profession is locked when editing - add a new profession instead",
      limitReached: "You can add up to 3 professions",
    },
    Nav: { modeWork: "Find Work", modeHire: "Hire" },
  },
  "src/i18n/messages/ur.json": {
    Profile: {
      savedToast: "پروفائل محفوظ ہو گئی",
      myProfessions: "میرے پیشے",
      addProfession: "پیشہ شامل کریں",
      editProfession: "ترمیم",
      professionLocked: "ترمیم کے دوران پیشہ مقفل ہے - نئی پیشہ شامل کریں",
      limitReached: "آپ 3 پیشے تک شامل کر سکتے ہیں",
    },
    Nav: { modeWork: "کام تلاش کریں", modeHire: "مزدور تلاش کریں" },
  },
};
for (const [path, patch] of Object.entries(patches)) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  deepMerge(json, patch);
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log("patched:", path);
}
