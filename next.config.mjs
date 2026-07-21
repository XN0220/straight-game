const isGitHubPages = process.env.GITHUB_PAGES === "true";

/** @type {import("next").NextConfig} */
const nextConfig = isGitHubPages
  ? {
      output: "export",
      basePath: "/straight-game",
      assetPrefix: "/straight-game",
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
