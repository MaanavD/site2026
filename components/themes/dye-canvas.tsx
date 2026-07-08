"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

// indigo vat: the ink-smoke field re-dyed — deep indigo cloth-dye swirls,
// turmeric-gold glow following the pointer, a whisper of madder red
const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;

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

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = uv;
    p.x *= u_resolution.x / u_resolution.y;
    p *= 2.2;

    float t = u_time * 0.06;

    vec2 m = u_mouse;
    m.x *= u_resolution.x / u_resolution.y;
    m *= 2.2;
    float md = exp(-distance(p, m) * 1.4);

    p += md * 0.55 * vec2(
      sin(u_time * 0.4 + p.y * 2.0),
      cos(u_time * 0.35 + p.x * 2.0)
    );

    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t * 0.7));
    vec2 r = vec2(
      fbm(p + 3.5 * q + vec2(1.7, 9.2) + t * 2.1),
      fbm(p + 3.5 * q + vec2(8.3, 2.8) - t * 1.6)
    );
    float f = fbm(p + 3.2 * r);
    f += md * 0.28;

    vec3 base = vec3(0.055, 0.070, 0.118);    // vat indigo
    vec3 plume = vec3(0.110, 0.150, 0.260);   // dye bloom
    vec3 crest = vec3(0.200, 0.270, 0.430);   // freshly lifted cloth
    vec3 turmeric = vec3(0.850, 0.640, 0.250);
    vec3 madder = vec3(0.640, 0.250, 0.180);

    vec3 col = mix(base, plume, smoothstep(0.25, 0.85, f));
    col = mix(col, crest, smoothstep(0.72, 1.05, f) * 0.8);

    col += turmeric * md * smoothstep(0.5, 0.95, f) * 0.34;
    col += madder * md * md * 0.14;

    float vig = smoothstep(1.25, 0.35, distance(uv, vec2(0.5, 0.45)));
    col *= mix(0.75, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function DyePlane() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const gl = useThree((s) => s.gl);
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));

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
    u.u_resolution.value.set(gl.domElement.width, gl.domElement.height);
    u.u_mouse.value.lerp(targetMouse.current, 0.045);
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
        }}
      />
    </mesh>
  );
}

export default function DyeCanvas() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <DyePlane />
    </Canvas>
  );
}
