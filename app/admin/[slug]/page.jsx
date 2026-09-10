import Link from "next/link";
import { notFound } from "next/navigation";
import AdminForm from "../../../components/AdminForm";
import { getRaffle } from "../../../lib/raffles";

export const dynamic = "force-dynamic";

export default async function EditRafflePage({ params }) {
  const { slug } = await params;
  const raffle = getRaffle(slug);
  if (!raffle) return notFound();

  return (
    <main className="min-h-screen px-4 py-10 max-w-xl mx-auto">
      <Link href="/admin" className="text-paper/50 hover:text-paper text-sm">
        ← Zurück
      </Link>
      <h1 className="font-heading text-3xl text-flame tracking-wide my-4">
        {raffle.title} bearbeiten
      </h1>
      <AdminForm initial={raffle} mode="edit" />
    </main>
  );
}
