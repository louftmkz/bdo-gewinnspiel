import Link from "next/link";
import { notFound } from "next/navigation";
import { getRaffle } from "../../lib/raffles";
import Wheel from "../../components/Wheel";
import Logo from "../../components/Logo";

export const dynamic = "force-dynamic";

export default async function RafflePage({ params }) {
  const { slug } = await params;
  const raffle = getRaffle(slug);
  if (!raffle) return notFound();

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-12 gap-8">
      <Logo />
      <div className="text-center max-w-xl">
        <h1 className="font-heading text-4xl sm:text-5xl tracking-wide text-flame">
          {raffle.title}
        </h1>
        {raffle.subtitle && <p className="mt-2 text-paper/80">{raffle.subtitle}</p>}
      </div>
      <Wheel raffle={raffle} />
      <Link href="/admin" className="text-xs text-paper/30 hover:text-paper/70 transition mt-4">
        Admin
      </Link>
    </main>
  );
}
