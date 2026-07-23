import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="July 23, 2026">
      <p>
        These terms govern your use of Run the Play. By using the site, you agree
        to them. This is a plain-language draft, not legal advice.
      </p>

      <h2>What Run the Play Is, and Is Not</h2>
      <p>
        Run the Play is a <strong>discovery and planning platform</strong> for
        podcast advertising with Black creators. We help buyers find shows,
        organize a plan, and contact shows directly.
      </p>
      <p>We are <strong>not</strong>:</p>
      <ul>
        <li>an advertising agency, media buyer, or broker;</li>
        <li>a payment processor for ad deals;</li>
        <li>a representative of the podcasts listed; or</li>
        <li>a guarantor of audience size, results, pricing, or availability.</li>
      </ul>

      <h2>No Guarantees on Listings</h2>
      <p>
        Many profiles are built from public sources and shown{" "}
        <strong>unverified</strong> until a creator claims them. Reach figures,
        prices, formats, and availability are set by each show and may be
        incomplete, estimated, or out of date. Confirm all terms directly with
        the podcast before spending money. Estimated figures are labeled as
        estimates and are not quoted rates.
      </p>

      <h2>Inquiries and Deals</h2>
      <p>
        When you contact a show through Run the Play, any resulting agreement is
        strictly between you and that show. We are not a party to it and take no
        commission on it.
      </p>

      <h2>Creator Accounts and Boosts</h2>
      <p>
        Listing is free. Creators may claim a profile to control their
        information and advertising options. Paid boosts increase a listing's
        visibility on labeled surfaces only; they are described on our{" "}
        <a href="/legal/ranking">How Ranking & Featured Placement Work</a> page and
        never buy a false editorial endorsement.
      </p>

      <h2>Acceptable Use</h2>
      <ul>
        <li>Do not submit false claims of profile ownership.</li>
        <li>Do not scrape, overload, or misuse the service.</li>
        <li>Do not use the service for unlawful, deceptive, or harmful purposes.</li>
      </ul>

      <h2>Intellectual Property</h2>
      <p>
        Podcast names, artwork, and clips belong to their owners and are used to
        identify shows. Creators can request corrections or removal at any time.
      </p>

      <h2>Disclaimers and Liability</h2>
      <p>
        The service is provided "as is," without warranties of any kind. To the
        fullest extent permitted by law, Run the Play is not liable for indirect
        or consequential damages, or for the outcome of any advertising
        arrangement made between a buyer and a show.
      </p>

      <h2>Changes and Contact</h2>
      <p>
        We may update these terms; material changes will be posted here.
        Questions: <a href="mailto:hello@runtheplay.com">hello@runtheplay.com</a>.
      </p>

      <p className="text-sm">
        Draft for internal use. Have counsel review before launch, including
        governing-law, arbitration, and limitation-of-liability provisions for
        your jurisdiction.
      </p>
    </LegalPage>
  );
}
