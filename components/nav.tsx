"use client";

import { TransitionLink } from "./ink-transition";
import { Gloss } from "./gloss";
import { SoundToggle } from "./sound-toggle";
import { usePathname } from "next/navigation";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/blog", label: "Writing" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();

  const scrollToHash = (e: React.MouseEvent, href: string) => {
    if (!href.startsWith("/#") || pathname !== "/") return;
    e.preventDefault();
    document
      .querySelector(href.slice(1))
      ?.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", href);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <TransitionLink
          href="/"
          aria-label="Home"
          className="group flex items-center gap-3"
        >
          <Gloss gloss='makoto · "truth, authenticity"' side="bottom">
            <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-moss font-display text-lg font-bold text-ink-950 transition-transform duration-300 group-hover:rotate-6">
              真
            </span>
          </Gloss>
          <span className="hidden font-display text-sm tracking-[0.2em] text-paper-dim uppercase transition-colors group-hover:text-paper sm:block">
            Maanav Dalal
          </span>
        </TransitionLink>
        <ul className="flex items-center gap-5 text-sm sm:gap-7">
          {links.map((l) => (
            <li key={l.href}>
              <TransitionLink
                href={l.href}
                onClick={(e) => scrollToHash(e, l.href)}
                data-active={
                  l.href !== "/#work" &&
                  l.href !== "/#about" &&
                  l.href !== "/#contact" &&
                  pathname.startsWith(l.href)
                }
                className="brush-link text-paper-dim transition-colors hover:text-paper"
              >
                {l.label}
              </TransitionLink>
            </li>
          ))}
          <li className="flex">
            <SoundToggle />
          </li>
        </ul>
      </nav>
    </header>
  );
}
