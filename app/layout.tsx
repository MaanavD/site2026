import type { Metadata } from "next";
import { Geist, Geist_Mono, Shippori_Mincho } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { InkTransition } from "@/components/ink-transition";
import { EnsoListener } from "@/components/enso-listener";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const shippori = Shippori_Mincho({
  variable: "--font-shippori",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.maanavdalal.com"),
  title: {
    default: "Maanav Dalal",
    template: "%s · Maanav Dalal",
  },
  description:
    "Developer Relations Engineer at Black Forest Labs. Building demos, giving talks, and writing about AI, design, and life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${shippori.variable} h-full antialiased`}
    >
      <body className="grain min-h-full flex flex-col">
        <SmoothScroll>
          <InkTransition>
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
            <EnsoListener />
          </InkTransition>
        </SmoothScroll>
      </body>
    </html>
  );
}
