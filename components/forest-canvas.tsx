"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "motion/react";

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

// The forest knows the hour AND the calendar.
// u_scene: 0 night, 1 dawn, 2 day, 3 dusk (wraps).
// u_season: 0 winter, 1 spring, 2 summer, 3 autumn (wraps).
// u_descend: 0..1 scroll progress — treelines rise past you, ink swallows the sky.
const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_scene;
  uniform float u_season;
  uniform float u_descend;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p);
      p = rot * p * 2.02;
      amp *= 0.5;
    }
    return v;
  }

  vec3 keyMix(vec3 a, vec3 b, vec3 c, vec3 d, float s) {
    float f = fract(s);
    f = f * f * (3.0 - 2.0 * f);
    float i = floor(mod(s, 4.0));
    if (i < 0.5) return mix(a, b, f);
    if (i < 1.5) return mix(b, c, f);
    if (i < 2.5) return mix(c, d, f);
    return mix(d, a, f);
  }

  float keyMixF(float a, float b, float c, float d, float s) {
    float f = fract(s);
    f = f * f * (3.0 - 2.0 * f);
    float i = floor(mod(s, 4.0));
    if (i < 0.5) return mix(a, b, f);
    if (i < 1.5) return mix(b, c, f);
    if (i < 2.5) return mix(c, d, f);
    return mix(d, a, f);
  }

  vec2 keyMix2(vec2 a, vec2 b, vec2 c, vec2 d, float s) {
    return vec2(
      keyMixF(a.x, b.x, c.x, d.x, s),
      keyMixF(a.y, b.y, c.y, d.y, s)
    );
  }

  // a row of firs: one jittered triangular crown per cell
  float conifers(float x, float density, float seed) {
    float cell = floor(x * density);
    float f = fract(x * density);
    float h = hash(vec2(cell, seed));
    float apex = 0.30 + 0.40 * hash(vec2(cell, seed + 7.0));
    float tri = f < apex ? f / apex : (1.0 - f) / (1.0 - apex);
    // slight concave sides so crowns read as pine, not sawtooth
    tri = pow(tri, 1.35);
    return tri * (0.30 + 0.70 * h);
  }

  float treeline(float x, float seed, float freq, float amp, float base,
    float density, float treeAmp) {
    float ridge = base + fbm(vec2(x * freq + seed, seed)) * amp;
    return ridge + conifers(x, density, seed) * treeAmp;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    float s = u_scene;
    float sn = u_season;
    float dd = u_descend;
    float t = u_time;

    vec2 p = uv;
    p.x *= aspect;
    p *= 2.2;

    vec2 m = u_mouse;
    float mx = m.x - 0.5;
    vec2 mp = vec2(m.x * aspect, m.y) * 2.2;
    float md = exp(-distance(p, mp) * 1.4);

    // ---- time-of-day parameters
    vec3 skyTop = keyMix(
      vec3(0.014, 0.018, 0.030),
      vec3(0.120, 0.115, 0.135),
      vec3(0.185, 0.195, 0.195),
      vec3(0.080, 0.060, 0.100),
      s);
    vec3 skyHor = keyMix(
      vec3(0.032, 0.038, 0.048),
      vec3(0.330, 0.250, 0.160),
      vec3(0.300, 0.290, 0.255),
      vec3(0.380, 0.195, 0.105),
      s);
    vec3 sunCol = keyMix(
      vec3(0.72, 0.78, 0.74),
      vec3(0.88, 0.64, 0.34),
      vec3(0.95, 0.92, 0.80),
      vec3(0.85, 0.44, 0.20),
      s);
    vec2 sunPos = keyMix2(
      vec2(0.78, 0.80),
      vec2(0.24, 0.42),
      vec2(0.50, 0.84),
      vec2(0.72, 0.40),
      s);
    float sunR = keyMixF(0.045, 0.085, 0.040, 0.105, s);
    float haloAmt = keyMixF(0.35, 0.55, 0.30, 0.75, s);
    float rayAmt = keyMixF(0.0, 1.0, 0.12, 0.25, s);
    float starAmt = keyMixF(1.0, 0.08, 0.0, 0.25, s);
    float flyAmt = keyMixF(1.0, 0.12, 0.0, 0.55, s);
    vec3 flyCol = keyMix(
      vec3(0.64, 0.78, 0.66),
      vec3(0.80, 0.68, 0.45),
      vec3(0.0, 0.0, 0.0),
      vec3(0.88, 0.52, 0.25),
      s);
    float mistAmt = keyMixF(0.18, 1.0, 0.30, 0.45, s);
    float inkAmt = keyMixF(1.0, 0.72, 0.55, 0.88, s);

    // ---- seasonal parameters (winter, spring, summer, autumn)
    float fallAmt = keyMixF(1.0, 0.9, 0.0, 1.0, sn);
    vec3 fallCol = keyMix(
      vec3(0.82, 0.85, 0.88),   // snow
      vec3(0.86, 0.66, 0.70),   // sakura petals
      vec3(0.0, 0.0, 0.0),
      vec3(0.74, 0.36, 0.16),   // maple leaves
      sn);
    float fallSize = keyMixF(120.0, 85.0, 90.0, 70.0, sn);
    float fallSpeed = keyMixF(0.022, 0.034, 0.03, 0.046, sn);
    float fallSway = keyMixF(0.010, 0.030, 0.02, 0.040, sn);
    // fireflies belong to summer nights
    flyAmt *= keyMixF(0.05, 0.45, 1.0, 0.5, sn);
    // winter pales the whole scene slightly
    float frost = keyMixF(1.0, 0.0, 0.0, 0.0, sn);

    // ---- the descent: everything climbs as you scroll into the forest
    float rise = dd * dd * (3.0 - 2.0 * dd); // smooth
    inkAmt = mix(inkAmt, 1.2, rise);

    // ---- sky
    float horizon = smoothstep(0.85, 0.05, uv.y);
    vec3 col = mix(skyTop, skyHor, horizon);
    col = mix(col, col * vec3(1.06, 1.07, 1.10) + 0.012, frost * 0.7);

    // ---- stars
    vec2 scell = uv * vec2(70.0, 40.0);
    vec2 sgrid = floor(scell);
    float srnd = hash(sgrid);
    vec2 spos = vec2(hash(sgrid + 1.7), hash(sgrid + 4.2)) * 0.6 + 0.2;
    float sdist = length(fract(scell) - spos);
    float twinkle = 0.55 + 0.45 * sin(t * 2.0 + srnd * 40.0);
    float star = step(0.975, srnd) * smoothstep(0.16, 0.0, sdist)
      * twinkle * starAmt * smoothstep(0.35, 0.6, uv.y);
    col += vec3(0.7, 0.75, 0.72) * star * 0.9;

    // ---- sun / moon (fades as the trees swallow the view)
    vec2 sp = vec2(sunPos.x * aspect, sunPos.y + rise * 0.35);
    float sd = distance(vec2(uv.x * aspect, uv.y), sp);
    float sunFade = 1.0 - rise * 0.8;
    float disc = smoothstep(sunR, sunR * 0.72, sd);
    float halo = exp(-sd * 5.0);
    col += sunCol * (disc * 0.85 + halo * haloAmt) * sunFade;

    vec2 rdir = vec2(uv.x * aspect, uv.y) - sp;
    float ang = atan(rdir.y, rdir.x);
    float rays = max(0.0, sin(ang * 9.0 + t * 0.15))
      * max(0.0, sin(ang * 5.0 - t * 0.1));
    col += sunCol * rays * exp(-sd * 2.4) * rayAmt * 0.20 * sunFade;

    // ---- parallax treelines, rising with the descent
    float y = uv.y;

    float hFar = treeline(uv.x + mx * 0.015, 7.3, 1.6, 0.07,
      0.33 + rise * 0.40, 110.0, 0.030);
    float silFar = smoothstep(hFar + 0.003, hFar - 0.003, y);
    col = mix(col, mix(col, skyTop * 0.55, 0.75), silFar);

    float hMid = treeline(uv.x + mx * 0.035, 3.1, 2.4, 0.085,
      0.245 + rise * 0.55, 62.0, 0.055);
    float silMid = smoothstep(hMid + 0.0022, hMid - 0.0022, y);
    col = mix(col, skyTop * 0.32, silMid);

    float hNear = treeline(uv.x + mx * 0.06, 11.7, 3.6, 0.09,
      0.145 + rise * 0.75, 34.0, 0.085);
    float silNear = smoothstep(hNear + 0.0016, hNear - 0.0016, y);
    col = mix(col, vec3(0.012, 0.014, 0.016), silNear);

    // ---- mist hugging the treetops
    float mist = fbm(vec2(uv.x * 2.4 + t * 0.03, uv.y * 6.0 - t * 0.01));
    float mistBand = smoothstep(0.45, 0.18, abs(y - hMid - 0.02) * 6.0);
    col += skyHor * mist * mistBand * mistAmt * 0.5;

    // ---- interactive ink smoke
    vec2 ip = p + md * 0.55 * vec2(
      sin(t * 0.4 + p.y * 2.0),
      cos(t * 0.35 + p.x * 2.0)
    );
    float it = t * 0.06;
    vec2 q = vec2(fbm(ip + it), fbm(ip + vec2(5.2, 1.3) - it * 0.7));
    vec2 r = vec2(
      fbm(ip + 3.5 * q + vec2(1.7, 9.2) + it * 2.1),
      fbm(ip + 3.5 * q + vec2(8.3, 2.8) - it * 1.6)
    );
    float f = fbm(ip + 3.2 * r) + md * 0.25;

    float smoke = smoothstep(0.35, 0.95, f) * inkAmt;
    col = mix(col, vec3(0.045, 0.045, 0.055), smoke * 0.75);
    col += vec3(0.16, 0.16, 0.18) * smoothstep(0.75, 1.05, f) * inkAmt * 0.35;

    // ---- seasonal fall: snow / petals / leaves drifting down
    float fall = 0.0;
    for (int i = 0; i < 10; i++) {
      float fi = float(i);
      vec2 seed = vec2(hash(vec2(fi, 8.3)), hash(vec2(2.9, fi)));
      float depth = 0.5 + seed.y * 0.8; // nearer flakes fall faster, larger
      vec2 fp = vec2(
        fract(seed.x + fallSway * depth * 12.0 * sin(t * 0.4 + fi * 1.9)
          + t * 0.006 * depth),
        fract(seed.y - t * fallSpeed * depth)
      );
      float fd = distance(vec2(uv.x * aspect, uv.y), vec2(fp.x * aspect, fp.y));
      fall += exp(-fd * fallSize / depth) * (0.5 + 0.5 * sin(t * 2.0 + fi * 3.0));
    }
    col += fallCol * fall * fallAmt * 0.7;

    // ---- fireflies among the trees
    float flies = 0.0;
    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      vec2 seed = vec2(hash(vec2(fi, 3.7)), hash(vec2(9.1, fi)));
      vec2 fp = vec2(
        fract(seed.x + t * (0.010 + seed.y * 0.018)
          + 0.14 * sin(t * 0.3 + fi * 2.1)),
        0.06 + 0.30 * fract(seed.y + 0.05 * sin(t * 0.22 + fi * 1.7))
      );
      float pulse = max(0.0, sin(t * (1.2 + seed.x) + fi * 5.0));
      float fd = distance(vec2(uv.x * aspect, uv.y), vec2(fp.x * aspect, fp.y));
      flies += (exp(-fd * 55.0) + exp(-fd * 14.0) * 0.12) * pulse * pulse;
    }
    col += flyCol * flies * flyAmt * 0.85;

    // ---- pointer glow
    col += flyCol * md * smoothstep(0.5, 0.95, f) * 0.28;
    col += vec3(0.20, 0.36, 0.26) * md * md * 0.15;

    // vignette tightens as you go deeper
    float vig = smoothstep(1.3 - rise * 0.45, 0.35 - rise * 0.1,
      distance(uv, vec2(0.5, 0.45)));
    col *= mix(0.72 - rise * 0.2, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function sceneFromHour(hour: number) {
  if (hour >= 5 && hour < 10) return 1;
  if (hour >= 10 && hour < 17) return 2;
  if (hour >= 17 && hour < 21) return 3;
  return 0;
}

export function seasonFromMonth(month: number) {
  if (month >= 2 && month <= 4) return 1; // spring
  if (month >= 5 && month <= 7) return 2; // summer
  if (month >= 8 && month <= 10) return 3; // autumn
  return 0; // winter
}

function ForestPlane({
  scene,
  season,
  descend,
}: {
  scene: number;
  season: number;
  descend?: MotionValue<number>;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const gl = useThree((s) => s.gl);
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));

  // mouse in canvas-local UV space, so tracking holds at any viewport,
  // scroll offset, or zoom level
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      targetMouse.current.set(
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height
      );
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl]);

  useFrame((_, delta) => {
    if (!mat.current) return;
    const u = mat.current.uniforms;
    u.u_time.value += delta;
    // gl_FragCoord is in device pixels — the resolution must match it,
    // or every retina screen renders the scene misaligned and stretched
    u.u_resolution.value.set(gl.domElement.width, gl.domElement.height);
    u.u_mouse.value.lerp(targetMouse.current, 0.045);
    u.u_scene.value += (scene - u.u_scene.value) * 0.03;
    u.u_season.value += (season - u.u_season.value) * 0.03;
    const d = descend?.get() ?? 0;
    u.u_descend.value += (d - u.u_descend.value) * 0.15;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          u_time: { value: 0 },
          u_resolution: { value: new THREE.Vector2(1, 1) },
          u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
          u_scene: { value: scene },
          u_season: { value: season },
          u_descend: { value: 0 },
        }}
      />
    </mesh>
  );
}

export default function ForestCanvas({
  scene,
  season,
  descend,
}: {
  scene?: number;
  season?: number;
  descend?: MotionValue<number>;
}) {
  const resolvedScene = scene ?? sceneFromHour(new Date().getHours());
  const resolvedSeason = season ?? seasonFromMonth(new Date().getMonth());

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ForestPlane
        scene={resolvedScene}
        season={resolvedSeason}
        descend={descend}
      />
    </Canvas>
  );
}
