import { readFileSync, writeFileSync } from "node:fs";

const enPath = "src/i18n/messages/en.json";
const urPath = "src/i18n/messages/ur.json";

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

const enPatch = {
  App: {
    name: "Rozgaar",
    tagline: "Verified workers. Protected wages. Zero hassle.",
  },
  Landing: {
    description:
      "Rozgaar connects employers with rated, verified daily-wage professionals across Pakistan — post a job in under a minute and let AI do the matching.",
    needWorkerDesc:
      "Post a job in under a minute. Our AI finds rated professionals near you and sends your offer straight to them.",
    amWorkerDesc:
      "Offers come to you based on your skills and city. Your wage is secured in escrow before you even start.",
    statsJobs: "jobs filled",
    statsWorkers: "skilled workers",
    statsRating: "average rating",
    trustTitle: "Why Pakistan trusts Rozgaar",
  },
  Common: {
    retry: "Retry",
  },
  Jobs: {
    statusExpired: "Expired",
    cancelJob: "Cancel Job",
    cancelConfirm:
      "Cancel this job? Accepted workers will be notified and any secured payment will be refunded to you.",
    jobCancelledRefund: "Job cancelled. Any secured payment has been refunded.",
  },
  Notifications: {
    jobExpired: "Job expired",
  },
};

const urPatch = {
  App: {
    name: "روزگار",
    tagline: "قابلِ اعتماد مزدور، محفوظ اجرت، بغیر کسی پریشانی۔",
  },
  Landing: {
    description:
      "روزگار آپ کو پاکستان بھر کے ہنر مند اور درجہ بندی والے مزدوروں سے جوڑتا ہے — ایک منٹ میں کام پوسٹ کریں اور میچنگ AI پر چھوڑ دیں۔",
    needWorkerDesc:
      "ایک منٹ میں کام پوسٹ کریں۔ ہمارا AI آپ کے قریب اچھی درجہ بندی والے پیشہ ور تلاش کر کے آپ کی پیشکش سیدھی ان تک پہنچاتا ہے۔",
    amWorkerDesc:
      "آپ کے ہنر اور شہر کے مطابق پیشکشیں آپ تک آتی ہیں۔ کام شروع ہونے سے پہلے ہی اجرت محفوظ کر دی جاتی ہے۔",
    statsJobs: "مکمل شدہ کام",
    statsWorkers: "ہنر مند مزدور",
    statsRating: "اوسط درجہ بندی",
    trustTitle: "پاکستان روزگار پر کیوں بھروسہ کرتا ہے",
  },
  Common: {
    retry: "دوبارہ کوشش کریں",
  },
  Jobs: {
    statusExpired: "ختم شدہ",
    cancelJob: "کام منسوخ کریں",
    cancelConfirm:
      "کیا آپ یہ کام منسوخ کرنا چاہتے ہیں؟ قبول کرنے والے مزدوروں کو اطلاع دی جائے گی اور محفوظ شدہ رقم واپس کر دی جائے گی۔",
    jobCancelledRefund: "کام منسوخ کر دیا گیا۔ محفوظ شدہ رقم واپس کر دی گئی ہے۔",
  },
  Notifications: {
    jobExpired: "کام ختم ہو گیا",
  },
};

for (const [path, patch] of [
  [enPath, enPatch],
  [urPath, urPatch],
]) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  deepMerge(json, patch);
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log("patched:", path);
}
