import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 23, 2026">
      <p>
        This policy explains what information Run the Play collects, how we use
        it, and the choices you have. It is a plain-language summary of our
        practices, not legal advice.
      </p>

      <h2>Information We Collect</h2>
      <h3>Podcast and Creator Information</h3>
      <p>
        We build podcast profiles from <strong>publicly available sources</strong>:
        official websites, RSS feeds, public platform pages (YouTube, Spotify,
        Apple, Instagram, TikTok), and business contact details a show has chosen
        to publish. We also collect information that a creator submits when they
        claim or update a profile.
      </p>
      <h3>Buyer and Visitor Information</h3>
      <p>
        When you build a plan, send an inquiry, subscribe to the newsletter, or
        create an account, we collect the information you provide (such as your
        email and campaign details) and basic, privacy-aware usage analytics.
      </p>

      <h2>How We Use Information</h2>
      <ul>
        <li>To operate the directory, Ad Planner, and profiles.</li>
        <li>To route your inquiry to a show's own contact. We do not broker deals.</li>
        <li>To send the newsletter you opted into, and to confirm that opt-in.</li>
        <li>To verify profile claims and prevent abuse.</li>
        <li>To measure and improve the product in aggregate.</li>
      </ul>

      <h2>The Newsletter Is Opt-In</h2>
      <p>
        We only add you to the newsletter after you confirm your subscription
        (double opt-in). Every email includes a one-click unsubscribe, and we
        keep a suppression list so an unsubscribe is honored permanently. We do
        not add publicly listed business emails to the newsletter.
      </p>

      <h2>Sharing</h2>
      <p>
        We do not sell personal information. We share it only with service
        providers that help us run the product (for example, email delivery,
        hosting, and analytics), under agreements that limit their use of it, or
        where required by law.
      </p>

      <h2>Your Choices and Rights</h2>
      <ul>
        <li>Unsubscribe from any email using the link in it.</li>
        <li>
          Request access to, correction of, or deletion of your personal
          information, subject to applicable law.
        </li>
        <li>
          Creators can claim a profile to correct it, or request changes or
          removal. See our{" "}
          <a href="/legal/data-and-corrections">Data & Corrections</a> page.
        </li>
      </ul>

      <h2>Data Retention and Security</h2>
      <p>
        We keep information for as long as needed to run the product and meet
        legal obligations, and we protect access tokens and account data with
        reasonable safeguards. Platform access tokens are encrypted and never
        exposed to the browser.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or requests: <a href="mailto:privacy@runtheplay.com">privacy@runtheplay.com</a>.
      </p>

      <p className="text-sm">
        This is a working draft and should be reviewed by qualified counsel
        before launch, including CCPA/CPRA and GDPR/UK-GDPR obligations that may
        apply to your users.
      </p>
    </LegalPage>
  );
}
