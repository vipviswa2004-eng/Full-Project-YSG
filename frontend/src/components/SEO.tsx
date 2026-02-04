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
const DEFAULT_TITLE = 'Sign Galaxy';
const DEFAULT_DESCRIPTION = 'Explore Sign Galaxy for premium personalized gifts, hand-crafted masterpieces, and corporate branding solutions. Turn your ideas into memorable keepsakes.';
const DEFAULT_IMAGE = `${DOMAIN}/logo-large.png`; // Improve this if we have a real og-image

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
    const canonicalUrl = `${DOMAIN}${location.pathname}`;
    const fullTitle = title ? `Sign Galaxy | ${title}` : DEFAULT_TITLE;
    const fullImage = image ? (image.startsWith('http') ? image : `${DOMAIN}${image}`) : DEFAULT_IMAGE;

    const defaultKeywords = ['custom gifts', 'personalized gifts', 'hand-crafted gifts', 'home decor', 'corporate gifts', 'gift shop india'];
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
        : {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Sign Galaxy',
            url: DOMAIN,
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
