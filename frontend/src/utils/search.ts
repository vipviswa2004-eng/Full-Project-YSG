import { Product } from '../types';

/**
 * Searches and ranks products based on a query string.
 * Implements a weighted scoring system for production-level relevancy.
 */
export const searchProducts = (products: Product[], query: string): Product[] => {
    if (!query || !query.trim()) return [];

    const cleanQuery = query.toLowerCase().trim();
    // Normalize tokens: remove 's, punctuation, and split by whitespace
    const STOP_WORDS = new Set(['and', 'or', 'the', 'a', 'an']);
    const tokens = cleanQuery
        .replace(/'s\b/g, '')
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 0 && !STOP_WORDS.has(t));

    if (tokens.length === 0) return [];

    const scoredProducts = products.map(product => {
        let score = 0;
        const normalize = (s: string | undefined) => (s || '').toLowerCase().replace(/'s\b/g, '');
        
        const name = normalize(product.name);
        const category = normalize(product.category);
        const description = normalize(product.description);
        const sku = (product as any).sku?.toLowerCase() || '';

        // Exact match for the entire query gets the highest boost
        if (name === cleanQuery.replace(/'s\b/g, '')) score += 500;
        if (category === cleanQuery.replace(/'s\b/g, '')) score += 300;

        tokens.forEach(token => {
            // Priority 1: Name Matches
            if (name.includes(token)) {
                // Word boundary check - prevents "men" matching "women"
                const wordRegex = new RegExp(`\\b${token}\\b`, 'i');
                const isWordMatch = wordRegex.test(name);
                
                if (isWordMatch) {
                    if (name.startsWith(token)) score += 150; // Starts with token
                    else score += 100; // Standalone word
                } else {
                    // Substring match but not word boundary (like "men" in "women")
                    // Still a match but much lower weight
                    score += 5;
                }
            }

            // Priority 2: Category Matches
            if (category.includes(token)) {
                if (new RegExp(`\\b${token}\\b`, 'i').test(category)) score += 80;
                else score += 10;
            }

            // Priority 3: SKU Matches
            if (sku && sku.includes(token)) score += 50;

            // Priority 4: Description Matches
            if (description.includes(token)) {
                if (new RegExp(`\\b${token}\\b`, 'i').test(description)) score += 20;
                else score += 2;
            }
        });

        // Relevancy Boosts
        if (score > 0) {
            if (product.isBestseller) score += 20;
            if (product.isTrending) score += 15;
            if (product.rating && product.rating > 4) score += product.rating * 2;
        }

        return { product, score };
    });

    // Filter out non-matches and sort by score descending
    return scoredProducts
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);
};
