import { NextResponse } from "next/server";
import { getJsonFile, upsertJsonFile } from "../../../lib/github";

function randomIndex(n) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % n;
}

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

    // Already decided (idempotent): never draw twice, always hand back the
    // recorded winner so a refresh or a second click can't change anything.
    if (existing.json.result) {
      return NextResponse.json({ result: existing.json.result, alreadyDrawn: true });
    }

    const participants = existing.json.participants || [];
    if (participants.length < 2) {
      return NextResponse.json({ error: "not_enough_participants" }, { status: 400 });
    }

    const winnerIndex = randomIndex(participants.length);
    const result = {
      winnerIndex,
      winner: participants[winnerIndex],
      drawnAt: new Date().toISOString(),
    };

    const updated = { ...existing.json, result, updatedAt: result.drawnAt };
    await upsertJsonFile(
      path,
      updated,
      `Ziehung: ${result.winner} gewinnt (${slug})`,
      existing.sha
    );

    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: "github_error", detail: String(err.message || err) }, { status: 502 });
  }
}
