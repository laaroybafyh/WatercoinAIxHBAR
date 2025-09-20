import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Handle browser extension interference
  webpack: (config, { dev, isServer }) => {
    if (!isServer && dev) {
      // Add webpack plugin to handle hydration mismatches in development
      config.optimization = {
        ...config.optimization,
        usedExports: false,
      };
    }
    
    return config;
  },

  // Fix workspace root warning
  outputFileTracingRoot: __dirname,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_HEDERA_NETWORK: process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet',
    NEXT_PUBLIC_WATERCOIN_HEDERA_ADDRESS: process.env.NEXT_PUBLIC_WATERCOIN_HEDERA_ADDRESS || '0x6f6ecef0b8c2ff3291721951f34f7d8a0d54ead5',
    NEXT_PUBLIC_HEDERA_MIRROR_NODE: process.env.NEXT_PUBLIC_HEDERA_MIRROR_NODE || 'https://testnet.mirrornode.hedera.com',
  },
  
  // Output configuration for static export if needed
  output: 'standalone',
  
  // Image optimization
  images: {
    unoptimized: true,
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/aptos',
        destination: '/pos',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;