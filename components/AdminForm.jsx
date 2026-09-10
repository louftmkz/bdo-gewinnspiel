"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function AdminForm({ initial, mode }) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [title, setTitle] = useState(initial?.title || "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle || "");
  const [prizeText, setPrizeText] = useState(initial?.prizeText || "");
  const [participantsText, setParticipantsText] = useState(
    (initial?.participants || []).join("\n")
  );
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleTitleChange(value) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const participants = participantsText
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title, subtitle, prizeText, participants }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Speichern fehlgeschlagen.");
      setSuccess(
        "Gespeichert – Vercel deployed die Änderung jetzt automatisch neu (dauert meist 30–60 Sek.)."
      );
      if (mode === "new") {
        router.push(`/admin/${data.raffle.slug}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm("Ziehung wirklich zurücksetzen? Der bisherige Gewinner wird gelöscht.")) return;
    setResetting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Zurücksetzen fehlgeschlagen.");
      setSuccess("Ziehung zurückgesetzt.");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setResetting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-paper text-ink rounded-2xl p-6 sm:p-8 shadow-xl">
      <div>
        <label className="block text-sm font-semibold mb-1">Titel</label>
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="w-full border border-ink/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ember"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Link-Name (URL)</label>
        <input
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          disabled={mode === "edit"}
          required
          className="w-full border border-ink/20 rounded-lg px-4 py-2 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-ember"
        />
        <p className="text-xs text-ink/50 mt-1">
          z.B. bdo-gewinnspiel → deine-app.vercel.app/bdo-gewinnspiel
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Untertitel (optional)</label>
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full border border-ink/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ember"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Preis</label>
        <input
          value={prizeText}
          onChange={(e) => setPrizeText(e.target.value)}
          placeholder="z.B. 500 €"
          className="w-full border border-ink/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ember"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">
          Teilnehmer:innen (eine Zeile pro Person)
        </label>
        <textarea
          value={participantsText}
          onChange={(e) => setParticipantsText(e.target.value)}
          rows={8}
          required
          className="w-full border border-ink/20 rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ember"
        />
      </div>

      {error && <p className="text-ember text-sm">{error}</p>}
      {success && <p className="text-green-700 text-sm">{success}</p>}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-full bg-ember text-paper font-semibold disabled:opacity-50"
        >
          {saving ? "Speichert…" : "Speichern"}
        </button>
        {mode === "edit" && initial?.result && (
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="px-6 py-2 rounded-full border border-ember text-ember font-semibold disabled:opacity-50"
          >
            {resetting ? "…" : "Ziehung zurücksetzen"}
          </button>
        )}
      </div>
    </form>
  );
}
