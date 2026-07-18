import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { Work } from "@/components/work";
import { About } from "@/components/about";
import { Writing } from "@/components/writing";
import { ContactCta } from "@/components/contact-cta";
import {
  canonicalAlternates,
  HOME_TITLE,
  serializeJsonLd,
  sharedOpenGraph,
  sharedTwitter,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: SITE_DESCRIPTION,
  alternates: canonicalAlternates("/"),
  openGraph: {
    ...sharedOpenGraph,
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    type: "profile",
  },
  twitter: {
    ...sharedTwitter,
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
  },
};

const profileJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#profile`,
  url: SITE_URL,
  name: HOME_TITLE,
  description: SITE_DESCRIPTION,
  mainEntity: {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: SITE_NAME,
    url: SITE_URL,
    jobTitle: "Developer Relations Engineer",
    worksFor: {
      "@type": "Organization",
      name: "Black Forest Labs",
      url: "https://blackforestlabs.ai",
    },
    sameAs: [
      "https://github.com/MaanavD",
      "https://x.com/maanavdalal",
      "https://www.linkedin.com/in/maanavdalal/",
    ],
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(profileJsonLd) }}
      />
      <Hero />
      <About />
      <Work />
      {/* Future talks and demos live here. */}
      <Writing />
      <ContactCta />
    </>
  );
}
