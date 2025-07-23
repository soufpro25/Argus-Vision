/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    return config;
  },
};

export default nextConfig;
