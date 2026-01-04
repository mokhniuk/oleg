import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export for production builds to preserve hot reload in dev
  output: !isDev ? "export" : undefined,
  reactStrictMode: true,
  
  // Image optimization for static export
  images: {
    loader: "akamai",
    path: "",
    unoptimized: true
  },
  
  // Only use assetPrefix in production
  assetPrefix: !isDev ? "/" : undefined,
  
  // Compression and optimization
  compress: true,
  
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Only apply optimizations in production
    if (!dev && !isServer) {
      // Remove unused imports automatically
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Minimize bundle size
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    // Resolve fallbacks for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    return config;
  },
  
  // Remove .DS_Store files from build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
};

// Only wrap with bundle analyzer when explicitly enabled
export default process.env.ANALYZE === 'true' 
  ? withBundleAnalyzer(nextConfig) 
  : nextConfig;
