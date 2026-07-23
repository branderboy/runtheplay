import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Data, Corrections & Opt-Out" };

export default function DataPage() {
  return (
    <LegalPage title="Data, Corrections & Opt-Out" updated="July 23, 2026">
      <p>
        Run the Play features Black creators. We want every profile to be
        accurate and every creator to control how they appear. This page explains
        where our data comes from and how to correct, claim, or remove a profile.
      </p>

      <h2>Where profile data comes from</h2>
      <p>
        Unclaimed profiles are built from <strong>public sources</strong> — a
        show's official website, RSS feed, public platform pages, and business
        contact details the show has published. We record where each field came
        from and when it was checked. Figures we cannot verify are labeled{" "}
        <strong>estimated</strong> or marked as needing verification, and we never
        present an estimate as a verified fact.
      </p>

      <h2>How we label trust</h2>
      <ul>
        <li><strong>Verified</strong> — confirmed by the creator or an authorized connection.</li>
        <li><strong>Public</strong> — visible on an official public source, shown with a date.</li>
        <li><strong>Estimated</strong> — modeled or third-party; clearly labeled, never a quoted rate.</li>
        <li><strong>Unclaimed</strong> — no owner has verified the profile yet.</li>
      </ul>

      <h2>Claim your profile</h2>
      <p>
        Listing is free. Claiming lets you correct your information, add
        advertising options, and choose how brands reach you. If the email you
        verify with matches the public business contact we already have on file,
        your claim is verified instantly; otherwise a person reviews it.{" "}
        <a href="/claim">Find and claim your show →</a>
      </p>

      <h2>Report incorrect data</h2>
      <p>
        Anyone can flag a metric or field that looks wrong. We preserve the
        original, review the evidence, and update or remove the value. Email{" "}
        <a href="mailto:corrections@runtheplay.com">corrections@runtheplay.com</a>{" "}
        with the show and the field in question.
      </p>

      <h2>Opt out of outreach or listing</h2>
      <p>
        A show can ask us to stop contacting it, or to remove its profile
        entirely. Requests are honored and added to a suppression list so they
        are not re-added. Email{" "}
        <a href="mailto:optout@runtheplay.com">optout@runtheplay.com</a> from a
        contact associated with the show.
      </p>

      <h2>Outreach vs. newsletter</h2>
      <p>
        These are separate. A one-time "your show was featured — claim it"
        message is transactional outreach with its own opt-out. The weekly
        newsletter is <strong>opt-in only</strong>, confirmed by double opt-in,
        and is never seeded from publicly listed business emails.
      </p>

      <p className="text-sm">
        Draft — review with counsel, especially for data-subject rights and
        platform API terms that govern what may be displayed and stored.
      </p>
    </LegalPage>
  );
}
