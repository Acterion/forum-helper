import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "i.pravatar.cc" }, { hostname: "avatar.iran.liara.run" }],
  },
};

export default nextConfig;
