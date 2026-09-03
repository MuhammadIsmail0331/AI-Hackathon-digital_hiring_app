import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { parseJobFromText } from "@/lib/ai/parse-job";

/**
 * POST /api/ai/parse-job
 * AI Job-Post Assistant: rough sentence -> structured job field suggestions.
 * LLM-backed when OPENAI_API_KEY is configured; bilingual heuristic fallback.
 */
export async function POST(request: Request) {
  try {
    const user = await resolveSessionUser();
    if (!user || user.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { text?: string };
    const text = (body.text ?? "").trim();
    if (text.length < 8) {
      return NextResponse.json(
        { error: "Please describe the job in a sentence or two" },
        { status: 400 }
      );
    }

    const parsed = await parseJobFromText(text);
    return NextResponse.json({ parsed }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Could not parse the job description" },
      { status: 500 }
    );
  }
}
