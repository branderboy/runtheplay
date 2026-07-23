"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";

/** A show saved to the buyer's media mix (client-side, persisted locally). */
export interface BasketItem {
  slug: string;
  name: string;
  category: string | null;
  artworkUrl?: string | null;
}

interface BasketState {
  items: BasketItem[];
  add: (item: BasketItem) => void;
  remove: (slug: string) => void;
  has: (slug: string) => boolean;
  clear: () => void;
}

const BasketContext = createContext<BasketState | null>(null);
const KEY = "rtp-media-mix";

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: BasketItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const state: BasketState = {
    items,
    add: (item) => {
      if (!items.some((i) => i.slug === item.slug)) persist([...items, item]);
    },
    remove: (slug) => persist(items.filter((i) => i.slug !== slug)),
    has: (slug) => items.some((i) => i.slug === slug),
    clear: () => persist([]),
  };

  return (
    <BasketContext.Provider value={state}>{children}</BasketContext.Provider>
  );
}

export function useBasket(): BasketState {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used inside BasketProvider");
  return ctx;
}

/* ------------------------- header cart icon + badge ------------------------ */

export function CartButton() {
  const { items } = useBasket();
  return (
    <Link
      href="/basket"
      aria-label={`Your media mix (${items.length} shows)`}
      className="group relative p-2 text-white/70 transition-colors hover:text-sky-400"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="transition-transform group-hover:scale-110"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {items.length > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-navy bg-orange text-[10px] font-black text-white shadow-md">
          {items.length}
        </span>
      )}
    </Link>
  );
}

/* --------------------- Add to Plan button (podcast card) -------------------- */

export function AddToPlanButton({
  slug,
  name,
  category,
  artworkUrl = null,
}: {
  slug: string;
  name: string;
  category: string | null;
  artworkUrl?: string | null;
}) {
  const { add, has } = useBasket();
  const added = has(slug);
  return (
    <button
      type="button"
      disabled={added}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add({ slug, name, category, artworkUrl });
      }}
      className={`flex-1 rounded-full py-3 text-xs font-black uppercase tracking-widest transition-all ${
        added
          ? "cursor-default border border-sky-100 bg-sky-50 text-sky-600"
          : "bg-orange text-white shadow-[0_10px_20px_-10px_rgba(249,115,22,0.6)] hover:-translate-y-0.5 hover:bg-orange-600"
      }`}
    >
      {added ? "Added" : "+ Add to Plan"}
    </button>
  );
}

/* ---------------------- sticky bottom plan summary bar ---------------------- */

export function PlanSummaryBar() {
  const { items } = useBasket();
  return (
    <div
      aria-hidden={items.length === 0}
      className={`fixed bottom-6 left-1/2 z-40 flex w-[92%] max-w-3xl -translate-x-1/2 items-center justify-between rounded-[2.5rem] border border-sky-100 bg-white p-3 shadow-[0_30px_60px_-10px_rgba(14,165,233,0.25)] transition-transform duration-500 ${
        items.length > 0 ? "translate-y-0" : "translate-y-40"
      }`}
    >
      <div className="flex items-center gap-4 pl-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-xl font-black text-sky-600">
          {items.length}
        </div>
        <div>
          <p className="font-black uppercase tracking-tight text-ink">
            Media Mix Building
          </p>
          <p className="text-sm font-bold text-ink-dim">
            {items.length} {items.length === 1 ? "show" : "shows"} saved
          </p>
        </div>
      </div>
      <Link
        href="/basket"
        className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-7 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5"
      >
        Finalize Plan
      </Link>
    </div>
  );
}
