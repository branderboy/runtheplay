import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BasketProvider, PlanSummaryBar } from "@/components/basket";
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Plan podcast advertising with Black creators. Tell us your goal, audience, and budget — Run the Play organizes the right shows.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Plan podcast advertising with Black creators — directory, ad planner, charts, and campaign plays.",
    url: SITE_URL,
    images: ["/runlogo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Plan podcast advertising with Black creators — directory, ad planner, charts, and campaign plays.",
    images: ["/runlogo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Loaded at runtime with system-font fallback; no build-time fetch. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-sky-500 focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to content
        </a>
        <BasketProvider>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <PlanSummaryBar />
          <SiteFooter />
        </BasketProvider>
      </body>
    </html>
  );
}
