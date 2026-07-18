"use client";

import { primeAudioContext } from "@/lib/audio-context";
import { Gloss } from "./gloss";
import { Marigold } from "./motifs";
import {
  updateSoundPreference,
  useSoundPreference,
} from "./use-local-storage-boolean";

export function SoundToggle() {
  const on = useSoundPreference();

  return (
    <Gloss gloss={on ? "sound on" : "sound off"} side="bottom">
      <button
        aria-label={on ? "Mute sounds" : "Enable sounds"}
        onClick={() => {
          const next = !on;
          if (next) primeAudioContext();
          updateSoundPreference(next);
          if (next) {
            void import("@/lib/sound").then(({ chime }) => chime());
          }
        }}
        className={`relative flex h-8 w-8 items-center justify-center rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turmeric ${
          on ? "text-turmeric" : "text-paper-faint hover:text-paper-dim"
        }`}
      >
        <Marigold className="h-5 w-5" />
        {!on && (
          <span className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-paper-faint" />
        )}
      </button>
    </Gloss>
  );
}
