import { ClaimSearch } from "@/components/claim-search";

export const metadata = {
  title: "Claim Your Profile",
  description:
    "Search the Run the Play database, see if your show is listed and claimed, and verify with your business email.",
  alternates: { canonical: "/claim" },
};

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-5 py-14 text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-500">
        For Creators
      </p>
      <h1 className="display text-4xl text-ink sm:text-5xl">
        Claim Your Profile.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-ink-dim">
        Listing is free. Search the database to see if your show is in and
        whether it's claimed. Verify with your public business email. If it
        matches what's on file, you're verified instantly.
      </p>
      <div className="mt-8">
        <ClaimSearch initialQuery={q ?? ""} />
      </div>
    </div>
  );
}
