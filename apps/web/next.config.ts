import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@a2ui-web/a2ui-react-renderer',
    '@a2ui-web/shadcn-ui',
    '@a2ui-web/animations',
    '@a2ui-web/assets',
    '@a2ui-web/lit-core',
  ],
};

export default nextConfig;
