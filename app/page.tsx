import { Hero } from "@/components/hero";
import { Work } from "@/components/work";
import { About } from "@/components/about";
import { Writing } from "@/components/writing";
import { ContactCta } from "@/components/contact-cta";

export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Hero />
      <Work />
      <About />
      <Writing />
      <ContactCta />
    </>
  );
}
