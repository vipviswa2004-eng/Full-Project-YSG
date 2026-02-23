import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    type?: 'website' | 'article' | 'product';
    productData?: {
        price: number;
        currency: string;
        availability: 'InStock' | 'OutOfStock';
        brand?: string;
    };
    noindex?: boolean;
}

const DOMAIN = 'https://ucgoc.com';
const DEFAULT_TITLE = 'Sign Galaxy | Premium Personalized Gifts & Custom Creations';
const DEFAULT_DESCRIPTION = "Shop premium personalized gifts, custom neon lights, photo frames, and unique handmade gifts online at Sign Galaxy. Discover customized gifts for birthdays, anniversaries, and special occasions with fast delivery across India.";
const DEFAULT_IMAGE = `${DOMAIN}/logo-large.png`;

export const SEO: React.FC<SEOProps> = ({
    title,
    description = DEFAULT_DESCRIPTION,
    keywords = [],
    image,
    type = 'website',
    productData,
    noindex = false,
}) => {
    const location = useLocation();

    // Ensure homepage canonical is always the root domain
    const isHome = location.pathname === '/' || location.pathname === '';
    const canonicalUrl = isHome ? DOMAIN : `${DOMAIN}${location.pathname}`;

    // Priority title logic: Brand first on home, Brand last on subpages
    let fullTitle = '';
    if (isHome) {
        fullTitle = title ? `Sign Galaxy | ${title}` : DEFAULT_TITLE;
    } else {
        fullTitle = title ? `${title} | Sign Galaxy` : `${DEFAULT_TITLE}`;
    }

    const fullImage = image ? (image.startsWith('http') ? image : `${DOMAIN}${image}`) : DEFAULT_IMAGE;

    const defaultKeywords = ['custom gifts', 'personalized gifts', 'hand-crafted gifts', 'corporate gifts', 'gift shop globally', 'ai', 'ai driven customised products', 'Sign Galaxy '];
    const allKeywords = [...new Set([...defaultKeywords, ...keywords])].join(', ');

    const structuredData = productData
        ? {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: title,
            description: description,
            image: fullImage,
            brand: {
                '@type': 'Brand',
                name: productData.brand || 'Sign Galaxy',
            },
            offers: {
                '@type': 'Offer',
                url: canonicalUrl,
                priceCurrency: productData.currency,
                price: productData.price,
                availability: `https://schema.org/${productData.availability}`,
            },
        }
        : isHome
            ? {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'Sign Galaxy',
                url: DOMAIN,
                potentialAction: {
                    '@type': 'SearchAction',
                    target: `${DOMAIN}/products?q={search_term_string}`,
                    'query-input': 'required name=search_term_string',
                },
            }
            : {
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: fullTitle,
                description: description,
                url: canonicalUrl,
            };

    return (
        <Helmet>
            {/* Global Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={allKeywords} />
            {!noindex && <link rel="canonical" href={canonicalUrl} />}
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:site_name" content="Sign Galaxy" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />

            {/* Structured Data */}
            <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        </Helmet>
    );
};
