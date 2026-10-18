/** @type {import('next').NextConfig} */
let nextConfig = {
  // Server-rendered app (MySQL-backed). No static export.
  reactStrictMode: true,

  experimental: {
    serverComponentsExternalPackages: ["mysql2", "sharp"],
    // Runs src/instrumentation.ts on server start (creates the DB schema).
    instrumentationHook: true,
  },

  // Serve /projects/* through a route handler so files uploaded after startup
  // are visible (next start snapshots public/ at boot) and so uploads can live on a volume.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/projects/:path*", destination: "/api/media/:path*" }],
    };
  },

  // Images are pre-converted to WebP; keep the optimizer off (local files only).
  images: {
    unoptimized: true,
  },

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

// The analyzer is a devDependency: load it only when asked, so `next start`
// in a production-only install never needs it.
if (process.env.ANALYZE === 'true') {
  const { default: bundleAnalyzer } = await import('@next/bundle-analyzer');
  nextConfig = bundleAnalyzer({ enabled: true })(nextConfig);
}

export default nextConfig;
