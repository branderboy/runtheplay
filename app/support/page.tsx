import { SupportForm } from "@/components/support-form";

export const metadata = {
  title: "Support",
  description: "Questions about advertising, claiming a show, or your data. We reply by email.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-500">
        Support
      </p>
      <h1 className="display text-4xl text-ink sm:text-5xl">How Can We Help?</h1>
      <p className="mt-4 max-w-xl text-lg font-medium text-ink-dim">
        Advertiser questions, claims, corrections, anything. We reply to your
        email.
      </p>
      <div className="mt-10 rounded-[2rem] border border-sky-50 bg-white p-8 shadow-[0_10px_30px_-15px_rgba(14,165,233,0.12)]">
        <SupportForm />
      </div>
    </div>
  );
}
