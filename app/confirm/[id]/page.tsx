import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db-optional";
import { newsletterSubscribers } from "@/src/db/schema/index";

export const metadata = {
  title: "Confirm Subscription",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ConfirmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const db = await getDb();
  let confirmed = false;
  if (db) {
    try {
      const [row] = await db
        .update(newsletterSubscribers)
        .set({ status: "confirmed", updatedAt: new Date() })
        .where(eq(newsletterSubscribers.id, id))
        .returning({ id: newsletterSubscribers.id });
      confirmed = Boolean(row);
    } catch {
      confirmed = false;
    }
  }
  if (!confirmed) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-500">
        The Loop
      </p>
      <h1 className="display text-4xl text-ink sm:text-5xl">You're In.</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-ink-dim">
        Subscription confirmed. New media opportunities, weekly independent
        charts, and budget-based campaign ideas, in your inbox.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/charts"
          className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5"
        >
          See This Week's Charts
        </Link>
        <Link
          href="/plan"
          className="rounded-full border border-sky-100 bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-ink shadow-sm transition-all hover:-translate-y-0.5"
        >
          Build a Plan
        </Link>
      </div>
    </div>
  );
}
