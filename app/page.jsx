import { redirect } from "next/navigation";
import { listRaffles } from "../lib/raffles";

export const dynamic = "force-dynamic";

export default function Home() {
  const raffles = listRaffles();
  const slug = raffles[0]?.slug || "bdo-gewinnspiel";
  redirect(`/${slug}`);
}
