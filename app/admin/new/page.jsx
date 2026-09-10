import Link from "next/link";
import AdminForm from "../../../components/AdminForm";
import { getRaffle } from "../../../lib/raffles";

export const dynamic = "force-dynamic";

export default async function NewRafflePage({ searchParams }) {
  const sp = await searchParams;
  const duplicateSlug = sp?.duplicate;
  const source = duplicateSlug ? getRaffle(duplicateSlug) : null;
  const initial = source
    ? { ...source, slug: "", result: null }
    : { slug: "", title: "", subtitle: "", prizeText: "", participants: [] };

  return (
    <main className="min-h-screen px-4 py-10 max-w-xl mx-auto">
      <Link href="/admin" className="text-paper/50 hover:text-paper text-sm">
        ← Zurück
      </Link>
      <h1 className="font-heading text-3xl text-flame tracking-wide my-4">
        Neues Gewinnspiel{source ? ` (Kopie von ${source.title})` : ""}
      </h1>
      <AdminForm initial={initial} mode="new" />
    </main>
  );
}
