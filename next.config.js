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

  webpack(config, { isServer }) {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    if (!isServer) {
        // These are server-side dependencies that should not be bundled on the client.
        config.externals = {
            ...config.externals,
            '@opentelemetry/instrumentation': '@opentelemetry/instrumentation',
            'require-in-the-middle': 'require-in-the-middle',
        };
    }

    return config;
  },
};

export default nextConfig;
