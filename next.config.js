/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Removed to enable API routes
  reactStrictMode: true,
  images: {
    // unoptimized: true, // Not needed when not using static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com'
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos'
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com'
      }
    ],
  },
  // SEO configurations
  trailingSlash: true, // Better for SEO
  // Disable dynamic routes that aren't pre-rendered
  experimental: {
    fallbackNodePolyfills: false
  },
  // Enhanced logging during build
  onDemandEntries: {
    // Keep generated pages in memory to improve development experience
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  }
};

// Log configuration on initialization
console.log('[BUILD CONFIG] API routes enabled with SEO optimizations');

module.exports = nextConfig;