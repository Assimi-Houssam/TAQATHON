// @ts-check
import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "http", // Allow http for localhost
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**", // Allow all HTTPS hosts
      },
    ],
  },
};

export default withNextIntl(config);
