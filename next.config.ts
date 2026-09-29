import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.13"],
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
