/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/**", // Allows any image path from this host and port
      },
      {
        protocol: "http",
        hostname: "api.blogger.abs.gd",
        port: "443",
        pathname: "/**", // Allows any image path from this host and port
      },
    ],
  },
};

export default nextConfig;
