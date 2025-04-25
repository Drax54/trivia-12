/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://trivia-master.com', // Replace with your site's URL
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  outDir: 'out', // Output directory for the static export
  exclude: ['/server-sitemap.xml'], // Exclude any pages that shouldn't be in the sitemap
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://trivia-master.com/server-sitemap.xml', // Add additional dynamic sitemaps here if needed
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  // Custom transform function for specific URL handling
  transform: async (config, path) => {
    // Custom priority for different paths
    let priority = 0.7;
    
    // Set higher priority for main pages
    if (path === '/') {
      priority = 1.0;
    } else if (path.startsWith('/categories') || path.startsWith('/study')) {
      priority = 0.9;
    } else if (path.match(/\/[^\/]+$/)) {
      // Category pages
      priority = 0.8;
    }
    
    // Return the modified config
    return {
      loc: path, // URL
      changefreq: path === '/' ? 'daily' : 'weekly',
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    };
  },
}; 