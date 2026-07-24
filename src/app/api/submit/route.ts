import { NextResponse } from "next/server";
import {
  assertGoogleFormsResponseUrl,
  buildSubmissionBody,
  FormError,
  submitOne,
} from "@/lib/googleForms";
import type { SampledAnswer, SubmitApiRequest } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidAnswers(value: unknown): value is SampledAnswer[] {
  return (
    Array.isArray(value) &&
    value.every(
      (a) =>
        a &&
        typeof a.entryId === "string" &&
        Array.isArray(a.values) &&
        a.values.every((v: unknown) => typeof v === "string"),
    )
  );
}

export async function POST(request: Request) {
  let body: SubmitApiRequest;
  try {
    body = (await request.json()) as SubmitApiRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body.", code: "bad_request" },
      { status: 400 },
    );
  }

  if (!isValidAnswers(body.answers)) {
    return NextResponse.json(
      { error: "Malformed answers payload.", code: "bad_request" },
      { status: 400 },
    );
  }

  let responseUrl: string;
  try {
    responseUrl = assertGoogleFormsResponseUrl(body.responseUrl);
  } catch (err) {
    const message =
      err instanceof FormError ? err.message : "Invalid response URL.";
    return NextResponse.json({ error: message, code: "bad_url" }, { status: 400 });
  }

  const encoded = buildSubmissionBody(
    body.answers,
    body.fbzx ?? null,
    typeof body.pageCount === "number" ? body.pageCount : 1,
  );
  const result = await submitOne(responseUrl, encoded);
  return NextResponse.json(result);
}
