import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { InkTransition } from "@/components/ink-transition";
import { EnsoListener } from "@/components/enso-listener";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import {
  AUTHOR_NAME,
  RSS_PATH,
  sharedOpenGraph,
  sharedTwitter,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rozha = localFont({
  src: "../assets/RozhaOne-Regular.ttf",
  variable: "--font-rozha",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  alternates: {
    types: {
      "application/rss+xml": RSS_PATH,
    },
  },
  openGraph: {
    ...sharedOpenGraph,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    type: "website",
  },
  twitter: {
    ...sharedTwitter,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${rozha.variable} h-full antialiased`}
    >
      <body className="grain min-h-full flex flex-col">
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[110] -translate-y-24 rounded-sm bg-turmeric px-4 py-3 font-mono text-sm font-semibold text-ink-950 transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <InkTransition>
          <Nav />
          <main id="main-content" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <Footer />
          <EnsoListener />
        </InkTransition>
      </body>
    </html>
  );
}
