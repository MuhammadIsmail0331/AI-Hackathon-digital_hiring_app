import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";

/**
 * AI Support — POST /api/chat/support
 * Body: { messages: [{ role: "user"|"assistant", content: string }] }
 * Uses Gemini when GEMINI_API_KEY is set; otherwise a bilingual rule-based
 * assistant answers common questions so the feature always works.
 */

const SYSTEM_PROMPT = [
  "You are the friendly support assistant for Rozgaar (Digital Hiring), a marketplace connecting daily-wage workers and employers in Pakistan.",
  "Rules: payments are escrow-protected (held until both sides mark the job complete); a 5% platform fee applies on release; OTP codes appear in the app during demo mode; workers can hold up to 3 profession profiles; matching uses skills + 50km radius + wage.",
  "Answer briefly (max 90 words), warmly and simply. If the user writes in Urdu (اردو), reply in Urdu. If in English, reply in English.",
].join(" ");

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

function ruleBasedReply(userText: string, locale: string): string {
  const s = (userText || "").toLowerCase();
  const has = (...ws: string[]) => ws.some((w) => s.includes(w));
  if (has("otp", "code", "verification", "کوڈ", "توثیق")) {
    return locale === "ur"
      ? "OTP کوڈ اسکرین پر ہی دکھایا جاتا ہے (ڈیمو موڈ) — اسے ڈبہ میں لکھے ہوئے نمبر کے ساتھ درج کریں۔ کوڈ 60 منٹ تک درست رہتا ہے۔"
      : "During demo mode the OTP code is shown right on the screen — type the 6 digits from the box. The code stays valid for 60 minutes.";
  }
  if (has("payment", "money", "paisa", "escrow", "پیسے", "ادائیگی", "تحفظ")) {
    return locale === "ur"
      ? "ادائیگی ایسکرو میں محفوظ ہوتی ہے: کام مکمل ہونے پر جب آپ دونوں تصدیق کریں گے تو رقم ورکر کو جاری ہوگی۔ منسوخی پر پیسے واپس۔"
      : "Payments are escrow-protected: the wage is held safely and released to the worker only when both sides mark the job complete. Cancelling refunds automatically.";
  }
  if (has("cancel", "refund", "منسوخ", "واپس")) {
    return locale === "ur"
      ? "کام منسوخ کرنے پر ایسکرو فنڈز خودکار طور پر قبضہ کرنے والے (ایمپلائر) کو واپس کر دیے جاتے ہیں۔"
      : "Cancelling a job automatically refunds the escrowed amount back to the employer — no waiting.";
  }
  if (has("offer", "match", "accept", "پیشکش", "کام")) {
    return locale === "ur"
      ? "آپ کو جو کام آپ کے ہنر، فاصلہ (50 کلومیٹر) اور اجر کے مطابق ہو، وہ 'Offers' میں ملاپ کی وجہ کے ساتھ نظر آتا ہے — قبول کریں اور رابطہ کھل جائے گا۔"
      : "Jobs matched to your skills, distance (50 km) and expected wage appear in 'Offers' with a clear match reason. Accept one to reveal contact details.";
  }
  if (has("password", "login", "پاس ورڈ", "لاگ ان")) {
    return locale === "ur"
      ? "لاگ ان پیج پر 'پاس ورڈ بھول گے؟' سے OTP کے ذریعے فوراً نیا پاس ورڈ مقرر کریں۔"
      : "On the login page use 'Forgot password?' — verify with an OTP code and set a new one right away.";
  }
  return locale === "ur"
    ? "میں روزگار کی مدد کے لیے حاضر ہوں! OTP، ادائیگی (ایسکرو)، کام ملنے یا اکاؤنٹ کے بارے میں پوچھیں — یا نیچے Help صفحہ کھولیں۔"
    : "I'm here to help with Rozgaar! Ask me about OTP, escrow payments, finding work, or your account — or open the Help page below.";
}

export async function POST(req: NextRequest) {
  const user = await resolveSessionUser();
  if (!user || user.isBlocked) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { messages?: ChatTurn[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const history = (body.messages ?? [])
    .filter((m) => m && typeof m.content === "string" && m.content.length <= 2000)
    .slice(-10);
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  const locale = req.nextUrl.searchParams.get("locale") === "ur" ? "ur" : "en";

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: history.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
            generationConfig: { maxOutputTokens: 220, temperature: 0.6 },
          }),
          signal: AbortSignal.timeout(12000),
        }
      );
      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
        if (text) return NextResponse.json({ reply: text, source: "gemini" });
      }
    } catch {
      /* fall through to rule-based */
    }
  }

  return NextResponse.json({
    reply: ruleBasedReply(lastUser?.content ?? "", locale),
    source: "rules",
  });
}