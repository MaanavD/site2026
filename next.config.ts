import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**": ["./assets/**"],
  },
  images: {
    localPatterns: [{ pathname: "/api/notion-media/**" }],
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.notion.so" },
    ],
  },
};

export default nextConfig;
