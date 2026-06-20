/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        crypto: false,
      };
    }
    // Suppress critical dependency warnings from @coral-xyz/anchor
    config.ignoreWarnings = [
      { module: /node_modules\/@coral-xyz\/anchor/ },
    ];
    return config;
  },
};

module.exports = nextConfig;
