import { getDb } from "@/lib/db-optional";
import {
  claims,
  listingRequests,
  inquiries,
  advertisers,
  savedPlans,
  supportTickets,
  newsletterSubscribers,
} from "@/src/db/schema/index";
import { adminKeyOk, adminSetTicketStatus } from "@/lib/actions";
import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

async function loadAll() {
  const db = await getDb();
  const empty = {
    db: false,
    claims: [] as Row[],
    listings: [] as Row[],
    tickets: [] as Row[],
    counts: { advertisers: 0, plans: 0, inquiries: 0, subscribers: 0 },
  };
  if (!db) return empty;
  try {
    const [cl, li, ti, ad, pl, inq, sub] = await Promise.all([
      db.select().from(claims),
      db.select().from(listingRequests),
      db.select().from(supportTickets),
      db.select({ id: advertisers.id }).from(advertisers),
      db.select({ id: savedPlans.id }).from(savedPlans),
      db.select({ id: inquiries.id }).from(inquiries),
      db.select({ id: newsletterSubscribers.id }).from(newsletterSubscribers),
    ]);
    return {
      db: true,
      claims: cl as Row[],
      listings: li as Row[],
      tickets: ti as Row[],
      counts: {
        advertisers: ad.length,
        plans: pl.length,
        inquiries: inq.length,
        subscribers: sub.length,
      },
    };
  } catch {
    return empty;
  }
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-b border-sky-50 px-3 py-2.5 text-sm text-ink-dim">
      {children}
    </td>
  );
}

export default async function AdminPage() {
  const authed = await adminKeyOk();

  if (!authed) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-14">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-500">
          Run the Play
        </p>
        <h1 className="display mb-8 text-4xl text-ink">Admin.</h1>
        <AdminLoginForm />
        <p className="mt-6 max-w-md text-xs font-medium text-ink-faint">
          Set the RTP_ADMIN_KEY environment variable in Vercel, then enter it
          here. The key is stored as a cookie on this device for 30 days.
        </p>
      </div>
    );
  }

  const data = await loadAll();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-500">
        Run the Play
      </p>
      <h1 className="display text-4xl text-ink">Admin.</h1>

      {!data.db && (
        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-700">
          Database not connected in this environment. Lists appear once
          DATABASE_URL is set.
        </p>
      )}

      {/* Counts */}
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Advertisers", data.counts.advertisers],
          ["Saved Plans", data.counts.plans],
          ["Inquiries", data.counts.inquiries],
          ["Subscribers", data.counts.subscribers],
        ].map(([label, n]) => (
          <div
            key={String(label)}
            className="rounded-[1.5rem] border border-sky-50 bg-white p-6 shadow-sm"
          >
            <p className="text-3xl font-black tabular-nums text-ink">{n}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Support tickets */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-black uppercase tracking-tight text-ink">
          Support Tickets ({data.tickets.length})
        </h2>
        <div className="overflow-x-auto rounded-[1.5rem] border border-sky-50 bg-white shadow-sm">
          <table className="w-full min-w-[40rem] text-left">
            <thead>
              <tr>
                {["Status", "Email", "Topic", "Message", "Action"].map((h) => (
                  <th
                    key={h}
                    className="border-b border-sky-100 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-ink-faint"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.tickets.length === 0 && (
                <tr>
                  <Cell>None yet.</Cell>
                  <Cell>{""}</Cell>
                  <Cell>{""}</Cell>
                  <Cell>{""}</Cell>
                  <Cell>{""}</Cell>
                </tr>
              )}
              {data.tickets.map((t) => (
                <tr key={String(t.id)}>
                  <Cell>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                        t.status === "open"
                          ? "bg-orange/10 text-orange-600"
                          : "bg-sky-50 text-sky-600"
                      }`}
                    >
                      {String(t.status)}
                    </span>
                  </Cell>
                  <Cell>{String(t.email)}</Cell>
                  <Cell>{String(t.topic ?? "")}</Cell>
                  <Cell>
                    <span className="line-clamp-2 max-w-md">
                      {String(t.message)}
                    </span>
                  </Cell>
                  <Cell>
                    <form action={adminSetTicketStatus}>
                      <input type="hidden" name="id" value={String(t.id)} />
                      <input
                        type="hidden"
                        name="status"
                        value={t.status === "open" ? "closed" : "open"}
                      />
                      <button
                        type="submit"
                        className="text-xs font-black uppercase tracking-widest text-sky-500 hover:text-sky-600"
                      >
                        {t.status === "open" ? "Close" : "Reopen"}
                      </button>
                    </form>
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Claims */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-black uppercase tracking-tight text-ink">
          Profile Claims ({data.claims.length})
        </h2>
        <div className="overflow-x-auto rounded-[1.5rem] border border-sky-50 bg-white shadow-sm">
          <table className="w-full min-w-[36rem] text-left">
            <thead>
              <tr>
                {["Show", "Email", "Role", "Method", "Status"].map((h) => (
                  <th
                    key={h}
                    className="border-b border-sky-100 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-ink-faint"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.claims.length === 0 && (
                <tr>
                  <Cell>None yet.</Cell>
                  <Cell>{""}</Cell>
                  <Cell>{""}</Cell>
                  <Cell>{""}</Cell>
                  <Cell>{""}</Cell>
                </tr>
              )}
              {data.claims.map((c) => (
                <tr key={String(c.id)}>
                  <Cell>{String(c.podcastSlug)}</Cell>
                  <Cell>{String(c.claimEmail)}</Cell>
                  <Cell>{String(c.role ?? "")}</Cell>
                  <Cell>{String(c.method)}</Cell>
                  <Cell>{String(c.status)}</Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Listing requests */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-black uppercase tracking-tight text-ink">
          Listing Requests ({data.listings.length})
        </h2>
        <p className="mb-4 max-w-2xl text-sm font-medium text-ink-dim">
          Review each against scope (Black creators, culture first, no
          politics), then add approved shows to data/seed/podcasts_seed.csv.
        </p>
        <div className="overflow-x-auto rounded-[1.5rem] border border-sky-50 bg-white shadow-sm">
          <table className="w-full min-w-[36rem] text-left">
            <thead>
              <tr>
                {["Show", "Contact", "Email", "Link"].map((h) => (
                  <th
                    key={h}
                    className="border-b border-sky-100 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-ink-faint"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.listings.length === 0 && (
                <tr>
                  <Cell>None yet.</Cell>
                  <Cell>{""}</Cell>
                  <Cell>{""}</Cell>
                  <Cell>{""}</Cell>
                </tr>
              )}
              {data.listings.map((l) => (
                <tr key={String(l.id)}>
                  <Cell>{String(l.showName)}</Cell>
                  <Cell>{String(l.contactName ?? "")}</Cell>
                  <Cell>{String(l.email)}</Cell>
                  <Cell>
                    {l.showUrl ? (
                      <a
                        href={String(l.showUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-500 hover:text-sky-600"
                      >
                        Open ↗
                      </a>
                    ) : (
                      ""
                    )}
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
