import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab · Stepwell",
  robots: { index: false },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
