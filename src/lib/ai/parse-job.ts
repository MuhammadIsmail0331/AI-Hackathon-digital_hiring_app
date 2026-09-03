import {
  WORKER_CATEGORIES,
  SKILLS_MAP,
  PAKISTAN_CITIES,
  type WorkerCategoryId,
  type CityId,
} from "@/lib/constants";

/**
 * AI Job-Post Assistant — parses a rough sentence into structured job fields.
 *
 * Strategy (provider adapter):
 *  1. If OPENAI_API_KEY is set, ask the LLM for structured JSON (best quality).
 *  2. Otherwise (or on any failure), fall back to a bilingual keyword parser.
 * Both paths return the same shape, so the UI never breaks.
 */

export interface ParsedJob {
  title?: string;
  workerType?: WorkerCategoryId;
  requiredSkills?: string[];
  city?: CityId;
  numberOfWorkers?: number;
  wage?: number;
  date?: string; // yyyy-mm-dd
  startTimeHour?: number;
  startTimeMinute?: number;
  startTimePeriod?: "AM" | "PM";
  source: "llm" | "heuristic";
  unmatched: string[]; // human hints for what the employer still needs to fill
}

type NamePair = { id: string; en: string; ur: string };

function lower(s: string) {
  return s.toLowerCase();
}

function findNamed<T extends NamePair>(list: readonly T[], text: string): T | undefined {
  const t = lower(text);
  return list.find(
    (item) =>
      t.includes(lower(item.en)) ||
      (item.ur && text.includes(item.ur))
  );
}

function resolveCategory(text: string): WorkerCategoryId | undefined {
  const hit = findNamed(WORKER_CATEGORIES, text);
  return hit?.id as WorkerCategoryId | undefined;
}

function resolveSkills(text: string, category?: WorkerCategoryId): string[] {
  const pools: (readonly NamePair[])[] = [];
  if (category && SKILLS_MAP[category]) pools.push(SKILLS_MAP[category]);
  else pools.push(...Object.values(SKILLS_MAP));
  const found = new Set<string>();
  for (const pool of pools) {
    for (const skill of pool) {
      const en = lower(skill.en);
      const firstWord = en.split(" ")[0];
      if (en.length > 3 && lower(text).includes(en)) found.add(skill.id);
      else if (firstWord.length > 3 && lower(text).includes(firstWord)) found.add(skill.id);
      else if (skill.ur && text.includes(skill.ur)) found.add(skill.id);
    }
  }
  return [...found].slice(0, 10);
}

function resolveCity(text: string): CityId | undefined {
  return findNamed(PAKISTAN_CITIES, text)?.id as CityId | undefined;
}

function resolveWorkers(text: string): number | undefined {
  const m = lower(text).match(/(\d{1,2})\s*(workers?|people|persons?|professionals?|men|مزدور|افراد|لوگ|آدمی)/);
  if (m) return Math.min(20, Math.max(1, parseInt(m[1], 10)));
  const urduNum = text.match(/(دو|تین|چار|پانچ)\s*(مزدور|افراد|لوگ)/);
  if (urduNum) {
    const map: Record<string, number> = { دو: 2, تین: 3, چار: 4, پانچ: 5 };
    return map[urduNum[1]];
  }
  return undefined;
}

function resolveWage(text: string): number | undefined {
  const t = lower(text);
  const explicit = t.match(/(?:rs\.?|pkr|rupees?|روپے)\s*([\d,]{3,7})/);
  if (explicit) return parseInt(explicit[1].replace(/,/g, ""), 10);
  const suffix = t.match(/([\d,]{3,7})\s*(?:rs\.?|pkr|rupees?|per day|per person|a day|روز)/);
  if (suffix) return parseInt(suffix[1].replace(/,/g, ""), 10);
  return undefined;
}

function isoDaysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().split("T")[0];
}

function nextWeekday(nameEn: string): string | undefined {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const target = days.indexOf(lower(nameEn));
  if (target < 0) return undefined;
  const d = new Date();
  const diff = (target - d.getDay() + 7) % 7 || 7;
  return isoDaysFromNow(diff);
}

function resolveDate(text: string): string | undefined {
  const t = lower(text);
  if (t.includes("tomorrow") || text.includes("کل")) return isoDaysFromNow(1);
  if (t.includes("today") || text.includes("آج")) return isoDaysFromNow(0);
  if (t.includes("day after tomorrow") || text.includes("پرسوں")) return isoDaysFromNow(2);
  for (const d of days) if (t.includes(d)) return nextWeekday(d);
  const iso = t.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  return undefined;
}

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function resolveTime(text: string): {
  startTimeHour?: number;
  startTimeMinute?: number;
  startTimePeriod?: "AM" | "PM";
} {
  const t = lower(text);
  const explicit = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (explicit) {
    return {
      startTimeHour: Math.min(12, parseInt(explicit[1], 10)),
      startTimeMinute: explicit[2] ? parseInt(explicit[2], 10) : 0,
      startTimePeriod: explicit[3].toUpperCase() === "PM" ? "PM" : "AM",
    };
  }
  if (t.includes("morning") || text.includes("صبح")) return { startTimeHour: 9, startTimeMinute: 0, startTimePeriod: "AM" };
  if (t.includes("afternoon") || text.includes("دوپہر")) return { startTimeHour: 1, startTimeMinute: 0, startTimePeriod: "PM" };
  if (t.includes("evening") || t.includes("night") || text.includes("شام") || text.includes("رات"))
    return { startTimeHour: 6, startTimeMinute: 0, startTimePeriod: "PM" };
  return {};
}

function heuristicParse(text: string): ParsedJob {
  const category = resolveCategory(text);
  const skills = resolveSkills(text, category);
  const city = resolveCity(text);
  const numberOfWorkers = resolveWorkers(text);
  const wage = resolveWage(text);
  const date = resolveDate(text);
  const time = resolveTime(text);

  const unmatched: string[] = [];
  if (!category) unmatched.push("workerType");
  if (skills.length === 0) unmatched.push("skills");
  if (!date) unmatched.push("date");
  if (!wage) unmatched.push("wage");

  const title =
    category && city
      ? `${category[0].toUpperCase()}${category.slice(1)} needed in ${city}`
      : category
        ? `${category[0].toUpperCase()}${category.slice(1)} needed`
        : text.trim().slice(0, 60);

  return {
    title,
    workerType: category,
    requiredSkills: skills.length > 0 ? skills : undefined,
    city,
    numberOfWorkers,
    wage,
    date,
    ...time,
    source: "heuristic",
    unmatched,
  };
}

async function llmParse(text: string): Promise<ParsedJob | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'Extract job-posting fields from the user text. Respond ONLY with JSON: {"title": string, "workerType": one of [painter,plumber,electrician,carpenter,mason,labourer,cleaner,welder,gardener,driver,helper,other], "skills": string[] (short skill names), "city": one of [karachi,lahore,islamabad,rawalpindi,faisalabad,multan,peshawar,quetta,sialkot,gujranwala,hyderabad,other_city], "numberOfWorkers": number, "wage": number (PKR per day), "date": "YYYY-MM-DD" (resolve relative words using today ' +
              new Date().toISOString().split("T")[0] +
              '), "startTimeHour": 1-12, "startTimeMinute": 0-59, "startTimePeriod": "AM"|"PM", "unmatched": string[] (fields not present in the text)}. Omit fields you cannot infer. Text may be English or Urdu.',
          },
          { role: "user", content: text },
        ],
      }),
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return null;
    const j = JSON.parse(raw) as Record<string, unknown>;

    // Validate LLM output against our catalogues (falls back to keywords).
    const category =
      WORKER_CATEGORIES.some((c) => c.id === j.workerType)
        ? (j.workerType as WorkerCategoryId)
        : resolveCategory(text);
    const city = PAKISTAN_CITIES.some((c) => c.id === j.city)
      ? (j.city as CityId)
      : resolveCity(text);
    const skills = Array.isArray(j.skills)
      ? (j.skills as string[]).filter((s) =>
          Object.values(SKILLS_MAP)
            .flat()
            .some((sk) => sk.id === s)
        )
      : resolveSkills(text, category);

    const unmatched = Array.isArray(j.unmatched)
      ? (j.unmatched as string[])
      : [];

    return {
      title: typeof j.title === "string" && j.title ? j.title.slice(0, 100) : heuristicParse(text).title,
      workerType: category,
      requiredSkills: skills.length > 0 ? skills : undefined,
      city,
      numberOfWorkers:
        typeof j.numberOfWorkers === "number" && j.numberOfWorkers >= 1
          ? Math.min(20, Math.round(j.numberOfWorkers))
          : resolveWorkers(text),
      wage: typeof j.wage === "number" && j.wage >= 100 ? Math.round(j.wage) : resolveWage(text),
      date: typeof j.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(j.date) ? j.date : resolveDate(text),
      startTimeHour:
        typeof j.startTimeHour === "number" && j.startTimeHour >= 1 && j.startTimeHour <= 12
          ? j.startTimeHour
          : resolveTime(text).startTimeHour,
      startTimeMinute:
        typeof j.startTimeMinute === "number" && j.startTimeMinute >= 0 && j.startTimeMinute <= 59
          ? j.startTimeMinute
          : resolveTime(text).startTimeMinute,
      startTimePeriod:
        j.startTimePeriod === "AM" || j.startTimePeriod === "PM"
          ? j.startTimePeriod
          : resolveTime(text).startTimePeriod,
      source: "llm",
      unmatched,
    };
  } catch {
    return null; // graceful fallback to heuristic
  }
}

/** Public entry: LLM first (if configured), heuristic always as safety net. */
export async function parseJobFromText(text: string): Promise<ParsedJob> {
  const trimmed = text.trim();
  if (trimmed.length < 8) {
    return { source: "heuristic", unmatched: ["everything"] };
  }
  const llm = await llmParse(trimmed);
  if (llm) return llm;
  return heuristicParse(trimmed);
}
