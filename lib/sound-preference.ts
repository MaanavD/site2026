export function soundPref() {
  return typeof window !== "undefined" && localStorage.getItem("sound") === "on";
}

export function setSoundPreference(on: boolean) {
  localStorage.setItem("sound", on ? "on" : "off");
}
