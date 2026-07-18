"use client";

import { useCallback, useSyncExternalStore } from "react";
import { isRead, markRead } from "@/lib/read-marks";
import { setSoundPreference, soundPref } from "@/lib/sound-preference";

const READ_MARKS_KEY = "read-posts";
const SOUND_KEY = "sound";
const listeners = new Map<string, Set<() => void>>();
const getServerSnapshot = () => false;

function useLocalStorageBoolean(key: string, getSnapshot: () => boolean) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const keyListeners = listeners.get(key) ?? new Set();
      keyListeners.add(onStoreChange);
      listeners.set(key, keyListeners);

      const onStorage = (event: StorageEvent) => {
        if (event.key === key) onStoreChange();
      };
      window.addEventListener("storage", onStorage);

      return () => {
        window.removeEventListener("storage", onStorage);
        keyListeners.delete(onStoreChange);
        if (!keyListeners.size) listeners.delete(key);
      };
    },
    [key]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

export function useReadStatus(slug: string) {
  const getSnapshot = useCallback(() => isRead(slug), [slug]);
  return useLocalStorageBoolean(READ_MARKS_KEY, getSnapshot);
}

export function markPostRead(slug: string) {
  markRead(slug);
  notify(READ_MARKS_KEY);
}

export function useSoundPreference() {
  return useLocalStorageBoolean(SOUND_KEY, soundPref);
}

export function updateSoundPreference(on: boolean) {
  setSoundPreference(on);
  notify(SOUND_KEY);
  if (!on) {
    void import("@/lib/sound").then(({ stopWind }) => stopWind());
  }
}
