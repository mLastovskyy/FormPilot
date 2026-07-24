/**
 * Server-only helpers for talking to Google Forms.
 *
 * Google Forms embeds its whole structure in a `FB_PUBLIC_LOAD_DATA_`
 * JavaScript array inside the public `viewform` HTML. We fetch that HTML
 * server-side (the browser can't, due to CORS), parse the array into our
 * domain model, and submit responses by POSTing url-encoded `entry.<id>`
 * pairs to the form's `formResponse` endpoint.
 *
 * This file must only be imported from server code (API routes).
 */

import type {
  GridRow,
  ParsedForm,
  ParsedOption,
  ParsedQuestion,
  QuestionType,
  SampledAnswer,
} from "./types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const FETCH_TIMEOUT_MS = 15_000;

/** Error type carrying a user-friendly message + a machine-readable code. */
export class FormError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "FormError";
  }
}

const TYPE_MAP: Record<number, QuestionType> = {
  0: "SHORT_ANSWER",
  1: "PARAGRAPH",
  2: "RADIO",
  3: "DROPDOWN",
  4: "CHECKBOX",
  5: "LINEAR_SCALE",
  7: "GRID",
  9: "DATE",
  10: "TIME",
};

// Google item type codes that are informational only (no answer to submit).
const NON_INPUT_TYPES = new Set([6, 8, 11, 13]);

interface FetchedHtml {
  html: string;
  finalUrl: string;
}

const SIGNIN_REDIRECT = /accounts\.google\.com\/(v3\/signin|ServiceLogin)/;
// Statuses worth retrying: Google intermittently returns 401/429 to server-side
// requests (bot protection) even for fully public forms, then 200 on retry.
const RETRYABLE_STATUS = new Set([401, 403, 408, 425, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchOnce(
  url: string,
): Promise<{ status: number; html: string; finalUrl: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    return { status: res.status, html: await res.text(), finalUrl: res.url || url };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHtml(url: string): Promise<FetchedHtml> {
  let lastStatus = 0;
  let timedOut = false;
  let networkFailed = false;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await sleep(500 * attempt);
    try {
      const { status, html, finalUrl } = await fetchOnce(url);
      // A redirect to the sign-in page is a genuine "not public" signal.
      if (SIGNIN_REDIRECT.test(finalUrl)) {
        throw new FormError("requires_login", "This form requires sign-in.");
      }
      if (status >= 200 && status < 300) {
        return { html, finalUrl };
      }
      lastStatus = status;
      if (!RETRYABLE_STATUS.has(status)) break;
    } catch (err) {
      if (err instanceof FormError) throw err;
      if (err instanceof Error && err.name === "AbortError") timedOut = true;
      else networkFailed = true;
    }
  }

  // Exhausted retries — translate the last failure into a friendly error.
  if (lastStatus === 401 || lastStatus === 403) {
    throw new FormError(
      "requires_login",
      "This form requires sign-in, or Google is rate-limiting the request.",
    );
  }
  if (timedOut) {
    throw new FormError("timeout", "Timed out while loading the form.");
  }
  if (lastStatus === 429) {
    throw new FormError(
      "fetch_failed",
      "Google is rate-limiting requests right now. Please try again in a moment.",
    );
  }
  if (lastStatus >= 500) {
    throw new FormError(
      "fetch_failed",
      `Google returned HTTP ${lastStatus}. Please try again shortly.`,
    );
  }
  if (networkFailed || lastStatus === 0) {
    throw new FormError(
      "network",
      "Could not reach Google Forms. Check the link and your connection.",
    );
  }
  throw new FormError(
    "fetch_failed",
    `Google returned HTTP ${lastStatus} when loading the form.`,
  );
}

function extractLoadData(html: string): unknown[] {
  const match = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);\s*<\/script>/);
  if (!match) {
    const looksLikeLogin =
      html.includes("accounts.google.com") ||
      html.includes("ServiceLogin") ||
      html.includes("identifier");
    if (looksLikeLogin) {
      throw new FormError(
        "requires_login",
        "This form is restricted to signed-in users, so it can't be read or filled anonymously.",
      );
    }
    throw new FormError(
      "not_a_form",
      "That page doesn't look like a public Google Form. Use the form's share link (the one that ends in /viewform or a forms.gle link).",
    );
  }
  try {
    return JSON.parse(match[1]) as unknown[];
  } catch {
    throw new FormError(
      "parse_error",
      "Found the form but couldn't decode its structure.",
    );
  }
}

function extractTitle(html: string): string {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!m) return "Untitled form";
  const raw = m[1].trim().replace(/\s*-\s*Google Forms\s*$/i, "");
  return raw || "Untitled form";
}

function extractFbzx(html: string): string | null {
  const patterns = [
    /name="fbzx"[^>]*value="([^"]+)"/,
    /value="([^"]+)"[^>]*name="fbzx"/,
    /"fbzx":"([^"]+)"/,
    /data-fbzx="([^"]+)"/,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1];
  }
  return null;
}

function safeString(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return "";
}

/** Recursively find the first string/number inside a nested array. */
function deepFirstString(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) {
    for (const item of v) {
      const found = deepFirstString(item);
      if (found) return found;
    }
  }
  return "";
}

function parseOptions(rawOptions: unknown): ParsedOption[] {
  if (!Array.isArray(rawOptions)) return [];
  const out: ParsedOption[] = [];
  for (const raw of rawOptions) {
    if (!Array.isArray(raw)) continue;
    const isOther = raw[4] === 1 || raw[4] === true;
    const value = safeString(raw[0]);
    out.push({ value, isOther });
  }
  return out;
}

function parseQuestion(item: unknown[], indexFallback: number): ParsedQuestion | null {
  const rawType = typeof item[3] === "number" ? item[3] : -1;
  if (NON_INPUT_TYPES.has(rawType)) return null;

  const answerBlocks = item[4];
  const title = safeString(item[1]) || "Untitled question";
  const description = safeString(item[2]);
  const type: QuestionType = TYPE_MAP[rawType] ?? "UNSUPPORTED";
  const id = safeString(item[0]) || `q-${indexFallback}`;

  // Non-input types already filtered; anything without answer blocks and not a
  // known type is informational — skip it.
  if (!Array.isArray(answerBlocks) || answerBlocks.length === 0) {
    if (type === "UNSUPPORTED") return null;
  }

  if (type === "GRID") {
    const blocks = Array.isArray(answerBlocks) ? answerBlocks : [];
    const first = blocks[0];
    const gridColumns = Array.isArray(first) && Array.isArray(first[1])
      ? parseOptions(first[1]).map((o) => o.value)
      : [];
    const gridRows: GridRow[] = blocks
      .filter((b): b is unknown[] => Array.isArray(b))
      .map((b) => ({
        entryId: safeString(b[0]),
        label: deepFirstString(b[3]) || "Row",
        required: b[2] === 1,
      }));
    return {
      id,
      entryId: "",
      title,
      description,
      type,
      required: gridRows.some((r) => r.required),
      options: [],
      gridRows,
      gridColumns,
      rawType,
    };
  }

  const block = Array.isArray(answerBlocks) ? answerBlocks[0] : undefined;
  const entryId = Array.isArray(block) ? safeString(block[0]) : "";
  const options = Array.isArray(block) ? parseOptions(block[1]) : [];
  const required = Array.isArray(block) && block[2] === 1;

  return {
    id: entryId || id,
    entryId,
    title,
    description,
    type,
    required,
    options,
    rawType,
  };
}

function deriveUrls(finalUrl: string): {
  formId: string;
  viewUrl: string;
  responseUrl: string;
} {
  const u = new URL(finalUrl);
  u.search = "";
  u.hash = "";
  let path = u.pathname;
  path = path.replace(/\/(viewform|formResponse)\/?$/, "");
  const idMatch =
    path.match(/\/forms\/d\/e\/([^/]+)/) || path.match(/\/forms\/d\/([^/]+)/);
  const formId = idMatch ? idMatch[1] : "";
  const base = `${u.origin}${path}`;
  return {
    formId,
    viewUrl: `${base}/viewform`,
    responseUrl: `${base}/formResponse`,
  };
}

export function normalizeInputUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new FormError("empty", "Please paste a Google Form link.");
  }
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new FormError("invalid_url", "That doesn't look like a valid URL.");
  }
  const host = url.hostname.toLowerCase();
  const isGoogleForm =
    (host.endsWith("docs.google.com") && url.pathname.includes("/forms/")) ||
    host === "forms.gle" ||
    host.endsWith(".forms.gle");
  if (!isGoogleForm) {
    throw new FormError(
      "not_google_forms",
      "Only Google Forms links are supported (docs.google.com/forms/… or forms.gle/…).",
    );
  }
  if (url.pathname.includes("/edit")) {
    throw new FormError(
      "edit_link",
      "That's the form's edit link. Open the form, click Send, and copy the public link instead.",
    );
  }
  return trimmed;
}

export async function fetchAndParseForm(input: string): Promise<ParsedForm> {
  const normalized = normalizeInputUrl(input);
  const { html, finalUrl } = await fetchHtml(normalized);
  return parseFormHtml(html, finalUrl);
}

/**
 * Pure parse step: turn already-fetched form HTML into our domain model.
 * Separated from the network fetch so it can be unit-tested in isolation.
 */
export function parseFormHtml(html: string, finalUrl: string): ParsedForm {
  const data = extractLoadData(html);

  const inner = Array.isArray(data[1]) ? (data[1] as unknown[]) : [];
  const description = safeString(inner[0]);
  const rawItems = Array.isArray(inner[1]) ? (inner[1] as unknown[]) : [];

  const questions: ParsedQuestion[] = [];
  let pageBreaks = 0;
  rawItems.forEach((raw, i) => {
    if (!Array.isArray(raw)) return;
    if (raw[3] === 8) pageBreaks += 1;
    const parsed = parseQuestion(raw as unknown[], i);
    if (parsed) questions.push(parsed);
  });

  const { formId, viewUrl, responseUrl } = deriveUrls(finalUrl);

  return {
    formId,
    title: extractTitle(html),
    description,
    viewUrl,
    responseUrl,
    fbzx: extractFbzx(html),
    pageCount: pageBreaks + 1,
    questions,
    requiresLogin: false,
  };
}

/**
 * SSRF guard: the submit endpoint accepts a response URL from the client, so
 * we must confirm it really points at a Google Forms `formResponse` endpoint
 * before the server POSTs to it.
 */
export function assertGoogleFormsResponseUrl(input: string): string {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new FormError("invalid_url", "Invalid response URL.");
  }
  const host = url.hostname.toLowerCase();
  const okHost = host === "docs.google.com";
  const okPath =
    url.pathname.includes("/forms/") && url.pathname.endsWith("/formResponse");
  if (url.protocol !== "https:" || !okHost || !okPath) {
    throw new FormError(
      "bad_response_url",
      "Refusing to submit: the target is not a Google Forms response endpoint.",
    );
  }
  return url.toString();
}

export function buildSubmissionBody(
  answers: SampledAnswer[],
  fbzx: string | null,
  pageCount: number,
): string {
  const params = new URLSearchParams();
  for (const answer of answers) {
    for (const value of answer.values) {
      params.append(`entry.${answer.entryId}`, value);
    }
  }
  params.append("fvv", "1");
  params.append(
    "pageHistory",
    Array.from({ length: Math.max(1, pageCount) }, (_, i) => i).join(","),
  );
  if (fbzx) params.append("fbzx", fbzx);
  params.append("submissionTimestamp", "-1");
  return params.toString();
}

export async function submitOne(
  responseUrl: string,
  body: string,
): Promise<{ ok: boolean; status: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(responseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
        Origin: "https://docs.google.com",
        Referer: responseUrl.replace(/\/formResponse$/, "/viewform"),
      },
      body,
      redirect: "follow",
      signal: controller.signal,
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}
