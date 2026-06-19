import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Kidist Fertility & Wellness - Premium Supplements & Coaching',
  description = 'Empowering your fertility and wellness journey with premium supplements, science-backed PCOS support, and expert coaching by Kidist. Heal your hormones from the root.',
  keywords = 'fertility, wellness, supplements, PCOS support, hormone balance, natural supplements, fertility coaching, Kidist, women health, hormonal health',
  image = '/og-image.jpg',
  url = window.location.href,
  type = 'website',
  noIndex = false,
  structuredData,
}) => {
  const siteName = 'Kidist Fertility & Wellness';
  const twitterHandle = '@kidistwellness';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={siteName} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#3D2B1F" />
      <meta name="msapplication-TileColor" content="#3D2B1F" />
      
      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
