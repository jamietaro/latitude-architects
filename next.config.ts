import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tycvnurnvyvlnqdjjnus.supabase.co",
      },
    ],
  },
};

export default nextConfig;
