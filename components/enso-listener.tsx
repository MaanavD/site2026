"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useInkTransition } from "./ink-transition";

type Pt = { x: number; y: number; t: number };

// Invisible: watches the native cursor for a drawn circle (ensō).
// A recognized circle flashes a ring and opens the garden.
export function EnsoListener() {
  const { navigate } = useInkTransition();
  const pathname = usePathname();
  const [burst, setBurst] = useState<{ x: number; y: number; k: number } | null>(
    null
  );

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const pts: Pt[] = [];
    let last = 0;

    const onMove = (e: PointerEvent) => {
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (pts.length > 160) pts.shift();

      const now = performance.now();
      if (now - last < 4000 || pathname === "/garden") return;
      const win = pts.filter((p) => now - p.t < 2000);
      if (win.length < 24) return;

      let cx = 0,
        cy = 0;
      for (const p of win) {
        cx += p.x;
        cy += p.y;
      }
      cx /= win.length;
      cy /= win.length;

      const radii = win.map((p) => Math.hypot(p.x - cx, p.y - cy));
      const mean = radii.reduce((a, b) => a + b, 0) / radii.length;
      if (mean < 40 || mean > 380) return;
      const variance =
        radii.reduce((a, r) => a + (r - mean) ** 2, 0) / radii.length;
      if (Math.sqrt(variance) / mean > 0.32) return;

      let sweep = 0;
      let prev = Math.atan2(win[0].y - cy, win[0].x - cx);
      for (let i = 1; i < win.length; i++) {
        const a = Math.atan2(win[i].y - cy, win[i].x - cx);
        let d = a - prev;
        if (d > Math.PI) d -= 2 * Math.PI;
        if (d < -Math.PI) d += 2 * Math.PI;
        sweep += d;
        prev = a;
      }
      if (Math.abs(sweep) < 5.5) return;

      last = now;
      pts.length = 0;
      localStorage.setItem("garden-unlocked", "1");
      setBurst({ x: cx, y: cy, k: now });
      setTimeout(() => navigate("/garden"), 550);
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!burst) return null;
  return (
    <span
      key={burst.k}
      aria-hidden
      className="enso-burst pointer-events-none fixed z-[150] rounded-full border-2 border-celadon"
      style={{ left: burst.x, top: burst.y }}
      onAnimationEnd={() => setBurst(null)}
    />
  );
}
