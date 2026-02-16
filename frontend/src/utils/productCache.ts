
import { Product } from '../types';

// Simple in-memory cache for product details
const productCache = new Map<string, Product>();
const activePrefetches = new Set<string>();

export const getCachedProduct = (id: string): Product | undefined => {
    return productCache.get(id);
};

export const setCachedProduct = (id: string, product: Product) => {
    productCache.set(id, product);
};

export const prefetchProduct = async (id: string, apiUrl: string) => {
    // If already cached or currently fetching, skip
    if (productCache.has(id) || activePrefetches.has(id)) return;

    activePrefetches.add(id);
    try {
        const res = await fetch(`${apiUrl}/api/products/${id}`);
        if (res.ok) {
            const data = await res.json();
            // Verify it has full details before caching
            if (data && data.description) {
                setCachedProduct(id, data);
                // console.log(`📦 Prefetched product ${id}`);
            }
        }
    } catch (err) {
        console.error(`Prefetch failed for ${id}`, err);
    } finally {
        activePrefetches.delete(id);
    }
};
