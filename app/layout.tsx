import type { Metadata } from "next";
import { Geist, Geist_Mono, Rozha_One } from "next/font/google";
import "./globals.css";
import { InkTransition } from "@/components/ink-transition";
import { EnsoListener } from "@/components/enso-listener";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const siteDescription =
  "Developer Relations Engineer at Black Forest Labs. Building demos, giving talks, and writing about AI, design, and life.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rozha = Rozha_One({
  variable: "--font-rozha",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.maanavdalal.com"),
  title: {
    default: "Maanav Dalal",
    template: "%s · Maanav Dalal",
  },
  description: siteDescription,
  applicationName: "Maanav Dalal",
  authors: [{ name: "Maanav Dalal", url: "https://www.maanavdalal.com" }],
  creator: "Maanav Dalal",
  openGraph: {
    title: "Maanav Dalal",
    description: siteDescription,
    url: "/",
    siteName: "Maanav Dalal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maanav Dalal",
    description: siteDescription,
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
        <InkTransition>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
          <EnsoListener />
        </InkTransition>
      </body>
    </html>
  );
}
