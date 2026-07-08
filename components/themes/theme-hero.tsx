"use client";

import dynamic from "next/dynamic";

const StepwellCanvas = dynamic(() => import("@/components/stepwell-canvas"), {
  ssr: false,
});

// the real hero shader, pinned to the prettiest hour for the style tile
export function ThemeHero() {
  return <StepwellCanvas scene={3} season={3} />;
}
