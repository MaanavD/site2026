import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

const shippori = readFile(
  path.join(process.cwd(), "assets", "ShipporiMincho-Bold.ttf")
);

export async function inkCard({
  title,
  kicker,
  watermark,
}: {
  title: string;
  kicker: string;
  watermark: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "radial-gradient(900px 500px at 85% 10%, #16241c 0%, #0a0a0c 55%)",
          color: "#eae3d2",
          fontFamily: "Shippori",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -40,
            bottom: -110,
            fontSize: 460,
            color: "rgba(234, 227, 210, 0.05)",
          }}
        >
          {watermark}
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
              color: "#6f8f76",
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
              color: "#eae3d2",
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
                background: "#6f8f76",
                color: "#0a0a0c",
                fontSize: 30,
                borderRadius: 4,
                transform: "rotate(3deg)",
              }}
            >
              真
            </div>
            <div style={{ fontSize: 26, color: "#a9a294" }}>
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
          name: "Shippori",
          data: await shippori,
          weight: 700 as const,
          style: "normal" as const,
        },
      ],
    }
  );
}
