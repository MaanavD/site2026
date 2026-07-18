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
const INK = "#0e1220";
const PAPER = "#ece2cc";
const PAPER_DIM = "#b5ac97";
const MADDER = "#8f3b2e";
const TURMERIC = "#d9a441";
const PEACOCK = "#1f5f5b";

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
      <circle cx="128" cy="128" r="86" fill="none" stroke={color} strokeWidth="5" opacity="0.5" />
      <circle cx="128" cy="128" r="18" fill={color} opacity="0.8" />
      {Array.from({ length: 12 }, (_, index) => (
        <ellipse
          key={index}
          cx="128"
          cy="58"
          rx="12"
          ry="32"
          fill={color}
          opacity="0.42"
          transform={`rotate(${index * 30} 128 128)`}
        />
      ))}
    </svg>
  );
}

type Watermark = "lotus" | "paisley" | "tree";

function WatermarkShape({
  watermark,
  size,
  color,
}: {
  watermark: Watermark;
  size: number;
  color: string;
}) {
  if (watermark === "paisley") {
    return <PaisleyWatermark size={size} color={color} />;
  }

  if (watermark === "tree") {
    return <TreeWatermark size={size} color={color} />;
  }

  return <LotusWatermark size={size} color={color} />;
}

function CornerButi({
  x,
  y,
  color,
}: {
  x: number;
  y: number;
  color: string;
}) {
  return (
    <svg
      width={108}
      height={108}
      viewBox="0 0 108 108"
      style={{ position: "absolute", left: x, top: y }}
    >
      <circle cx="54" cy="54" r="42" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="54" cy="54" r="8" fill={color} opacity="0.8" />
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse
          key={i}
          cx="54"
          cy="24"
          rx="5"
          ry="15"
          fill={color}
          opacity="0.45"
          transform={`rotate(${i * 45} 54 54)`}
        />
      ))}
    </svg>
  );
}

export async function dyeCard({
  title,
  kicker,
  watermark,
  subtitle,
}: {
  title: string;
  kicker: string;
  watermark: Watermark;
  subtitle?: string;
}) {
  const titleSize = title.length > 62 ? 50 : title.length > 42 ? 60 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: INK,
          color: PAPER,
          fontFamily: "Rozha",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(760px 480px at 84% 16%, rgba(217, 164, 65, 0.18) 0%, rgba(31, 95, 91, 0.12) 34%, rgba(14, 18, 32, 0) 68%)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: 18,
            background: `linear-gradient(90deg, ${MADDER}, ${TURMERIC} 42%, ${PEACOCK})`,
          }}
        />
        <CornerButi x={66} y={64} color="rgba(217, 164, 65, 0.18)" />
        <CornerButi x={998} y={460} color="rgba(236, 226, 204, 0.10)" />
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: -84,
            bottom: -132,
          }}
        >
          <WatermarkShape watermark={watermark} size={520} color={FAINT} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            margin: 42,
            padding: "48px 56px 42px",
            width: "100%",
            border: "1px solid rgba(236, 226, 204, 0.16)",
            boxShadow: "inset 0 0 0 8px rgba(236, 226, 204, 0.035)",
            background:
              "linear-gradient(135deg, rgba(28, 38, 66, 0.92), rgba(14, 18, 32, 0.78))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                width: 66,
                height: 66,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                background: TURMERIC,
                boxShadow: `0 0 0 8px ${MADDER}`,
              }}
            >
              <LotusWatermark size={44} color={INK} />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  letterSpacing: 5,
                  color: TURMERIC,
                  textTransform: "uppercase",
                }}
              >
                {kicker}
              </div>
              <div style={{ fontSize: 23, color: PAPER_DIM }}>
                maanavdalal.com
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              maxWidth: 890,
            }}
          >
            <div
              style={{
                fontSize: titleSize,
                lineHeight: 1.04,
                color: PAPER,
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                style={{
                  maxWidth: 720,
                  fontSize: 28,
                  lineHeight: 1.32,
                  color: PAPER_DIM,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: PAPER_DIM,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div style={{ width: 64, height: 2, background: MADDER }} />
              <div style={{ width: 64, height: 2, background: TURMERIC }} />
              <div style={{ width: 64, height: 2, background: PEACOCK }} />
            </div>
            <div style={{ fontSize: 26 }}>
              Developer Relations Engineer · Black Forest Labs
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
