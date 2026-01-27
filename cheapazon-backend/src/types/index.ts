export interface AmazonProduct {
    asin: string;
    title: string;
    price: number;
    currency: 'USD' | 'CAD';
    domain: 'amazon.com' | 'amazon.ca';
    imageUrl?: string;
}

export interface AliExpressProduct {
    aliTitle: string;
    aliPrice: number;
    shipping: number;
    currency: 'USD' | 'CAD';
    savings: number;
    affiliateUrl: string;
    imageUrl: string;
    aliProductId?: string; // Optional for backward compatibility, but strictly needed for optim
}

export interface ComparisonResponse {
    found: boolean;
    match?: AliExpressProduct;
}
