let context: AudioContext | null = null;

export function primeAudioContext() {
  if (typeof AudioContext === "undefined") return null;
  if (!context) context = new AudioContext();
  if (context.state === "suspended") void context.resume();
  return context;
}

export function whenAudioRunning(callback: (context: AudioContext) => void) {
  const audioContext = primeAudioContext();
  if (!audioContext) return;
  if (audioContext.state === "running") {
    callback(audioContext);
    return;
  }
  void audioContext.resume().then(() => callback(audioContext)).catch(() => {});
}
