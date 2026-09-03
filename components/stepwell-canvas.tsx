"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion, type MotionValue } from "motion/react";

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

// The vat knows the hour AND the calendar.
// u_scene: 0 night, 1 dawn, 2 day, 3 dusk (wraps).
// u_season: 0 winter, 1 spring, 2 summer, 3 autumn (wraps).
// u_descend: 0..1 scroll progress, the stepwell's tiers rise past you,
// light thins with depth, and still water waits at the bottom.
const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_scene;
  uniform float u_season;
  uniform float u_descend;
  uniform float u_stir;
  uniform float u_textOn;
  uniform vec4 u_textRect;
  uniform sampler2D u_text;
  uniform vec3 u_stones[4];

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
    for (int i = 0; i < 4; i++) {
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

  // a stepwell wall in silhouette: stone stairs descending toward the
  // centre of the frame, with a little hand-cut irregularity per step
  float tierSurf(float x, float steps, float seed, float base,
    float riseAmt, float profScale, float rise) {
    float cell = floor(abs(x - 0.5) * 2.0 * steps);
    float k = cell / steps;
    k += (hash(vec2(cell, seed)) - 0.5) * 0.04;
    return base + rise * riseAmt + k * profScale;
  }

  // Chand Baori's walls: flights of stairs crossing each other in a lattice,
  // cut from sandstone that sits in indigo shadow. treads take the light,
  // risers keep the dark, and the diagonal edges of every flight catch the
  // last of the sky. the whole wall climbs past you as you descend
  vec3 stone(vec2 uv, float aspect, float layer, float lift, vec3 rimCol,
    float rimAmt) {
    vec2 w = vec2(abs(uv.x - 0.5) * aspect, uv.y - lift * (0.9 + 0.35 * layer));
    float S = 38.0 + layer * 9.0;
    vec2 g = w * S;
    float a = g.x + g.y;
    float b = g.x - g.y;
    float flight = 6.0;
    float checker = mod(floor(a / flight) + floor(b / flight), 2.0);
    float fy = fract(g.y);
    float tread = smoothstep(0.62, 0.5, fy);
    float lip = smoothstep(0.5, 0.44, fy) * smoothstep(0.36, 0.44, fy);
    float edgeA = smoothstep(0.10, 0.0, abs(fract(a / flight) - 0.5) - 0.40);
    float edgeB = smoothstep(0.10, 0.0, abs(fract(b / flight) - 0.5) - 0.40);
    float grain = fbm(g * 0.33 + layer * 13.1) * 0.6 + noise(g * 3.1) * 0.2;
    vec3 sand = mix(vec3(0.085, 0.095, 0.15), vec3(0.21, 0.185, 0.19), grain);
    sand *= 0.84 + 0.26 * tread;
    sand *= mix(0.82, 1.06, checker);
    sand += rimCol * (edgeA + edgeB) * 0.075 * rimAmt;
    sand += rimCol * lip * 0.06 * rimAmt;
    // light thins with depth, and pools near the centre where the sky is
    sand *= (1.0 - layer * 0.14) * (0.72 + 0.28 * smoothstep(0.9, 0.2, w.x));
    return sand;
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
    vec2 mp = vec2(m.x * aspect, m.y) * 2.2;
    float md = exp(-distance(p, mp) * 1.4);

    // ---- time-of-day parameters
    vec3 skyTop = keyMix(
      vec3(0.030, 0.038, 0.068),
      vec3(0.100, 0.100, 0.170),
      vec3(0.160, 0.180, 0.240),
      vec3(0.075, 0.055, 0.115),
      s);
    vec3 skyHor = keyMix(
      vec3(0.055, 0.068, 0.110),
      vec3(0.420, 0.240, 0.120),
      vec3(0.300, 0.285, 0.245),
      vec3(0.460, 0.200, 0.095),
      s);
    vec3 sunCol = keyMix(
      vec3(0.72, 0.76, 0.82),
      vec3(0.90, 0.62, 0.30),
      vec3(0.95, 0.91, 0.78),
      vec3(0.93, 0.50, 0.18),
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
    float flyAmt = keyMixF(1.0, 0.12, 0.0, 0.90, s);
    vec3 flyCol = keyMix(
      vec3(0.88, 0.58, 0.26),
      vec3(0.80, 0.60, 0.38),
      vec3(0.0, 0.0, 0.0),
      vec3(0.97, 0.60, 0.22),
      s);
    float mistAmt = keyMixF(0.18, 1.0, 0.30, 0.45, s);
    float dyeAmt = keyMixF(1.0, 0.72, 0.55, 0.88, s);
    float rimAmt = keyMixF(0.08, 0.25, 0.18, 0.35, s);

    // ---- seasonal parameters (winter, spring, summer, autumn)
    // winter flies kites instead of dropping anything
    float kiteAmt = keyMixF(1.0, 0.0, 0.0, 0.0, sn);
    float fallAmt = keyMixF(0.0, 0.7, 1.0, 1.0, sn);
    vec3 fallCol = keyMix(
      vec3(0.0, 0.0, 0.0),
      vec3(0.85, 0.84, 0.78),   // jasmine drift
      vec3(0.55, 0.62, 0.75),   // monsoon rain
      vec3(0.85, 0.55, 0.15),   // marigold petals
      sn);
    float fallSizeX = keyMixF(90.0, 95.0, 300.0, 72.0, sn);
    float fallSizeY = keyMixF(90.0, 95.0, 26.0, 72.0, sn);
    float fallSpeed = keyMixF(0.02, 0.030, 0.24, 0.038, sn);
    float fallSway = keyMixF(0.02, 0.030, 0.004, 0.045, sn);
    float rainAmt = keyMixF(0.0, 0.0, 1.0, 0.0, sn);
    mistAmt = mix(mistAmt, mistAmt * 1.7 + 0.25, rainAmt);
    // lamps burn brightest around Diwali, and monsoon drowns them
    flyAmt *= keyMixF(0.55, 0.55, 0.25, 1.0, sn);
    // winter pales the whole scene slightly
    float frost = keyMixF(1.0, 0.0, 0.0, 0.0, sn);

    // ---- the descent: the well's tiers climb as you scroll down into it
    float rise = dd * dd * (3.0 - 2.0 * dd); // smooth
    // the well is there before you scroll; the descent only deepens it
    float lift = mix(0.62, 1.3, rise);
    dyeAmt = mix(dyeAmt, 1.2, rise);

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
    col += vec3(0.7, 0.73, 0.80) * star * 0.9;

    // ---- sun / moon (fades as the stone swallows the view)
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

    // ---- low drifting mist
    float mist = fbm(vec2(uv.x * 2.4 + t * 0.03, uv.y * 6.0 - t * 0.01));
    float mistBand = smoothstep(0.5, 0.0, uv.y);
    col += skyHor * mist * mistBand * mistAmt * 0.35;

    // ---- indigo dye blooming in the vat (pointer stirs it)
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

    float dye = smoothstep(0.35, 0.95, f) * dyeAmt;
    col = mix(col, vec3(0.040, 0.050, 0.095), dye * 0.75);
    col += vec3(0.13, 0.16, 0.27) * smoothstep(0.75, 1.05, f) * dyeAmt * 0.35;

    // ---- the stepwell: four walls of stairs, nearer ones darker and
    // faster, each edge catching a thin line of the last light
    float rimFade = rimAmt * (1.0 + rise * 0.6);
    vec3 rimCol = sunCol;

    float surf0 = tierSurf(uv.x, 4.0, 1.0, -0.35, 0.53, 0.25, lift);
    float m0 = smoothstep(surf0 + 0.003, surf0 - 0.003, uv.y);
    col = mix(col, stone(uv, aspect, 0.0, lift, rimCol, rimFade), m0);
    col += rimCol * m0 * smoothstep(0.014, 0.0, surf0 - uv.y) * rimFade;

    float surf1 = tierSurf(uv.x, 5.0, 2.0, -0.55, 0.78, 0.35, lift);
    float m1 = smoothstep(surf1 + 0.003, surf1 - 0.003, uv.y);
    col = mix(col, stone(uv, aspect, 1.0, lift, rimCol, rimFade), m1);
    col += rimCol * m1 * smoothstep(0.014, 0.0, surf1 - uv.y) * rimFade * 0.85;

    float surf2 = tierSurf(uv.x, 6.0, 3.0, -0.80, 1.06, 0.48, lift);
    float m2 = smoothstep(surf2 + 0.003, surf2 - 0.003, uv.y);
    col = mix(col, stone(uv, aspect, 2.0, lift, rimCol, rimFade), m2);
    col += rimCol * m2 * smoothstep(0.014, 0.0, surf2 - uv.y) * rimFade * 0.7;

    float surf3 = tierSurf(uv.x, 7.0, 4.0, -1.10, 1.38, 0.62, lift);
    float m3 = smoothstep(surf3 + 0.003, surf3 - 0.003, uv.y);
    col = mix(col, stone(uv, aspect, 3.0, lift, rimCol, rimFade), m3);
    col += rimCol * m3 * smoothstep(0.014, 0.0, surf3 - uv.y) * rimFade * 0.55;

    // ---- still water at the bottom of the well
    float waterY = 0.21 * lift;
    float wellX = smoothstep(0.50, 0.30, abs(uv.x - 0.5));
    float ripple = fbm(vec2(uv.x * 14.0, uv.y * 40.0 - t * 0.35) + md * 0.8);
    float waterM = smoothstep(waterY, waterY - 0.02, uv.y) * wellX;
    vec3 waterCol = mix(vec3(0.015, 0.020, 0.045), skyHor * 0.5, ripple * 0.4);
    col = mix(col, waterCol, waterM * 0.92);

    // ---- dropped stones: each one sends rings out through the pool for a
    // few seconds, then the water forgets
    float rings = 0.0;
    for (int i = 0; i < 4; i++) {
      vec3 st = u_stones[i];
      float age = t - st.z;
      if (age <= 0.0 || age > 4.5) continue;
      float sd3 = distance(vec2(uv.x * aspect, uv.y * 0.35), vec2(st.x * aspect, st.y * 0.35));
      // the wave front travels outward; behind it the water keeps rocking
      float front = age * 0.28;
      float band = exp(-abs(sd3 - front) * 9.0);
      rings += sin(sd3 * 48.0 - age * 6.0) * (band * 1.6 + exp(-sd3 * 3.0) * 0.5)
        * exp(-age * 0.55) * smoothstep(0.0, 0.06, age);
      // the splash: a brief bloom where the stone hit
      rings += exp(-sd3 * 40.0) * exp(-age * 4.0) * 2.5;
    }
    col += skyHor * rings * waterM * 0.35;
    col += vec3(0.86, 0.80, 0.66) * max(rings, 0.0) * waterM * 0.12;

    // the surface line, a thread of the sky's last light
    col += skyHor * smoothstep(0.006, 0.0, abs(uv.y - waterY)) * wellX * 0.5;

    // ---- the pool holds the name upside down. the sky's noise shivers it,
    // and a hand over the water sends rings through the letters
    if (u_textOn > 0.5 && waterM > 0.002) {
      float fy = clamp(uv.y / max(waterY, 0.001), 0.0, 1.0);
      vec2 rip = (vec2(
        fbm(vec2(uv.x * 22.0, uv.y * 70.0 - t * 0.6)),
        fbm(vec2(uv.x * 11.0 + 4.0, uv.y * 35.0 - t * 0.4))
      ) - 0.5) * vec2(0.010, 0.12);
      float sd2 = distance(vec2(uv.x * aspect, uv.y), vec2(m.x * aspect, m.y));
      rip.y += sin(sd2 * 80.0 - t * 7.0) * exp(-sd2 * 7.0) * exp(-u_stir * 1.4) * 0.07;
      rip.y += rings * 0.22;
      rip.x += rings * 0.035;
      float tx = (uv.x - u_textRect.x) / max(u_textRect.z - u_textRect.x, 0.001) + rip.x;
      float tv = (1.0 - fy) * 1.12 - 0.04 + rip.y;
      float inside = step(0.0, tx) * step(tx, 1.0) * step(0.0, tv) * step(tv, 1.0);
      float glyph = texture2D(u_text, vec2(tx, tv)).a * inside;
      float fade = smoothstep(0.0, 0.5, fy) * (0.3 + 0.7 * fy);
      col += vec3(0.86, 0.80, 0.66) * glyph * waterM * fade * 0.42;
    }
    for (int i = 0; i < 3; i++) {
      float gx = 0.40 + 0.10 * float(i);
      float flick = 0.6 + 0.4 * sin(t * 1.7 + float(i) * 2.9);
      col += flyCol * exp(-abs(uv.x - gx) * aspect * 70.0)
        * smoothstep(waterY, 0.0, uv.y) * waterM * flick * 0.35 * flyAmt;
    }

    // ---- seasonal fall: jasmine / rain / marigolds drifting down
    if (fallAmt > 0.01) {
      float fall = 0.0;
      for (int i = 0; i < 10; i++) {
        float fi = float(i);
        vec2 seed = vec2(hash(vec2(fi, 8.3)), hash(vec2(2.9, fi)));
        float depth = 0.5 + seed.y * 0.8; // nearer ones fall faster, larger
        vec2 fp = vec2(
          fract(seed.x + fallSway * depth * 12.0 * sin(t * 0.4 + fi * 1.9)
            + t * 0.006 * depth),
          fract(seed.y - t * fallSpeed * depth)
        );
        vec2 fd = abs(vec2(uv.x * aspect - fp.x * aspect, uv.y - fp.y));
        fall += exp(-(fd.x * fallSizeX + fd.y * fallSizeY) / depth)
          * (0.5 + 0.5 * sin(t * 2.0 + fi * 3.0));
      }
      col += fallCol * fall * fallAmt * 0.7;
    }

    // ---- Uttarayan: three paper kites climbing the winter sky
    if (kiteAmt > 0.01) {
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        vec2 seed = vec2(hash(vec2(fi, 6.1)), hash(vec2(7.7, fi)));
        vec2 fp = vec2(
          fract(seed.x + 0.04 * sin(t * 0.3 + fi * 2.2) + t * 0.004),
          0.35 + 0.60 * fract(seed.y + t * (0.010 + seed.x * 0.012))
        );
        vec3 kcol = vec3(0.62, 0.24, 0.17);
        if (i == 1) kcol = vec3(0.85, 0.63, 0.24);
        if (i == 2) kcol = vec3(0.18, 0.46, 0.43);
        vec2 kd = abs(vec2((uv.x - fp.x) * aspect, uv.y - fp.y));
        float kite = smoothstep(1.0, 0.8, kd.x / 0.016 + kd.y / 0.024);
        col = mix(col, kcol, kite * kiteAmt * 0.9);
        // the glass-line string, swaying beneath
        float sx = (uv.x - fp.x) * aspect
          - 0.015 * sin((fp.y - uv.y) * 30.0 + t * 2.0 + fi);
        float str = smoothstep(0.0022, 0.0005, abs(sx))
          * smoothstep(fp.y - 0.16, fp.y, uv.y) * step(uv.y, fp.y);
        col = mix(col, vec3(0.02, 0.02, 0.04), str * kiteAmt * 0.45);
      }
    }

    // ---- diyas: floating lamps that settle onto the tiers as you descend
    float flies = 0.0;
    if (flyAmt > 0.01)
    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      vec2 seed = vec2(hash(vec2(fi, 3.7)), hash(vec2(9.1, fi)));
      float lx = fract(seed.x + t * (0.010 + seed.y * 0.018)
        + 0.14 * sin(t * 0.3 + fi * 2.1));
      float driftY = 0.06 + 0.30 * fract(seed.y + 0.05 * sin(t * 0.22 + fi * 1.7));
      float odd = mod(fi, 2.0);
      float shelf = tierSurf(lx, mix(5.0, 6.0, odd), mix(2.0, 3.0, odd),
        mix(-0.55, -0.80, odd), mix(0.78, 1.06, odd),
        mix(0.35, 0.48, odd), lift) + 0.015;
      float ly = mix(driftY, clamp(shelf, 0.05, 0.9), rise);
      float pulse = max(0.0, sin(t * (1.2 + seed.x) + fi * 5.0));
      float fd = distance(vec2(uv.x * aspect, uv.y), vec2(lx * aspect, ly));
      flies += (exp(-fd * 55.0) + exp(-fd * 14.0) * 0.12) * pulse * pulse;
    }
    col += flyCol * flies * flyAmt * 0.85;

    // ---- the leap: every little while one ember jumps from the tiers
    // for the sun, holds it a breath, and comes back down. somebody here
    // once mistook it for a mango; the habit stuck.
    {
      float cycle = 13.0;
      float ph = fract(t / cycle);
      float id = floor(t / cycle);
      float lx = 0.25 + 0.5 * hash(vec2(id, 21.7));
      float ground = tierSurf(lx, 5.0, 2.0, -0.55, 0.78, 0.35, lift);
      vec2 a = vec2(lx * aspect, max(ground, 0.05) + 0.015);
      vec2 sunPix = vec2(sunPos.x * aspect, sunPos.y + rise * 0.35);
      vec2 b = sunPix - vec2(0.0, sunR + 0.015);
      vec2 land = vec2(
        a.x + 0.18 * aspect * (hash(vec2(id, 3.3)) - 0.5), a.y);

      float emb = 0.0;
      vec2 pos = a;
      vec2 tail = a;
      if (ph > 0.62 && ph < 0.995) {
        vec2 cpt = mix(a, b, 0.5) + vec2(0.0, 0.30);
        if (ph < 0.78) {
          float k = (ph - 0.62) / 0.16;
          k = k * k * (3.0 - 2.0 * k);
          float k2 = max(0.0, k - 0.07);
          pos = mix(mix(a, cpt, k), mix(cpt, b, k), k);
          tail = mix(mix(a, cpt, k2), mix(cpt, b, k2), k2);
          emb = 1.0;
        } else if (ph < 0.82) {
          pos = b;
          tail = b;
          // the touch: a small flare against the sun's cheek
          emb = 1.0 + 1.6 * sin((ph - 0.78) / 0.04 * 3.1416);
        } else if (ph < 0.94) {
          float k = (ph - 0.82) / 0.12;
          pos = vec2(mix(b.x, land.x, k), mix(b.y, land.y, k * k));
          float kt = max(0.0, k - 0.06);
          tail = vec2(mix(b.x, land.x, kt), mix(b.y, land.y, kt * kt));
          emb = 1.0 - 0.35 * k;
        } else {
          pos = land;
          tail = land;
          // cooling where it fell, among the diyas
          emb = (1.0 - (ph - 0.94) / 0.055) * 0.65;
        }
        float ed = distance(vec2(uv.x * aspect, uv.y), pos);
        float td = distance(vec2(uv.x * aspect, uv.y), tail);
        float glow = exp(-ed * 220.0) * 1.2 + exp(-ed * 40.0) * 0.10
          + exp(-td * 240.0) * 0.35;
        col += mix(vec3(0.85, 0.60, 0.24), sunCol, 0.35)
          * glow * emb * sunFade;
      }
    }

    // ---- pointer glow: turmeric caught in the dye
    col += vec3(0.85, 0.64, 0.25) * md * smoothstep(0.5, 0.95, f) * 0.28;
    col += vec3(0.36, 0.26, 0.12) * md * md * 0.15;

    // vignette tightens as you go deeper
    float vig = smoothstep(1.3 - rise * 0.45, 0.35 - rise * 0.1,
      distance(uv, vec2(0.5, 0.45)));
    col *= mix(0.72 - rise * 0.2, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

import { sceneFromHour, seasonFromMonth } from "./well-clock";

// the name, drawn once into a texture in the page's own display face so the
// water can hold it; re-drawn whenever the heading moves or resizes
function useNameTexture(
  textRef: React.RefObject<HTMLElement | null> | undefined,
  canvasEl: HTMLCanvasElement,
) {
  const store = useMemo(
    () => ({ texture: new THREE.Texture(), rect: new THREE.Vector4() }),
    [],
  );
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = textRef?.current;
    if (!el) return;
    let cancelled = false;

    const draw = () => {
      const h = textRef?.current;
      if (cancelled || !h) return;
      const r = h.getBoundingClientRect();
      const c = canvasEl.getBoundingClientRect();
      if (!r.width || !c.width) return;
      store.rect.set(
        (r.left - c.left) / c.width,
        1 - (r.bottom - c.top) / c.height,
        (r.right - c.left) / c.width,
        1 - (r.top - c.top) / c.height,
      );
      const style = getComputedStyle(h);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cv = document.createElement("canvas");
      cv.width = Math.ceil(r.width * dpr);
      cv.height = Math.ceil(r.height * dpr);
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      const size = parseFloat(style.fontSize) * dpr;
      ctx.font = `${style.fontWeight} ${size}px ${style.fontFamily}`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const text = h.textContent?.replace(/\s+/g, " ").trim() ?? "";
      const words = text.split(" ");
      const half = Math.ceil(words.length / 2);
      const lines =
        ctx.measureText(text).width > cv.width && words.length > 1
          ? [words.slice(0, half).join(" "), words.slice(half).join(" ")]
          : [text];
      const lh = parseFloat(style.lineHeight) * dpr || size * 1.05;
      const top = cv.height / 2 - ((lines.length - 1) * lh) / 2;
      lines.forEach((line, i) => ctx.fillText(line, cv.width / 2, top + i * lh));
      store.texture.image = cv;
      store.texture.needsUpdate = true;
      setOn(true);
    };

    const ready = () => document.fonts.ready.then(() => requestAnimationFrame(draw));
    ready();
    const ro = new ResizeObserver(() => ready());
    ro.observe(el);
    ro.observe(canvasEl);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [textRef, canvasEl, store]);

  return { ...store, on };
}

function StepwellPlane({
  scene,
  season,
  descend,
  textRef,
}: {
  scene: number;
  season: number;
  descend?: MotionValue<number>;
  textRef?: React.RefObject<HTMLElement | null>;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const gl = useThree((s) => s.gl);
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const lastMove = useRef(-10);
  const name = useNameTexture(textRef, gl.domElement);
  const clock = useRef(0);
  const stones = useMemo(
    () => Array.from({ length: 4 }, () => new THREE.Vector3(0, 0, -100)),
    [],
  );
  const nextStone = useRef(0);
  const lastDrop = useRef(0);
  const descendRef = useRef(0);

  // a press on the pool drops a stone: rings in the water, one soft note.
  // the pool is the bottom band of the canvas, wherever the tiers have risen to
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const rect = gl.domElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      if (x < 0 || x > 1 || y < 0) return;
      const d = descendRef.current;
      const rise = d * d * (3 - 2 * d);
      const waterY = 0.21 * (0.62 + 0.38 * rise);
      if (y > waterY) return;
      const now = performance.now();
      if (now - lastDrop.current < 160) return;
      lastDrop.current = now;
      stones[nextStone.current % stones.length].set(x, y, clock.current);
      nextStone.current += 1;
      void import("@/lib/sound").then(({ pluck }) =>
        pluck(Math.floor(Math.random() * 5), 0.05),
      );
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [gl, stones]);

  // mouse in canvas-local UV space, so tracking holds at any viewport,
  // scroll offset, or zoom level
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      targetMouse.current.set(
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height
      );
      lastMove.current = performance.now() / 1000;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl]);

  useFrame((_, delta) => {
    if (!mat.current) return;
    const u = mat.current.uniforms;
    u.u_time.value += delta;
    clock.current = u.u_time.value;
    // gl_FragCoord is in device pixels, the resolution must match it,
    // or every retina screen renders the scene misaligned and stretched
    u.u_resolution.value.set(gl.domElement.width, gl.domElement.height);
    u.u_mouse.value.lerp(targetMouse.current, 0.045);
    u.u_scene.value += (scene - u.u_scene.value) * 0.03;
    u.u_season.value += (season - u.u_season.value) * 0.03;
    const d = descend?.get() ?? 0;
    u.u_descend.value += (d - u.u_descend.value) * 0.15;
    descendRef.current = u.u_descend.value;
    u.u_stir.value = Math.min(6, performance.now() / 1000 - lastMove.current);
    u.u_textOn.value = name.on ? 1 : 0;
    u.u_textRect.value.copy(name.rect);
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
          u_stir: { value: 6 },
          u_textOn: { value: 0 },
          u_textRect: { value: new THREE.Vector4() },
          u_text: { value: name.texture },
          u_stones: { value: stones },
        }}
        transparent={false}
      />
    </mesh>
  );
}

export default function StepwellCanvas({
  scene,
  season,
  descend,
  textRef,
}: {
  scene?: number;
  season?: number;
  descend?: MotionValue<number>;
  textRef?: React.RefObject<HTMLElement | null>;
}) {
  const resolvedScene = scene ?? sceneFromHour(new Date().getHours());
  const resolvedSeason = season ?? seasonFromMonth(new Date().getMonth());
  const reduceMotion = useReducedMotion();

  // the shader only breathes while it's on screen; once the visitor has
  // scrolled past, the GPU gets its evening off
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let intersecting = false;
    const update = () => setActive(intersecting && !document.hidden);
    const io = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <div ref={wrap} aria-hidden style={{ position: "absolute", inset: 0 }}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={active && !reduceMotion ? "always" : "never"}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <StepwellPlane
          scene={resolvedScene}
          season={resolvedSeason}
          descend={descend}
          textRef={textRef}
        />
      </Canvas>
    </div>
  );
}
