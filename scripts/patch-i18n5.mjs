import { readFileSync, writeFileSync } from "node:fs";
function deepMerge(t, p) {
  for (const [k, v] of Object.entries(p)) {
    if (v && typeof v === "object") { t[k] = t[k] ?? {}; deepMerge(t[k], v); } else { t[k] = v; }
  }
}
const patches = {
  "src/i18n/messages/en.json": {
    Jobs: {
      aiTitle: "AI Job Assistant",
      aiHint: "Describe the job in your own words - AI fills the form for you.",
      aiPlaceholder: "e.g. Need an electrician tomorrow morning in Lahore for wiring, 3500 per day, 2 workers",
      aiButton: "Fill with AI",
      aiWorking: "Thinking...",
      aiApplied: "Fields filled - please review before posting",
      aiError: "AI could not read that - please fill the form manually",
      wageTypical: "Typical: PKR {min}-{max}/day (from {count} jobs)",
      fairWage: "Fair Wage",
    },
  },
  "src/i18n/messages/ur.json": {
    Jobs: {
      aiTitle: "AI نوکری اسسٹنٹ",
      aiHint: "کام اپنے الفاظ میں بیان کریں - AI آپ کے لیے فارق بھر دے گا۔",
      aiPlaceholder: "مثال کے طور پر: کل صبح لاہور میں وائرنگ کے لیے الیکٹریشن چاہیے، 3500 روپے روز، 2 مزدور",
      aiButton: "AI سے بھریں",
      aiWorking: "سوچ رہا ہے...",
      aiApplied: "فیلڈز بھر دیے گئے ہیں - پوسٹ کرنے سے پہلے جانچ لیں",
      aiError: "AI یہ نہیں پڑھ سکا - فارق خود بھریں",
      wageTypical: "عام: روز {min} تا {max} روپے ({count} کاموں سے)",
      fairWage: "منصفانہ اجرت",
    },
  },
};
for (const [path, patch] of Object.entries(patches)) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  deepMerge(json, patch);
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log("patched:", path);
}
