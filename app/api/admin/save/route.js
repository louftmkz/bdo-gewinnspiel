import { NextResponse } from "next/server";
import { getJsonFile, upsertJsonFile } from "../../../../lib/github";
import { slugify } from "../../../../lib/raffles";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const slug = slugify(body?.slug || body?.title || "");
  const title = String(body?.title || "").trim();
  const subtitle = String(body?.subtitle || "").trim();
  const prizeText = String(body?.prizeText || "").trim();
  const participants = Array.isArray(body?.participants)
    ? body.participants.map((p) => String(p).trim()).filter(Boolean)
    : [];

  if (!slug) {
    return NextResponse.json({ error: "missing_slug" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "missing_title" }, { status: 400 });
  }
  if (participants.length < 2) {
    return NextResponse.json({ error: "need_at_least_two_participants" }, { status: 400 });
  }

  const path = `data/raffles/${slug}.json`;

  try {
    const existing = await getJsonFile(path);
    const now = new Date().toISOString();
    const createdAt = existing?.json?.createdAt || now;
    const result = body?.resetResult ? null : existing?.json?.result ?? null;

    const raffle = {
      slug,
      title,
      subtitle,
      prizeText,
      participants,
      result,
      createdAt,
      updatedAt: now,
    };

    await upsertJsonFile(
      path,
      raffle,
      `${existing ? "Update" : "Create"} Gewinnspiel: ${title}`,
      existing?.sha
    );

    return NextResponse.json({ ok: true, raffle });
  } catch (err) {
    return NextResponse.json({ error: "github_error", detail: String(err.message || err) }, { status: 502 });
  }
}
