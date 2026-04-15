import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  // Enable static HTML export only for GitHub Pages
  // API routes work in dev mode and on Vercel
  ...(isGitHubPages && { output: 'export' }),

  // GitHub Pages serves from a subdirectory by default
  basePath: isGitHubPages ? '/quran-fractal' : '',

  // Required for static export
  images: {
    unoptimized: true,
  },

  // Trailing slashes for cleaner URLs on static hosting
  trailingSlash: true,
};

export default nextConfig;
