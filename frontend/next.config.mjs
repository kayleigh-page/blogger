import nextPWA from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const withPWA = nextPWA({
  dest: "public",
  disable: isDev, // Disable PWA in development
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/, /dynamic-css-manifest\.json$/],
});

const nextConfig = withPWA({
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.blogger.abs.gd",
        port: "443",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
});

export default nextConfig;
