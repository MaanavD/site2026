"use client";

import { useEffect, useState } from "react";
import { Gloss } from "./gloss";
import { soundPref, setSound, pluck } from "@/lib/sound";

export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => setOn(soundPref()), []);

  return (
    <Gloss gloss={on ? "oto · sound on" : "oto · sound off"} side="bottom">
      <button
        aria-label={on ? "Mute sounds" : "Enable sounds"}
        onClick={() => {
          const next = !on;
          setOn(next);
          setSound(next);
          if (next) pluck(2);
        }}
        className={`relative font-display text-lg transition-colors ${
          on ? "text-celadon" : "text-paper-faint hover:text-paper-dim"
        }`}
      >
        音
        {!on && (
          <span className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-paper-faint" />
        )}
      </button>
    </Gloss>
  );
}
