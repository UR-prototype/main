import type { NextConfig } from "next";

/** GitHub Pages: repo `UR-prototype/main` → https://ur-prototype.github.io/main/ */
const basePath =
  process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_BASE_PATH
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
};

export default nextConfig;
