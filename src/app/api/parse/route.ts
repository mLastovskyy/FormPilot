import { NextResponse } from "next/server";
import { fetchAndParseForm, FormError } from "@/lib/googleForms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let url: unknown;
  try {
    const body = await request.json();
    url = body?.url;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body.", code: "bad_request" },
      { status: 400 },
    );
  }

  if (typeof url !== "string" || url.trim().length === 0) {
    return NextResponse.json(
      { error: "A form URL is required.", code: "bad_request" },
      { status: 400 },
    );
  }

  try {
    const form = await fetchAndParseForm(url);
    return NextResponse.json({ form });
  } catch (err) {
    if (err instanceof FormError) {
      const status = err.code === "requires_login" ? 403 : 422;
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Something went wrong while parsing the form.", code: "unknown" },
      { status: 500 },
    );
  }
}
