import { readFileSync, writeFileSync } from "node:fs";

const patches = {
  "src/i18n/messages/en.json": {
    Landing: {
      featureVerifiedTitle: "Verified & Secure",
      featureVerifiedDesc:
        "Every account verifies its phone with OTP. Ratings and escrow keep both sides honest.",
      featureMatchingTitle: "AI That Matches",
      featureMatchingDesc:
        "Tell us the job once — our matching engine finds the best-rated workers within 50 km and sends them your offer.",
      featurePaymentTitle: "Protected Payments",
      featurePaymentDesc:
        "Wages sit in escrow from the moment a worker accepts until the job is done. Released only when everyone agrees.",
      chipVerified: "OTP verified",
      chipEscrow: "Escrow protected",
      chipRated: "Rated workers",
    },
  },
  "src/i18n/messages/ur.json": {
    Landing: {
      featureVerifiedTitle: "تصدیق شدہ اور محفوظ",
      featureVerifiedDesc:
        "ہر اکاؤنٹ OTP سے فون نمبر تصدیق کرتا ہے۔ درجہ بندی اور اسکرو دونوں طرف کو ایماندار رکھتے ہیں۔",
      featureMatchingTitle: "AI میچنگ",
      featureMatchingDesc:
        "کام ایک بار بتائیں — ہمارا میچنگ انجن 50 کلومیٹر کے دائرے میں بہترین درجہ بندی والے مزدور تلاش کر کے انہیں آپ کی پیشکش بھیجتا ہے۔",
      featurePaymentTitle: "محفوظ ادائیگی",
      featurePaymentDesc:
        "مزدور کے قبول کرنے سے لے کر کام مکمل ہونے تک اجرت اسکرو میں محفوظ رہتی ہے۔ سب متفق ہوں تو ہی رہا ہوتی ہے۔",
      chipVerified: "OTP تصدیق شدہ",
      chipEscrow: "اسکرو محفوظ",
      chipRated: "درجہ بندی والے مزدور",
    },
  },
};

function deepMerge(target, patch) {
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      target[k] = target[k] && typeof target[k] === "object" ? target[k] : {};
      deepMerge(target[k], v);
    } else {
      target[k] = v;
    }
  }
}

for (const [path, patch] of Object.entries(patches)) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  deepMerge(json, patch);
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log("patched:", path);
}
