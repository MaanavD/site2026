import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

const rozha = readFile(
  path.join(process.cwd(), "assets", "RozhaOne-Regular.ttf")
);

// the same motif paths as components/motifs.tsx (Phosphor Icons, MIT),
// re-declared here because Satori needs explicit sizes and plain SVGs
const FAINT = "rgba(236, 226, 204, 0.05)";

const LOTUS_FILL =
  "M245.83,121.63a15.53,15.53,0,0,0-9.52-7.33,73.55,73.55,0,0,0-22.17-2.22c4-19.85,1-35.55-2-44.86a16.17,16.17,0,0,0-18.8-10.88,85.53,85.53,0,0,0-28.55,12.12,94.58,94.58,0,0,0-27.11-33.25,16.05,16.05,0,0,0-19.26,0A94.58,94.58,0,0,0,91.26,68.46,85.53,85.53,0,0,0,62.71,56.34,16.14,16.14,0,0,0,43.92,67.22c-3,9.31-6,25-2.06,44.86a73.55,73.55,0,0,0-22.17,2.22,15.53,15.53,0,0,0-9.52,7.33,16,16,0,0,0-1.6,12.26c3.39,12.58,13.8,36.49,45.33,55.33S113.13,208,128.05,208s42.67,0,74-18.78c31.53-18.84,41.94-42.75,45.33-55.33A16,16,0,0,0,245.83,121.63ZM62.1,175.49C35.47,159.57,26.82,140.05,24,129.7a59.61,59.61,0,0,1,22.5-1.17,129.08,129.08,0,0,0,9.15,19.41,142.28,142.28,0,0,0,34,39.56A114.92,114.92,0,0,1,62.1,175.49ZM128,190.4c-9.33-6.94-32-28.23-32-71.23C96,76.7,118.38,55.24,128,48c9.62,7.26,32,28.72,32,71.19C160,162.17,137.33,183.46,128,190.4Zm104-60.68c-2.77,10.24-11.4,29.81-38.09,45.77a114.92,114.92,0,0,1-27.55,12,142.28,142.28,0,0,0,34-39.56,129.08,129.08,0,0,0,9.15-19.41A59.69,59.69,0,0,1,232,129.71Z";

const TREE =
  "M198.1,62.59a76,76,0,0,0-140.2,0A71.71,71.71,0,0,0,16,127.8C15.9,166,48,199,86.14,200A72.09,72.09,0,0,0,120,192.47V232a8,8,0,0,0,16,0V192.47A72.17,72.17,0,0,0,168,200l1.82,0C208,199,240.11,166,240,127.8A71.71,71.71,0,0,0,198.1,62.59ZM169.45,184a56.08,56.08,0,0,1-33.45-10v-41l43.58-21.78a8,8,0,1,0-7.16-14.32L136,115.06V88a8,8,0,0,0-16,0v51.06L83.58,120.84a8,8,0,1,0-7.16,14.32L120,156.94v17a56,56,0,0,1-33.45,10C56.9,183.23,31.92,157.52,32,127.84A55.77,55.77,0,0,1,67.11,76a8,8,0,0,0,4.53-4.67,60,60,0,0,1,112.72,0A8,8,0,0,0,188.89,76,55.79,55.79,0,0,1,224,127.84C224.08,157.52,199.1,183.23,169.45,184Z";

function LotusWatermark({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256">
      <path d={LOTUS_FILL} fill={color} />
    </svg>
  );
}

function TreeWatermark({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256">
      <path d={TREE} fill={color} />
    </svg>
  );
}

function PaisleyWatermark({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256">
      <g
        fill="none"
        stroke={color}
        strokeWidth={14}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M112 228 A 72 72 0 0 1 40 156 A 72 72 0 0 1 76 94 C 96 74 128 60 146 46 A 26 26 0 1 1 190 74 C 184 88 170 94 154 90 C 170 104 184 128 184 156 A 72 72 0 0 1 112 228 Z" />
        <path d="M104 190 C 82 182 70 158 76 136 C 81 118 96 106 114 102" />
      </g>
      <circle cx="126" cy="152" r="11" fill={color} />
    </svg>
  );
}

type Watermark = "lotus" | "paisley" | "tree";

export async function dyeCard({
  title,
  kicker,
  watermark,
}: {
  title: string;
  kicker: string;
  watermark: Watermark;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "radial-gradient(900px 500px at 85% 10%, #1c2642 0%, #0e1220 55%)",
          color: "#ece2cc",
          fontFamily: "Rozha",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: -40,
            bottom: -110,
          }}
        >
          {watermark === "lotus" && <LotusWatermark size={460} color={FAINT} />}
          {watermark === "paisley" && (
            <PaisleyWatermark size={400} color={FAINT} />
          )}
          {watermark === "tree" && <TreeWatermark size={420} color={FAINT} />}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 80px",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: 6,
              color: "#d9a441",
              textTransform: "uppercase",
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              fontSize: title.length > 42 ? 58 : 76,
              lineHeight: 1.15,
              maxWidth: 900,
              color: "#ece2cc",
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 54,
                height: 54,
                background: "#8f3b2e",
                borderRadius: 4,
                transform: "rotate(3deg)",
              }}
            >
              <LotusWatermark size={36} color="#ece2cc" />
            </div>
            <div style={{ fontSize: 26, color: "#b5ac97" }}>
              Maanav Dalal · maanavdalal.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        {
          name: "Rozha",
          data: await rozha,
          weight: 400 as const,
          style: "normal" as const,
        },
      ],
    }
  );
}
