

/**
 * Global Brand List (Curated top 50)
 * Only major brands that might be mentioned in OEM product titles
 */
const GLOBAL_BRANDS = [
    'Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo', 'Asus',
    'Acer', 'Microsoft', 'Google', 'Nike', 'Adidas', 'Canon', 'Nikon',
    'Panasonic', 'Philips', 'Bosch', 'Tesla', 'Xiaomi', 'Huawei', 'OnePlus',
    'Logitech', 'Razer', 'Corsair', 'SteelSeries', 'Bose', 'JBL', 'Beats',
    'GoPro', 'DJI', 'Anker', 'Aukey', 'RAVPower', 'Belkin', 'TP-Link',
    'Netgear', 'Seagate', 'Western Digital', 'SanDisk', 'Kingston', 'Crucial',
    'Intel', 'AMD', 'NVIDIA', 'Gigabyte', 'MSI', 'EVGA', 'Roku', 'Fitbit'
];

/**
 * Clean and normalize product titles for comparison
 */
export function cleanTitle(title: string): string {
    let cleaned = title.toLowerCase();

    // 1. Remove marketing keywords
    const marketingWords = [
        'hot sale', 'limited', 'new arrival', 'free shipping', 'best seller',
        'amazon\'s choice', 'premium', 'upgraded', 'professional', 'high quality',
        'gift for', '2024', '2025', '2026', 'pack of', 'set of'
    ];

    for (const word of marketingWords) {
        cleaned = cleaned.replace(new RegExp(word, 'gi'), ' ');
    }

    // 2. Remove special characters but keep numbers and units
    cleaned = cleaned.replace(/[^\w\s\-]/g, ' ');

    // 3. Normalize brand names
    for (const brand of GLOBAL_BRANDS) {
        const regex = new RegExp(`\\b${brand}\\b`, 'gi');
        cleaned = cleaned.replace(regex, brand.toLowerCase());
    }

    // 4. Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
}

/**
 * Calculate text similarity score (0 to 1) using Overlap Coefficient.
 * Formula: Intersection(A, B) / Min(|A|, |B|)
 * This ensures that if all Amazon keywords (A) are present in the AliExpress title (B),
 * the score is 1.0, regardless of how long B is.
 */
export function getTextSimilarity(titleA: string, titleB: string): number {
    const cleanA = cleanTitle(titleA);
    const cleanB = cleanTitle(titleB);

    if (!cleanA || !cleanB) return 0;

    // Tokenize and filter short words
    const tokensA = new Set(cleanA.split(/\s+/).filter(w => w.length >= 2));
    const tokensB = new Set(cleanB.split(/\s+/).filter(w => w.length >= 2));

    if (tokensA.size === 0 || tokensB.size === 0) return 0;

    // Calculate Intersection
    let intersection = 0;
    tokensA.forEach(token => {
        if (tokensB.has(token)) intersection++;
    });

    // Overlap Coefficient: Intersection / Min(|A|, |B|)
    // We typically expect Amazon title (A) to be the "Query" and Ali (B) to be the "Document".
    // Using Math.min ensures that if A is a subset of B, score is 1.
    const minSize = Math.min(tokensA.size, tokensB.size);

    return minSize > 0 ? intersection / minSize : 0;
}
