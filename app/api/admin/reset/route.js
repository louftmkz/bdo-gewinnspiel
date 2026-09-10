import { NextResponse } from "next/server";
import { getJsonFile, upsertJsonFile } from "../../../../lib/github";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const slug = String(body?.slug || "").trim();
  if (!slug) {
    return NextResponse.json({ error: "missing_slug" }, { status: 400 });
  }

  const path = `data/raffles/${slug}.json`;

  try {
    const existing = await getJsonFile(path);
    if (!existing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const updated = { ...existing.json, result: null, updatedAt: new Date().toISOString() };
    await upsertJsonFile(path, updated, `Ziehung zurückgesetzt (${slug})`, existing.sha);
    return NextResponse.json({ ok: true, raffle: updated });
  } catch (err) {
    return NextResponse.json({ error: "github_error", detail: String(err.message || err) }, { status: 502 });
  }
}
