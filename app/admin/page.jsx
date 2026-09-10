import Link from "next/link";
import { listRaffles } from "../../lib/raffles";
import LogoutButton from "../../components/LogoutButton";

export const dynamic = "force-dynamic";

export default function AdminHome() {
  const raffles = listRaffles();

  return (
    <main className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl text-flame tracking-wide">Gewinnspiele</h1>
        <LogoutButton />
      </div>

      <Link
        href="/admin/new"
        className="inline-block mb-8 px-5 py-2 rounded-full bg-flame text-paper font-heading tracking-wide"
      >
        + Neues Gewinnspiel
      </Link>

      <ul className="space-y-3">
        {raffles.map((r) => (
          <li
            key={r.slug}
            className="border border-paper/15 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <p className="font-semibold">{r.title}</p>
              <p className="text-paper/50 text-sm">
                /{r.slug} · {r.participants.length} Teilnehmer:innen
                {r.result ? ` · Gewinner:in: ${r.result.winner}` : ""}
              </p>
            </div>
            <div className="flex gap-3 shrink-0 text-sm">
              <Link href={`/${r.slug}`} className="underline text-paper/70 hover:text-paper">
                Ansehen
              </Link>
              <Link href={`/admin/${r.slug}`} className="underline text-flame">
                Bearbeiten
              </Link>
              <Link
                href={`/admin/new?duplicate=${r.slug}`}
                className="underline text-paper/70 hover:text-paper"
              >
                Duplizieren
              </Link>
            </div>
          </li>
        ))}
        {raffles.length === 0 && <p className="text-paper/50">Noch keine Gewinnspiele.</p>}
      </ul>
    </main>
  );
}
