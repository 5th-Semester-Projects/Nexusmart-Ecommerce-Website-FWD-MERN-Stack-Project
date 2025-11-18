import { Helmet } from 'react-helmet-async';

/**
 * SEO component for dynamic meta tags
 * @param {Object} props - SEO configuration
 */
const SEO = ({
  title = 'NexusMart - AI + AR Powered Ecommerce',
  description = 'Shop with AI-powered recommendations, AR try-on, and cryptocurrency payments. Experience the future of online shopping.',
  keywords = 'ecommerce, AI shopping, AR try-on, virtual showroom, crypto payments, NFT rewards, online store',
  image = '/og-image.jpg',
  url = '',
  type = 'website',
  author = 'NexusMart Team',
  publishedTime,
  modifiedTime,
  structuredData,
  noindex = false,
  nofollow = false,
  canonical,
}) => {
  const siteUrl = 'https://nexusmart.com';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Default structured data
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NexusMart',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Robots */}
      {(noindex || nofollow) && (
        <meta
          name="robots"
          content={`${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`}
        />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="NexusMart" />
      <meta property="og:locale" content="en_US" />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@nexusmart" />
      <meta name="twitter:creator" content="@nexusmart" />

      {/* Additional Meta */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;

/**
 * Generate Product structured data
 */
export const generateProductSchema = (product) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map(img => img.startsWith('http') ? img : `https://nexusmart.com${img}`),
    brand: {
      '@type': 'Brand',
      name: product.brand || 'NexusMart',
    },
    sku: product.sku || product._id,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://nexusmart.com/products/${product._id}`,
      seller: {
        '@type': 'Organization',
        name: 'NexusMart',
      },
    },
    aggregateRating: product.rating && product.numReviews ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.numReviews,
      bestRating: '5',
      worstRating: '1',
    } : undefined,
  };
};

/**
 * Generate Breadcrumb structured data
 */
export const generateBreadcrumbSchema = (items) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `https://nexusmart.com${item.url}` : undefined,
    })),
  };
};

/**
 * Generate Organization structured data
 */
export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NexusMart',
    url: 'https://nexusmart.com',
    logo: 'https://nexusmart.com/logo.png',
    description: 'AI-powered ecommerce platform with AR try-on and crypto payments',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Commerce Street',
      addressLocality: 'New York',
      addressRegion: 'NY',
      postalCode: '10001',
      addressCountry: 'US',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-123-4567',
      contactType: 'Customer Service',
      email: 'support@nexusmart.com',
      availableLanguage: 'English',
    },
    sameAs: [
      'https://facebook.com/nexusmart',
      'https://twitter.com/nexusmart',
      'https://instagram.com/nexusmart',
      'https://linkedin.com/company/nexusmart',
    ],
  };
};

/**
 * Generate Review structured data
 */
export const generateReviewSchema = (review, product) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.userName || 'Anonymous',
    },
    datePublished: review.createdAt,
    reviewBody: review.comment,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: '5',
      worstRating: '1',
    },
    itemReviewed: {
      '@type': 'Product',
      name: product.name,
      image: product.images?.[0],
    },
  };
};

/**
 * Generate FAQ structured data
 */
export const generateFAQSchema = (faqs) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};
