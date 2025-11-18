/**
 * Sitemap generator for NexusMart
 * Run this script to generate sitemap.xml
 * Usage: node generateSitemap.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'https://nexusmart.com';
const OUTPUT_PATH = path.join(__dirname, '../client/public/sitemap.xml');

// Static routes with their priority and change frequency
const staticRoutes = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/products', priority: 0.9, changefreq: 'daily' },
  { path: '/cart', priority: 0.6, changefreq: 'weekly' },
  { path: '/checkout', priority: 0.7, changefreq: 'monthly' },
  { path: '/login', priority: 0.5, changefreq: 'monthly' },
  { path: '/register', priority: 0.5, changefreq: 'monthly' },
  { path: '/about', priority: 0.6, changefreq: 'monthly' },
  { path: '/contact', priority: 0.6, changefreq: 'monthly' },
  { path: '/faq', priority: 0.6, changefreq: 'monthly' },
  { path: '/privacy', priority: 0.4, changefreq: 'yearly' },
  { path: '/terms', priority: 0.4, changefreq: 'yearly' },
  { path: '/virtual-showroom', priority: 0.7, changefreq: 'weekly' },
];

// Categories (you would fetch these from your database)
const categories = [
  'electronics',
  'fashion',
  'home',
  'beauty',
  'sports',
  'books',
  'toys',
  'automotive',
];

/**
 * Generate sitemap XML
 */
async function generateSitemap() {
  console.log('🔄 Generating sitemap...');

  const currentDate = new Date().toISOString();

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  sitemap += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  // Add static routes
  staticRoutes.forEach(route => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${SITE_URL}${route.path}</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += `    <changefreq>${route.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${route.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });

  // Add category pages
  categories.forEach(category => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${SITE_URL}/products?category=${category}</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += `    <changefreq>daily</changefreq>\n`;
    sitemap += `    <priority>0.8</priority>\n`;
    sitemap += '  </url>\n';
  });

  // Add dynamic product pages (you would fetch these from your database)
  // Example with mock product IDs
  const mockProductIds = Array.from({ length: 100 }, (_, i) => `product-${i + 1}`);

  mockProductIds.forEach(productId => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${SITE_URL}/products/${productId}</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += `    <changefreq>weekly</changefreq>\n`;
    sitemap += `    <priority>0.8</priority>\n`;
    // Optional: Add product images
    sitemap += `    <image:image>\n`;
    sitemap += `      <image:loc>${SITE_URL}/images/products/${productId}.jpg</image:loc>\n`;
    sitemap += `    </image:image>\n`;
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>';

  // Write to file
  fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf8');

  console.log('✅ Sitemap generated successfully!');
  console.log(`📁 Location: ${OUTPUT_PATH}`);
  console.log(`📊 Total URLs: ${staticRoutes.length + categories.length + mockProductIds.length}`);
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt() {
  const robotsPath = path.join(__dirname, '../client/public/robots.txt');

  const robotsTxt = `# NexusMart Robots.txt
# Allow all crawlers
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/
Disallow: /checkout/
Disallow: /cart/
Disallow: /*.json$

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay for bots
User-agent: Googlebot
Crawl-delay: 0

User-agent: Bingbot
Crawl-delay: 1

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /
`;

  fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
  console.log('✅ robots.txt generated successfully!');
  console.log(`📁 Location: ${robotsPath}`);
}

// Run generators
if (require.main === module) {
  generateSitemap()
    .then(() => generateRobotsTxt())
    .catch(error => {
      console.error('❌ Error generating sitemap:', error);
      process.exit(1);
    });
}

module.exports = { generateSitemap, generateRobotsTxt };
