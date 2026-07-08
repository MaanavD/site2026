"use client";

import { useEffect, useState } from "react";
import { Gloss } from "./gloss";
import { Sparkler } from "./motifs";
import { soundPref, setSound, chime } from "@/lib/sound";

export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => setOn(soundPref()), []);

  return (
    <Gloss gloss={on ? "sound on" : "sound off"} side="bottom">
      <button
        aria-label={on ? "Mute sounds" : "Enable sounds"}
        onClick={() => {
          const next = !on;
          setOn(next);
          setSound(next);
          if (next) chime();
        }}
        className={`relative transition-colors ${
          on ? "text-turmeric" : "text-paper-faint hover:text-paper-dim"
        }`}
      >
        <Sparkler className="h-5 w-5" lit={on} />
        {!on && (
          <span className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-paper-faint" />
        )}
      </button>
    </Gloss>
  );
}
