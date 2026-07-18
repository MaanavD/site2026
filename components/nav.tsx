"use client";

import { motion, useReducedMotion } from "motion/react";
import { TransitionLink } from "./ink-transition";
import { Gloss } from "./gloss";
import { LotusSeal } from "./motifs";
import { SoundToggle } from "./sound-toggle";
import { usePathname } from "next/navigation";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#work", label: "Work" },
  { href: "/blog", label: "Writing" },
  { href: "/#contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const scrollToHash = (e: React.MouseEvent, href: string) => {
    if (!href.startsWith("/#") || pathname !== "/") return;
    e.preventDefault();
    document
      .querySelector(href.slice(1))
      ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", href);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-gradient-to-b from-ink-950/90 via-ink-950/50 to-transparent">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <TransitionLink
          href="/"
          aria-label="Home"
          className="group flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric"
        >
          <Gloss gloss="a lotus, carved like a stamp" side="bottom">
            {/* the seal leaps when pressed. small, strong, back in a beat */}
            <motion.span
              whileTap={reduceMotion ? undefined : { y: -9, rotate: 10, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 500, damping: 14 }}
              className="flex h-9 w-9 items-center justify-center rounded-sm bg-madder text-paper transition-transform duration-300 group-hover:rotate-6"
            >
              <LotusSeal className="h-6 w-6" />
            </motion.span>
          </Gloss>
          <span className="hidden font-mono text-xs tracking-[0.25em] text-paper-dim uppercase transition-colors group-hover:text-paper sm:block">
            Maanav Dalal
          </span>
        </TransitionLink>
        <ul className="flex items-center gap-3 text-sm sm:gap-7">
          {links.map((l) => (
            <li key={l.href}>
              <TransitionLink
                href={l.href}
                onClick={(e) => scrollToHash(e, l.href)}
                data-active={
                  l.href === "/blog" && pathname.startsWith("/blog")
                }
                aria-current={
                  l.href === "/blog" && pathname.startsWith("/blog")
                    ? "page"
                    : undefined
                }
                className="brush-link text-paper-dim transition-colors hover:text-paper focus-visible:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric"
              >
                {l.label}
              </TransitionLink>
            </li>
          ))}
          <li className="hidden min-[360px]:flex">
            <SoundToggle />
          </li>
        </ul>
      </nav>
    </header>
  );
}
